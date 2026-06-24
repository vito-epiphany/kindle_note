# Repository Guidelines

## Project Structure & Module Organization

This repository is a local Kindle note library built with Node.js ES modules and no third-party runtime dependencies.

- `kindle-notes`: main command wrapper for import, build, serve, refresh, and tests.
- `scripts/`: executable entry points, including `import-notes.mjs`, `build-html.mjs`, and `serve-local.mjs`.
- `scripts/lib/`: reusable modules for parsing Kindle exports, merging books, generating HTML, and site assets.
- `test/`: Node test runner suites named `*.test.mjs`.
- `imports/`: local Kindle source files (`.html`, `.txt`, `.eml`) for import.
- `data/`: durable local data (`books.json`, `sources.json`).
- `public/`: generated browser UI and assets. Rebuild rather than hand-edit generated files.

## Build, Test, and Development Commands

Prefer the project wrapper over npm:

```bash
./kindle-notes import    # scan imports/ and merge notes into data/books.json
./kindle-notes build     # regenerate public/ from data/books.json
./kindle-notes refresh   # import, then build
./kindle-notes serve     # run local app on port 4173 with write-back API
./kindle-notes test      # run all Node tests
```

Equivalent npm scripts exist, but the wrapper is the documented workflow.

## Coding Style & Naming Conventions

Use ES modules (`import`/`export`) and Node built-ins. Keep modules focused: parsing, merging, rendering, and serving belong in separate files under `scripts/lib/` or `scripts/`. Use two-space indentation, semicolons, descriptive camelCase function names, and kebab-case filenames such as `merge-books.mjs`.

Avoid adding dependencies unless the project clearly needs them. Generated files in `public/` should come from `./kindle-notes build`.

## Testing Guidelines

Tests use the built-in Node test runner:

```bash
node --test test/*.test.mjs
```

Add or update focused tests for parser behavior, merge conflict handling, server APIs, and generated HTML/asset expectations. Name tests by behavior, for example `mergeBooks preserves edited note...`.

## Commit & Pull Request Guidelines

Follow the existing commit style:

```text
feat: add local library server
fix: preserve edited notes on import conflicts
style: remove pane divider lines
chore: add non-npm project command
```

Use concise, imperative summaries with a conventional prefix (`feat`, `fix`, `style`, `chore`). Pull requests should include a short description, verification commands run, and screenshots for UI changes. Do not commit personal imported notebooks or generated local data unless intentionally updating shared fixtures.

## Security & Configuration Tips

The local server writes to `data/books.json`; only run it from a trusted checkout. Treat `imports/` and `data/` as local working data. If testing with private reading notes, keep those files out of commits unless explicitly requested.
