# Build Report — v4.11z52w17 History Raw Archive Controls Rewire

## Base

`Tower-Battle-Intel_v4.11z52w16_CommandDeckRawArchiveRewire_FullBuild.zip`

## Goal

After w16 made Command Deck save raw Battle Report source records before parser/History writes, w17 moves the next ownership step into History:

`History controls → actions/historyActions.js → core/history.js + rawReportArchiveStore.js → localStore.js → render`

This keeps the raw Battle Report archive as the source spine while letting History manage parsed cache controls and user metadata safely.

## Files changed

- `config/appConfig.js`
- `index.html`
- `src/ui/events/historyEvents.js`
- `src/ui/events/index.js`
- `src/actions/historyActions.js`
- `src/actions/importExportActions.js`
- `src/storage/rawReportArchiveStore.js`
- `src/ui/sections/historyView.js`
- `docs/ARCHITECTURE_OWNERSHIP_RULES.md`
- `tests/v4.11z52w17-history-raw-archive-controls-rewire.test.mjs`
- current test version markers

## Behaviour

### History controls now active

The modular `historyEvents.js` file now owns History card and modal controls. These controls are handled before parked fallback controls, so History actions should no longer be mistaken for parked shell buttons.

### Raw archive metadata sync

When a History run is archived, restored, or edited, the matching raw archive record receives the same user metadata through `patchRawReportRecordUserMeta()`.

This matters because parsed History is cache-like, while raw Battle Report records are the longer-lived source layer.

### Export/import

History export now carries both parsed `history` and `rawArchive` where available. Import merges incoming raw archive records instead of only importing parsed history.

### UI indicators

History now passively shows raw archive count and per-card source markers without redesigning the History layout.

## Protected areas

Dashboard, Header, Command Deck layout, and mobile remain visually protected. This build does not begin mobile repair and does not reconnect Dashboard quick actions.

## Validation

- 52 Node tests passed.
- 142 JS syntax checks passed.
- 52 MJS syntax checks passed.
- 35 CSS brace checks passed.
- Mobile diff against w16 passed unchanged.
- ZIP integrity passed.
