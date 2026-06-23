import { createBookId, createNoteId, normalizeText } from './ids.mjs';

function decodeHtml(value) {
  return String(value)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(raw) {
  return decodeHtml(String(raw)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(h1|h2|h3|p|div|blockquote|br)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' '));
}

function extractClassText(raw, className) {
  const pattern = new RegExp(`<[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i');
  const match = String(raw).match(pattern);
  return match ? normalizeText(stripHtml(match[1])) : '';
}

function normalizeNotebookLines(lines) {
  const normalized = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const next = lines[index + 1] || '';

    if (/^标注(?:\(.+\))?$/.test(line) && /^-\s*第\s*\d+\s*页/.test(next)) {
      normalized.push(`${line} ${next}`);
      index += 1;
      continue;
    }

    normalized.push(line);
  }

  return normalized;
}

function extractBody(raw) {
  const content = String(raw);
  const headerSplit = content.split(/\r?\n\r?\n/);
  const withoutHeaders = headerSplit.length > 1 && /^from:|^subject:|^content-type:/im.test(headerSplit[0])
    ? headerSplit.slice(1).join('\n\n')
    : content;

  return normalizeNotebookLines(stripHtml(withoutHeaders)
    .split(/\r?\n/)
    .map((line) => normalizeText(line))
    .filter(Boolean));
}

function parseMarker(line) {
  const englishMatch = line.match(/^(Highlight|Note)\s*\((Location\s+\d+|Page\s+\d+)\)$/i);
  if (englishMatch) {
    const marker = englishMatch[2];
    return {
      location: marker.startsWith('Location') ? marker : '',
      page: marker.startsWith('Page') ? marker : ''
    };
  }

  const chineseMatch = line.match(/^(?:标注(?:\(.+\))?|笔记)\s*-\s*(第\s*\d+\s*页)?(?:\s*·\s*)?(位置\s*\d+)?$/);
  if (!chineseMatch) return null;

  return {
    page: chineseMatch[1] ? normalizeText(chineseMatch[1]) : '',
    location: chineseMatch[2] ? normalizeText(chineseMatch[2]) : ''
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

  const title = extractClassText(raw, 'bookTitle') || lines[0] || 'Untitled';
  const author = extractClassText(raw, 'authors') || (firstMarkerIndex > 1 ? lines[1] : '');
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
