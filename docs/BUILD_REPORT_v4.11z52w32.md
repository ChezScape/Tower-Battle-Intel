# Build Report — v4.11z52w32 History Hero + Run Type Edit Polish

Build: `Tower-Battle-Intel_v4.11z52w32_HistoryHeroRunTypeEditPolish_FullBuild.zip`
Core protected version: `v4.11z52`
Visible/display build: `v4.11z52w32`

## Purpose

This pass continues the rebuilt History polish after w31 fixed Command Deck raw-source hydration and tournament-marker metadata. It focuses on the History hero/summary area and manual run-type correction.

## Changes

- History raw-source count now uses `normaliseRawArchive()` and falls back to raw-backed parsed History entries.
- History hero Raw Sources can show complete/partial source coverage instead of incorrectly showing `0` when raw-backed History entries exist.
- The workflow strip now uses user-facing wording:
  - Find — Search saved reports
  - Choose — Set Run A / Run B
  - Inspect — Stats, edit, archive
  - Protect — Raw sources + backups / no raw source records yet
- Removed user-facing `parsed-cache runs` wording from the active History hero.
- History Edit modal now includes Run Type controls:
  - Normal
  - Tournament
  - Farming
  - Milestone
  - Test
  - Event
- Run Type edits are saved through `history-update-meta`, update History card/search metadata, and sync into raw archive user metadata.
- History Stats modal now displays Run Type in the trust row and Run Identity section.

## Protected areas

- Dashboard visual shell untouched.
- Header untouched.
- Command Deck raw save/batch splitter path protected from w31.
- Rebuilt History hub structure protected.
- Stats/Edit modal ownership retained under `src/ui/sections/history/`.
- Mobile CSS/modules and mobile view unchanged from w31.

## Validation

- Focused w30 batch/raw-source test passed.
- Focused w31 raw-source hydration/tournament search test passed.
- New w32 History hero/run-type edit test passed.
- 147 JS syntax checks passed.
- 66 MJS syntax checks passed.
- 36 CSS files checked.
- Mobile root CSS, mobile modules, and mobile view unchanged from w31.
