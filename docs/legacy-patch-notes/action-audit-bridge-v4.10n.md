# Tower Battle Intel v4.10n - Action Audit Bridge

## Problem

The main tabs were switching, but controls inside the active panels were not reliably firing:

- Dashboard buttons
- Compare/system section buttons
- Systems tiles
- Coach/anomaly side buttons
- History import/export/delete/load/stats/edit buttons
- History filter controls
- Command Deck buttons
- Debug close/download buttons

The import picker could open after v4.10m, but selected files were not being committed into History.

## Fix

`src/ui/actionAuditBridge.js` adds one capture-phase interaction bridge for active panel controls. It handles:

- `data-ui-action`
- `data-dashboard-tab`
- `data-section`
- `data-history-*` buttons
- file input `change` import handling
- history filters/search/dropdowns
- history stats/edit modal controls
- debug close/copy/download
- visible import result toasts

## Browser checks

After hard refresh:

```js
TowerBattleIntel?.version
TowerBattleIntelNativeControls?.status()
TowerBattleIntelActionAudit?.auditControls()
```

Expected:

```js
version: "v4.10n"
actionAuditBridgeBound: true
historyCount: changes after importing a history JSON
```

After selecting a file:

```js
TowerBattleIntelNativeControls.status().lastImportResult
TowerBattleIntelActions?.getState?.().history?.length
```
