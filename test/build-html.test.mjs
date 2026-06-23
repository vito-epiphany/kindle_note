import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { renderBookPage, renderIndexPage } from '../scripts/lib/render-html.mjs';

const execFileAsync = promisify(execFile);
const buildScriptPath = fileURLToPath(new URL('../scripts/build-html.mjs', import.meta.url));

const books = [{
  id: 'book-deep-work-cal-newport',
  title: 'Deep Work',
  author: 'Cal Newport',
  source: 'kindle',
  firstImportedAt: '2026-06-23T00:00:00.000Z',
  lastImportedAt: '2026-06-23T00:00:00.000Z',
  notes: [{
    id: 'note-1',
    quote: 'Focus deeply on cognitively demanding tasks.',
    location: 'Location 42',
    page: '',
    highlightedAt: '',
    tags: ['attention'],
    status: 'expanded',
    extension: 'Connect this to planning blocks.',
    createdAt: '2026-06-23T00:00:00.000Z',
    updatedAt: '2026-06-23T00:00:00.000Z'
  }]
}];

test('renderIndexPage includes search and book links', () => {
  const html = renderIndexPage(books);
  assert.match(html, /<input[^>]+id="search"/);
  assert.match(html, /Deep Work/);
  assert.match(html, /books\/book-deep-work-cal-newport.html/);
});

test('renderBookPage escapes content and renders extension fields', () => {
  const html = renderBookPage(books[0]);
  assert.match(html, /Focus deeply on cognitively demanding tasks\./);
  assert.match(html, /Connect this to planning blocks\./);
  assert.match(html, /attention/);
  assert.doesNotMatch(renderBookPage({ ...books[0], title: '<script>' }), /<script>/);
});

test('build-html removes stale book pages that are no longer in books.json', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kindle-build-'));
  const dataDir = join(tempDir, 'data');
  const publicDir = join(tempDir, 'public');
  const booksDir = join(publicDir, 'books');

  await mkdir(dataDir, { recursive: true });
  await mkdir(booksDir, { recursive: true });

  await writeFile(join(dataDir, 'books.json'), `${JSON.stringify([books[0]], null, 2)}\n`);
  await writeFile(join(booksDir, 'book-old-title.html'), '<!doctype html><title>stale</title>');

  const { stdout } = await execFileAsync('node', [buildScriptPath], { cwd: tempDir });

  await assert.doesNotReject(readFile(join(publicDir, 'index.html'), 'utf8'));
  await assert.doesNotReject(readFile(join(booksDir, 'book-deep-work-cal-newport.html'), 'utf8'));
  await assert.rejects(readFile(join(booksDir, 'book-old-title.html'), 'utf8'), { code: 'ENOENT' });
  assert.match(stdout, /Built 1 book page\(s\)\./);
});
