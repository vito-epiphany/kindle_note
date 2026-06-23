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
