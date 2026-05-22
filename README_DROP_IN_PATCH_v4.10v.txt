Tower Battle Intel v4.10v - Universal Download Fix

Copy/merge this patch into the project root, then run:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Unblock-File .\apply-v4.10v.ps1
.\apply-v4.10v.ps1
node .\tests\universal-download-fix.test.mjs

Then restart localhost and hard refresh.

Fixes:
- History Export download
- Stats Download JSON
- Debug Health JSON download
- Debug Full Debug JSON download
