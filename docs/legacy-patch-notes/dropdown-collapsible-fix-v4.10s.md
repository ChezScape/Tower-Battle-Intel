# Tower Battle Intel v4.10s Dropdown + Collapsible Fix

## Fixes

- Native dropdown/select controls no longer have their pointer/click events captured by the action audit bridge.
- Dropdowns should open normally with a click, not only while holding the mouse button.
- Collapsible `<details>/<summary>` panels now use native browser toggling first, with a one-tick fallback if an older listener blocks the native toggle.
- The edit modal keeps textareas and selects fully native.

## Test

Run:

```powershell
node .\tests\dropdown-collapsible-fix.test.mjs
```

Then test locally:

1. History → Sort dropdown
2. History → Build dropdown
3. History → Tag dropdown
4. Any collapsible History panels
5. Any Systems detail collapsible
