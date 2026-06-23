import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { renderBookPage, renderIndexPage } from '../scripts/lib/render-html.mjs';
import { APP_CSS, APP_JS } from '../scripts/lib/site-assets.mjs';

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
    note: 'Connect this to planning blocks.',
    extension: '',
    chapter: 'Focus rituals',
    createdAt: '2026-06-23T00:00:00.000Z',
    updatedAt: '2026-06-23T00:00:00.000Z'
  }]
}];

test('renderIndexPage includes search and book links', () => {
  const html = renderIndexPage(books);
  assert.match(html, /<input[^>]+id="search"/);
  assert.match(html, /Deep Work/);
  assert.match(html, /books\/book-deep-work-cal-newport.html/);
  assert.match(html, /Last import:/);
  assert.match(html, /2026-06-23 00:00 UTC/);
});

test('renderBookPage escapes content and renders editable note fields', () => {
  const html = renderBookPage(books[0], books);
  assert.match(html, /Focus deeply on cognitively demanding tasks\./);
  assert.match(html, /Connect this to planning blocks\./);
  assert.match(html, /attention/);
  assert.doesNotMatch(renderBookPage({ ...books[0], title: '<script>' }), /<script>/);
  assert.match(html, /data-note-id="note-1"/);
  assert.doesNotMatch(html, /data-note-source=/);
  assert.doesNotMatch(html, />笔记</);
  assert.doesNotMatch(html, />读书笔记</);
  assert.doesNotMatch(html, />原文标注</);
  assert.doesNotMatch(html, /class="eyebrow"/);
  assert.doesNotMatch(html, /class="detail-header"/);
  assert.match(html, /class="reader-shell"/);
  assert.match(html, /class="library-pane"/);
  assert.match(html, /class="note-list-pane"/);
  assert.match(html, /class="detail-pane"/);
  assert.match(html, /data-collapse-target="books"/);
  assert.match(html, /data-collapse-target="chapters"/);
  assert.match(html, /data-collapse-panel="books"/);
  assert.match(html, /data-collapse-panel="chapters"/);
  assert.match(html, /data-chapter="Focus rituals"/);
  assert.match(html, /Focus rituals/);
  assert.match(html, /class="quote-block"/);
  assert.match(html, /class="note-input"/);
  assert.doesNotMatch(html, /window-controls/);
  assert.doesNotMatch(html, /detail-toolbar/);
  assert.doesNotMatch(html, /class="note-preview"/);
  assert.doesNotMatch(html, /class="note-editor"/);
  assert.doesNotMatch(html, /data-action="edit-note"/);
  assert.doesNotMatch(html, /data-action="apply-note"/);
  assert.doesNotMatch(html, /data-action="cancel-note"/);
  assert.doesNotMatch(html, /extension-preview/);
  assert.doesNotMatch(html, /id="export-json"/);
  assert.doesNotMatch(html, /class="back-link"/);
  assert.doesNotMatch(html, /全部图书/);
  assert.doesNotMatch(html, /class="status"/);
  assert.doesNotMatch(html, /class="tags"/);
  assert.doesNotMatch(html, /class="tag"/);
  assert.doesNotMatch(html, /id="books-data"/);
});

test('book page layout fills the viewport without decorative frames', () => {
  assert.match(APP_CSS, /\.reader-shell\s*{[^}]*grid-template-columns: 320px 430px minmax\(0, 1fr\)/s);
  assert.match(APP_CSS, /\.reader-shell\s*{[^}]*min-height: 100vh/s);
  assert.match(APP_CSS, /\.reader-shell\s*{[^}]*margin: 0/s);
  assert.match(APP_CSS, /\.note-input\s*{[^}]*min-height: 320px/s);
  assert.match(APP_CSS, /\.note-input\s*{[^}]*border: 0/s);
  assert.doesNotMatch(APP_CSS, /\.window-controls/);
  assert.doesNotMatch(APP_CSS, /\.detail-toolbar/);
  assert.doesNotMatch(APP_CSS, /\.detail-header/);
  assert.doesNotMatch(APP_CSS, /\.eyebrow/);
  assert.doesNotMatch(APP_CSS, /\.note-preview/);
});

test('sidebar sections are collapsible and typographic hierarchy is explicit', () => {
  assert.match(APP_CSS, /\.section-toggle\s*{[^}]*font-size: 12px/s);
  assert.match(APP_CSS, /\.library-book span\s*{[^}]*font-size: 15px/s);
  assert.match(APP_CSS, /\.library-book small\s*{[^}]*font-size: 12px/s);
  assert.match(APP_CSS, /\.chapter-link span\s*{[^}]*font-size: 13px/s);
  assert.match(APP_CSS, /\.chapter-link small\s*{[^}]*font-size: 12px/s);
  assert.match(APP_JS, /data-collapse-target/);
  assert.match(APP_JS, /aria-expanded/);
  assert.match(APP_JS, /data-collapse-panel/);
});

test('renderBookPage sorts chapters and notes by chapter order', () => {
  const outOfOrderBook = {
    ...books[0],
    notes: [{
      ...books[0].notes[0],
      id: 'note-third',
      quote: 'Third chapter quote.',
      note: 'Third note.',
      chapter: '第三章 返乡',
      page: '第 39 页',
      location: '位置 547'
    }, {
      ...books[0].notes[0],
      id: 'note-first',
      quote: '',
      note: 'First note.',
      chapter: '第一章 保就业',
      page: '第 8 页',
      location: '位置 87'
    }, {
      ...books[0].notes[0],
      id: 'note-second',
      quote: 'Second chapter quote.',
      note: 'Second note.',
      chapter: '第二章 大学生',
      page: '第 24 页',
      location: '位置 314'
    }]
  };
  const html = renderBookPage(outOfOrderBook, [outOfOrderBook]);

  assert.ok(html.indexOf('data-chapter-filter="第一章 保就业"') < html.indexOf('data-chapter-filter="第二章 大学生"'));
  assert.ok(html.indexOf('data-chapter-filter="第二章 大学生"') < html.indexOf('data-chapter-filter="第三章 返乡"'));
  assert.ok(html.indexOf('data-note-target="note-first"') < html.indexOf('data-note-target="note-second"'));
  assert.ok(html.indexOf('data-note-target="note-second"') < html.indexOf('data-note-target="note-third"'));
  assert.ok(html.indexOf('data-note-id="note-first"') < html.indexOf('data-note-id="note-second"'));
  assert.ok(html.indexOf('data-note-id="note-second"') < html.indexOf('data-note-id="note-third"'));
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

test('build-html rebuilds referenced app assets from data/books.json', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kindle-build-assets-'));
  const dataDir = join(tempDir, 'data');
  const publicDir = join(tempDir, 'public');
  const assetsDir = join(publicDir, 'assets');

  await mkdir(dataDir, { recursive: true });
  await mkdir(assetsDir, { recursive: true });
  await writeFile(join(dataDir, 'books.json'), `${JSON.stringify([books[0]], null, 2)}\n`);

  const { stdout } = await execFileAsync('node', [buildScriptPath], { cwd: tempDir });
  const css = await readFile(join(assetsDir, 'app.css'), 'utf8');
  const js = await readFile(join(assetsDir, 'app.js'), 'utf8');

  assert.match(css, /--accent:/);
  assert.match(js, /search/i);
  assert.match(stdout, /Built 1 book page\(s\)\./);
});

test('app asset includes markdown note editing and export behavior', () => {
  assert.match(APP_JS, /addEventListener\('input'/);
  assert.match(APP_JS, /localStorage\.getItem/);
  assert.match(APP_JS, /localStorage\.setItem/);
  assert.doesNotMatch(APP_JS, /editedNotes/);
  assert.doesNotMatch(APP_JS, /function renderMarkdown/);
  assert.doesNotMatch(APP_JS, /escapeHtml/);
  assert.doesNotMatch(APP_JS, /edit-note/);
  assert.doesNotMatch(APP_JS, /apply-note/);
  assert.doesNotMatch(APP_JS, /cancel-note/);
  assert.doesNotMatch(APP_JS, /export-json/);
  assert.doesNotMatch(APP_JS, /new Blob/);
  assert.doesNotMatch(APP_JS, /editedExtensions/);
});
