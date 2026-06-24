# Kindle Note Local HTML Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Kindle note library that imports saved Kindle note files, preserves user extensions in JSON, and generates static HTML pages.

**Architecture:** Node.js ES modules provide a small file-based pipeline: parse source files into normalized books, merge them into durable JSON, then render static HTML. Parsing, merging, and rendering are separate modules so Gmail sync can reuse the same pipeline in a future task.

**Tech Stack:** Node.js 20+, built-in `node:test`, `node:assert/strict`, `node:fs/promises`, `node:crypto`, ES modules, static HTML/CSS/JavaScript.

---

## File Map

- Create `package.json`: npm scripts for tests, import, build, and local preview.
- Create `imports/README.md`: instructions for placing `.txt`, `.html`, and `.eml` source files.
- Create `data/books.json`: durable normalized book and note data.
- Create `data/sources.json`: source file import registry.
- Create `scripts/lib/ids.mjs`: stable slug and hash ID helpers.
- Create `scripts/lib/parse-kindle-note.mjs`: source text extraction and Kindle note parsing.
- Create `scripts/lib/merge-books.mjs`: deterministic merge that preserves user fields.
- Create `scripts/lib/render-html.mjs`: static HTML rendering helpers.
- Create `scripts/import-notes.mjs`: CLI importer from `imports/` to `data/`.
- Create `scripts/build-html.mjs`: CLI builder from `data/` to `public/`.
- Create `public/assets/app.css`: generated site styles.
- Create `public/assets/app.js`: search and filter behavior for generated pages.
- Create `test/fixtures/kindle-sample.txt`: representative Kindle text export.
- Create `test/fixtures/kindle-sample.html`: representative HTML body.
- Create `test/fixtures/kindle-sample.eml`: representative saved email.
- Create `test/fixtures/unsupported.txt`: unsupported input.
- Create `test/parse-kindle-note.test.mjs`: parser tests.
- Create `test/merge-books.test.mjs`: merge tests.
- Create `test/build-html.test.mjs`: renderer and build tests.
- Modify `docs/superpowers/specs/2026-06-23-kindle-note-local-html-design.md`: no planned changes unless implementation discovers a spec mismatch.

---

### Task 1: Project Scaffolding and ID Helpers

**Files:**
- Create: `package.json`
- Create: `imports/README.md`
- Create: `data/books.json`
- Create: `data/sources.json`
- Create: `scripts/lib/ids.mjs`
- Create: `test/ids.test.mjs`

- [ ] **Step 1: Write failing ID helper tests**

Create `test/ids.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBookId, createNoteId, sha256, slugify } from '../scripts/lib/ids.mjs';

test('slugify creates stable lowercase slugs', () => {
  assert.equal(slugify('  Deep Work: Rules for Focused Success!  '), 'deep-work-rules-for-focused-success');
  assert.equal(slugify('原则'), 'item');
});

test('sha256 returns a deterministic hex digest', () => {
  assert.equal(
    sha256('kindle note'),
    '91704bfeaa41d8af1b70284c5fbfc65fba829628f5daaa5a6e26e7d91c748b81'
  );
});

test('book and note ids are stable', () => {
  assert.equal(createBookId({ title: 'Deep Work', author: 'Cal Newport' }), 'book-deep-work-cal-newport');
  assert.match(
    createNoteId({ title: 'Deep Work', quote: 'Focus deeply.', location: 'Location 42', page: '' }),
    /^note-deep-work-[a-f0-9]{12}$/
  );
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
node --test test/ids.test.mjs
```

Expected: FAIL with `Cannot find module` for `scripts/lib/ids.mjs`.

- [ ] **Step 3: Add package scripts and initial data files**

Create `package.json`:

```json
{
  "name": "kindle-note",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test test/*.test.mjs",
    "import": "node scripts/import-notes.mjs",
    "build": "node scripts/build-html.mjs",
    "dev": "python3 -m http.server 4173 --directory public"
  },
  "engines": {
    "node": ">=20"
  }
}
```

Create `imports/README.md`:

```md
# Imports

Place saved Kindle note source files in this directory.

Supported first-version formats:

- `.txt`
- `.html`
- `.eml`

Run `npm run import` from the repository root after adding files.
```

Create `data/books.json`:

```json
[]
```

Create `data/sources.json`:

```json
[]
```

- [ ] **Step 4: Implement ID helpers**

Create `scripts/lib/ids.mjs`:

```js
import { createHash } from 'node:crypto';

export function sha256(value) {
  return createHash('sha256').update(String(value), 'utf8').digest('hex');
}

export function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function slugify(value) {
  const ascii = normalizeText(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return ascii || 'item';
}

export function createBookId({ title, author = '' }) {
  return `book-${slugify(`${title} ${author}`)}`;
}

export function createNoteId({ title, quote, location = '', page = '' }) {
  const prefix = slugify(title);
  const digest = sha256([normalizeText(title), normalizeText(quote), normalizeText(location), normalizeText(page)].join('|')).slice(0, 12);
  return `note-${prefix}-${digest}`;
}
```

- [ ] **Step 5: Run scaffold tests**

Run:

```bash
npm test
```

Expected: PASS for `test/ids.test.mjs`.

- [ ] **Step 6: Commit scaffold**

Run:

```bash
git add package.json imports/README.md data/books.json data/sources.json scripts/lib/ids.mjs test/ids.test.mjs
git commit -m "feat: scaffold Kindle note tool"
```

---

### Task 2: Kindle Note Parser

**Files:**
- Create: `scripts/lib/parse-kindle-note.mjs`
- Create: `test/fixtures/kindle-sample.txt`
- Create: `test/fixtures/kindle-sample.html`
- Create: `test/fixtures/kindle-sample.eml`
- Create: `test/fixtures/unsupported.txt`
- Create: `test/parse-kindle-note.test.mjs`

- [ ] **Step 1: Add parser fixtures**

Create `test/fixtures/kindle-sample.txt`:

```text
Deep Work
Cal Newport

Highlight (Location 42)
Focus deeply on cognitively demanding tasks.

Note (Location 45)
This connects to my morning planning habit.

Highlight (Page 12)
Attention residue reduces performance.
```

Create `test/fixtures/kindle-sample.html`:

```html
<!doctype html>
<html>
  <body>
    <h1>Deep Work</h1>
    <p>Cal Newport</p>
    <div>Highlight (Location 42)</div>
    <blockquote>Focus deeply on cognitively demanding tasks.</blockquote>
    <div>Highlight (Page 12)</div>
    <blockquote>Attention residue reduces performance.</blockquote>
  </body>
</html>
```

Create `test/fixtures/kindle-sample.eml`:

```text
From: kindle@example.com
Subject: Your Kindle Notes
Content-Type: text/html; charset=UTF-8

<html><body>
<h1>Deep Work</h1>
<p>Cal Newport</p>
<p>Highlight (Location 42)</p>
<p>Focus deeply on cognitively demanding tasks.</p>
</body></html>
```

Create `test/fixtures/unsupported.txt`:

```text
This is not a Kindle note export.
It has no title, metadata, or highlight blocks.
```

- [ ] **Step 2: Write failing parser tests**

Create `test/parse-kindle-note.test.mjs`:

```js
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
```

- [ ] **Step 3: Run parser tests and verify failure**

Run:

```bash
node --test test/parse-kindle-note.test.mjs
```

Expected: FAIL with `Cannot find module` for `scripts/lib/parse-kindle-note.mjs`.

- [ ] **Step 4: Implement parser**

Create `scripts/lib/parse-kindle-note.mjs`:

```js
import { createBookId, createNoteId, normalizeText } from './ids.mjs';

function stripHtml(raw) {
  return String(raw)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(h1|h2|h3|p|div|blockquote|br)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractBody(raw) {
  const content = String(raw);
  const headerSplit = content.split(/\r?\n\r?\n/);
  const withoutHeaders = headerSplit.length > 1 && /^from:|^subject:|^content-type:/im.test(headerSplit[0])
    ? headerSplit.slice(1).join('\n\n')
    : content;

  return stripHtml(withoutHeaders)
    .split(/\r?\n/)
    .map((line) => normalizeText(line))
    .filter(Boolean);
}

function parseMarker(line) {
  const match = line.match(/^(Highlight|Note)\s*\((Location\s+\d+|Page\s+\d+)\)$/i);
  if (!match) return null;
  const marker = match[2];
  return {
    location: marker.startsWith('Location') ? marker : '',
    page: marker.startsWith('Page') ? marker : ''
  };
}

export function parseKindleSource(raw, { path = 'unknown' } = {}) {
  const lines = extractBody(raw);
  const warnings = [];
  const firstMarkerIndex = lines.findIndex((line) => parseMarker(line));

  if (firstMarkerIndex < 0) {
    return {
      books: [],
      warnings: [{ path, reason: 'No Kindle highlight blocks found' }]
    };
  }

  const title = lines[0] || 'Untitled';
  const author = firstMarkerIndex > 1 ? lines[1] : '';
  const book = {
    id: createBookId({ title, author }),
    title,
    author,
    source: 'kindle',
    notes: []
  };

  for (let index = firstMarkerIndex; index < lines.length; index += 1) {
    const marker = parseMarker(lines[index]);
    if (!marker) continue;

    const quote = lines[index + 1] || '';
    if (!quote || parseMarker(quote)) {
      warnings.push({ path, reason: `Missing quote after ${lines[index]}` });
      continue;
    }

    book.notes.push({
      id: createNoteId({ title, quote, location: marker.location, page: marker.page }),
      quote,
      location: marker.location,
      page: marker.page,
      highlightedAt: '',
      tags: [],
      status: 'new',
      extension: ''
    });
  }

  if (book.notes.length === 0) {
    warnings.push({ path, reason: 'No Kindle notes parsed' });
    return { books: [], warnings };
  }

  return { books: [book], warnings };
}
```

- [ ] **Step 5: Run parser tests**

Run:

```bash
npm test
```

Expected: PASS for ID and parser tests.

- [ ] **Step 6: Commit parser**

Run:

```bash
git add scripts/lib/parse-kindle-note.mjs test/fixtures test/parse-kindle-note.test.mjs
git commit -m "feat: parse Kindle note sources"
```

---

### Task 3: Merge Logic and Import CLI

**Files:**
- Create: `scripts/lib/merge-books.mjs`
- Create: `scripts/import-notes.mjs`
- Create: `test/merge-books.test.mjs`

- [ ] **Step 1: Write failing merge tests**

Create `test/merge-books.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeBooks } from '../scripts/lib/merge-books.mjs';

const now = '2026-06-23T00:00:00.000Z';

test('mergeBooks inserts new books and stamps timestamps', () => {
  const result = mergeBooks([], [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    notes: [{ id: 'note-1', quote: 'Focus.', location: 'Location 1', page: '', highlightedAt: '', tags: [], status: 'new', extension: '' }]
  }], { now });

  assert.equal(result.books.length, 1);
  assert.equal(result.books[0].firstImportedAt, now);
  assert.equal(result.books[0].lastImportedAt, now);
  assert.equal(result.books[0].notes[0].createdAt, now);
  assert.equal(result.books[0].notes[0].updatedAt, now);
});

test('mergeBooks preserves user extension fields on repeated import', () => {
  const existing = [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    firstImportedAt: '2026-01-01T00:00:00.000Z',
    lastImportedAt: '2026-01-01T00:00:00.000Z',
    notes: [{
      id: 'note-1',
      quote: 'Focus.',
      location: 'Location 1',
      page: '',
      highlightedAt: '',
      tags: ['attention'],
      status: 'expanded',
      extension: 'My own expansion.',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    }]
  }];

  const incoming = [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    notes: [{ id: 'note-1', quote: 'Focus.', location: 'Location 1', page: '', highlightedAt: '', tags: [], status: 'new', extension: '' }]
  }];

  const result = mergeBooks(existing, incoming, { now });
  const note = result.books[0].notes[0];

  assert.equal(result.books[0].notes.length, 1);
  assert.deepEqual(note.tags, ['attention']);
  assert.equal(note.status, 'expanded');
  assert.equal(note.extension, 'My own expansion.');
  assert.equal(note.updatedAt, '2026-01-02T00:00:00.000Z');
});
```

- [ ] **Step 2: Run merge tests and verify failure**

Run:

```bash
node --test test/merge-books.test.mjs
```

Expected: FAIL with `Cannot find module` for `scripts/lib/merge-books.mjs`.

- [ ] **Step 3: Implement merge module**

Create `scripts/lib/merge-books.mjs`:

```js
function stampNewNote(note, now) {
  return {
    highlightedAt: '',
    tags: [],
    status: 'new',
    extension: '',
    ...note,
    createdAt: note.createdAt || now,
    updatedAt: note.updatedAt || now
  };
}

export function mergeBooks(existingBooks, incomingBooks, { now = new Date().toISOString() } = {}) {
  const booksById = new Map(existingBooks.map((book) => [book.id, { ...book, notes: [...(book.notes || [])] }]));

  for (const incomingBook of incomingBooks) {
    const existingBook = booksById.get(incomingBook.id);

    if (!existingBook) {
      booksById.set(incomingBook.id, {
        ...incomingBook,
        firstImportedAt: now,
        lastImportedAt: now,
        notes: incomingBook.notes.map((note) => stampNewNote(note, now))
      });
      continue;
    }

    const notesById = new Map(existingBook.notes.map((note) => [note.id, note]));
    for (const incomingNote of incomingBook.notes) {
      const existingNote = notesById.get(incomingNote.id);
      if (existingNote) {
        notesById.set(incomingNote.id, {
          ...incomingNote,
          tags: existingNote.tags || [],
          status: existingNote.status || 'new',
          extension: existingNote.extension || '',
          createdAt: existingNote.createdAt || now,
          updatedAt: existingNote.updatedAt || existingNote.createdAt || now
        });
      } else {
        notesById.set(incomingNote.id, stampNewNote(incomingNote, now));
      }
    }

    booksById.set(incomingBook.id, {
      ...existingBook,
      title: incomingBook.title || existingBook.title,
      author: incomingBook.author || existingBook.author,
      source: incomingBook.source || existingBook.source,
      lastImportedAt: now,
      notes: [...notesById.values()].sort((a, b) => a.id.localeCompare(b.id))
    });
  }

  return {
    books: [...booksById.values()].sort((a, b) => a.title.localeCompare(b.title))
  };
}
```

- [ ] **Step 4: Implement import CLI**

Create `scripts/import-notes.mjs`:

```js
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parseKindleSource } from './lib/parse-kindle-note.mjs';
import { mergeBooks } from './lib/merge-books.mjs';
import { sha256 } from './lib/ids.mjs';

const root = process.cwd();
const importsDir = join(root, 'imports');
const dataDir = join(root, 'data');
const booksPath = join(dataDir, 'books.json');
const sourcesPath = join(dataDir, 'sources.json');
const supported = new Set(['.txt', '.html', '.eml']);

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

function extensionOf(path) {
  const match = path.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : '';
}

await mkdir(importsDir, { recursive: true });
await mkdir(dataDir, { recursive: true });

const existingBooks = await readJson(booksPath, []);
const existingSources = await readJson(sourcesPath, []);
const sourceByKey = new Map(existingSources.map((source) => [`${source.path}:${source.sha256}`, source]));
const entries = (await readdir(importsDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => join(importsDir, entry.name))
  .filter((path) => supported.has(extensionOf(path)));

const allIncomingBooks = [];
const nextSources = [...existingSources];
let importedFiles = 0;

for (const path of entries) {
  const raw = await readFile(path, 'utf8');
  const digest = sha256(raw);
  const displayPath = relative(root, path);
  const sourceKey = `${displayPath}:${digest}`;

  if (sourceByKey.has(sourceKey)) continue;

  const parsed = parseKindleSource(raw, { path: displayPath });
  nextSources.push({
    path: displayPath,
    sha256: digest,
    importedAt: new Date().toISOString(),
    notesFound: parsed.books.reduce((sum, book) => sum + book.notes.length, 0),
    warnings: parsed.warnings
  });

  if (parsed.books.length > 0) {
    allIncomingBooks.push(...parsed.books);
    importedFiles += 1;
  }
}

if (allIncomingBooks.length > 0) {
  const merged = mergeBooks(existingBooks, allIncomingBooks);
  await writeFile(booksPath, `${JSON.stringify(merged.books, null, 2)}\n`);
}

await writeFile(sourcesPath, `${JSON.stringify(nextSources, null, 2)}\n`);

console.log(`Scanned ${entries.length} source file(s).`);
console.log(`Imported ${importedFiles} file(s).`);
console.log(`Parsed ${allIncomingBooks.reduce((sum, book) => sum + book.notes.length, 0)} note(s).`);
```

- [ ] **Step 5: Run tests and importer**

Run:

```bash
npm test
npm run import
```

Expected: tests PASS. Import command prints scan and import counts without throwing.

- [ ] **Step 6: Commit merge and import CLI**

Run:

```bash
git add scripts/lib/merge-books.mjs scripts/import-notes.mjs test/merge-books.test.mjs
git commit -m "feat: import Kindle notes into JSON"
```

---

### Task 4: HTML Renderer and Build CLI

**Files:**
- Create: `scripts/lib/render-html.mjs`
- Create: `scripts/build-html.mjs`
- Create: `public/assets/app.css`
- Create: `public/assets/app.js`
- Create: `test/build-html.test.mjs`

- [ ] **Step 1: Write failing renderer tests**

Create `test/build-html.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderBookPage, renderIndexPage } from '../scripts/lib/render-html.mjs';

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
```

- [ ] **Step 2: Run renderer tests and verify failure**

Run:

```bash
node --test test/build-html.test.mjs
```

Expected: FAIL with `Cannot find module` for `scripts/lib/render-html.mjs`.

- [ ] **Step 3: Implement renderer module**

Create `scripts/lib/render-html.mjs`:

```js
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pageShell({ title, body }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="../assets/app.css">
</head>
<body>
${body}
  <script src="../assets/app.js"></script>
</body>
</html>
`;
}

export function renderIndexPage(books) {
  const items = books.map((book) => {
    const href = `books/${book.id}.html`;
    const searchable = `${book.title} ${book.author} ${book.notes.map((note) => note.quote).join(' ')}`;
    return `<article class="book-card" data-search="${escapeHtml(searchable.toLowerCase())}">
      <a href="${escapeHtml(href)}">
        <h2>${escapeHtml(book.title)}</h2>
        <p>${escapeHtml(book.author || 'Unknown author')}</p>
        <span>${book.notes.length} notes</span>
      </a>
    </article>`;
  }).join('\n');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kindle Notes</title>
  <link rel="stylesheet" href="assets/app.css">
</head>
<body>
  <main class="page">
    <header class="hero">
      <h1>Kindle Notes</h1>
      <input id="search" type="search" placeholder="Search books, authors, and highlights" aria-label="Search">
    </header>
    <section class="book-grid">${items}</section>
  </main>
  <script src="assets/app.js"></script>
</body>
</html>
`;
}

export function renderBookPage(book) {
  const notes = book.notes.map((note) => {
    const meta = [note.location, note.page, note.highlightedAt].filter(Boolean).join(' · ');
    const tags = (note.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    return `<article class="note" data-search="${escapeHtml(`${note.quote} ${note.extension} ${(note.tags || []).join(' ')}`.toLowerCase())}">
      <blockquote>${escapeHtml(note.quote)}</blockquote>
      <p class="meta">${escapeHtml(meta || 'No location')}</p>
      <p class="status">${escapeHtml(note.status || 'new')}</p>
      <div class="tags">${tags}</div>
      <section class="extension">${escapeHtml(note.extension || 'No extension yet.')}</section>
    </article>`;
  }).join('\n');

  return pageShell({
    title: `${book.title} - Kindle Notes`,
    body: `  <main class="page">
    <nav><a href="../index.html">Back to all books</a></nav>
    <header class="hero">
      <h1>${escapeHtml(book.title)}</h1>
      <p>${escapeHtml(book.author || 'Unknown author')}</p>
      <input id="search" type="search" placeholder="Filter notes" aria-label="Filter notes">
    </header>
    <section class="notes">${notes}</section>
  </main>`
  });
}
```

- [ ] **Step 4: Implement CSS, client search, and build CLI**

Create `public/assets/app.css`:

```css
:root {
  color-scheme: light;
  --bg: #f6f5f2;
  --text: #202124;
  --muted: #62615c;
  --line: #d8d4ca;
  --panel: #ffffff;
  --accent: #0f6f68;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.6;
}

.page {
  width: min(1100px, calc(100% - 32px));
  margin: 0 auto;
  padding: 32px 0;
}

.hero {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

h1,
h2,
p {
  margin: 0;
}

input[type="search"] {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 0 12px;
  font: inherit;
}

.book-grid,
.notes {
  display: grid;
  gap: 12px;
}

.book-card,
.note {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  padding: 16px;
}

.book-card a {
  color: inherit;
  display: grid;
  gap: 4px;
  text-decoration: none;
}

.meta,
.status,
.tag {
  color: var(--muted);
  font-size: 14px;
}

blockquote {
  margin: 0;
  border-left: 4px solid var(--accent);
  padding-left: 12px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
}

.tag {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 2px 8px;
}

.extension {
  white-space: pre-wrap;
}

[hidden] {
  display: none !important;
}
```

Create `public/assets/app.js`:

```js
const search = document.querySelector('#search');

if (search) {
  const searchableItems = [...document.querySelectorAll('[data-search]')];
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    for (const item of searchableItems) {
      item.hidden = query.length > 0 && !item.dataset.search.includes(query);
    }
  });
}
```

Create `scripts/build-html.mjs`:

```js
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { renderBookPage, renderIndexPage } from './lib/render-html.mjs';

const root = process.cwd();
const dataPath = join(root, 'data', 'books.json');
const publicDir = join(root, 'public');
const booksDir = join(publicDir, 'books');

const books = JSON.parse(await readFile(dataPath, 'utf8'));

await mkdir(booksDir, { recursive: true });
await mkdir(join(publicDir, 'assets'), { recursive: true });
await writeFile(join(publicDir, 'index.html'), renderIndexPage(books));

for (const book of books) {
  await writeFile(join(booksDir, `${book.id}.html`), renderBookPage(book));
}

console.log(`Built ${books.length} book page(s).`);
```

- [ ] **Step 5: Run renderer tests and build**

Run:

```bash
npm test
npm run build
```

Expected: tests PASS. Build command creates `public/index.html` and prints page count.

- [ ] **Step 6: Commit renderer and build CLI**

Run:

```bash
git add scripts/lib/render-html.mjs scripts/build-html.mjs public/assets/app.css public/assets/app.js test/build-html.test.mjs
git commit -m "feat: build static Kindle note HTML"
```

---

### Task 5: End-to-End Verification and Documentation

**Files:**
- Create: `README.md`
- Modify: `data/books.json`
- Modify: `data/sources.json`
- Modify: `public/index.html`
- Modify: `public/books/book-deep-work-cal-newport.html`

- [ ] **Step 1: Seed imports with sample fixture for manual verification**

Run:

```bash
cp test/fixtures/kindle-sample.txt imports/kindle-sample.txt
```

Expected: `imports/kindle-sample.txt` exists.

- [ ] **Step 2: Run the full pipeline**

Run:

```bash
npm test
npm run import
npm run build
```

Expected:

```text
npm test exits with status 0
Scanned 1 source file(s).
Imported 1 file(s).
Parsed 3 note(s).
Built 1 book page(s).
```

- [ ] **Step 3: Verify generated files contain expected content**

Run:

```bash
rg -n "Deep Work|Focus deeply|Attention residue" data/books.json public/index.html public/books
```

Expected: matches in `data/books.json`, `public/index.html`, and `public/books/book-deep-work-cal-newport.html`.

- [ ] **Step 4: Write README**

Create `README.md`:

```md
# Kindle Note

Local Kindle note library for importing saved Kindle note files, preserving personal extensions, and generating static HTML pages.

## Workflow

1. Place `.txt`, `.html`, or `.eml` Kindle note files in `imports/`.
2. Run `npm run import`.
3. Run `npm run build`.
4. Open `public/index.html`, or run `npm run dev` and open `http://localhost:4173`.

## Data

- `data/books.json` is the durable note database.
- `data/sources.json` records imported source fingerprints and parser warnings.
- `public/` is generated and can be rebuilt from `data/books.json`.

Manual note extensions live in `data/books.json` under each note's `extension`, `tags`, and `status` fields. Re-importing the same Kindle note preserves those fields.

## Commands

```bash
npm test
npm run import
npm run build
npm run dev
```
```

- [ ] **Step 5: Commit verified output and docs**

Run:

```bash
git add README.md imports/kindle-sample.txt data/books.json data/sources.json public/index.html public/books
git commit -m "docs: document Kindle note workflow"
```

- [ ] **Step 6: Push completed implementation**

Run:

```bash
git status --short --branch
git push
```

Expected: clean working tree and successful push to `origin/main`.
