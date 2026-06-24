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
  --library-collapsed-width: 48px;
  --note-list-width: 430px;
  --font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display: "Kaiti SC", "STKaiti", "Songti SC", serif;
  --font-reading: "Kaiti SC", "STKaiti", "Songti SC", serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: radial-gradient(circle at top, #ffffff 0, var(--bg) 48rem);
  color: var(--text);
  font-family: var(--font-ui);
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
  height: 100vh;
  margin: 0;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: var(--panel);
  box-shadow: none;
}

.reader-shell[data-sidebar-collapsed="true"] {
  grid-template-columns: var(--library-collapsed-width) 8px var(--note-list-width) 8px minmax(0, 1fr);
}

.library-pane {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
  background: var(--rail);
  color: var(--rail-text);
  padding: 18px 14px 18px;
}

.library-content {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.reader-shell[data-sidebar-collapsed="true"] .library-pane {
  overflow: hidden;
  gap: 0;
  align-items: center;
  padding: 12px 2px;
}

.reader-shell[data-sidebar-collapsed="true"] .library-content {
  display: none;
}

.sidebar-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  justify-content: flex-end;
  margin: -4px -4px 2px 0;
}

.app-brand {
  display: block;
  width: 100%;
  min-width: 0;
  color: var(--rail-text);
  text-decoration: none;
}

.app-name {
  display: block;
  overflow: hidden;
  font-family: "Snell Roundhand", "Brush Script MT", cursive;
  font-size: 34px;
  font-weight: 600;
  line-height: 0.95;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-toggle {
  display: grid;
  width: 44px;
  min-width: 44px;
  min-height: 44px;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: rgba(243, 244, 242, 0.08);
  color: var(--rail-muted);
  padding: 0;
}

.sidebar-toggle:hover {
  background: rgba(243, 244, 242, 0.14);
}

.sidebar-toggle-icon {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 120ms ease;
}

.sidebar-toggle[aria-expanded="false"] .sidebar-toggle-icon {
  transform: scaleX(-1);
}

.reader-shell[data-sidebar-collapsed="true"] .sidebar-controls {
  justify-content: center;
  margin: 0;
}

.reader-shell[data-sidebar-collapsed="true"] .app-brand {
  display: none;
}

.sidebar-resizer,
.note-list-resizer {
  position: relative;
  width: 8px;
  min-width: 8px;
  border: 0;
  cursor: col-resize;
  overflow: visible;
  touch-action: none;
}

.sidebar-resizer {
  background: var(--rail);
}

.note-list-resizer {
  background: var(--paper);
}

.library-section {
  display: grid;
  gap: 6px;
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
  gap: 4px;
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
  padding: 7px 9px;
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

.library-book[aria-current="page"],
.chapter-link[aria-current="true"] {
  background: var(--rail-active);
  color: var(--rail-text);
}

.note-list-pane {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
  background: var(--paper);
  padding: 20px 18px;
}

.list-header {
  display: grid;
  gap: 10px;
}

.note-list-item {
  display: grid;
  width: 100%;
  min-height: auto;
  gap: 2px;
  border: 0;
  border-left: 4px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  padding: 9px 12px;
  text-align: left;
}

.note-list-item[aria-current="true"] {
  border-left-color: var(--accent);
  background: var(--panel);
  box-shadow: 0 8px 20px rgba(40, 45, 48, 0.06);
}

.note-list-item span {
  display: block;
  color: #696969;
  font-size: 14px;
  line-height: 1.45;
  white-space: nowrap;
}

.note-list-item small,
.meta {
  color: var(--muted);
  font-size: 13px;
}

.note-list-item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-pane {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  background: var(--panel);
  padding: 34px min(4vw, 56px) 34px;
}

.detail-card {
  display: grid;
  width: 100%;
  max-width: 900px;
  gap: 16px;
  margin: 0 auto;
}

.quote-block {
  display: grid;
  gap: 10px;
  border-left: 4px solid var(--accent);
  padding: 4px 0 4px 18px;
}

.note-markdown {
  display: grid;
  gap: 14px;
}

blockquote {
  margin: 0;
  border: 0;
  padding: 0;
  color: #3f3f3f;
  font-family: var(--font-reading);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.58;
}

.note-input {
  width: 100%;
  min-height: 220px;
  resize: vertical;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfbfa;
  padding: 16px 18px;
  color: #454545;
  font-family: var(--font-reading);
  font-size: 17px;
  line-height: 1.62;
}

.note-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(230, 82, 94, 0.12);
  outline: 0;
}

.note-mode-toggle {
  display: inline-flex;
  width: fit-content;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #f3f3f1;
}

.note-mode-button {
  min-height: 32px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--muted);
  padding: 0 12px;
  font-size: 13px;
}

.note-mode-button[aria-pressed="true"] {
  background: var(--panel);
  color: var(--text);
  box-shadow: 0 1px 8px rgba(40, 45, 48, 0.08);
}

.note-workspace {
  display: grid;
  gap: 10px;
  align-items: start;
}

.note-preview {
  min-height: 220px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfbfa;
  padding: 16px 18px;
  color: #454545;
  font-family: var(--font-reading);
  font-size: 17px;
  line-height: 1.62;
}

.note-markdown[data-note-view="edit"] .note-preview,
.note-markdown[data-note-view="preview"] .note-input {
  display: none;
}

.markdown-body > * + * {
  margin-top: 0.8em;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin: 0;
  color: #303030;
  line-height: 1.28;
}

.markdown-body h1 {
  font-size: 26px;
}

.markdown-body h2 {
  font-size: 22px;
}

.markdown-body h3 {
  font-size: 19px;
}

.markdown-body p,
.markdown-body ul,
.markdown-body ol {
  margin-bottom: 0;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 1.4em;
}

.markdown-body blockquote {
  border-left: 3px solid var(--accent);
  padding-left: 12px;
  color: #5d5d5d;
  font-size: 16px;
  font-weight: 500;
}

.markdown-body code {
  border-radius: 4px;
  background: #eeeeec;
  padding: 0.1em 0.35em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.92em;
}

.markdown-body pre {
  border-radius: 8px;
  background: #282d30;
  color: #f3f4f2;
  padding: 14px 16px;
}

.markdown-body pre code {
  background: transparent;
  padding: 0;
}

.markdown-body a {
  color: var(--accent);
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
    height: auto;
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
    border-bottom: 1px solid var(--line);
  }

}
`;

export const APP_JS = `const search = document.querySelector('#search');
const readerShell = document.querySelector('[data-reader-shell]');
const sidebarResizer = document.querySelector('[data-sidebar-resizer]');
const noteListResizer = document.querySelector('[data-note-list-resizer]');
const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
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
  const libraryWidth = readerShell?.dataset.sidebarCollapsed === 'true'
    ? currentPaneWidth('--library-collapsed-width', 48)
    : currentPaneWidth('--library-width', 320);
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

  if (readerShell.dataset.sidebarCollapsed !== 'true') {
    const libraryWidth = clampSidebarWidth(currentPaneWidth('--library-width', 320));
    readerShell.style.setProperty('--library-width', libraryWidth + 'px');
  }

  const noteListWidth = clampNoteListWidth(currentPaneWidth('--note-list-width', 430));
  readerShell.style.setProperty('--note-list-width', noteListWidth + 'px');
}

function setSidebarWidth(value, options = {}) {
  if (!readerShell) return;
  if (readerShell.dataset.sidebarCollapsed === 'true') return;

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

function setSidebarCollapsed(isCollapsed, options = {}) {
  if (!readerShell || !sidebarToggle) return;

  readerShell.dataset.sidebarCollapsed = isCollapsed ? 'true' : 'false';
  sidebarToggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
  sidebarToggle.setAttribute('aria-label', isCollapsed ? '展开侧边栏' : '收起侧边栏');
  sidebarToggle.setAttribute('title', isCollapsed ? 'Show sidebar' : 'Hide sidebar');

  if (!isCollapsed) {
    normalizePaneWidths();
  }

  if (options.persist === false) return;

  try {
    localStorage.setItem('kindle-note:sidebar-collapsed', isCollapsed ? 'true' : 'false');
  } catch {
    // The current session can still toggle the sidebar without persisted storage.
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

if (readerShell && sidebarToggle) {
  try {
    setSidebarCollapsed(localStorage.getItem('kindle-note:sidebar-collapsed') === 'true', { persist: false });
  } catch {
    setSidebarCollapsed(false, { persist: false });
  }

  sidebarToggle.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });

  sidebarToggle.addEventListener('click', () => {
    setSidebarCollapsed(readerShell.dataset.sidebarCollapsed !== 'true');
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

function canSaveToServer() {
  return window.location.protocol === 'http:' || window.location.protocol === 'https:';
}

function saveNoteFallback(noteId, value) {
  try {
    localStorage.setItem(noteStorageKey(noteId), value);
  } catch {
    // Editing still works for the current page even without persisted storage.
  }
}

async function saveNoteToServer(noteId, value) {
  const response = await fetch('/api/notes/' + encodeURIComponent(noteId), {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ note: value })
  });

  if (!response.ok) {
    throw new Error('Failed to save note');
  }

  return response.json();
}

const noteSaveTimers = new Map();

function scheduleNoteSave(noteId, value) {
  if (!canSaveToServer()) {
    saveNoteFallback(noteId, value);
    return;
  }

  window.clearTimeout(noteSaveTimers.get(noteId));
  noteSaveTimers.set(noteId, window.setTimeout(() => {
    saveNoteToServer(noteId, value).catch(() => saveNoteFallback(noteId, value));
  }, 350));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineText(value) {
  let html = escapeHtml(value);
  html = html.replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)\\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*])\\*([^*]+)\\*/g, '$1<em>$2</em>');
  return html;
}

function renderInlineMarkdown(value) {
  const tick = String.fromCharCode(96);
  return String(value ?? '').split(tick).map((part, index) => {
    if (index % 2 === 1) return '<code>' + escapeHtml(part) + '</code>';
    return renderInlineText(part);
  }).join('');
}

function closeMarkdownList(output, listType) {
  if (!listType) return '';

  output.push('</' + listType + '>');
  return '';
}

function renderMarkdown(value) {
  const fence = String.fromCharCode(96, 96, 96);
  const lines = String(value || '').replace(/\\r\\n/g, '\\n').split('\\n');
  const output = [];
  const codeLines = [];
  let listType = '';
  let inCode = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith(fence)) {
      if (inCode) {
        output.push('<pre><code>' + escapeHtml(codeLines.join('\\n')) + '</code></pre>');
        codeLines.length = 0;
        inCode = false;
      } else {
        listType = closeMarkdownList(output, listType);
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      listType = closeMarkdownList(output, listType);
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\\s+(.+)$/);
    if (heading) {
      listType = closeMarkdownList(output, listType);
      const level = heading[1].length;
      output.push('<h' + level + '>' + renderInlineMarkdown(heading[2]) + '</h' + level + '>');
      continue;
    }

    if (trimmed.startsWith('> ')) {
      listType = closeMarkdownList(output, listType);
      output.push('<blockquote>' + renderInlineMarkdown(trimmed.slice(2)) + '</blockquote>');
      continue;
    }

    const unordered = trimmed.match(/^[-*]\\s+(.+)$/);
    if (unordered) {
      if (listType !== 'ul') {
        listType = closeMarkdownList(output, listType);
        output.push('<ul>');
        listType = 'ul';
      }
      output.push('<li>' + renderInlineMarkdown(unordered[1]) + '</li>');
      continue;
    }

    const ordered = trimmed.match(/^(\\d+)\\.\\s+(.+)$/);
    if (ordered) {
      if (listType !== 'ol') {
        listType = closeMarkdownList(output, listType);
        output.push('<ol start="' + escapeHtml(ordered[1]) + '">');
        listType = 'ol';
      }
      output.push('<li>' + renderInlineMarkdown(ordered[2]) + '</li>');
      continue;
    }

    listType = closeMarkdownList(output, listType);
    output.push('<p>' + renderInlineMarkdown(trimmed) + '</p>');
  }

  if (inCode) {
    output.push('<pre><code>' + escapeHtml(codeLines.join('\\n')) + '</code></pre>');
  }

  closeMarkdownList(output, listType);

  return output.join('') || '<p class="empty-preview">空白笔记</p>';
}

function autoSizeNoteInput(input) {
  input.style.height = 'auto';
  input.style.height = Math.max(220, input.scrollHeight + 2) + 'px';
}

function updateMarkdownPreview(note) {
  const input = note.querySelector('[data-note-input]');
  const preview = note.querySelector('[data-note-preview]');
  if (!input || !preview) return;

  preview.innerHTML = renderMarkdown(input.value);
}

function setMarkdownView(markdownRoot, mode) {
  markdownRoot.dataset.noteView = mode;

  for (const button of markdownRoot.querySelectorAll('[data-note-mode]')) {
    button.setAttribute('aria-pressed', button.dataset.noteMode === mode ? 'true' : 'false');
  }
}

for (const note of document.querySelectorAll('[data-note-id]')) {
  const input = note.querySelector('[data-note-input]');
  if (!input) continue;
  const markdownRoot = note.querySelector('[data-note-markdown]');

  if (!canSaveToServer()) {
    try {
      const savedNote = localStorage.getItem(noteStorageKey(note.dataset.noteId));
      if (savedNote !== null) {
        input.value = savedNote;
      }
    } catch {
      // Local files can run in browser modes where storage is unavailable.
    }
  }

  updateMarkdownPreview(note);
  autoSizeNoteInput(input);

  if (markdownRoot) {
    for (const button of markdownRoot.querySelectorAll('[data-note-mode]')) {
      button.addEventListener('click', () => setMarkdownView(markdownRoot, button.dataset.noteMode || 'edit'));
    }
  }

  input.addEventListener('input', () => {
    autoSizeNoteInput(input);
    updateMarkdownPreview(note);
    scheduleNoteSave(note.dataset.noteId, input.value);
  });
}
`;
