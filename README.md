# Kindle Note

Local Kindle note library for importing saved Kindle note files, preserving editable Markdown notes, and running a local browser UI that writes edits back to disk.

## Workflow

1. Place `.txt`, `.html`, or `.eml` Kindle note files in `imports/`.
2. Run `./kindle-notes serve`.
3. Open `http://localhost:4173`.
4. Edit Markdown notes in the browser. Saves are written back to `data/books.json`.

## Data

- `data/books.json` is the durable note database.
- `data/sources.json` records imported source fingerprints and parser warnings.
- `public/` is generated and can be rebuilt from `data/books.json`.

Kindle highlights live in each note's `quote` field. Kindle notes and manual edits live in each note's `note` field as Markdown.

## Editing Markdown Notes

Book pages show original highlighted text as `原文` and editable Markdown notes as `笔记`. When opened through `./kindle-notes serve`, typing in the note editor saves back to `data/books.json`.

If you open the generated HTML directly with `file://`, edits fall back to browser local storage and do not write to disk. Use the local server when you want durable file updates.

To rebuild generated pages manually, run:

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
