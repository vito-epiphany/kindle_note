# Local Library Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static-only usage with a local server that scans `imports/`, serves the UI, and writes edited Markdown notes back to `data/books.json`.

**Architecture:** Move import scanning into a reusable library module used by both CLI import and server startup. Add a small Node HTTP server using only built-in modules; it serves `public/`, exposes JSON APIs, and rewrites generated HTML after saves/imports. Keep generated book pages as the UI surface so existing layout and editor code stay intact.

**Tech Stack:** Node.js built-in `http`, `fs/promises`, existing ES modules, browser `fetch`, Node test runner.

---

### Task 1: Reusable Import Library

**Files:**
- Create: `scripts/lib/import-library.mjs`
- Modify: `scripts/import-notes.mjs`
- Test: `test/import-notes.test.mjs`

- [x] Write a failing test that imports from a temp `imports/` folder through a reusable function.
- [x] Run the focused test and confirm it fails because the module does not exist.
- [x] Move the existing import scan/merge behavior into `scanImportFolder(root)`.
- [x] Update `scripts/import-notes.mjs` to call the reusable function.
- [x] Run importer tests and confirm they pass.

### Task 2: Local Server API

**Files:**
- Create: `scripts/serve-local.mjs`
- Test: `test/local-server.test.mjs`
- Modify: `kindle-notes`

- [x] Write failing tests for `GET /api/books`, `PATCH /api/notes/:id`, and static `GET /`.
- [x] Implement a Node HTTP server that scans imports on start, rebuilds `public/`, serves files, and exposes JSON APIs.
- [x] Update `./kindle-notes serve` to call `node scripts/serve-local.mjs`.
- [x] Run focused server tests and confirm they pass.

### Task 3: Browser Save Integration

**Files:**
- Modify: `scripts/lib/site-assets.mjs`
- Modify generated: `public/assets/app.js`
- Test: `test/build-html.test.mjs`

- [x] Add tests that the front-end script calls `/api/notes/` and falls back to localStorage.
- [x] Update note editing to debounce saves through `fetch` when served from localhost.
- [x] Keep localStorage fallback for direct `file://` opening.
- [x] Rebuild assets and run the full test suite.

### Task 4: Documentation and Verification

**Files:**
- Modify: `README.md`

- [x] Document the new default workflow: place files in `imports/`, run `./kindle-notes serve`, edit in browser, save writes to `data/books.json`.
- [x] Run `./kindle-notes test`.
- [x] Run `./kindle-notes build`.
- [x] Commit and push only code/docs/tests, leaving real imported data uncommitted.
