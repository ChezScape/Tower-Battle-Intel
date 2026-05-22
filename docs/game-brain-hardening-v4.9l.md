# v4.9l Game Brain Hardening

## Purpose

This patch turns `src/game/` into a more proper local game-knowledge brain instead of a loose set of catalogues.

## New files

- `src/game/gameVersionProfile.js`
- `src/game/battleReportAliases.js`
- `src/game/reportSchema.js`
- `src/game/buildStyleProfiles.js`
- `src/game/metricPriorityRules.js`
- `src/game/unknownMetricLogger.js`
- `tests/report-parser-game-brain.test.mjs`
- `tests/fixtures/Battle_Report_T11.txt`
- `tests/fixtures/Battle_Report_T12.txt`

## Wired into runtime

- `parser.js` now uses shared battle-report key aliases and attaches schema/unknown-field metadata.
- `schemaEngine.js` now preserves parser metadata instead of dropping it.
- `sectionEngine.js` now uses shared section/header labels.
- `compare.js` now uses game metric priority/role rules.
- `interpretationRules.js` now uses the shared build-style profiles.
- `src/game/index.js` exports all new game-brain files.

## Why it matters

- Future game report changes can be spotted instead of silently ignored.
- A/B compare can classify lower-is-better and neutral/context metrics more consistently.
- Build styles can be reused by UI, coach and priority sorting.
- Parser/section normalisation is now centralised.
