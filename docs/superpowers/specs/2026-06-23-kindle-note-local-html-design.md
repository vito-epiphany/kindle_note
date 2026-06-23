# Kindle Note Local HTML Design

## Goal

Build a local Kindle note library in this repository. The first version imports existing Kindle note exports or saved email content from local files, stores normalized data in JSON, and generates static HTML pages for browsing and extending the notes manually.

The design deliberately separates three concerns:

- Import source files into normalized note data.
- Preserve user-written extensions across repeated imports.
- Generate local HTML that can be opened and reviewed without a hosted backend.

Gmail automation is a later integration. The first version keeps the import pipeline reusable so Gmail sync can feed the same parser and merge logic later.

## Scope

Version 1 includes:

- Local import from `.txt`, `.html`, and `.eml` files placed in `imports/`.
- Structured data under `data/`.
- Static site output under `public/`.
- A repeatable command flow for import, build, and local preview.
- Fixtures and tests for parser, merge, and HTML generation behavior.

Version 1 excludes:

- Gmail OAuth and Gmail API sync.
- Multi-device cloud sync.
- A server-side editor that writes directly to local files from the browser.
- Full fidelity parsing for every historical Kindle email layout.

## Repository Structure

```text
imports/
  README.md
data/
  books.json
  sources.json
public/
  index.html
  books/
  assets/
    app.css
    app.js
scripts/
  import-notes.mjs
  build-html.mjs
  lib/
    parse-kindle-note.mjs
    merge-books.mjs
    render-html.mjs
test/
  fixtures/
  parse-kindle-note.test.mjs
  merge-books.test.mjs
  build-html.test.mjs
package.json
```

`imports/` is the only place the user needs to drop source files. `data/` is the durable working state. `public/` is generated output and can be rebuilt from `data/`.

## Data Model

`data/books.json` contains an array of books:

```json
[
  {
    "id": "book-stable-id",
    "title": "Book title",
    "author": "Author name",
    "source": "kindle",
    "firstImportedAt": "2026-06-23T00:00:00.000Z",
    "lastImportedAt": "2026-06-23T00:00:00.000Z",
    "notes": [
      {
        "id": "note-stable-id",
        "quote": "Original Kindle highlight text",
        "location": "Location 123",
        "page": "",
        "highlightedAt": "",
        "tags": [],
        "status": "new",
        "extension": "",
        "createdAt": "2026-06-23T00:00:00.000Z",
        "updatedAt": "2026-06-23T00:00:00.000Z"
      }
    ]
  }
]
```

`status` starts as `new`. Later useful values can include `thinking`, `expanded`, and `archived`.

Note IDs are derived from normalized book title, normalized quote text, and location/page when present. Re-importing the same source should not duplicate notes and must not overwrite `extension`, `tags`, or `status`.

`data/sources.json` records imported file fingerprints:

```json
[
  {
    "path": "imports/example.eml",
    "sha256": "file-content-hash",
    "importedAt": "2026-06-23T00:00:00.000Z",
    "notesFound": 12,
    "warnings": []
  }
]
```

The source registry helps skip unchanged files and diagnose parsing issues.

## Import Flow

The command is:

```bash
npm run import
```

The importer:

1. Scans `imports/` for `.txt`, `.html`, and `.eml`.
2. Computes a hash for each file.
3. Skips files already recorded with the same hash.
4. Extracts a text or HTML body.
5. Parses Kindle note blocks into normalized book and note objects.
6. Merges parsed notes into `data/books.json`.
7. Records source metadata and parser warnings in `data/sources.json`.

Parser behavior should be conservative. If a file cannot be parsed confidently, the import command reports a warning and leaves the existing data unchanged for that file.

## HTML Build Flow

The command is:

```bash
npm run build
```

The builder:

1. Reads `data/books.json`.
2. Generates `public/index.html`.
3. Generates one page per book under `public/books/`.
4. Copies or writes CSS and client-side JavaScript assets under `public/assets/`.

The generated site is static. It can be opened directly from disk or served through a local dev server:

```bash
npm run dev
```

## Page Experience

`public/index.html` provides:

- Search across book titles, authors, and note quotes.
- A book list with note counts and last import time.
- Links to per-book pages.

Each book page provides:

- Book title and author.
- A filterable list of notes.
- Quote text, location/page, and highlight time.
- User extension text, tags, and status.

For version 1, editing is intentionally lightweight. The durable source of truth is `data/books.json`. If browser editing is included, it should export a replacement JSON file for the user to review instead of writing directly to the filesystem.

## Gmail Sync Extension Point

Future Gmail sync should feed the same import pipeline:

```text
Gmail search -> message body extraction -> parser -> merge -> build
```

The future script can be named `scripts/sync-gmail.mjs`. It should only be added after the local file import workflow is stable. It will need OAuth setup, Gmail search query configuration, and explicit documentation for credentials.

## Error Handling

Import errors should be visible and non-destructive:

- Existing `data/books.json` must not be overwritten by an empty or failed parse.
- Parser warnings should include file path and reason.
- Malformed files should not stop other files from importing.
- Duplicate notes should be skipped or merged deterministically.

## Testing

Automated tests should cover:

- Parsing representative Kindle text, HTML, and EML fixtures.
- Re-importing the same note without duplication.
- Preserving `extension`, `tags`, and `status` when the same note is imported again.
- Generating index and book HTML files from sample `books.json`.
- Reporting parse warnings for unsupported input.

Manual verification should include:

- Running `npm run import` with fixture files.
- Running `npm run build`.
- Opening the generated `public/index.html` or `npm run dev` preview.

## Implementation Notes

Use Node.js ES modules for scripts because the repository is a small local tool and does not need a framework. Keep parsing, merging, and rendering in separate modules so Gmail sync can reuse the parser and merge layer later.

The first implementation should favor deterministic plain files over hidden state. Generated output should be reproducible from `data/books.json`.
