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

test('local server preserves concurrent edits to different notes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kindle-local-server-concurrent-'));
  const dataDir = join(root, 'data');
  const publicDir = join(root, 'public');
  const importsDir = join(root, 'imports');

  await mkdir(dataDir, { recursive: true });
  await mkdir(publicDir, { recursive: true });
  await mkdir(importsDir, { recursive: true });
  await writeFile(join(dataDir, 'books.json'), `${JSON.stringify([{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    notes: [{
      id: 'note-1',
      quote: 'First quote.',
      note: '',
      location: 'Location 1',
      page: '',
      chapter: '',
      highlightedAt: '',
      tags: [],
      status: 'new',
      extension: ''
    }, {
      id: 'note-2',
      quote: 'Second quote.',
      note: '',
      location: 'Location 2',
      page: '',
      chapter: '',
      highlightedAt: '',
      tags: [],
      status: 'new',
      extension: ''
    }]
  }], null, 2)}\n`);

  const server = await createLocalServer({ root });
  const baseUrl = await listen(server);

  try {
    const [firstResponse, secondResponse] = await Promise.all([
      fetch(`${baseUrl}/api/notes/note-1`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ note: 'First concurrent edit' })
      }),
      fetch(`${baseUrl}/api/notes/note-2`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ note: 'Second concurrent edit' })
      })
    ]);

    assert.equal(firstResponse.status, 200);
    assert.equal(secondResponse.status, 200);

    const savedBooks = JSON.parse(await readFile(join(dataDir, 'books.json'), 'utf8'));
    const savedNotes = new Map(savedBooks[0].notes.map((note) => [note.id, note.note]));

    assert.equal(savedNotes.get('note-1'), 'First concurrent edit');
    assert.equal(savedNotes.get('note-2'), 'Second concurrent edit');
  } finally {
    await close(server);
  }
});
