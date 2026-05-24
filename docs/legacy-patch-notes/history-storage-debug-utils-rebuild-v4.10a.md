# v4.10a History / Storage / Debug / UI Utils Rebuild

## Scope

Rebuilt the utility and support layer requested by Andrew:

- `src/history/historyBadges.js`
- `src/history/historyFilters.js`
- `src/history/historySelectors.js`
- `src/history/historyStats.js`
- `src/storage/localStore.js`
- `src/ui/dev/inspectionPanel.js`
- `src/ui/utils/colourScale.js`
- `src/ui/utils/deltaFormat.js`
- `src/ui/utils/format.js`

## Goals

- Make History filtering/sorting/badges/stats stable and pure.
- Make local storage safer, versioned, backed up, and Node-safe.
- Rebuild the debug inspection panel with stable tabs, copy/download tools, health summary and Escape/Close behaviour.
- Centralise UI formatting, delta formatting and colour/heat severity logic.

## Notes

This patch does not change the visible dashboard layout. It supports the visible UI/action layer by cleaning the files it depends on.

## Tests

Added:

- `tests/history-storage-ui-utils.test.mjs`

Run:

```powershell
node .\tests\history-storage-ui-utils.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
```
