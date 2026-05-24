# v4.10o Action Audit Status Fix

Fixes a recursion bug in `TowerBattleIntelNativeControls.status()` after the action audit bridge overwrote the native status function.

## Symptom

Chrome console showed:

```text
RangeError: Maximum call stack size exceeded
at Object.status (actionAuditBridge.js:871:26)
```

## Cause

`actionAuditBridge.status()` called `window.TowerBattleIntelNativeControls.status()`, but after install that property pointed back to `actionAuditBridge.status()`.

## Fix

The bridge now captures the previous native status function before overwriting `TowerBattleIntelNativeControls.status`, and calls that saved function instead.
