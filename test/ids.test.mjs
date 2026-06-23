import test from 'node:test';
import assert from 'node:assert/strict';
import { createBookId, createNoteId, sha256, slugify } from '../scripts/lib/ids.mjs';

test('slugify creates stable lowercase slugs', () => {
  assert.equal(slugify('  Deep Work: Rules for Focused Success!  '), 'deep-work-rules-for-focused-success');
  assert.equal(slugify('原则'), 'item');
});

test('sha256 returns a deterministic hex digest', () => {
  assert.equal(
    sha256('kindle note'),
    '91704bfeaa41d8af1b70284c5fbfc65fba829628f5daaa5a6e26e7d91c748b81'
  );
});

test('book and note ids are stable', () => {
  assert.equal(createBookId({ title: 'Deep Work', author: 'Cal Newport' }), 'book-deep-work-cal-newport');
  assert.match(
    createNoteId({ title: 'Deep Work', quote: 'Focus deeply.', location: 'Location 42', page: '' }),
    /^note-deep-work-[a-f0-9]{12}$/
  );
});
