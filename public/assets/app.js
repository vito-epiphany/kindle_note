const search = document.querySelector('#search');
const readerShell = document.querySelector('[data-reader-shell]');
const sidebarResizer = document.querySelector('[data-sidebar-resizer]');
const noteListResizer = document.querySelector('[data-note-list-resizer]');
const chapterButtons = [...document.querySelectorAll('[data-chapter-filter]')];
const noteListItems = [...document.querySelectorAll('[data-note-target]')];
const detailCards = [...document.querySelectorAll('.detail-card[data-note-id]')];
const collapseButtons = [...document.querySelectorAll('[data-collapse-target]')];
let activeChapter = chapterButtons.find((button) => button.getAttribute('aria-current') === 'true')?.dataset.chapterFilter || chapterButtons[0]?.dataset.chapterFilter || '';
let activeSearchQuery = '';

function clampSidebarWidth(value) {
  return Math.min(460, Math.max(220, Math.round(value)));
}

function clampNoteListWidth(value) {
  return Math.min(620, Math.max(300, Math.round(value)));
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
