# Build Report — Tower Battle Intel v4.11z52w19

## Build name

`Tower-Battle-Intel_v4.11z52w19_RebuildWiringCompletion_FullBuild.zip`

## Base

`Tower-Battle-Intel_v4.11z52w18_HistoryViewRebuild_FullBuild.zip`

## Goal

Finish the current rebuild wiring before deleting legacy clutter. The focus is active route correctness, new event-handler ownership, import/export browser IO, action calls, and raw archive payload continuity.

## Summary

`v4.11z52w19` does not remove old project clutter yet. It keeps compatibility/reference/parked files in place and makes the active rebuilt paths clearer:

- Command Deck remains the report intake workspace.
- History remains the rebuilt report-management hub.
- Raw Battle Report archive remains the source-of-truth spine.
- Import/export browser behaviour now has one shared active owner.
- Parked tabs stay intentionally parked until their rebuild phases.

## Files changed

- `config/appConfig.js`
- `index.html`
- `src/actions/actionUtils.js`
- `src/storage/rawReportArchiveStore.js`
- `src/ui/events/importExportEvents.js`
- `src/ui/events/commandDeckEvents.js`
- `src/ui/events/historyEvents.js`
- `src/ui/sections/history/historyShared.js`
- `src/ui/sections/history/historyView.js`
- `src/ui/sections/historyView.js`
- `src/ui/views/desktopView.js`
- `styles/desktop/04-history-rebuild.css`
- `docs/ARCHITECTURE_OWNERSHIP_RULES.md`
- `docs/BUILD_HISTORY_INDEX.md`
- `tests/v4.11z52w19-rebuild-wiring-completion.test.mjs`

Most source/CSS changes outside the event modules are version-marker updates so the runtime and tests reflect the current build checkpoint.

## Import/export ownership

`src/ui/events/importExportEvents.js` now owns:

- History JSON file picker creation.
- History JSON browser download creation.
- Shared Command Deck and History import/export feedback wording.
- Calls into `performUIAction("import-history-json")` and `performUIAction("export-history-json")`.

Command Deck and History still own their own visible buttons. They now delegate shared browser IO into `importExportEvents.js` instead of keeping duplicate local helpers.

## Rebuild status after w19

Active/rebuilt/protected:

- App startup/render/tabs foundation.
- Modular UI event shell.
- Modular action layer.
- Storage/import/export/raw archive foundation.
- Command Deck raw archive intake.
- History controls/raw metadata sync.
- Rebuilt desktop History visual hub.
- Shared History JSON browser import/export owner.

Still parked by design:

- Compare.
- Coach.
- Systems.
- Anomalies.
- Settings.
- Mobile workspaces.

## Validation

- 54 Node tests passed.
- 149 JS syntax checks passed.
- 54 MJS syntax checks passed.
- 33 CSS files brace-checked.
- Core module import smoke test passed.
- Mobile root CSS and mobile modules unchanged from w18.
- ZIP integrity passed.

## Notes

Legacy cleanup is intentionally delayed. The next cleanup pass should inventory and delete/move only files proven unused after active wiring is stable.
