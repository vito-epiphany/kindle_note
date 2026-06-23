# Markdown Extension Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add simple static-page Markdown editing for each note's `extension` field and export updated `books.json`.

**Architecture:** Keep the app static. `render-html.mjs` emits note ids, extension source, edit controls, and the current book data JSON; `site-assets.mjs` owns the client Markdown renderer, edit/apply/cancel behavior, and export logic. No backend, framework, or browser filesystem writeback is added.

**Tech Stack:** Node.js ES modules, `node:test`, static HTML/CSS/JavaScript, browser Blob download API.

---

## File Map

- Modify `scripts/lib/render-html.mjs`: render Markdown preview containers, edit controls, note identifiers, and embedded book JSON.
- Modify `scripts/lib/site-assets.mjs`: add Markdown rendering, edit state, preview updates, and `books.json` export behavior.
- Modify `test/build-html.test.mjs`: cover edit controls, escaping, Markdown rendering helper behavior via generated asset text, and static export data.
- Modify `README.md`: document Markdown extension workflow and replacement of `data/books.json`.

---

### Task 1: Render Editable Extension Data

**Files:**
- Modify: `scripts/lib/render-html.mjs`
- Modify: `test/build-html.test.mjs`

- [ ] **Step 1: Write failing renderer tests**

Add these assertions to `test/build-html.test.mjs` inside `renderBookPage escapes content and renders extension fields`:

```js
assert.match(html, /data-note-id="note-1"/);
assert.match(html, /data-extension-source="Connect this to planning blocks\."/);
assert.match(html, /class="extension-preview"/);
assert.match(html, /class="extension-editor"/);
assert.match(html, /data-action="edit-extension"/);
assert.match(html, /data-action="apply-extension"/);
assert.match(html, /data-action="cancel-extension"/);
assert.match(html, /id="export-json"/);
assert.match(html, /<script type="application\/json" id="book-data">/);
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test test/build-html.test.mjs
```

Expected: FAIL because editable extension controls are not rendered.

- [ ] **Step 3: Implement minimal renderer changes**

In `scripts/lib/render-html.mjs`, add JSON-safe escaping:

```js
function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function escapeScriptJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
```

Update each note article in `renderBookPage(book)` to include:

```js
const extension = note.extension || '';

return `<article class="note" data-note-id="${escapeAttribute(note.id)}" data-extension-source="${escapeAttribute(extension)}" data-search="${escapeHtml(searchable)}">
      <blockquote>${escapeHtml(note.quote)}</blockquote>
      <p class="meta">${escapeHtml(meta || 'No location')}</p>
      <p class="status">${escapeHtml(note.status || 'new')}</p>
      <div class="tags">${renderedTags}</div>
      <section class="extension">
        <div class="extension-preview" data-extension-preview>${escapeHtml(extension || '暂无拓展')}</div>
        <div class="extension-editor" data-extension-editor hidden>
          <textarea data-extension-input aria-label="Markdown extension">${escapeHtml(extension)}</textarea>
          <div class="extension-actions">
            <button type="button" data-action="apply-extension">Apply</button>
            <button type="button" data-action="cancel-extension">Cancel</button>
          </div>
        </div>
        <button type="button" data-action="edit-extension">Edit</button>
      </section>
    </article>`;
```

Add an Export button and book JSON to the book page body:

```js
    <button type="button" id="export-json" disabled>Export books.json</button>
    <section class="notes">${notes}</section>
    <script type="application/json" id="book-data">${escapeScriptJson(book)}</script>
```

- [ ] **Step 4: Run renderer tests**

Run:

```bash
node --test test/build-html.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add scripts/lib/render-html.mjs test/build-html.test.mjs
git commit -m "feat: render extension edit controls"
```

---

### Task 2: Static Markdown Editing Behavior

**Files:**
- Modify: `scripts/lib/site-assets.mjs`
- Modify: `test/build-html.test.mjs`

- [ ] **Step 1: Write failing asset tests**

Add a test to `test/build-html.test.mjs`:

```js
import { APP_JS } from '../scripts/lib/site-assets.mjs';

test('app asset includes markdown editing and export behavior', () => {
  assert.match(APP_JS, /function renderMarkdown/);
  assert.match(APP_JS, /escapeHtml/);
  assert.match(APP_JS, /data-action="edit-extension"/);
  assert.match(APP_JS, /data-action="apply-extension"/);
  assert.match(APP_JS, /data-action="cancel-extension"/);
  assert.match(APP_JS, /export-json/);
  assert.match(APP_JS, /new Blob/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test test/build-html.test.mjs
```

Expected: FAIL because `APP_JS` does not contain Markdown editing/export behavior.

- [ ] **Step 3: Implement static client behavior**

In `scripts/lib/site-assets.mjs`, replace `APP_JS` with code that keeps existing search behavior and adds:

```js
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function renderMarkdown(source) {
  const text = String(source ?? '').trim();
  if (!text) return '<p class="empty-extension">暂无拓展</p>';
  return text.split(/\n{2,}/).map((block) => {
    if (/^```/.test(block)) return '<pre><code>' + escapeHtml(block.replace(/^```[a-zA-Z0-9_-]*\n?|\n?```$/g, '')) + '</code></pre>';
    if (/^#{1,3}\s+/.test(block)) {
      const level = block.match(/^#{1,3}/)[0].length;
      return '<h' + level + '>' + renderInlineMarkdown(block.replace(/^#{1,3}\s+/, '')) + '</h' + level + '>';
    }
    if (/^>\s?/m.test(block)) return '<blockquote>' + renderInlineMarkdown(block.replace(/^>\s?/gm, '')) + '</blockquote>';
    if (/^[-*]\s+/m.test(block)) return '<ul>' + block.split('\n').map((line) => '<li>' + renderInlineMarkdown(line.replace(/^[-*]\s+/, '')) + '</li>').join('') + '</ul>';
    if (/^\d+\.\s+/m.test(block)) return '<ol>' + block.split('\n').map((line) => '<li>' + renderInlineMarkdown(line.replace(/^\d+\.\s+/, '')) + '</li>').join('') + '</ol>';
    return '<p>' + renderInlineMarkdown(block).replace(/\n/g, '<br>') + '</p>';
  }).join('');
}
```

Then add edit/export initialization:

```js
const bookDataScript = document.querySelector('#book-data');
const exportButton = document.querySelector('#export-json');
const bookData = bookDataScript ? JSON.parse(bookDataScript.textContent) : null;
const editedExtensions = new Map();

for (const note of document.querySelectorAll('[data-note-id]')) {
  const preview = note.querySelector('[data-extension-preview]');
  const editor = note.querySelector('[data-extension-editor]');
  const input = note.querySelector('[data-extension-input]');
  const edit = note.querySelector('[data-action="edit-extension"]');
  const apply = note.querySelector('[data-action="apply-extension"]');
  const cancel = note.querySelector('[data-action="cancel-extension"]');
  if (!preview || !editor || !input || !edit || !apply || !cancel) continue;
  preview.innerHTML = renderMarkdown(note.dataset.extensionSource || '');
  edit.addEventListener('click', () => {
    input.value = note.dataset.extensionSource || '';
    editor.hidden = false;
    edit.hidden = true;
  });
  apply.addEventListener('click', () => {
    note.dataset.extensionSource = input.value;
    preview.innerHTML = renderMarkdown(input.value);
    editedExtensions.set(note.dataset.noteId, input.value);
    editor.hidden = true;
    edit.hidden = false;
    if (exportButton) exportButton.disabled = false;
  });
  cancel.addEventListener('click', () => {
    input.value = note.dataset.extensionSource || '';
    editor.hidden = true;
    edit.hidden = false;
  });
}

if (exportButton && bookData) {
  exportButton.addEventListener('click', () => {
    for (const note of bookData.notes || []) {
      if (editedExtensions.has(note.id)) note.extension = editedExtensions.get(note.id);
    }
    const blob = new Blob([JSON.stringify([bookData], null, 2) + '\\n'], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'books.json';
    link.click();
    URL.revokeObjectURL(link.href);
  });
}
```

- [ ] **Step 4: Add CSS for editor**

Append to `APP_CSS`:

```css
.extension {
  display: grid;
  gap: 10px;
}

.extension-preview {
  border-top: 1px solid var(--line);
  padding-top: 10px;
}

.extension-editor textarea {
  width: 100%;
  min-height: 140px;
  resize: vertical;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 10px;
  font: inherit;
}

.extension-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

button {
  width: fit-content;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--panel);
  color: var(--text);
  min-height: 36px;
  padding: 0 12px;
  font: inherit;
}

button:not(:disabled) {
  cursor: pointer;
}

button:disabled {
  color: var(--muted);
}

pre {
  overflow-x: auto;
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add scripts/lib/site-assets.mjs test/build-html.test.mjs
git commit -m "feat: edit note extensions as markdown"
```

---

### Task 3: Documentation, Build, and Browser Verification

**Files:**
- Modify: `README.md`
- Modify generated files under `public/`

- [ ] **Step 1: Update README**

Add a section:

```md
## Editing Markdown Extensions

Book pages let you edit each note's `extension` field as Markdown. Click `Edit`, write Markdown, click `Apply`, then use `Export books.json` to download updated data.

Because the site is static, the browser does not write directly to local files. Replace `data/books.json` with the exported file, then run:

```bash
npm run build
```
```

- [ ] **Step 2: Rebuild static output**

Run:

```bash
npm test
npm run build
```

Expected: tests PASS and build prints `Built 2 book page(s).` when the real imported note data is present locally.

- [ ] **Step 3: Verify current real page manually**

Open or reload:

```text
file:///Users/alsc/Documents/%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0/.worktrees/kindle-note-local-html/public/books/book-boden-z-library-sk-1lib-sk-z-lib-sk-boden.html
```

Expected:

- each note has an Edit button
- clicking Edit shows a Markdown textarea
- Apply updates the preview
- Export button enables after Apply

- [ ] **Step 4: Commit docs and generated static assets**

Run:

```bash
git add README.md public/index.html public/books public/assets
git commit -m "docs: document markdown extension editing"
```
