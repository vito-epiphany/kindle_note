# Markdown Extension Editing Design

## Goal

Add simple static-page editing for each note's `extension` field. The extension content is Markdown source written by the user as reading expansion notes.

The feature must keep the project static and lightweight. It must not add a backend, framework, browser writeback, or editing for tags/status.

## Scope

Version 1 includes:

- Markdown editing for `note.extension` only.
- A textarea per note, opened with an Edit button.
- A rendered Markdown preview for the extension.
- A single export action that downloads an updated `books.json`.
- Basic Markdown support: headings, paragraphs, blockquotes, unordered lists, ordered lists, bold, italic, inline code, fenced code blocks, and links.
- HTML escaping for user Markdown source before rendering supported Markdown syntax.

Version 1 excludes:

- Direct filesystem writes from the browser.
- Editing tags, status, quote text, book metadata, or import source records.
- Full CommonMark compatibility.
- External Markdown libraries.

## Data Flow

`build-html.mjs` reads `data/books.json` and renders book pages that include enough note metadata for client-side export:

- current book id
- current note ids
- current extension Markdown values

The browser keeps edits in memory. When the user clicks Export, the page downloads a JSON file containing updated `data/books.json` content. The user can replace `data/books.json` with that file and run:

```bash
npm run build
```

Re-import remains safe because the existing merge logic preserves `extension`.

## Page Behavior

Each note page section shows:

- quote
- metadata
- rendered extension preview
- Edit button

When editing:

- textarea appears with the Markdown source
- preview updates as the user types
- Cancel restores the current saved-in-page value
- Apply updates the in-memory value and preview

The page has one top-level Export button. Export is enabled after the first applied edit.

## Error Handling

- Empty extension renders as `暂无拓展`.
- Markdown HTML input is escaped and treated as text.
- Export should fail visibly with an alert only if JSON generation or download setup throws.

## Testing

Automated tests should cover:

- rendered book pages include extension edit controls and note ids
- Markdown renderer escapes raw HTML
- Markdown renderer supports the basic syntax listed in scope
- exported JSON preserves unrelated books and notes while updating only edited `extension` values

Manual verification should include:

- run `npm test`
- run `npm run build`
- open the generated real book page
- edit one extension using Markdown
- apply it and confirm preview updates
- export `books.json`
