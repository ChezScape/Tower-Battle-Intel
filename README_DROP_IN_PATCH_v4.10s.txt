Tower Battle Intel v4.10s - Dropdown + Collapsible Fix

Copy/merge this patch into the project root.

Fixes:
- History Sort / Build / Tag dropdowns opening only while holding click.
- Collapsible panels not opening/closing.
- Modal/native select and textarea interaction being stolen by capture handlers.

Install:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Unblock-File .\apply-v4.10s.ps1
.\apply-v4.10s.ps1
node .\tests\dropdown-collapsible-fix.test.mjs
