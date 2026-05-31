# Build Report — v4.11z52w46 Command Deck Build Style Input Retention

## Source base
Built from `Tower-Battle-Intel_v4.11z52w45_HistorySearchFullLibraryRepair_FullBuild.zip`.

## Problem
When a report was pasted into Command Deck and the Build Style dropdown was changed, Command Deck re-rendered and the visible pasted report text could disappear from the textarea.

## Fix
- `src/ui/events/workspaceEvents.js`
  - `handleCommandChange()` now finds the active Command Deck textarea and caches its visible value through `actionCacheCommandInputDraft()` before calling `set-build-style` and rendering.
  - This makes the visible textarea content the source of truth during the build-style change.

## Test
- `tests/v4.11z52w46-command-build-style-input-retention.test.mjs`
  - Confirms the visible build version is w46.
  - Confirms Command Deck build-style changes cache the visible draft before render.
  - Confirms changing build style to Hybrid preserves pasted report text in state and rendered Command Deck output.

## Protected areas
- Dashboard/Header untouched.
- Command Deck save/validate/raw-source logic untouched.
- History layout/search/pager/inspector untouched.
- Stats/Edit modals untouched.
- Click Truth Probe untouched.
- Raw archive/source storage untouched.
- Mobile untouched.
