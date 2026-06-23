const search = document.querySelector('#search');
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

      const blob = new Blob([JSON.stringify(booksData, null, 2) + '\n'], { type: 'application/json' });
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
