function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function pageShell({ title, body, assetPrefix = '' }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${assetPrefix}assets/app.css">
</head>
<body>
${body}
  <script src="${assetPrefix}assets/app.js"></script>
</body>
</html>
`;
}

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function formatImportTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown import time';
  }

  return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

const chineseNumeralValues = new Map([
  ['零', 0],
  ['〇', 0],
  ['一', 1],
  ['二', 2],
  ['两', 2],
  ['三', 3],
  ['四', 4],
  ['五', 5],
  ['六', 6],
  ['七', 7],
  ['八', 8],
  ['九', 9]
]);

function parseChineseInteger(value) {
  const text = String(value || '').trim();
  if (/^\d+$/.test(text)) return Number(text);
  if (text === '十') return 10;

  const tenIndex = text.indexOf('十');
  if (tenIndex >= 0) {
    const before = text.slice(0, tenIndex);
    const after = text.slice(tenIndex + 1);
    const tens = before ? chineseNumeralValues.get(before) : 1;
    const ones = after ? chineseNumeralValues.get(after) : 0;
    return (tens ?? 0) * 10 + (ones ?? 0);
  }

  return chineseNumeralValues.get(text);
}

function chapterSortValue(chapter) {
  const match = String(chapter || '').match(/第\s*([一二两三四五六七八九十〇零\d]+)\s*章/);
  const value = match ? parseChineseInteger(match[1]) : undefined;
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function numberFromText(value) {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

function compareNotesByReadingOrder(a, b) {
  const chapterDiff = chapterSortValue(a.chapter) - chapterSortValue(b.chapter);
  if (chapterDiff !== 0) return chapterDiff;

  const chapterNameDiff = String(a.chapter || '').localeCompare(String(b.chapter || ''));
  if (chapterNameDiff !== 0) return chapterNameDiff;

  const pageDiff = numberFromText(a.page) - numberFromText(b.page);
  if (pageDiff !== 0) return pageDiff;

  const locationDiff = numberFromText(a.location) - numberFromText(b.location);
  if (locationDiff !== 0) return locationDiff;

  return String(a.id || '').localeCompare(String(b.id || ''));
}

export function renderIndexPage(books) {
  const items = normalizeList(books).map((book) => {
    const notes = normalizeList(book.notes);
    const href = `books/${book.id}.html`;
    const searchable = `${book.title} ${book.author} ${notes.map((note) => `${note.quote || ''} ${note.note || ''}`).join(' ')}`;
    const lastImportTime = formatImportTime(book.lastImportedAt);

    return `<article class="book-card" data-search="${escapeHtml(searchable.toLowerCase())}">
      <a href="${escapeHtml(href)}">
        <h2>${escapeHtml(book.title)}</h2>
        <p>${escapeHtml(book.author || 'Unknown author')}</p>
        <p class="meta">${notes.length} notes · Last import: ${escapeHtml(lastImportTime)}</p>
      </a>
    </article>`;
  }).join('\n');

  return pageShell({
    title: 'Kindle Notes',
    body: `  <main class="page">
    <header class="hero">
      <h1>Kindle Notes</h1>
      <input id="search" type="search" placeholder="Search books, authors, and highlights" aria-label="Search">
    </header>
    <section class="book-grid">${items}</section>
  </main>`,
    assetPrefix: ''
  });
}

export function renderBookPage(book, allBooks = [book]) {
  const bookNotes = [...normalizeList(book.notes)].sort(compareNotesByReadingOrder);
  const normalizedBooks = normalizeList(allBooks);
  const chapters = [...new Set(bookNotes.map((note) => note.chapter || '未分章'))];
  const activeChapter = chapters[0] || '未分章';
  const firstNoteId = bookNotes[0]?.id || '';

  const bookItems = normalizedBooks.map((item) => {
    const isActive = item.id === book.id;
    return `<a class="library-book" href="${escapeAttribute(`${item.id}.html`)}" aria-current="${isActive ? 'page' : 'false'}">
        <span>${escapeHtml(item.title)}</span>
        <small>${escapeHtml(item.author || 'Unknown author')}</small>
      </a>`;
  }).join('\n');

  const chapterItems = chapters.map((chapter) => {
    const count = bookNotes.filter((note) => (note.chapter || '未分章') === chapter).length;
    const isActive = chapter === activeChapter;
    return `<button type="button" class="chapter-link" data-chapter-filter="${escapeAttribute(chapter)}" aria-current="${isActive ? 'true' : 'false'}">
        <span>${escapeHtml(chapter)}</span>
        <small>${count}</small>
      </button>`;
  }).join('\n');

  const noteList = bookNotes.map((note) => {
    const tags = normalizeList(note.tags);
    const chapter = note.chapter || '未分章';
    const meta = [chapter, note.location, note.page].filter(Boolean).join(' · ');
    const sourceText = note.quote || note.note || '空白笔记';
    const searchable = `${note.quote || ''} ${note.note || ''} ${chapter} ${tags.join(' ')}`.toLowerCase();
    const isActive = note.id === firstNoteId;

    return `<button type="button" class="note-list-item" data-note-target="${escapeAttribute(note.id)}" data-chapter="${escapeAttribute(chapter)}" data-search="${escapeAttribute(searchable)}" aria-current="${isActive ? 'true' : 'false'}">
        <span>${escapeHtml(sourceText)}</span>
        <small>${escapeHtml(meta || 'No location')}</small>
      </button>`;
  }).join('\n');

  const notes = bookNotes.map((note) => {
    const chapter = note.chapter || '未分章';
    const meta = [chapter, note.location, note.page, note.highlightedAt].filter(Boolean).join(' · ');
    const searchable = `${note.quote || ''} ${note.note || ''} ${chapter} ${normalizeList(note.tags).join(' ')}`.toLowerCase();
    const noteText = note.note || '';
    const quoteBlock = note.quote
      ? `<section class="quote-block">
        <h2 class="section-label">原文</h2>
        <blockquote>${escapeHtml(note.quote)}</blockquote>
      </section>`
      : '';
    const isActive = note.id === firstNoteId;

    return `<article class="note detail-card" data-note-id="${escapeAttribute(note.id)}" data-chapter="${escapeAttribute(chapter)}" data-search="${escapeAttribute(searchable)}"${isActive ? '' : ' hidden'}>
      <p class="meta">${escapeHtml(meta || 'No location')}</p>
      ${quoteBlock}
      <section class="note-markdown">
        <h2 class="section-label">笔记</h2>
        <textarea class="note-input" data-note-input aria-label="Markdown note">${escapeHtml(noteText)}</textarea>
      </section>
    </article>`;
  }).join('\n');

  return pageShell({
    title: `${book.title} - Kindle Notes`,
    body: `  <main class="reader-shell" data-reader-shell>
    <aside class="library-pane">
      <section class="library-section">
        <button type="button" class="section-toggle" data-collapse-target="books" aria-expanded="true">
          <span>图书</span>
          <span aria-hidden="true">⌄</span>
        </button>
        <div class="library-books" data-collapse-panel="books">${bookItems}</div>
      </section>
      <section class="library-section">
        <button type="button" class="section-toggle" data-collapse-target="chapters" aria-expanded="true">
          <span>章节</span>
          <span aria-hidden="true">⌄</span>
        </button>
        <div class="chapter-list" data-collapse-panel="chapters">${chapterItems}</div>
      </section>
    </aside>
    <div class="sidebar-resizer" data-sidebar-resizer role="separator" aria-label="调整侧边栏宽度" aria-orientation="vertical" tabindex="0"></div>
    <aside class="note-list-pane">
      <header class="list-header">
        <div>
          <h1>${escapeHtml(book.title)}</h1>
          <p>${escapeHtml(book.author || 'Unknown author')}</p>
        </div>
        <input id="search" type="search" placeholder="搜索笔记" aria-label="Filter notes">
      </header>
      <section class="note-list">${noteList}</section>
    </aside>
    <div class="note-list-resizer" data-note-list-resizer role="separator" aria-label="调整笔记列表宽度" aria-orientation="vertical" tabindex="0"></div>
    <section class="detail-pane">
      <section class="notes">${notes}</section>
    </section>
  </main>`,
    assetPrefix: '../'
  });
}
