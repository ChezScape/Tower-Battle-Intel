Tower Battle Intel v4.10y - History Search Focus Fix

Copy/merge the contents of this folder into your project root:
C:\Users\glitc\Documents\Tower-Battle-Intel

Then run:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Unblock-File .\apply-v4.10y.ps1
.\apply-v4.10y.ps1
node .\tests\history-search-focus-fix.test.mjs

Restart localhost and hard refresh Chrome.

Check in F12:
TowerBattleIntel?.version
TowerBattleIntelHistorySearchFocusGuard?.status()

Then test History -> Search by typing normally.
