import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { renderBookPage, renderIndexPage } from './render-html.mjs';
import { APP_CSS, APP_JS } from './site-assets.mjs';

async function readBooks(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export async function buildSite(root = process.cwd()) {
  const dataPath = join(root, 'data', 'books.json');
  const publicDir = join(root, 'public');
  const booksDir = join(publicDir, 'books');
  const assetsDir = join(publicDir, 'assets');
  const books = await readBooks(dataPath);

  await mkdir(booksDir, { recursive: true });
  await mkdir(assetsDir, { recursive: true });
  await writeFile(join(publicDir, 'index.html'), renderIndexPage(books));
  await writeFile(join(assetsDir, 'app.css'), APP_CSS);
  await writeFile(join(assetsDir, 'app.js'), APP_JS);

  const currentBookFiles = new Set(books.map((book) => `${book.id}.html`));

  for (const book of books) {
    await writeFile(join(booksDir, `${book.id}.html`), renderBookPage(book, books));
  }

  for (const entry of await readdir(booksDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    if (currentBookFiles.has(entry.name)) continue;
    await unlink(join(booksDir, entry.name));
  }

  return { books };
}
