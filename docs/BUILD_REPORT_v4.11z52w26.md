# Build Report — v4.11z52w27 History Stats Modal Control Repair

## Source

`Tower-Battle-Intel_v4.11z52w25_HistoryStatsModalMountRepair_FullBuild.zip`

## Reason

Andrew tested w25 and confirmed the Stats modal was now visually different and mounted as a modal, but modal controls were not working:

- Close did not close.
- Summary / Sections did not switch tabs.
- Download JSON did not download.
- Set Run A / Set Run B did work and closed the modal.

The Click Truth Probe showed the modal clicks were reaching `workspaceEvents`, but the probe action remained broad `history`, which meant the modal controls needed a dedicated modal-first route.

## Implemented

`src/ui/events/workspaceEvents.js`

- Added `handleStatsModalControlClick()`.
- Runs modal controls before broad History card/list controls.
- Handles Close, Summary/Sections/Raw tabs, Copy JSON, Download JSON, and stats search Clear.
- Close now clears `#historyStatsModalMount` directly from the clicked modal and removes stray modal instances defensively.
- Tab switching now targets the active modal directly and normalises tab names.
- Copy/download now read JSON from the active modal root.

`src/ui/sections/history/historyStatsModal.js`

- Added specific `data-ui-action` markers to Close, tab, Copy JSON, Download JSON, and Clear controls for clearer Click Truth Probe output.

`tests/v4.11z52w27-history-stats-modal-control-routing.test.mjs`

- Verifies modal-first handler exists.
- Verifies Close/tab/download controls are routed before broad History routing.
- Verifies modal controls expose specific Click Truth Probe action names.

## Validation

- 60 Node tests passed.
- 148 JS syntax checks passed.
- 60 MJS syntax checks passed.
- 35 CSS brace checks passed.
- Module import smoke test passed.
- `mobile.css`, `styles/mobile/`, and `src/ui/views/mobileView.js` unchanged from w25.
- ZIP integrity passed.
