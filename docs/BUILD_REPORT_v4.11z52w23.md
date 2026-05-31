# Build Report - v4.11z52w24 Tab Action Router Repair

## Summary
Built from `v4.11z52w24_BrowserClickTruthProbe`. This repair fixes the real browser evidence Andrew captured: the Validate button was seen by the probe but handled by `tabEvents`, not `workspaceEvents`.

## Root Cause
`stampAppTabRuntime()` writes `data-dashboard-tab` to `<html>` and `<body>` as passive runtime state. The old tab click handler used `closest("[data-dashboard-tab]")`, so workspace button clicks climbed to `<body>` and were consumed as tab events.

## Fix
`tabEvents.js` now matches only explicit interactive tab/route triggers:

```text
button[data-dashboard-tab]
a[data-dashboard-tab]
[role='button'][data-dashboard-tab]
[role='tab'][data-dashboard-tab]
```

This preserves top nav and intentional route buttons, while allowing Command Deck / History `data-ui-action` controls to reach the rebuilt workspace handler.

## Expected Probe Result
Clicking Command Deck Validate should now show:

```text
Handled: workspaceEvents / validate-report
```

not:

```text
Handled: tabEvents / validate-report
```

## Validation
- Node tests passed.
- JS/MJS syntax checks passed.
- CSS brace checks passed.
- Mobile CSS/modules unchanged from w22.
- ZIP integrity passed.
