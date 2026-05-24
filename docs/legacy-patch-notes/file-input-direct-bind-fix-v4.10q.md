# Tower Battle Intel v4.10q - File Input Direct Bind Fix

## Problem

v4.10p proved the picker opens with `showPicker()`, but after choosing a file:

- `importPickerAttempt` was `trusted-click`
- `importPickerMethod` was `showPicker`
- `selectedFileChangedAt` stayed `null`
- `lastImportResult` stayed `null`
- history stayed `0`

That means the picker opened, but the selected-file `change` event did not reach the importer.

## Fix

`nativeImportHardBridge.js` now:

- directly binds `change`, `input`, and `onchange` to the chosen file input before opening the picker
- starts a short poll/watch after `showPicker()`
- checks the file input again when browser focus returns
- commits the file if `input.files[0]` exists even if the normal `change` event is missed
- exposes debug status fields for direct event, watch, focus return, file observation, and poll state

## Console checks

After importing, check:

```js
TowerBattleIntelNativeControls.status().directInputEventAt
TowerBattleIntelNativeControls.status().watchStartedAt
TowerBattleIntelNativeControls.status().focusReturnedAt
TowerBattleIntelNativeControls.status().fileObservedAt
TowerBattleIntelNativeControls.status().lastImportResult
TowerBattleIntelActions?.getState?.().history?.length
```

Expected: `lastImportResult` is an object and history length is greater than `0`.
