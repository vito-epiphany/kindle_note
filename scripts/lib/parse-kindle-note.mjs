import { createBookId, createNoteId, normalizeText } from './ids.mjs';

function stripHtml(raw) {
  return String(raw)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(h1|h2|h3|p|div|blockquote|br)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractBody(raw) {
  const content = String(raw);
  const headerSplit = content.split(/\r?\n\r?\n/);
  const withoutHeaders = headerSplit.length > 1 && /^from:|^subject:|^content-type:/im.test(headerSplit[0])
    ? headerSplit.slice(1).join('\n\n')
    : content;

  return stripHtml(withoutHeaders)
    .split(/\r?\n/)
    .map((line) => normalizeText(line))
    .filter(Boolean);
}

function parseMarker(line) {
  const match = line.match(/^(Highlight|Note)\s*\((Location\s+\d+|Page\s+\d+)\)$/i);
  if (!match) return null;
  const marker = match[2];
  return {
    location: marker.startsWith('Location') ? marker : '',
    page: marker.startsWith('Page') ? marker : ''
  };
}

export function parseKindleSource(raw, { path = 'unknown' } = {}) {
  const lines = extractBody(raw);
  const warnings = [];
  const firstMarkerIndex = lines.findIndex((line) => parseMarker(line));

  if (firstMarkerIndex < 0) {
    return {
      books: [],
      warnings: [{ path, reason: 'No Kindle highlight blocks found' }]
    };
  }

  const title = lines[0] || 'Untitled';
  const author = firstMarkerIndex > 1 ? lines[1] : '';
  const book = {
    id: createBookId({ title, author }),
    title,
    author,
    source: 'kindle',
    notes: []
  };

  for (let index = firstMarkerIndex; index < lines.length; index += 1) {
    const marker = parseMarker(lines[index]);
    if (!marker) continue;

    const quote = lines[index + 1] || '';
    if (!quote || parseMarker(quote)) {
      warnings.push({ path, reason: `Missing quote after ${lines[index]}` });
      continue;
    }

    book.notes.push({
      id: createNoteId({ title, quote, location: marker.location, page: marker.page }),
      quote,
      location: marker.location,
      page: marker.page,
      highlightedAt: '',
      tags: [],
      status: 'new',
      extension: ''
    });
  }

  if (book.notes.length === 0) {
    warnings.push({ path, reason: 'No Kindle notes parsed' });
    return { books: [], warnings };
  }

  return { books: [book], warnings };
}
