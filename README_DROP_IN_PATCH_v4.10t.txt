Tower Battle Intel v4.10t - Native Control Guard

Copy/merge this patch into your project root.

Then run:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Unblock-File .\apply-v4.10t.ps1
.\apply-v4.10t.ps1
node .\tests\native-control-guard.test.mjs

Then restart localhost and hard refresh Chrome.

Check in F12:
TowerBattleIntel?.version
TowerBattleIntelNativeControlGuard?.status()
