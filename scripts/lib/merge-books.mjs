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

function locationNumber(value) {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

function isStandaloneNotePair(candidate, incomingNote) {
  if (!incomingNote.quote || !incomingNote.note || candidate.quote || !candidate.note) return false;
  if (candidate.page !== incomingNote.page) return false;
  if (candidate.chapter && incomingNote.chapter && candidate.chapter !== incomingNote.chapter) return false;

  const candidateLocation = locationNumber(candidate.location);
  const incomingLocation = locationNumber(incomingNote.location);
  const isAdjacentLocation = candidateLocation !== null
    && incomingLocation !== null
    && candidateLocation >= incomingLocation
    && candidateLocation - incomingLocation <= 1;

  return candidate.note === incomingNote.note || isAdjacentLocation;
}

function findStandaloneNotePair(notesById, incomingNote, matchedId = '') {
  for (const [id, note] of notesById.entries()) {
    if (id === matchedId) continue;
    if (isStandaloneNotePair(note, incomingNote)) return { id, note };
  }

  return null;
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
      const standalonePair = findStandaloneNotePair(notesById, incomingNote, existingId);

      if (existingNote) {
        if (existingId !== incomingNote.id) {
          notesById.delete(existingId);
        }
        const mergedNote = mergeExistingNote(existingNote, incomingNote, now);
        if (standalonePair) {
          notesById.delete(standalonePair.id);
          mergedNote.note = standalonePair.note.note || mergedNote.note;
          mergedNote.updatedAt = standalonePair.note.updatedAt || mergedNote.updatedAt;
        }
        notesById.set(incomingNote.id, mergedNote);
        if (positionKey) {
          noteIdByPosition.set(positionKey, incomingNote.id);
        }
      } else {
        const stampedNote = stampNewNote(incomingNote, now);
        if (standalonePair) {
          notesById.delete(standalonePair.id);
          stampedNote.note = standalonePair.note.note || stampedNote.note;
          stampedNote.createdAt = standalonePair.note.createdAt || stampedNote.createdAt;
          stampedNote.updatedAt = standalonePair.note.updatedAt || stampedNote.updatedAt;
        }
        notesById.set(incomingNote.id, stampedNote);
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
