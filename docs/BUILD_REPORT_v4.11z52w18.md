# Build Report — v4.11z52w18 History View Rebuild

## Base

`Tower-Battle-Intel_v4.11z52w17_HistoryRawArchiveControlsRewire_FullBuild.zip`

## Goal

Rebuild the visible desktop History workspace properly instead of only wiring the hidden action/event layer.

`History view → History components → History event owner → History actions → raw archive/history storage → render`

This phase moves History away from the old parked shell and turns it into a logical saved-report management hub.

## Files added

- `src/ui/sections/history/historyView.js`
- `src/ui/sections/history/historyHeader.js`
- `src/ui/sections/history/historyToolbar.js`
- `src/ui/sections/history/historyRunList.js`
- `src/ui/sections/history/historyRunCard.js`
- `src/ui/sections/history/historyInspector.js`
- `src/ui/sections/history/historyEmptyState.js`
- `src/ui/sections/history/historyModalMounts.js`
- `src/ui/sections/history/historyShared.js`
- `styles/desktop/04-history-rebuild.css`
- `tests/v4.11z52w18-history-view-rebuild.test.mjs`

## Files changed

- `src/ui/sections/historyView.js` is now a thin wrapper for the modular History folder.
- `src/ui/views/desktopView.js` now mounts the real rebuilt History view instead of the parked History shell.
- `desktop.css` imports the new History rebuild stylesheet.
- `config/appConfig.js` and `index.html` update visible/display build markers to `v4.11z52w18`.
- `src/ui/events/historyEvents.js`, `src/storage/rawReportArchiveStore.js`, and `src/actions/actionUtils.js` update their current phase/version markers.
- Existing History/source tests were updated where they still expected the parked-shell phase.
- Existing RULE book updated in place.

## Behaviour

### Visible History is no longer parked

The active desktop History tab now renders the rebuilt `buildHistoryView()` path. The old parked wording such as `History wiring disconnected` and `Saved-run shell` is no longer present in the active desktop History panel.

### New visual structure

History is now organised as:

1. Report Management Hub header.
2. Trust/workflow strip for saved runs, raw archive count, and Run A/B state.
3. Search/filter toolbar with Normal/Deep search, sort, build, tag, archive shown/hidden, import/export, reset, Clear A/B, and Swap A/B.
4. Saved report cards with exact Wave display, source proof, short raw ID, build/tags/notes, Set A/B, Stats, Edit, Archive/Restore, Delete.
5. Selected Report inspector with A/B controls, quick metrics, source proof, Run Intel Summary, and Library Intel.
6. Existing Stats/Edit modal mounts retained for History event ownership.

### Modular History files

The visible History view now has its own folder so future History work can stay contained:

`src/ui/sections/history/`

This avoids growing another giant `historyView.js` and follows the existing ownership rulebook.

## Protected areas

- Dashboard visuals/layout remain untouched.
- Header remains untouched.
- Command Deck layout and raw intake remain intact.
- Mobile CSS and `styles/mobile/` remain unchanged from w17.
- Compare/Coach/Systems/Anomalies/Settings remain parked shells.

## Validation

- 53 Node tests passed.
- 151 JavaScript syntax checks passed.
- 53 MJS syntax checks passed.
- 36 CSS brace checks passed.
- Mobile root CSS unchanged from w17.
- Mobile module CSS unchanged from w17.
- Direct desktop History render smoke test passed.
- ZIP integrity passed.
