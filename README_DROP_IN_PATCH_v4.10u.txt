Tower Battle Intel v4.10u - Final Control Polish

Copy/merge this patch into your project root, then run:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Unblock-File .\apply-v4.10u.ps1
.\apply-v4.10u.ps1
node .\tests\final-control-polish.test.mjs

Then restart localhost and hard refresh.

Fixes:
- quiet display toggle
- Stats Download JSON
- Edit modal build buttons
- Debug Health JSON download
- Debug Full Debug JSON download
