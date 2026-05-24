# v4.10l Native Import Placement Fix

## Problem

The History Import file picker existed, but DevTools showed the active `#historyImportInput` as a tiny 2×2 input at the top-left of the page. The History Import button still depended on a hidden/fallback input, so the visible control could appear correct while native file picking stayed unreliable.

## Fix

- The rendered History Import control is now a real `<label>` containing the real `#historyImportInput`.
- The visible input has `data-history-visible-import-input="true"` and fills the whole Import History control.
- Browser click handlers now let direct clicks on the visible file input pass through instead of preventing the native picker.
- Console/helper picker routes now prefer the visible import input first.
- The always-present fallback picker is now `#historyImportFallbackInput`, so it can no longer conflict with the visible import input.
- Desktop and mobile CSS force the visible input to fill the Import History button area and keep the fallback picker off-canvas.

## Test

Run:

```powershell
node .\tests\native-import-placement.test.mjs
node .\tests\native-control-hardening.test.mjs
node .\tests\root-shell-foundation.test.mjs
```

Then test locally by mouse click:

1. Open HISTORY.
2. Click Import History.
3. The Windows file picker should open from the visible Import History button.

Console check:

```js
TowerBattleIntel?.version
TowerBattleIntelNativeControls?.status()
TowerBattleIntelNativeControls?.openImportPicker()
```

Expected version: `v4.10l`.
