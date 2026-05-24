# v4.10b Utils Foundation Rebuild

## Scope

Rebuilt the shared utility foundation requested by Andrew:

- `src/utils/format.js`
- `src/utils/math.js`
- `src/utils/reportSplitter.js`
- `src/utils/safe.js`
- `src/utils/sectionEngine.js`
- `src/utils/timeEngine.js`
- `src/utils/util.js`

## Purpose

These files sit underneath parser, compute, compare, history, diagnostics and UI formatting.
The aim was to make them stable, compatible and testable before continuing higher-level UI/action fixes.

## Main changes

- Rebuilt shared math helpers around The Tower notation parser.
- Kept case-sensitive notation support such as `q`, `Q`, `s`, `S`, `O`, `N`, `D`, and `aa`.
- Rebuilt report splitter with safer multi-report detection and stable report fingerprints.
- Rebuilt section engine with shared battle-report aliases and safer tab / multi-space / no-tab parsing.
- Rebuilt time parsing for report strings such as `2d 0h 31m 51s`, `10h 6m 35s`, and `10:06:35`.
- Rebuilt safe helpers for nested get/set, cloning, strings, objects, arrays and escaping.
- Rebuilt `util.js` as a compatibility export hub.

## Tests

Added:

- `tests/utils-foundation.test.mjs`

Passed locally:

- JavaScript syntax check
- Import path check
- `node tests/report-parser-game-brain.test.mjs`
- `node tests/ui-action-foundation.test.mjs`
- `node tests/history-storage-ui-utils.test.mjs`
- `node tests/utils-foundation.test.mjs`
