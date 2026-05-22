# v4.10t Native Control Guard

## Fix target

v4.10s still allowed older capture-phase dashboard bridges to interfere with native browser controls.
Symptoms:

- Sort / Build / Tag dropdowns only worked while holding the mouse.
- Collapsible `<details>/<summary>` panels did not open/close.

## Fix

`src/ui/nativeControlGuard.js` is loaded first from `bootstrap.js`.

It captures native-control events before the dashboard/action bridges and calls `stopImmediatePropagation()` without `preventDefault()`.

That means:

- Browser native dropdown behaviour is preserved.
- Browser native text focus/typing is preserved.
- Browser native details/summary toggle is preserved.
- Later custom bridge handlers do not steal those events.

## Browser check

```js
TowerBattleIntelNativeControlGuard?.status()
```

Expected:

```js
nativeControlGuardBound: true
nativeControlGuardVersion: "v4.10t"
```
