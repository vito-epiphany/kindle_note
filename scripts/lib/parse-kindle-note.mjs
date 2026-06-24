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
      kind: 'entry',
      location: marker.startsWith('Location') ? marker : '',
      page: marker.startsWith('Page') ? marker : ''
    };
  }

  const chineseMatch = line.match(/^(标注(?:\(.+\))?|笔记|书签)\s*-\s*(第\s*\d+\s*页)?(?:\s*·\s*)?(位置\s*\d+)?$/);
  if (!chineseMatch) return null;

  const label = chineseMatch[1];
  const kind = label.startsWith('标注') ? 'highlight' : label === '笔记' ? 'note' : 'bookmark';

  return {
    kind,
    page: chineseMatch[2] ? normalizeText(chineseMatch[2]) : '',
    location: chineseMatch[3] ? normalizeText(chineseMatch[3]) : ''
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

  let lastHighlightNote = null;
  let currentChapter = '';

  for (let index = 0; index < lines.length; index += 1) {
    const marker = parseMarker(lines[index]);
    if (!marker) {
      const nextLineIsMarker = Boolean(parseMarker(lines[index + 1] || ''));
      const isBookHeader = index < firstMarkerIndex && (lines[index] === title || lines[index] === author || lines[index] === '笔记本导出');

      if (nextLineIsMarker && !isBookHeader) {
        currentChapter = lines[index];
      }

      continue;
    }

    if (marker.kind === 'bookmark') {
      lastHighlightNote = null;
      continue;
    }

    const text = lines[index + 1] || '';
    if (!text || parseMarker(text)) {
      warnings.push({ path, reason: `Missing quote after ${lines[index]}` });
      lastHighlightNote = null;
      continue;
    }

    if (marker.kind === 'note' && lastHighlightNote) {
      lastHighlightNote.note = text;
      lastHighlightNote = null;
      index += 1;
      continue;
    }

    const quote = marker.kind === 'note' ? '' : text;
    const note = marker.kind === 'note' ? text : '';
    const idText = quote || note;
    const parsedNote = {
      id: createNoteId({ title, quote: idText, location: marker.location, page: marker.page }),
      quote,
      note,
      location: marker.location,
      page: marker.page,
      chapter: currentChapter,
      highlightedAt: '',
      tags: [],
      status: 'new',
      extension: ''
    };

    book.notes.push(parsedNote);
    lastHighlightNote = marker.kind === 'highlight' ? parsedNote : null;
    index += 1;
  }

  if (book.notes.length === 0) {
    warnings.push({ path, reason: 'No Kindle notes parsed' });
    return { books: [], warnings };
  }

  return { books: [book], warnings };
}
