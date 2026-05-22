# Tower Battle Intel v4.10u Final Control Polish

Targets the few controls still failing after v4.10t:

- Dashboard quiet display toggle.
- History Stats → Download JSON.
- History Edit modal build-style buttons.
- Debug → Download Health JSON.
- Debug → Download Full Debug JSON.

Quiet display is a calmer display mode. It reduces glow/shadows/animation intensity for a less visually busy dashboard. It does not change report data or calculations.

Install:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Unblock-File .\apply-v4.10u.ps1
.\apply-v4.10u.ps1
node .\tests\final-control-polish.test.mjs
```

Browser checks:

```js
TowerBattleIntel?.version
TowerBattleIntelNativeControls?.status()
TowerBattleIntelFinalControlPolish?.status()
```
