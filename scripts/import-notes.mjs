import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parseKindleSource } from './lib/parse-kindle-note.mjs';
import { mergeBooks } from './lib/merge-books.mjs';
import { sha256 } from './lib/ids.mjs';

const root = process.cwd();
const importsDir = join(root, 'imports');
const dataDir = join(root, 'data');
const booksPath = join(dataDir, 'books.json');
const sourcesPath = join(dataDir, 'sources.json');
const supported = new Set(['.txt', '.html', '.eml']);

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

function extensionOf(path) {
  const match = path.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : '';
}

await mkdir(importsDir, { recursive: true });
await mkdir(dataDir, { recursive: true });

const existingBooks = await readJson(booksPath, []);
const existingSources = await readJson(sourcesPath, []);
const sourceByKey = new Map(existingSources.map((source) => [`${source.path}:${source.sha256}`, source]));
const entries = (await readdir(importsDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => join(importsDir, entry.name))
  .filter((path) => supported.has(extensionOf(path)));

const allIncomingBooks = [];
const nextSources = [...existingSources];
let importedFiles = 0;

for (const path of entries) {
  const raw = await readFile(path, 'utf8');
  const digest = sha256(raw);
  const displayPath = relative(root, path);
  const sourceKey = `${displayPath}:${digest}`;

  if (sourceByKey.has(sourceKey)) continue;

  const parsed = parseKindleSource(raw, { path: displayPath });
  nextSources.push({
    path: displayPath,
    sha256: digest,
    importedAt: new Date().toISOString(),
    notesFound: parsed.books.reduce((sum, book) => sum + book.notes.length, 0),
    warnings: parsed.warnings
  });

  if (parsed.books.length > 0) {
    allIncomingBooks.push(...parsed.books);
    importedFiles += 1;
  }
}

if (allIncomingBooks.length > 0) {
  const merged = mergeBooks(existingBooks, allIncomingBooks);
  await writeFile(booksPath, `${JSON.stringify(merged.books, null, 2)}\n`);
}

await writeFile(sourcesPath, `${JSON.stringify(nextSources, null, 2)}\n`);

console.log(`Scanned ${entries.length} source file(s).`);
console.log(`Imported ${importedFiles} file(s).`);
console.log(`Parsed ${allIncomingBooks.reduce((sum, book) => sum + book.notes.length, 0)} note(s).`);
