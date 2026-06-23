# Editable Kindle Notes Design

## Goal

Show Kindle highlights as original text and make Kindle notes editable as Markdown.

The previous `extension` editing concept is removed from the user interface because the real user-authored content is Kindle `笔记`. The underlying data model may keep the `extension` property for backward compatibility, but new page behavior does not show or edit it.

## Import Rules

Kindle Notebook entries map into notes as follows:

- `标注` becomes the note's `quote`.
- A `笔记` immediately following a `标注` becomes the same note's `note`.
- A standalone `笔记` without a preceding `标注` becomes its own note with empty `quote` and `note` set to the note text.
- `书签` is skipped.

English test fixtures keep existing behavior: `Highlight` and `Note` entries remain separate notes unless they use the Chinese Notebook structure above.

## Page Behavior

Book pages show each entry as original text plus editable Markdown note:

- `原文` displays `quote` and is not editable.
- `笔记` renders `note` as Markdown.
- Clicking `Edit` opens a textarea containing the note Markdown source.
- `Apply` updates the in-memory note and preview.
- `Cancel` discards the edit for that note.
- `Export books.json` downloads the full updated books array.

The page does not show `extension`, edit original quote text, edit tags/status, or write directly to the filesystem.

## Data Flow

`build-html.mjs` embeds the full `books.json` array in each book page for export. Client-side JavaScript updates only edited `note` fields and writes a downloaded `books.json` file.

After export, the user replaces `data/books.json` and runs:

```bash
npm run build
```

## Safety

- Markdown rendering escapes HTML before applying supported Markdown syntax.
- Empty note renders as `暂无笔记`, not executable HTML.
- Export preserves unrelated books and notes.

## Testing

Automated tests should cover:

- Chinese Notebook parser attaches a following `笔记` to the previous `标注` as `note`.
- Standalone Chinese `笔记` imports as a note with empty `quote` and populated `note`.
- `书签` remains skipped.
- Book pages render note edit controls, not extension edit controls.
- Export behavior updates `note` fields.
- Markdown preview escapes raw HTML.
