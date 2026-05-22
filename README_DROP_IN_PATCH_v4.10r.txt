Tower Battle Intel v4.10r Drop-In Patch
Active Control Fix

Copy/extract this zip into the project root, then run:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Unblock-File .\apply-v4.10r.ps1
.\apply-v4.10r.ps1
node .\tests\active-control-fix.test.mjs

Then restart localhost and hard refresh.

Check in browser:
TowerBattleIntel?.version
TowerBattleIntelNativeControls?.status()

Expected:
v4.10r
actionAuditBridgeVersion: "v4.10r"
