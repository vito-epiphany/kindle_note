import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

test('project command exposes import build serve without npm', async () => {
  const { stdout } = await execFileAsync('./kindle-notes', ['help']);

  assert.match(stdout, /Usage: \.\/kindle-notes <command>/);
  assert.match(stdout, /import\s+Import Kindle note files/);
  assert.match(stdout, /build\s+Generate static HTML/);
  assert.match(stdout, /serve\s+Serve the local app and save edits/);
  assert.doesNotMatch(stdout, /npm/);
});

test('README documents the non-npm workflow', async () => {
  const readme = await readFile('README.md', 'utf8');

  assert.match(readme, /\.\/kindle-notes import/);
  assert.match(readme, /\.\/kindle-notes build/);
  assert.match(readme, /\.\/kindle-notes serve/);
  assert.doesNotMatch(readme, /npm run import/);
  assert.doesNotMatch(readme, /npm run build/);
  assert.doesNotMatch(readme, /npm run dev/);
});
