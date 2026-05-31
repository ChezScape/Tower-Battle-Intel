# v4.11z52w24 - Tab Action Router Repair

## Why
Andrew tested w22 and the Click Truth Probe showed `validate-report` was being handled by `tabEvents` instead of the rebuilt workspace event owner.

Root cause: `src/app/tabs.js` stamps `data-dashboard-tab` on `<body>` / `<html>` as runtime state. The tab event handler used a broad `closest("[data-dashboard-tab]")`, so any in-page button could climb to `<body>` and be treated as a tab click before workspace handlers ran.

## Changed
- `src/ui/events/tabEvents.js` now only treats explicit interactive triggers as tab/navigation buttons.
- Runtime body/html `data-dashboard-tab` stamps are ignored by the tab click router.
- Command Deck and History workspace actions can now fall through to `workspaceEvents.js`.
- Click Truth Probe remains active so local Chrome can prove `validate-report` / `save-report` are handled by `workspaceEvents`.

## Protected
- Dashboard visual shell protected.
- Command Deck layout protected.
- Rebuilt History layout protected.
- Raw archive spine protected.
- Mobile untouched.
