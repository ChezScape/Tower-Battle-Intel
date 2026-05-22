# Tower Battle Intel v4.10j Native Control Backbone

## Problem fixed

The visible UI existed, but critical browser controls were still unreliable on the live site:

- History Import did not open the file picker.
- History Export did not download.
- Debug Close did not close the panel.
- Debug Health / Full JSON downloads did not download.
- The History Import label still carried `data-ui-action="import-history"`, so generic action handlers could prevent the native label/file-input behaviour.

## Main fix

A browser-native fallback script is now embedded in `index.html` before the module app starts.

This script binds capture-phase click/change handlers before module handlers. It owns only hard browser behaviours:

- `#historyImportInput` permanent file picker
- `.history-import-label` native import trigger
- History Export JSON download fallback
- Debug Close fallback
- Debug Health JSON download fallback
- Debug Full JSON download fallback
- Debug copy fallback

## Important change

`src/ui/layouts/historyLayout.js` now renders Import History as a native label only:

```html
<label for="historyImportInput" data-native-history-import-label="true">Import History</label>
```

It deliberately does **not** use:

```html
data-ui-action="import-history"
```

That avoids the generic click bridge blocking the browser-native file picker.

## Console checks

On the live site, run:

```js
TowerBattleIntelNativeControls.status()
```

Expected useful values:

```js
{
  bound: true,
  filePickerExists: true,
  importLabels: 1,
  exportButtons: 1,
  actionBridgeExists: true,
  appHelpersExist: true
}
```

Direct tests:

```js
TowerBattleIntelNativeControls.openImportPicker()
TowerBattleIntelNativeControls.exportHistory()
TowerBattleIntelNativeControls.downloadHealth()
TowerBattleIntelNativeControls.downloadFullDebug()
TowerBattleIntelNativeControls.closeDebug()
```
