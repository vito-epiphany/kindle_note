# Editable Quote Only Design

## Goal

Simplify note editing so each note has one editable Markdown field: `quote`.

The previous `extension` editing concept is removed from the user interface because it duplicates the role of editable notes. The underlying data model may keep the `extension` property for backward compatibility, but new page behavior does not show or edit it.

## Import Rules

Kindle Notebook entries map into notes as follows:

- `标注` becomes a note `quote`.
- A `笔记` immediately following a `标注` is appended to the same `quote` as Markdown:

  ```md
  Original highlight text

  > 笔记：Kindle note text
  ```

- A standalone `笔记` without a preceding `标注` becomes its own note with `quote` set to the note text.
- `书签` is skipped.

English test fixtures keep existing behavior: `Highlight` and `Note` entries remain separate notes unless they use the Chinese Notebook structure above.

## Page Behavior

Book pages show each note as editable Markdown:

- The rendered quote appears as Markdown preview.
- Clicking `Edit` opens a textarea containing the Markdown source.
- `Apply` updates the in-memory quote and preview.
- `Cancel` discards the edit for that note.
- `Export books.json` downloads the full updated books array.

The page does not show `extension`, tags editing, status editing, or direct filesystem writes.

## Data Flow

`build-html.mjs` embeds the full `books.json` array in each book page for export. Client-side JavaScript updates only edited `quote` fields and writes a downloaded `books.json` file.

After export, the user replaces `data/books.json` and runs:

```bash
npm run build
```

## Safety

- Markdown rendering escapes HTML before applying supported Markdown syntax.
- Empty quote renders as an empty Markdown preview, not executable HTML.
- Export preserves unrelated books and notes.

## Testing

Automated tests should cover:

- Chinese Notebook parser appends a following `笔记` to the previous `标注` quote.
- Standalone Chinese `笔记` imports as a note quote.
- `书签` remains skipped.
- Book pages render quote edit controls, not extension edit controls.
- Export behavior updates `quote` fields.
- Markdown preview escapes raw HTML.
