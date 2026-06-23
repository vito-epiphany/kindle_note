# Kindle Note

Local Kindle note library for importing saved Kindle note files, preserving personal extensions, and generating static HTML pages.

## Workflow

1. Place `.txt`, `.html`, or `.eml` Kindle note files in `imports/`.
2. Run `npm run import`.
3. Run `npm run build`.
4. Open `public/index.html`, or run `npm run dev` and open `http://localhost:4173`.

## Data

- `data/books.json` is the durable note database.
- `data/sources.json` records imported source fingerprints and parser warnings.
- `public/` is generated and can be rebuilt from `data/books.json`.

Manual note extensions live in `data/books.json` under each note's `extension`, `tags`, and `status` fields. Re-importing the same Kindle note preserves those fields.

## Commands

```bash
npm test
npm run import
npm run build
npm run dev
```
