# v4.9z Complete UI Sections Wiring Patch

## Why this patch exists

v4.9y rebuilt the action layer, but the drop-in patch did not include every section renderer file. That could leave a project with new actions/events but older section renderers still producing buttons with missing or stale attributes.

## This patch includes the complete visible UI/action layer

- `src/actions/actions.js`
- `src/core/events.js`
- `src/ui/events.js`
- `src/ui/dashboard.js`
- `src/ui/components/*.js`
- `src/ui/layouts/*.js`
- `src/ui/sections/*.js`
- `src/ui/views/*.js`
- `desktop.css`
- `mobile.css`

## Section files now included

- `src/ui/sections/anomaliesView.js`
- `src/ui/sections/coachView.js`
- `src/ui/sections/commandDeckView.js`
- `src/ui/sections/compareView.js`
- `src/ui/sections/differenceOverview.js`
- `src/ui/sections/gapRadar.js`
- `src/ui/sections/historyView.js`
- `src/ui/sections/runHeader.js`
- `src/ui/sections/sectionUtils.js`
- `src/ui/sections/sideIntel.js`
- `src/ui/sections/statPanels.js`
- `src/ui/sections/systemsMatrix.js`

## Expected action route

Visible button / input / select -> `src/ui/events.js` -> `src/actions/actions.js` -> core/history/state/update -> render.

## Test

Run:

```powershell
node .\tests\ui-action-foundation.test.mjs
```

Then hard refresh the browser and test visible buttons in Dashboard, Compare, Systems, History, Command Deck and Settings.
