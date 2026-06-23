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

export function renderBookPage(book, allBooks = [book]) {
  const notes = normalizeList(book.notes).map((note) => {
    const tags = normalizeList(note.tags);
    const meta = [note.location, note.page, note.highlightedAt].filter(Boolean).join(' · ');
    const searchable = `${note.quote} ${note.extension} ${tags.join(' ')}`.toLowerCase();
    const renderedTags = tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    const extension = note.extension || '';

    return `<article class="note" data-note-id="${escapeAttribute(note.id)}" data-extension-source="${escapeAttribute(extension)}" data-search="${escapeHtml(searchable)}">
      <blockquote>${escapeHtml(note.quote)}</blockquote>
      <p class="meta">${escapeHtml(meta || 'No location')}</p>
      <p class="status">${escapeHtml(note.status || 'new')}</p>
      <div class="tags">${renderedTags}</div>
      <section class="extension">
        <div class="extension-preview" data-extension-preview>${escapeHtml(extension || '暂无拓展')}</div>
        <div class="extension-editor" data-extension-editor hidden>
          <textarea data-extension-input aria-label="Markdown extension">${escapeHtml(extension)}</textarea>
          <div class="extension-actions">
            <button type="button" data-action="apply-extension">Apply</button>
            <button type="button" data-action="cancel-extension">Cancel</button>
          </div>
        </div>
        <button type="button" data-action="edit-extension">Edit</button>
      </section>
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
    <button type="button" id="export-json" disabled>Export books.json</button>
    <section class="notes">${notes}</section>
    <script type="application/json" id="books-data">${escapeScriptJson(allBooks)}</script>
  </main>`,
    assetPrefix: '../'
  });
}
