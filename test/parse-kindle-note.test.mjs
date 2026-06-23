import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseKindleSource } from '../scripts/lib/parse-kindle-note.mjs';

test('parses Kindle txt exports into one normalized book', async () => {
  const raw = await readFile('test/fixtures/kindle-sample.txt', 'utf8');
  const result = parseKindleSource(raw, { path: 'test/fixtures/kindle-sample.txt' });

  assert.equal(result.warnings.length, 0);
  assert.equal(result.books.length, 1);
  assert.equal(result.books[0].title, 'Deep Work');
  assert.equal(result.books[0].author, 'Cal Newport');
  assert.equal(result.books[0].notes.length, 3);
  assert.equal(result.books[0].notes[0].quote, 'Focus deeply on cognitively demanding tasks.');
  assert.equal(result.books[0].notes[0].location, 'Location 42');
});

test('parses simple HTML and EML bodies', async () => {
  const html = await readFile('test/fixtures/kindle-sample.html', 'utf8');
  const eml = await readFile('test/fixtures/kindle-sample.eml', 'utf8');

  assert.equal(parseKindleSource(html, { path: 'sample.html' }).books[0].notes.length, 2);
  assert.equal(parseKindleSource(eml, { path: 'sample.eml' }).books[0].notes.length, 1);
});

test('reports unsupported input without throwing', async () => {
  const raw = await readFile('test/fixtures/unsupported.txt', 'utf8');
  const result = parseKindleSource(raw, { path: 'unsupported.txt' });

  assert.deepEqual(result.books, []);
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].reason, 'No Kindle highlight blocks found');
});
