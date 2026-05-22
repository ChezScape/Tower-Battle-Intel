# v4.10m Trusted Import Picker Bridge

## What the runtime recording proved

The History Import click reached the real file input:

- target tag: `INPUT`
- target id: `historyImportInput`
- class: `history-native-import-input`
- type: `file`

But the runtime report still showed:

- `filePickerTriggers: 0`
- `downloads: 0`
- `runtimeErrors: 0`

That means the button is clickable and the input exists, but the browser picker is not being opened before other dashboard/render handlers finish.

## Fix

`src/ui/nativeImportHardBridge.js` captures the trusted user click and opens the file picker immediately using:

1. `input.showPicker()` when supported.
2. `input.click()` as fallback.

It also calls `event.stopImmediatePropagation()` so later dashboard handlers cannot re-render the input before the browser picker starts.

## Install

From the project root:

```powershell
.\apply-v4.10m.ps1
node .\tests\native-import-hard-bridge.test.mjs
```

Then hard refresh localhost and run:

```js
TowerBattleIntel?.version
TowerBattleIntelNativeControls?.status()
```

Expected version: `v4.10m`.
