# Active Rebuild Status — v4.11z52w20

This is a status checklist for cleanup planning. It is not a duplicate RULE book.

## Active / rebuilt

- App startup/render/tab path through `src/app/`.
- Modular UI event shell through `src/ui/events/index.js`.
- Command Deck report intake view and event owner.
- Command Deck raw archive intake action path.
- Raw report archive storage spine.
- Parsed History cache actions.
- Rebuilt desktop History view under `src/ui/sections/history/`.
- History event owner for cards, filters, modals, Run A/B, archive/restore/delete, and import/export clicks.
- Shared History JSON browser import/export owner.
- Import/export action payload owner carrying `history` and `rawArchive`.

## Protected / active visual shell

- Dashboard visual shell under `src/ui/views/dashboardVisualShell.js`.
- Header/nav frame.
- Command Deck layout.
- Rebuilt History visual layout.

## Parked intentionally

- Compare.
- Coach.
- Systems.
- Anomalies.
- Settings.
- Mobile workspaces.

## Compatibility wrappers still present

- Root `app.js` and `bootstrap.js` entry wrappers.
- `src/ui/render.js`, `src/ui/events.js`, `src/core/events.js`, and `src/actions/actions.js` compatibility loaders.
- `src/ui/sections/historyView.js` as a thin History view wrapper.

## Cleanup candidates later

- Old History CSS modules that are still imported beside `04-history-rebuild.css`.
- Old dashboard section builders that are parked by `dashboardVisualShell.js`.
- Old Systems bridge while Systems is parked.
- Old tests that only protect legacy structure instead of current behaviour.
- Old loose build reports/changelogs if they become distracting.

## Do not delete yet

- `workspaceResetView.js`, because parked workspaces still depend on it.
- History modal layout files until the rebuilt modal path is fully consolidated.
- Raw archive/history/action modules that are now part of the active spine.
