Tower Battle Intel v4.10w - Manual Download Fallback

Copy/merge the contents into your project root.

Run:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Unblock-File .\apply-v4.10w.ps1
.\apply-v4.10w.ps1
node .\tests\manual-download-fallback.test.mjs

Then restart localhost and hard refresh.

Test:
TowerBattleIntel?.version
TowerBattleIntelUniversalDownloadBridge?.status()

Expected:
v4.10w
universalDownloadBridgeVersion: "v4.10w"

When you click a download button, if it does not auto-download, click the visible "Click here if it did not start" link.
