import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLocalServer } from '../scripts/serve-local.mjs';

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve(`http://127.0.0.1:${server.address().port}`);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

test('local server imports folder, serves homepage, and writes note edits', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kindle-local-server-'));
  const importsDir = join(root, 'imports');
  const dataDir = join(root, 'data');

  await mkdir(importsDir, { recursive: true });
  await mkdir(dataDir, { recursive: true });
  await writeFile(join(importsDir, 'notes.txt'), [
    'Deep Work',
    'Cal Newport',
    '',
    'Highlight (Location 42)',
    'Focus deeply on cognitively demanding tasks.'
  ].join('\n'));

  const server = await createLocalServer({ root });
  const baseUrl = await listen(server);

  try {
    const homeResponse = await fetch(`${baseUrl}/`);
    assert.equal(homeResponse.status, 200);
    assert.match(await homeResponse.text(), /Deep Work/);

    const booksResponse = await fetch(`${baseUrl}/api/books`);
    assert.equal(booksResponse.status, 200);
    const books = await booksResponse.json();
    const noteId = books[0].notes[0].id;

    const saveResponse = await fetch(`${baseUrl}/api/notes/${encodeURIComponent(noteId)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ note: 'Saved from browser' })
    });

    assert.equal(saveResponse.status, 200);
    assert.equal((await saveResponse.json()).note.note, 'Saved from browser');

    const savedBooks = JSON.parse(await readFile(join(dataDir, 'books.json'), 'utf8'));
    assert.equal(savedBooks[0].notes[0].note, 'Saved from browser');
  } finally {
    await close(server);
  }
});
