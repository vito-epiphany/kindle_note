export const APP_CSS = `:root {
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

input[type="search"]:focus {
  outline: 2px solid color-mix(in srgb, var(--accent) 35%, white);
  outline-offset: 1px;
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

.book-card a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
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

[hidden] {
  display: none !important;
}

.extension {
  display: grid;
  gap: 10px;
}

.extension-preview {
  border-top: 1px solid var(--line);
  padding-top: 10px;
}

.extension-preview p,
.extension-preview ul,
.extension-preview ol,
.extension-preview blockquote,
.extension-preview pre,
.extension-preview h1,
.extension-preview h2,
.extension-preview h3 {
  margin: 0 0 10px;
}

.extension-preview code {
  background: var(--bg);
  border-radius: 4px;
  padding: 1px 4px;
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
`;

export const APP_JS = `function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\\\`([^\\\`]+)\\\`/g, '<code>$1</code>')
    .replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\*([^*]+)\\*/g, '<em>$1</em>')
    .replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^)\\s]+)\\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function renderMarkdown(source) {
  const text = String(source ?? '').trim();
  if (!text) return '<p class="empty-extension">暂无拓展</p>';

  return text.split(/\\n{2,}/).map((block) => {
    if (/^\\\`\\\`\\\`/.test(block)) {
      const code = block.replace(/^\\\`\\\`\\\`[a-zA-Z0-9_-]*\\n?|\\n?\\\`\\\`\\\`$/g, '');
      return '<pre><code>' + escapeHtml(code) + '</code></pre>';
    }

    if (/^#{1,3}\\s+/.test(block)) {
      const level = block.match(/^#{1,3}/)[0].length;
      return '<h' + level + '>' + renderInlineMarkdown(block.replace(/^#{1,3}\\s+/, '')) + '</h' + level + '>';
    }

    if (/^>\\s?/m.test(block)) {
      return '<blockquote>' + renderInlineMarkdown(block.replace(/^>\\s?/gm, '')) + '</blockquote>';
    }

    if (/^[-*]\\s+/m.test(block)) {
      return '<ul>' + block.split('\\n').map((line) => '<li>' + renderInlineMarkdown(line.replace(/^[-*]\\s+/, '')) + '</li>').join('') + '</ul>';
    }

    if (/^\\d+\\.\\s+/m.test(block)) {
      return '<ol>' + block.split('\\n').map((line) => '<li>' + renderInlineMarkdown(line.replace(/^\\d+\\.\\s+/, '')) + '</li>').join('') + '</ol>';
    }

    return '<p>' + renderInlineMarkdown(block).replace(/\\n/g, '<br>') + '</p>';
  }).join('');
}

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

const booksDataScript = document.querySelector('#books-data');
const exportButton = document.querySelector('#export-json');
const booksData = booksDataScript ? JSON.parse(booksDataScript.textContent) : null;
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

if (exportButton && booksData) {
  exportButton.addEventListener('click', () => {
    try {
      for (const book of booksData) {
        for (const note of book.notes || []) {
          if (editedExtensions.has(note.id)) {
            note.extension = editedExtensions.get(note.id);
            note.updatedAt = new Date().toISOString();
          }
        }
      }

      const blob = new Blob([JSON.stringify(booksData, null, 2) + '\\n'], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'books.json';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      alert('Export failed: ' + error.message);
    }
  });
}
`;
