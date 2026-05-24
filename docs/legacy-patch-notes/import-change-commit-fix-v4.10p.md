# v4.10p Import Change Commit Fix

The picker opens, but `lastImportResult` stays `null` and History stays at `0`. That means the trusted click path is fixed, but the selected-file `change` event is not committing the JSON into the app.

This patch makes `nativeImportHardBridge.js` own the file-selection commit as well:

- listens for `change` on visible and fallback import inputs
- reads the selected JSON file
- extracts `history` / `runs` arrays
- calls `TowerBattleIntelActions.importHistoryText(text)` when available
- hard-fallback merges the history into runtime state and localStorage if the normal action path does not change state
- records `lastImportResult` on `window.__TowerBattleIntelLastImportResult`
- exposes that result through `TowerBattleIntelNativeControls.status()`

Expected after importing:

```js
TowerBattleIntelNativeControls.status().lastImportResult
TowerBattleIntelActions?.getState?.().history?.length
```

History length should become more than `0`.
