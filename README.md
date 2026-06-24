# Kindle Note

Local Kindle note library for importing saved Kindle note files, preserving editable Markdown notes, and generating static HTML pages.

## Workflow

1. Place `.txt`, `.html`, or `.eml` Kindle note files in `imports/`.
2. Run `./kindle-notes import`.
3. Run `./kindle-notes build`.
4. Open `public/index.html`, or run `./kindle-notes serve` and open `http://localhost:4173`.

## Data

- `data/books.json` is the durable note database.
- `data/sources.json` records imported source fingerprints and parser warnings.
- `public/` is generated and can be rebuilt from `data/books.json`.

Kindle highlights live in each note's `quote` field. Kindle notes and manual edits live in each note's `note` field as Markdown.

## Editing Markdown Notes

Book pages show original highlighted text as `原文` and editable Markdown notes as `笔记`. Click `Edit`, write Markdown, click `Apply`, then use `Export books.json` to download updated data.

Because the site is static, the browser does not write directly to local files. Replace `data/books.json` with the exported file, then run:

```bash
./kindle-notes build
```

## Commands

```bash
./kindle-notes import
./kindle-notes build
./kindle-notes refresh
./kindle-notes serve
./kindle-notes test
```
