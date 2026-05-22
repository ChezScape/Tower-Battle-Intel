# v4.10i Handler Presence + Static File Picker Audit

## Findings

The previous v4.10f project had History Import/Export handlers in `src/ui/events.js`, and Debug handlers in `src/ui/dev/inspectionPanel.js`, but the History file picker did **not** exist in the static DOM.

Instead, the file input was created only after the Import History click handler ran. If the click bridge failed, the file picker could never be created.

## Fix

This patch adds a permanent native file input to `index.html`:

```html
<input id="historyImportInput" type="file" accept="application/json,.json">
```

History Import is also changed to a real label pointing at that input:

```html
<label for="historyImportInput">Import History</label>
```

That gives the browser a native file-picker route instead of relying only on JavaScript-created inputs.

## Added Bridge

`src/ui/staticControlBridge.js` is a small safety bridge for hard browser behaviours:

- Debug close
- Debug health download
- Debug full JSON download
- History import picker
- History export JSON
- Browser audit helper

## Browser audit helper

After hard refresh, open F12 and run:

```js
TowerBattleIntelHandlers.status()
```

Expected:

```js
{
  staticBridgeBound: true,
  filePickerExists: true,
  debugPanelExists: true,
  historyImportTriggers: 1 or more,
  historyExportTriggers: 1 or more
}
```

Manual tests:

```js
TowerBattleIntelHandlers.openImportPicker()
TowerBattleIntelHandlers.exportHistory()
TowerBattleIntelHandlers.downloadHealth()
TowerBattleIntelHandlers.downloadFullDebug()
```
