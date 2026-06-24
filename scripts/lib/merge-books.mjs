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

function notePositionKey(note) {
  const location = String(note.location || '').trim();
  const page = String(note.page || '').trim();
  if (!location) return '';

  return [location, page].join('|');
}

function mergeExistingNote(existingNote, incomingNote, now) {
  const restoredStandaloneNote = existingNote.quote
    && !existingNote.note
    && !incomingNote.quote
    && incomingNote.note === existingNote.quote;

  return {
    ...incomingNote,
    tags: existingNote.tags || [],
    status: existingNote.status || 'new',
    note: restoredStandaloneNote ? incomingNote.note : existingNote.note ?? incomingNote.note ?? '',
    extension: existingNote.extension || '',
    createdAt: existingNote.createdAt || now,
    updatedAt: existingNote.updatedAt || existingNote.createdAt || now
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
    const noteIdByPosition = new Map(existingBook.notes
      .map((note) => [notePositionKey(note), note.id])
      .filter(([key]) => key));

    for (const incomingNote of incomingBook.notes) {
      const positionKey = notePositionKey(incomingNote);
      const existingId = notesById.has(incomingNote.id) ? incomingNote.id : noteIdByPosition.get(positionKey);
      const existingNote = existingId ? notesById.get(existingId) : null;

      if (existingNote) {
        if (existingId !== incomingNote.id) {
          notesById.delete(existingId);
        }
        notesById.set(incomingNote.id, mergeExistingNote(existingNote, incomingNote, now));
        if (positionKey) {
          noteIdByPosition.set(positionKey, incomingNote.id);
        }
      } else {
        notesById.set(incomingNote.id, stampNewNote(incomingNote, now));
        if (positionKey) {
          noteIdByPosition.set(positionKey, incomingNote.id);
        }
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
