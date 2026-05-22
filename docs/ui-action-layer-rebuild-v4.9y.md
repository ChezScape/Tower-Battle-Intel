# Tower Battle Intel v4.9y - UI Action Layer Rebuild

## Built from

`Tower-Battle-Intel-v4.9r[full project currently].zip`, intended to be applied after the v4.9w/v4.9x foundation/diagnostics patches.

## Purpose

Rebuild the visible UI action layer so desktop and mobile buttons have a single route:

```text
button / input / select
→ src/ui/events.js
→ src/actions/actions.js
→ core/history.js, core/state.js, core/update.js
→ render()
```

## What changed

- `src/actions/actions.js` is now the main command bus.
- `src/ui/events.js` is now a delegated UI bridge instead of many duplicated per-render binders.
- `src/core/events.js` only owns static controls such as Save Report, Clear Input, Clear Runs, build style select, hidden debug hold, and mobile command deck.
- Inline `onclick` buttons in rebuilt UI sections were replaced with `data-ui-action`.
- History action buttons still keep compatibility attributes, but route through the action layer.
- Dashboard/Compare footer buttons route to Compare and preserve selected section context.
- System Matrix tiles toggle open/closed through the action bus.
- Import History creates the native file picker directly during the click event.
- History Stats / Edit / Confirm modals are handled by delegated UI events.

## Files changed

- `config/appConfig.js`
- `desktop.css`
- `mobile.css`
- `src/actions/actions.js`
- `src/core/events.js`
- `src/ui/events.js`
- `src/ui/components/topNav.js`
- `src/ui/components/historyCard.js`
- `src/ui/layouts/historyLayout.js`
- `src/ui/sections/sideIntel.js`
- `src/ui/sections/commandDeckView.js`
- `src/ui/sections/statPanels.js`
- `src/ui/sections/compareView.js`
- `tests/ui-action-foundation.test.mjs`

## Test commands

```powershell
node .\tests\ui-action-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
```

## Manual test list

1. Hard refresh.
2. Top navigation tabs.
3. Dashboard quick actions.
4. Dashboard card footer buttons.
5. Compare footer buttons.
6. Systems Matrix tiles: click once to open, same tile again to close.
7. History Import / Export.
8. History Delete Last / Delete All, then cancel.
9. History A / B / Stats / Edit / Arc / Restore / Del.
10. Command Deck Save / Clear Input / Clear Runs / Open History.
11. Gear and quiet-display toggle.
