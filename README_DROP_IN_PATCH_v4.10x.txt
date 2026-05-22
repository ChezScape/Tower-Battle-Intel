Tower Battle Intel v4.10x - Save As Download Fix

Copy/merge the contents into your project root.

Run:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Unblock-File .\apply-v4.10x.ps1
.\apply-v4.10x.ps1
node .\tests\save-as-download-fix.test.mjs

Then restart localhost and hard refresh.

Test:
TowerBattleIntel?.version
TowerBattleIntelUniversalDownloadBridge?.status()

Expected:
v4.10x
universalDownloadBridgeVersion: "v4.10x"
savePickerSupported: true

Click Export/Download. Chrome should open a Save As dialog. If not, use the visible fallback shelf.
