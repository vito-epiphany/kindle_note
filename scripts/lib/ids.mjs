import { createHash } from 'node:crypto';

export function sha256(value) {
  return createHash('sha256').update(String(value), 'utf8').digest('hex');
}

export function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function slugify(value) {
  const ascii = normalizeText(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return ascii || 'item';
}

export function createBookId({ title, author = '' }) {
  return `book-${slugify(`${title} ${author}`)}`;
}

export function createNoteId({ title, quote, location = '', page = '' }) {
  const prefix = slugify(title);
  const digest = sha256([normalizeText(title), normalizeText(quote), normalizeText(location), normalizeText(page)].join('|')).slice(0, 12);
  return `note-${prefix}-${digest}`;
}
