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

function escapeScriptJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
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
  const bookNotes = normalizeList(book.notes);
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
    const title = note.quote ? '原文标注' : '读书笔记';
    const isActive = note.id === firstNoteId;

    return `<button type="button" class="note-list-item" data-note-target="${escapeAttribute(note.id)}" data-chapter="${escapeAttribute(chapter)}" data-search="${escapeAttribute(searchable)}" aria-current="${isActive ? 'true' : 'false'}">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(sourceText)}</span>
        <small>${escapeHtml(meta || 'No location')}</small>
      </button>`;
  }).join('\n');

  const notes = bookNotes.map((note) => {
    const tags = normalizeList(note.tags);
    const chapter = note.chapter || '未分章';
    const meta = [chapter, note.location, note.page, note.highlightedAt].filter(Boolean).join(' · ');
    const searchable = `${note.quote || ''} ${note.note || ''} ${chapter} ${tags.join(' ')}`.toLowerCase();
    const renderedTags = tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    const noteText = note.note || '';
    const quoteBlock = note.quote
      ? `<section class="quote-block">
        <h2>原文</h2>
        <blockquote>${escapeHtml(note.quote)}</blockquote>
      </section>`
      : '';
    const isActive = note.id === firstNoteId;

    return `<article class="note detail-card" data-note-id="${escapeAttribute(note.id)}" data-chapter="${escapeAttribute(chapter)}" data-note-source="${escapeAttribute(noteText)}" data-search="${escapeAttribute(searchable)}"${isActive ? '' : ' hidden'}>
      <header class="detail-header">
        <div>
          <p class="eyebrow">${escapeHtml(chapter)}</p>
          <h1>${note.quote ? '原文标注' : '读书笔记'}</h1>
        </div>
        <p class="status">${escapeHtml(note.status || 'new')}</p>
      </header>
      <p class="meta">${escapeHtml(meta || 'No location')}</p>
      <div class="tags">${renderedTags}</div>
      ${quoteBlock}
      <section class="note-markdown">
        <h2>笔记</h2>
        <textarea class="note-input" data-note-input aria-label="Markdown note">${escapeHtml(noteText)}</textarea>
      </section>
    </article>`;
  }).join('\n');

  return pageShell({
    title: `${book.title} - Kindle Notes`,
    body: `  <main class="reader-shell">
    <aside class="library-pane">
      <a class="back-link" href="../index.html">全部图书</a>
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
    <aside class="note-list-pane">
      <header class="list-header">
        <div>
          <p class="eyebrow">笔记</p>
          <h1>${escapeHtml(book.title)}</h1>
          <p>${escapeHtml(book.author || 'Unknown author')}</p>
        </div>
        <input id="search" type="search" placeholder="搜索笔记" aria-label="Filter notes">
      </header>
      <section class="note-list">${noteList}</section>
    </aside>
    <section class="detail-pane">
      <section class="notes">${notes}</section>
    </section>
    <script type="application/json" id="books-data">${escapeScriptJson(allBooks)}</script>
  </main>`,
    assetPrefix: '../'
  });
}
