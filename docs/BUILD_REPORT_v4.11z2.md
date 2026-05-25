# Tower Battle Intel v4.11z2 — Growth Workspace Rebuild

Built from v4.11z1. Dashboard remains locked on the v4.11x2 protected dashboard baseline and `mobile.css` is untouched.

## Why this build exists

The previous Growth Range buttons and mode buttons were not reliably changing the view on localhost. This build removes the fragile hidden-panel control system from the Growth section and rebuilds the whole Compare/Growth area as a visible datasheet-style growth workspace.

## Changes

- Removed the non-working Growth Range / Group By mode buttons from the Growth workspace UI.
- Replaced them with simple anchor jump chips:
  - Range Overview
  - Report Trends
  - Monthly Rollup
  - Stat Families
  - Best / Average
- Added a visible Range Overview board for 30 Days, 90 Days, 6 Months, 1 Year, and All Time.
- Added all-saved Report Trend graphs for Wave, Coins, Cells, and Coins/hour.
- Added Monthly Rollup and Month-to-Month charts.
- Added Stat Families growth matrix for key tracked stat families.
- Added Best / Average summary cards.
- Kept single-report signal breakdown.
- Kept Compare datasheet and DIFF+ behaviour from previous builds.

## Tests

```powershell
node .\tests\current-v4.11z2-growth-workspace-rebuild.test.mjs
node .\tests\ui-render-layer.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
```
