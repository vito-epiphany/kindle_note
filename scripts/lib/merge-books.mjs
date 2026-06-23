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
          note: existingNote.note ?? incomingNote.note ?? '',
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
