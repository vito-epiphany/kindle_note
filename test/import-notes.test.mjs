import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const scriptPath = fileURLToPath(new URL('../scripts/import-notes.mjs', import.meta.url));

test('importer keeps processing after a per-file failure', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kindle-import-'));
  const importsDir = join(tempDir, 'imports');
  const dataDir = join(tempDir, 'data');
  const goodPath = join(importsDir, 'good.txt');
  const badPath = join(importsDir, 'bad.txt');

  await mkdir(importsDir, { recursive: true });
  await mkdir(dataDir, { recursive: true });

  await writeFile(goodPath, [
    'Deep Work',
    'Cal Newport',
    '',
    'Highlight (Location 42)',
    'Focus deeply on cognitively demanding tasks.'
  ].join('\n'));
  await writeFile(badPath, 'This file should fail to read.');
  await chmod(badPath, 0o000);

  try {
    const { stdout } = await execFileAsync('node', [scriptPath], { cwd: tempDir });

    const books = JSON.parse(await readFile(join(dataDir, 'books.json'), 'utf8'));
    const sources = JSON.parse(await readFile(join(dataDir, 'sources.json'), 'utf8'));

    assert.equal(books.length, 1);
    assert.equal(books[0].title, 'Deep Work');
    assert.equal(books[0].notes.length, 1);

    assert.equal(sources.length, 2);
    assert.match(stdout, /Scanned 2 source file\(s\)\./);
    assert.match(stdout, /Imported 1 file\(s\)\./);
    assert.match(stdout, /Parsed 1 note\(s\)\./);

    const failedSource = sources.find((source) => source.error);
    const successfulSource = sources.find((source) => !source.error);

    assert.ok(failedSource);
    assert.equal(failedSource.notesFound, 0);
    assert.equal(failedSource.warnings.length, 1);
    assert.equal(failedSource.warnings[0].path, 'imports/bad.txt');
    assert.match(failedSource.warnings[0].reason, /EACCES|EPERM|permission/i);

    assert.ok(successfulSource);
    assert.equal(successfulSource.notesFound, 1);
    assert.equal(successfulSource.warnings.length, 0);
  } finally {
    await chmod(badPath, 0o644).catch(() => {});
  }
});
