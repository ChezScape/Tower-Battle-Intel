# Tower Battle Intel v4.11z52w6 — LocalStore Export Repair

Built directly from the uploaded `v4.11z52w_HistoryButtonSearchModeRepair` ZIP.

## Purpose
Fix the remaining History export failure after import was confirmed working.

## What was removed
- Removed the active `nativeControlGuard` safeguard from `bootstrap.js`.
- Removed `src/ui/nativeControlGuard.js` from active source.

## Export repair
- `src/ui/events.js` now has a direct import/export click owner before the generic History/UI click routing.
- Export now catches:
  - `data-export-history`
  - `data-ui-action="export-history"`
  - legacy export action aliases
  - `.action-export-history`
- Export now uses a direct Blob/ObjectURL download path with delayed link removal and delayed URL revocation.
- Export payloads prefer live `getState().history`.
- If live history is unavailable, export falls back to the primary localStore history.
- Backup storage is exposed for diagnostics, but not automatically exported as the main history source because backups can be stale after deletes.

## localStore changes
- Added `readRawStorageSnapshot()`.
- Added `readSavedHistoryCandidates()`.
- Preserved `historyFilters.mode` so Normal/Deep search mode survives storage round trips.

## Console checks
Use these in Chrome DevTools after loading the build:

```js
TowerBattleIntelDirectFileIO.status()
TowerBattleIntelDirectFileIO.inspectHistorySource()
TowerBattleIntelDirectFileIO.previewExport()
TowerBattleIntelDirectFileIO.forceExport()
```

## Protected
- Dashboard visuals kept intact.
- Existing buttons kept intact.
- Command Deck visuals kept intact.
- History visuals kept intact except export/import ownership behind the buttons.
- Mobile CSS and mobile modules untouched.

## Validation
- JS/MJS syntax checks passed.
- 40 Node tests passed.
- CSS brace check passed across 35 CSS files.
- `mobile.css` and `styles/mobile/` verified unchanged from the uploaded ZIP.
- ZIP integrity verified after packaging.
