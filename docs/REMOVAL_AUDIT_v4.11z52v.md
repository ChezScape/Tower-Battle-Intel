# Removal Audit — v4.11z52v Src Ownership Clean Rebuild

| Removed | Reason | Replacement owner |
|---|---|---|
| `src/ui/globalSearchBridge.js` | It became another state/search owner fighting the older stable render-state model. | `events.js` for History/Stats, `systemsKnowledgeBridge.js` for Systems, `historyFilters.js` for matching. |
| `src/ui/historySearchFocusGuard.js` | Compatibility shim only; no longer needed once History search returned to `events.js`. | `events.js` restores focus/caret after History search renders. |
| `src/ui/nativeImportHardBridge.js` | Over-complex import owner compared with the older working file picker flow. | `events.js` simple `openHistoryImportPicker()`. |
| `src/ui/universalDownloadBridge.js` | Extra early download owner; export/download should not be handled by multiple bridges. | `events.js` direct `downloadTextFile()` using current `actionExportHistoryJSON()`. |
| `historyImportFallbackInput` static HTML | Only needed by removed native import hard bridge. | Dynamic hidden input created by `events.js` when needed. |

Files kept intentionally:
- `nativeControlGuard.js`: browser-native control protection only.
- `metricTableDiffToggleBridge.js`: still owns metric-table diff toggles.
- `platformIsolationGuard.js` / `desktopPolishGuard.js`: static visual/platform guards.
