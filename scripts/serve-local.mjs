import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { scanImportFolder } from './lib/import-library.mjs';
import { buildSite } from './lib/build-site.mjs';

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8']
]);

async function readBooks(root) {
  try {
    return JSON.parse(await readFile(join(root, 'data', 'books.json'), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeBooks(root, books) {
  await writeFile(join(root, 'data', 'books.json'), `${JSON.stringify(books, null, 2)}\n`);
}

async function updateNote(root, noteId, noteText) {
  const books = await readBooks(root);
  const now = new Date().toISOString();

  for (const book of books) {
    for (const note of book.notes || []) {
      if (note.id !== noteId) continue;

      note.note = String(noteText ?? '');
      note.updatedAt = now;
      await writeBooks(root, books);
      await buildSite(root);
      return { book, note };
    }
  }

  return null;
}

function createWriteQueue() {
  let current = Promise.resolve();

  return async function enqueueWrite(task) {
    const next = current.then(task, task);
    current = next.catch(() => {});
    return next;
  };
}

async function readRequestJson(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1024 * 1024) {
      throw Object.assign(new Error('Request body is too large'), { statusCode: 413 });
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(`${JSON.stringify(payload)}\n`);
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { 'content-type': 'text/plain; charset=utf-8' });
  response.end(message);
}

async function serveStatic(root, pathname, response) {
  const publicDir = join(root, 'public');
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = normalize(join(publicDir, decodeURIComponent(requestedPath)));
  const relativePath = relative(publicDir, filePath);

  if (relativePath.startsWith('..') || relativePath === '') {
    sendText(response, 404, 'Not found');
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      'content-type': contentTypes.get(extname(filePath)) || 'application/octet-stream'
    });
    response.end(body);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EISDIR') {
      sendText(response, 404, 'Not found');
      return;
    }
    throw error;
  }
}

export async function createLocalServer({ root = process.cwd() } = {}) {
  await scanImportFolder(root);
  await buildSite(root);
  const enqueueWrite = createWriteQueue();

  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://localhost');

      if (request.method === 'GET' && url.pathname === '/api/books') {
        sendJson(response, 200, await readBooks(root));
        return;
      }

      if (request.method === 'POST' && url.pathname === '/api/import') {
        const importResult = await scanImportFolder(root);
        await buildSite(root);
        sendJson(response, 200, importResult);
        return;
      }

      const noteMatch = url.pathname.match(/^\/api\/notes\/([^/]+)$/);
      if (request.method === 'PATCH' && noteMatch) {
        const body = await readRequestJson(request);
        if (typeof body.note !== 'string') {
          sendJson(response, 400, { error: 'Field "note" must be a string' });
          return;
        }

        const saved = await enqueueWrite(() => updateNote(root, decodeURIComponent(noteMatch[1]), body.note));
        if (!saved) {
          sendJson(response, 404, { error: 'Note not found' });
          return;
        }

        sendJson(response, 200, saved);
        return;
      }

      if (request.method === 'GET' || request.method === 'HEAD') {
        await serveStatic(root, url.pathname, response);
        return;
      }

      sendText(response, 405, 'Method not allowed');
    } catch (error) {
      const statusCode = error.statusCode || 500;
      sendJson(response, statusCode, { error: error.message || 'Server error' });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = process.cwd();
  const port = Number(process.argv[2] || 4173);
  const server = await createLocalServer({ root });

  server.listen(port, () => {
    console.log(`Kindle Notes server running at http://localhost:${port}`);
    console.log('Watching imports/ on startup and saving edits to data/books.json');
  });
}
