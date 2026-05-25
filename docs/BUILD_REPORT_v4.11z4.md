# Tower Battle Intel v4.11z4 — Combined Growth Graphs

Built from v4.11z3 Growth Intelligence Workspace.

## Protected areas

- Dashboard remains locked on v4.11x2.
- `mobile.css` untouched.
- Work is scoped to Compare/Growth only.

## Changes

- Rebuilt Stat Families from many small graph cards into combined family overlay charts.
- Added combined normalised line charts for:
  - Farming
  - Combat
  - Survival
  - Utility
- Added per-family legends showing each metric and its first-to-latest movement.
- Added calculation rows under each family graph:
  - latest value
  - best or average value depending on metric type
  - change from first report to latest report
- Kept Growth Verdict, Top Gains/Top Drops, Focus Next, Monthly Intelligence, Best/Average, and Single Report Signals.
- Kept anchor-only navigation. No fragile hidden button switching.

## Tests run

```powershell
node .\tests\current-v4.11z4-combined-growth-graphs.test.mjs
node .\tests\ui-render-layer.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
```
