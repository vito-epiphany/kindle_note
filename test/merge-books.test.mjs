import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeBooks } from '../scripts/lib/merge-books.mjs';

const now = '2026-06-23T00:00:00.000Z';

test('mergeBooks inserts new books and stamps timestamps', () => {
  const result = mergeBooks([], [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    notes: [{ id: 'note-1', quote: 'Focus.', location: 'Location 1', page: '', highlightedAt: '', tags: [], status: 'new', extension: '' }]
  }], { now });

  assert.equal(result.books.length, 1);
  assert.equal(result.books[0].firstImportedAt, now);
  assert.equal(result.books[0].lastImportedAt, now);
  assert.equal(result.books[0].notes[0].createdAt, now);
  assert.equal(result.books[0].notes[0].updatedAt, now);
});

test('mergeBooks preserves user extension fields on repeated import', () => {
  const existing = [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    firstImportedAt: '2026-01-01T00:00:00.000Z',
    lastImportedAt: '2026-01-01T00:00:00.000Z',
    notes: [{
      id: 'note-1',
      quote: 'Focus.',
      location: 'Location 1',
      page: '',
      highlightedAt: '',
      tags: ['attention'],
      status: 'expanded',
      note: 'Edited markdown note.',
      extension: 'My own expansion.',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    }]
  }];

  const incoming = [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    notes: [{ id: 'note-1', quote: 'Focus.', location: 'Location 1', page: '', highlightedAt: '', tags: [], status: 'new', note: 'Imported note.', extension: '' }]
  }];

  const result = mergeBooks(existing, incoming, { now });
  const note = result.books[0].notes[0];

  assert.equal(result.books[0].notes.length, 1);
  assert.deepEqual(note.tags, ['attention']);
  assert.equal(note.status, 'expanded');
  assert.equal(note.note, 'Edited markdown note.');
  assert.equal(note.extension, 'My own expansion.');
  assert.equal(note.updatedAt, '2026-01-02T00:00:00.000Z');
});

test('mergeBooks refreshes imported chapter metadata on repeated import', () => {
  const existing = [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    firstImportedAt: '2026-01-01T00:00:00.000Z',
    lastImportedAt: '2026-01-01T00:00:00.000Z',
    notes: [{
      id: 'note-1',
      quote: 'Focus.',
      location: 'Location 1',
      page: '',
      chapter: '',
      highlightedAt: '',
      tags: [],
      status: 'new',
      note: 'Edited markdown note.',
      extension: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    }]
  }];

  const incoming = [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    notes: [{
      id: 'note-1',
      quote: 'Focus.',
      location: 'Location 1',
      page: '',
      chapter: 'Focus rituals',
      highlightedAt: '',
      tags: [],
      status: 'new',
      note: 'Imported note.',
      extension: ''
    }]
  }];

  const result = mergeBooks(existing, incoming, { now });

  assert.equal(result.books[0].notes[0].chapter, 'Focus rituals');
  assert.equal(result.books[0].notes[0].note, 'Edited markdown note.');
});

test('mergeBooks preserves edited note when repeated import changes note id at the same position', () => {
  const existing = [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    firstImportedAt: '2026-01-01T00:00:00.000Z',
    lastImportedAt: '2026-01-01T00:00:00.000Z',
    notes: [{
      id: 'note-old',
      quote: 'Focus.',
      location: 'Location 1',
      page: 'Page 8',
      chapter: 'Focus rituals',
      highlightedAt: '',
      tags: ['attention'],
      status: 'expanded',
      note: 'Edited markdown note.',
      extension: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    }]
  }];

  const incoming = [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    notes: [{
      id: 'note-new',
      quote: 'Focus, revised in the source file.',
      location: 'Location 1',
      page: 'Page 8',
      chapter: 'Focus rituals',
      highlightedAt: '',
      tags: [],
      status: 'new',
      note: 'Imported conflicting note.',
      extension: ''
    }]
  }];

  const result = mergeBooks(existing, incoming, { now });
  const note = result.books[0].notes[0];

  assert.equal(result.books[0].notes.length, 1);
  assert.equal(note.id, 'note-new');
  assert.equal(note.quote, 'Focus, revised in the source file.');
  assert.equal(note.note, 'Edited markdown note.');
  assert.deepEqual(note.tags, ['attention']);
  assert.equal(note.status, 'expanded');
  assert.equal(note.createdAt, '2026-01-01T00:00:00.000Z');
  assert.equal(note.updatedAt, '2026-01-02T00:00:00.000Z');
});

test('mergeBooks migrates legacy note-only import without duplicating text into editable note', () => {
  const existing = [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    firstImportedAt: '2026-01-01T00:00:00.000Z',
    lastImportedAt: '2026-01-01T00:00:00.000Z',
    notes: [{
      id: 'note-1',
      quote: '',
      location: 'Location 1',
      page: '',
      highlightedAt: '',
      tags: [],
      status: 'new',
      note: 'Standalone Kindle note text.',
      extension: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    }]
  }];

  const incoming = [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    notes: [{
      id: 'note-1',
      quote: 'Standalone Kindle note text.',
      location: 'Location 1',
      page: '',
      highlightedAt: '',
      tags: [],
      status: 'new',
      note: '',
      extension: ''
    }]
  }];

  const result = mergeBooks(existing, incoming, { now });
  const note = result.books[0].notes[0];

  assert.equal(note.quote, 'Standalone Kindle note text.');
  assert.equal(note.note, '');
});

test('mergeBooks does not collapse different highlights that only share a page', () => {
  const existing = [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    firstImportedAt: '2026-01-01T00:00:00.000Z',
    lastImportedAt: '2026-01-01T00:00:00.000Z',
    notes: [{
      id: 'note-old-1',
      quote: 'First highlight.',
      location: '',
      page: 'Page 8',
      chapter: 'Focus rituals',
      highlightedAt: '',
      tags: [],
      status: 'new',
      note: 'Edited first note.',
      extension: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    }, {
      id: 'note-old-2',
      quote: 'Second highlight.',
      location: '',
      page: 'Page 8',
      chapter: 'Focus rituals',
      highlightedAt: '',
      tags: [],
      status: 'new',
      note: 'Edited second note.',
      extension: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    }]
  }];

  const incoming = [{
    id: 'book-deep-work-cal-newport',
    title: 'Deep Work',
    author: 'Cal Newport',
    source: 'kindle',
    notes: [{
      id: 'note-new-1',
      quote: 'First highlight revised.',
      location: '',
      page: 'Page 8',
      chapter: 'Focus rituals',
      highlightedAt: '',
      tags: [],
      status: 'new',
      note: 'Imported first note.',
      extension: ''
    }, {
      id: 'note-new-2',
      quote: 'Second highlight revised.',
      location: '',
      page: 'Page 8',
      chapter: 'Focus rituals',
      highlightedAt: '',
      tags: [],
      status: 'new',
      note: 'Imported second note.',
      extension: ''
    }]
  }];

  const result = mergeBooks(existing, incoming, { now });
  const notes = result.books[0].notes;

  assert.equal(notes.length, 4);
  assert.ok(notes.find((note) => note.id === 'note-old-1'));
  assert.ok(notes.find((note) => note.id === 'note-old-2'));
  assert.ok(notes.find((note) => note.id === 'note-new-1'));
  assert.ok(notes.find((note) => note.id === 'note-new-2'));
});
