# Tower Battle Intel v4.8w1

Full rebuild from the working dev-5 / v4.8u Game Brain Integration base.

## What changed

- Rebuilt `desktop.css` and `mobile.css` from clean consolidated styles instead of stacked patch overrides.
- Removed unused old scaffold files that were not imported by the live app.
- Kept the game knowledge brain in `src/game/` and the v4.8u intelligence improvements.
- Removed the old unused `#debug` placeholder from `index.html`; the active debug panel remains `#debugPanel` through `inspectionPanel.js`.
- Subsystem Matrix no longer scroll-jumps when a tile is clicked.
- Subsystem Matrix, selected detail, Insights, AI Coach, and Anomalies are collapsible.
- Battle Report textarea is compact on desktop and mobile to reclaim screen space.
- History filter code was rebuilt into one delegated system instead of legacy + new handlers fighting each other.
- History search preserves scroll position and caret while filtering.
- Desktop and mobile still load one stylesheet only.

## Current debug

Hold the banner for diagnostics. The visible version pill should read `TBI: v4.8w1`.

## Removed unused files

- `src/actions/actions.js`
- `src/diagnostics/traceEngine.js`
- `src/history/historySelectors.js`
- `src/ui/dev/debugPanel.js`
- `src/ui/numbers.js`
- `src/utils/safe.js`
- `src/utils/util.js`

These were not reachable from the live `app.js` runtime chain in the working base.
