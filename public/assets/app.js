function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function renderMarkdown(source) {
  const text = String(source ?? '').trim();
  if (!text) return '<p class="empty-extension">暂无拓展</p>';

  return text.split(/\n{2,}/).map((block) => {
    if (/^\`\`\`/.test(block)) {
      const code = block.replace(/^\`\`\`[a-zA-Z0-9_-]*\n?|\n?\`\`\`$/g, '');
      return '<pre><code>' + escapeHtml(code) + '</code></pre>';
    }

    if (/^#{1,3}\s+/.test(block)) {
      const level = block.match(/^#{1,3}/)[0].length;
      return '<h' + level + '>' + renderInlineMarkdown(block.replace(/^#{1,3}\s+/, '')) + '</h' + level + '>';
    }

    if (/^>\s?/m.test(block)) {
      return '<blockquote>' + renderInlineMarkdown(block.replace(/^>\s?/gm, '')) + '</blockquote>';
    }

    if (/^[-*]\s+/m.test(block)) {
      return '<ul>' + block.split('\n').map((line) => '<li>' + renderInlineMarkdown(line.replace(/^[-*]\s+/, '')) + '</li>').join('') + '</ul>';
    }

    if (/^\d+\.\s+/m.test(block)) {
      return '<ol>' + block.split('\n').map((line) => '<li>' + renderInlineMarkdown(line.replace(/^\d+\.\s+/, '')) + '</li>').join('') + '</ol>';
    }

    return '<p>' + renderInlineMarkdown(block).replace(/\n/g, '<br>') + '</p>';
  }).join('');
}

const search = document.querySelector('#search');

if (search) {
  const searchableItems = [...document.querySelectorAll('[data-search]')];

  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();

    for (const item of searchableItems) {
      item.hidden = query.length > 0 && !item.dataset.search.includes(query);
    }
  });
}

const booksDataScript = document.querySelector('#books-data');
const exportButton = document.querySelector('#export-json');
const booksData = booksDataScript ? JSON.parse(booksDataScript.textContent) : null;
const editedExtensions = new Map();

for (const note of document.querySelectorAll('[data-note-id]')) {
  const preview = note.querySelector('[data-extension-preview]');
  const editor = note.querySelector('[data-extension-editor]');
  const input = note.querySelector('[data-extension-input]');
  const edit = note.querySelector('[data-action="edit-extension"]');
  const apply = note.querySelector('[data-action="apply-extension"]');
  const cancel = note.querySelector('[data-action="cancel-extension"]');

  if (!preview || !editor || !input || !edit || !apply || !cancel) continue;

  preview.innerHTML = renderMarkdown(note.dataset.extensionSource || '');

  edit.addEventListener('click', () => {
    input.value = note.dataset.extensionSource || '';
    editor.hidden = false;
    edit.hidden = true;
  });

  apply.addEventListener('click', () => {
    note.dataset.extensionSource = input.value;
    preview.innerHTML = renderMarkdown(input.value);
    editedExtensions.set(note.dataset.noteId, input.value);
    editor.hidden = true;
    edit.hidden = false;
    if (exportButton) exportButton.disabled = false;
  });

  cancel.addEventListener('click', () => {
    input.value = note.dataset.extensionSource || '';
    editor.hidden = true;
    edit.hidden = false;
  });
}

if (exportButton && booksData) {
  exportButton.addEventListener('click', () => {
    try {
      for (const book of booksData) {
        for (const note of book.notes || []) {
          if (editedExtensions.has(note.id)) {
            note.extension = editedExtensions.get(note.id);
            note.updatedAt = new Date().toISOString();
          }
        }
      }

      const blob = new Blob([JSON.stringify(booksData, null, 2) + '\n'], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'books.json';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      alert('Export failed: ' + error.message);
    }
  });
}
