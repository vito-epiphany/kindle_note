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
  --library-width: 320px;
  --note-list-width: 430px;
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
  grid-template-columns: var(--library-width) 8px var(--note-list-width) 8px minmax(0, 1fr);
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
  gap: 18px;
  overflow: auto;
  background: var(--rail);
  color: var(--rail-text);
  padding: 30px 18px 24px;
}

.sidebar-resizer,
.note-list-resizer {
  position: relative;
  width: 8px;
  min-width: 8px;
  border: 0;
  background: var(--paper);
  cursor: col-resize;
  touch-action: none;
}

.sidebar-resizer::before,
.note-list-resizer::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 3px;
  width: 1px;
  background: var(--line);
  content: "";
  opacity: 0.75;
}

.sidebar-resizer:hover::before,
.sidebar-resizer:focus-visible::before,
.note-list-resizer:hover::before,
.note-list-resizer:focus-visible::before,
.reader-shell[data-resizing-sidebar="true"] .sidebar-resizer::before,
.reader-shell[data-resizing-note-list="true"] .note-list-resizer::before {
  background: var(--accent);
  opacity: 1;
}

.library-section {
  display: grid;
  gap: 8px;
}

.section-toggle {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: 10px;
  width: 100%;
  min-height: 34px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--rail-text);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0;
  padding: 0 4px;
  text-align: left;
}

.section-toggle::after {
  display: block;
  grid-column: 2;
  grid-row: 1;
  height: 1px;
  background: rgba(243, 244, 242, 0.22);
  content: "";
}

.section-toggle[aria-expanded="false"] span:last-child {
  transform: rotate(-90deg);
}

.section-toggle span:last-child {
  grid-column: 3;
  grid-row: 1;
  justify-self: end;
  color: var(--rail-muted);
  transition: transform 120ms ease;
}

.library-books,
.chapter-list,
.note-list,
.notes {
  display: grid;
  gap: 6px;
}

.library-book,
.chapter-link {
  display: grid;
  min-width: 0;
  gap: 1px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--rail-muted);
  padding: 8px 10px;
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

.library-book span {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
}

.library-book small {
  color: inherit;
  font-size: 12px;
  line-height: 1.35;
  opacity: 0.72;
}

.chapter-link span {
  font-size: 13px;
  font-weight: 650;
  line-height: 1.25;
}

.chapter-link small {
  color: inherit;
  font-size: 12px;
  line-height: 1.35;
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

.note-list-item span {
  display: -webkit-box;
  color: #696969;
  font-size: 14px;
  line-height: 1.45;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-list-item small,
.meta {
  color: var(--muted);
  font-size: 13px;
}

.detail-pane {
  min-width: 0;
  overflow: auto;
  background: var(--panel);
  padding: 74px min(6vw, 88px) 56px;
}

.detail-card {
  display: grid;
  width: 100%;
  max-width: 980px;
  gap: 28px;
  margin: 0 auto;
}

.section-label {
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1;
}

.quote-block {
  display: grid;
  gap: 14px;
  border-radius: 8px;
  background: #f7f7f5;
  padding: 18px 20px;
}

.note-markdown {
  display: grid;
  gap: 14px;
  border-top: 1px solid var(--line);
  padding-top: 22px;
}

blockquote {
  margin: 0;
  border-left: 4px solid var(--accent);
  padding: 2px 0 2px 16px;
  color: #3f3f3f;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.76;
}

.note-input {
  width: 100%;
  min-height: 320px;
  resize: vertical;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  color: #454545;
  font: inherit;
  font-size: 17px;
  line-height: 1.7;
}

.note-input:focus {
  outline-offset: 6px;
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
    grid-template-columns: var(--library-width) 8px var(--note-list-width) 8px minmax(0, 1fr);
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
  .sidebar-resizer,
  .note-list-resizer,
  .note-list-pane,
  .detail-pane {
    overflow: visible;
  }

  .sidebar-resizer,
  .note-list-resizer {
    display: none;
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
const readerShell = document.querySelector('[data-reader-shell]');
const sidebarResizer = document.querySelector('[data-sidebar-resizer]');
const noteListResizer = document.querySelector('[data-note-list-resizer]');
const chapterButtons = [...document.querySelectorAll('[data-chapter-filter]')];
const noteListItems = [...document.querySelectorAll('[data-note-target]')];
const detailCards = [...document.querySelectorAll('.detail-card[data-note-id]')];
const collapseButtons = [...document.querySelectorAll('[data-collapse-target]')];
const minimumDetailWidth = 420;
const resizerWidthTotal = 16;
let activeChapter = chapterButtons.find((button) => button.getAttribute('aria-current') === 'true')?.dataset.chapterFilter || chapterButtons[0]?.dataset.chapterFilter || '';
let activeSearchQuery = '';

function currentPaneWidth(name, fallback) {
  if (!readerShell) return fallback;

  return Number.parseInt(getComputedStyle(readerShell).getPropertyValue(name), 10) || fallback;
}

function shellWidth() {
  return readerShell?.clientWidth || window.innerWidth || 1280;
}

function maxLibraryWidth() {
  const noteListWidth = currentPaneWidth('--note-list-width', 430);
  return Math.max(220, Math.min(460, shellWidth() - noteListWidth - minimumDetailWidth - resizerWidthTotal));
}

function maxNoteListWidth() {
  const libraryWidth = currentPaneWidth('--library-width', 320);
  return Math.max(300, Math.min(620, shellWidth() - libraryWidth - minimumDetailWidth - resizerWidthTotal));
}

function clampSidebarWidth(value) {
  return Math.min(maxLibraryWidth(), Math.max(220, Math.round(value)));
}

function clampNoteListWidth(value) {
  return Math.min(maxNoteListWidth(), Math.max(300, Math.round(value)));
}

function normalizePaneWidths() {
  if (!readerShell) return;

  const libraryWidth = clampSidebarWidth(currentPaneWidth('--library-width', 320));
  readerShell.style.setProperty('--library-width', libraryWidth + 'px');
  const noteListWidth = clampNoteListWidth(currentPaneWidth('--note-list-width', 430));
  readerShell.style.setProperty('--note-list-width', noteListWidth + 'px');
}

function setSidebarWidth(value, options = {}) {
  if (!readerShell) return;

  const width = clampSidebarWidth(value);
  readerShell.style.setProperty('--library-width', width + 'px');

  if (options.persist === false) return;

  try {
    localStorage.setItem('kindle-note:library-width', width + 'px');
  } catch {
    // Width changes still apply for the current page without persisted storage.
  }
}

function setNoteListWidth(value, options = {}) {
  if (!readerShell) return;

  const width = clampNoteListWidth(value);
  readerShell.style.setProperty('--note-list-width', width + 'px');

  if (options.persist === false) return;

  try {
    localStorage.setItem('kindle-note:note-list-width', width + 'px');
  } catch {
    // Width changes still apply for the current page without persisted storage.
  }
}

if (readerShell && sidebarResizer) {
  try {
    const savedWidth = localStorage.getItem('kindle-note:library-width');
    if (savedWidth) {
      setSidebarWidth(Number.parseInt(savedWidth, 10), { persist: false });
    }
  } catch {
    // Local files can run in browser modes where storage is unavailable.
  }

  normalizePaneWidths();

  sidebarResizer.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    readerShell.dataset.resizingSidebar = 'true';
    sidebarResizer.setPointerCapture?.(event.pointerId);

    const shellLeft = readerShell.getBoundingClientRect().left;
    const updateFromPointer = (pointerEvent) => {
      setSidebarWidth(pointerEvent.clientX - shellLeft);
    };
    const stopResize = () => {
      delete readerShell.dataset.resizingSidebar;
      window.removeEventListener('pointermove', updateFromPointer);
    };

    updateFromPointer(event);
    window.addEventListener('pointermove', updateFromPointer);
    window.addEventListener('pointerup', stopResize, { once: true });
    window.addEventListener('pointercancel', stopResize, { once: true });
  });

  sidebarResizer.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    const currentWidth = Number.parseInt(getComputedStyle(readerShell).getPropertyValue('--library-width'), 10) || 320;
    setSidebarWidth(currentWidth + (event.key === 'ArrowRight' ? 16 : -16));
  });
}

if (readerShell && noteListResizer) {
  try {
    const savedWidth = localStorage.getItem('kindle-note:note-list-width');
    if (savedWidth) {
      setNoteListWidth(Number.parseInt(savedWidth, 10), { persist: false });
    }
  } catch {
    // Local files can run in browser modes where storage is unavailable.
  }

  normalizePaneWidths();

  noteListResizer.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    readerShell.dataset.resizingNoteList = 'true';
    noteListResizer.setPointerCapture?.(event.pointerId);

    const startX = event.clientX;
    const startWidth = Number.parseInt(getComputedStyle(readerShell).getPropertyValue('--note-list-width'), 10) || 430;
    const updateFromPointer = (pointerEvent) => {
      setNoteListWidth(startWidth + pointerEvent.clientX - startX);
    };
    const stopResize = () => {
      delete readerShell.dataset.resizingNoteList;
      window.removeEventListener('pointermove', updateFromPointer);
    };

    updateFromPointer(event);
    window.addEventListener('pointermove', updateFromPointer);
    window.addEventListener('pointerup', stopResize, { once: true });
    window.addEventListener('pointercancel', stopResize, { once: true });
  });

  noteListResizer.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    const currentWidth = Number.parseInt(getComputedStyle(readerShell).getPropertyValue('--note-list-width'), 10) || 430;
    setNoteListWidth(currentWidth + (event.key === 'ArrowRight' ? 16 : -16));
  });
}

if (readerShell) {
  window.addEventListener('resize', normalizePaneWidths);
}

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

for (const button of collapseButtons) {
  const panel = document.querySelector('[data-collapse-panel="' + button.dataset.collapseTarget + '"]');
  if (!panel) continue;

  button.addEventListener('click', () => {
    const willExpand = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', willExpand ? 'true' : 'false');
    panel.hidden = !willExpand;
  });
}

function noteStorageKey(noteId) {
  return 'kindle-note:' + noteId + ':note';
}

for (const note of document.querySelectorAll('[data-note-id]')) {
  const input = note.querySelector('[data-note-input]');
  if (!input) continue;

  try {
    const savedNote = localStorage.getItem(noteStorageKey(note.dataset.noteId));
    if (savedNote !== null) {
      input.value = savedNote;
    }
  } catch {
    // Local files can run in browser modes where storage is unavailable.
  }

  input.addEventListener('input', () => {
    try {
      localStorage.setItem(noteStorageKey(note.dataset.noteId), input.value);
    } catch {
      // Editing still works for the current page even without persisted storage.
    }
  });
}
`;
