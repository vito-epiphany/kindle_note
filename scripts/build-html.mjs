import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { renderBookPage, renderIndexPage } from './lib/render-html.mjs';

const root = process.cwd();
const dataPath = join(root, 'data', 'books.json');
const publicDir = join(root, 'public');
const booksDir = join(publicDir, 'books');

const books = JSON.parse(await readFile(dataPath, 'utf8'));

await mkdir(booksDir, { recursive: true });
await mkdir(join(publicDir, 'assets'), { recursive: true });
await writeFile(join(publicDir, 'index.html'), renderIndexPage(books));

for (const book of books) {
  await writeFile(join(booksDir, `${book.id}.html`), renderBookPage(book));
}

console.log(`Built ${books.length} book page(s).`);
