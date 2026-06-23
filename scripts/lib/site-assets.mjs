export const APP_CSS = `:root {
  color-scheme: light;
  --bg: #eeeeec;
  --paper: #f7f7f5;
  --panel: #ffffff;
  --rail: #282d30;
  --rail-active: #424648;
  --rail-text: #f3f4f2;
  --rail-muted: #a8adaf;
  --text: #333333;
  --muted: #858585;
  --line: #dededb;
  --line-strong: #cfcfca;
  --accent: #e6525e;
  --accent-soft: #fff0f2;
  --shadow: 0 24px 70px rgba(37, 39, 41, 0.18);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: radial-gradient(circle at top, #ffffff 0, var(--bg) 48rem);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.6;
}

h1,
h2,
p {
  margin: 0;
}

a {
  color: inherit;
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

.hero h1 {
  font-size: clamp(34px, 6vw, 56px);
  line-height: 1.05;
}

input[type="search"] {
  width: 100%;
  min-height: 38px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfbfa;
  color: var(--text);
  padding: 0 12px;
  font: inherit;
}

input[type="search"]:focus,
button:focus-visible,
a:focus-visible,
textarea:focus {
  outline: 2px solid rgba(230, 82, 94, 0.32);
  outline-offset: 2px;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.book-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  padding: 16px;
}

.book-card a {
  display: grid;
  gap: 4px;
  text-decoration: none;
}

.reader-shell {
  display: grid;
  grid-template-columns: 320px 430px minmax(0, 1fr);
  min-height: 100vh;
  margin: 0;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: var(--panel);
  box-shadow: none;
}

.library-pane {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 20px;
  overflow: auto;
  background: var(--rail);
  color: var(--rail-text);
  padding: 24px 22px;
}

.window-controls {
  display: flex;
  gap: 8px;
  margin: 4px 0 10px;
}

.window-controls span {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #ff5f57;
}

.window-controls span:nth-child(2) {
  background: #febc2e;
}

.window-controls span:nth-child(3) {
  background: #28c840;
}

.back-link {
  width: fit-content;
  color: var(--rail-muted);
  font-size: 14px;
  text-decoration: none;
}

.library-section {
  display: grid;
  gap: 10px;
}

.library-section h2 {
  color: var(--rail-muted);
  font-size: 13px;
  font-weight: 700;
}

.library-books,
.chapter-list,
.note-list,
.notes {
  display: grid;
  gap: 8px;
}

.library-book,
.chapter-link {
  display: grid;
  min-width: 0;
  gap: 2px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--rail-muted);
  padding: 9px 10px;
  text-align: left;
  text-decoration: none;
}

.library-book span,
.chapter-link span,
.note-list-item span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.library-book span,
.chapter-link span {
  white-space: nowrap;
}

.library-book small,
.chapter-link small {
  color: inherit;
  font-size: 12px;
  opacity: 0.75;
}

.library-book[aria-current="page"],
.chapter-link[aria-current="true"] {
  background: var(--rail-active);
  color: var(--rail-text);
}

.note-list-pane {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 14px;
  overflow: auto;
  border-right: 1px solid var(--line);
  background: var(--paper);
  padding: 26px 20px;
}

.list-header {
  display: grid;
  gap: 14px;
}

.list-header h1 {
  font-size: 22px;
  line-height: 1.2;
}

.list-header p {
  color: var(--muted);
  font-size: 14px;
}

.eyebrow {
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
}

.note-list-item {
  display: grid;
  width: 100%;
  min-height: 118px;
  gap: 6px;
  border: 0;
  border-left: 4px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  padding: 14px 16px;
  text-align: left;
}

.note-list-item[aria-current="true"] {
  border-left-color: var(--accent);
  background: var(--panel);
  box-shadow: 0 8px 20px rgba(40, 45, 48, 0.06);
}

.note-list-item strong {
  font-size: 16px;
  line-height: 1.25;
}

.note-list-item span {
  display: -webkit-box;
  color: #696969;
  font-size: 14px;
  line-height: 1.45;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-list-item small,
.meta,
.status,
.tag {
  color: var(--muted);
  font-size: 13px;
}

.detail-pane {
  min-width: 0;
  overflow: auto;
  background: var(--panel);
  padding: 34px min(6vw, 88px) 56px;
}

.detail-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 32px;
}

.detail-card {
  display: grid;
  width: 100%;
  max-width: 1120px;
  gap: 22px;
  margin: 0 auto;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.detail-header h1 {
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.1;
}

.status {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 2px 10px;
}

.quote-block,
.note-markdown {
  display: grid;
  gap: 12px;
}

.quote-block h2,
.note-markdown h2 {
  font-size: 18px;
}

blockquote {
  margin: 0;
  border-left: 4px solid var(--accent);
  padding: 2px 0 2px 16px;
  color: #3f3f3f;
  font-size: 21px;
  font-weight: 650;
  line-height: 1.72;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 2px 8px;
}

.note-input {
  width: 100%;
  min-height: 320px;
  resize: vertical;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfbfa;
  padding: 16px;
  color: #454545;
  font: inherit;
  font-size: 17px;
  line-height: 1.7;
}

.note-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

button {
  width: fit-content;
  border: 1px solid var(--line);
  border-radius: 8px;
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

[hidden] {
  display: none !important;
}

@media (max-width: 1020px) {
  .reader-shell {
    grid-template-columns: 250px minmax(300px, 380px) minmax(0, 1fr);
  }

  .detail-pane {
    padding: 22px;
  }
}

@media (max-width: 820px) {
  .reader-shell {
    display: flex;
    min-height: 100vh;
    margin: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    flex-direction: column;
  }

  .library-pane,
  .note-list-pane,
  .detail-pane {
    overflow: visible;
  }

  .library-pane {
    max-height: 42vh;
  }

  .note-list-pane {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
}
`;

export const APP_JS = `const search = document.querySelector('#search');
const chapterButtons = [...document.querySelectorAll('[data-chapter-filter]')];
const noteListItems = [...document.querySelectorAll('[data-note-target]')];
const detailCards = [...document.querySelectorAll('.detail-card[data-note-id]')];
let activeChapter = chapterButtons.find((button) => button.getAttribute('aria-current') === 'true')?.dataset.chapterFilter || chapterButtons[0]?.dataset.chapterFilter || '';
let activeSearchQuery = '';

function selectNote(noteId) {
  if (!noteId) return;

  for (const item of noteListItems) {
    item.setAttribute('aria-current', item.dataset.noteTarget === noteId ? 'true' : 'false');
  }

  for (const card of detailCards) {
    card.hidden = card.dataset.noteId !== noteId;
  }
}

function applyNoteFilters() {
  for (const item of noteListItems) {
    const matchesChapter = !activeChapter || item.dataset.chapter === activeChapter;
    const matchesSearch = !activeSearchQuery || item.dataset.search.includes(activeSearchQuery);
    item.hidden = !(matchesChapter && matchesSearch);
  }

  const currentItem = noteListItems.find((item) => item.getAttribute('aria-current') === 'true' && !item.hidden);
  const nextItem = currentItem || noteListItems.find((item) => !item.hidden);
  selectNote(nextItem?.dataset.noteTarget || '');
}

if (noteListItems.length > 0) {
  for (const item of noteListItems) {
    item.addEventListener('click', () => selectNote(item.dataset.noteTarget));
  }

  for (const button of chapterButtons) {
    button.addEventListener('click', () => {
      activeChapter = button.dataset.chapterFilter || '';

      for (const item of chapterButtons) {
        item.setAttribute('aria-current', item === button ? 'true' : 'false');
      }

      applyNoteFilters();
    });
  }

  if (search) {
    search.addEventListener('input', () => {
      activeSearchQuery = search.value.trim().toLowerCase();
      applyNoteFilters();
    });
  }

  applyNoteFilters();
} else if (search) {
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
const editedNotes = new Map();

for (const note of document.querySelectorAll('[data-note-id]')) {
  const input = note.querySelector('[data-note-input]');
  if (!input) continue;

  input.addEventListener('input', () => {
    note.dataset.noteSource = input.value;
    editedNotes.set(note.dataset.noteId, input.value);
    if (exportButton) exportButton.disabled = false;
  });
}

if (exportButton && booksData) {
  exportButton.addEventListener('click', () => {
    try {
      for (const book of booksData) {
        for (const note of book.notes || []) {
          if (editedNotes.has(note.id)) {
            note.note = editedNotes.get(note.id);
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
