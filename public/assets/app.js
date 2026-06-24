const search = document.querySelector('#search');
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
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
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
  const lines = String(value || '').replace(/\r\n/g, '\n').split('\n');
  const output = [];
  const codeLines = [];
  let listType = '';
  let inCode = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith(fence)) {
      if (inCode) {
        output.push('<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>');
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

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
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

    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      if (listType !== 'ul') {
        listType = closeMarkdownList(output, listType);
        output.push('<ul>');
        listType = 'ul';
      }
      output.push('<li>' + renderInlineMarkdown(unordered[1]) + '</li>');
      continue;
    }

    const ordered = trimmed.match(/^(\d+)\.\s+(.+)$/);
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
    output.push('<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>');
  }

  closeMarkdownList(output, listType);

  return output.join('') || '<p class="empty-preview">空白笔记</p>';
}

function autoSizeNoteInput(input) {
  input.style.height = 'auto';
  input.style.height = Math.max(280, input.scrollHeight + 2) + 'px';
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
