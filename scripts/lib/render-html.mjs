function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
    const searchable = `${book.title} ${book.author} ${notes.map((note) => note.quote).join(' ')}`;
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

export function renderBookPage(book) {
  const notes = normalizeList(book.notes).map((note) => {
    const tags = normalizeList(note.tags);
    const meta = [note.location, note.page, note.highlightedAt].filter(Boolean).join(' · ');
    const searchable = `${note.quote} ${note.extension} ${tags.join(' ')}`.toLowerCase();
    const renderedTags = tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');

    return `<article class="note" data-search="${escapeHtml(searchable)}">
      <blockquote>${escapeHtml(note.quote)}</blockquote>
      <p class="meta">${escapeHtml(meta || 'No location')}</p>
      <p class="status">${escapeHtml(note.status || 'new')}</p>
      <div class="tags">${renderedTags}</div>
      <section class="extension">${escapeHtml(note.extension || 'No extension yet.')}</section>
    </article>`;
  }).join('\n');

  return pageShell({
    title: `${book.title} - Kindle Notes`,
    body: `  <main class="page">
    <nav><a href="../index.html">Back to all books</a></nav>
    <header class="hero">
      <h1>${escapeHtml(book.title)}</h1>
      <p>${escapeHtml(book.author || 'Unknown author')}</p>
      <input id="search" type="search" placeholder="Filter notes" aria-label="Filter notes">
    </header>
    <section class="notes">${notes}</section>
  </main>`,
    assetPrefix: '../'
  });
}
