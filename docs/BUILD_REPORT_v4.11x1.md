# Tower Battle Intel v4.11x1 — Dashboard Grid Lock Repair

Desktop-only repair built from v4.11x.

## Protected rules

- v4.11u approved dashboard visuals remain the protected baseline.
- No dashboard redesign or restyle.
- Compare/Trend v4.11x improvements retained.
- `mobile.css` untouched.

## Fix

- Moved the dashboard DIFF+ control into its own compact action row at medium/small desktop widths.
- Removed the compact header-only right padding that made Run A / Run B labels look off in the small-long dashboard grid.
- Kept Run A / Run B / row values aligned in overview metric cards.
- Kept full DIFF+ modal behaviour.

## Checks

```powershell
node .\tests\current-v4.11x1-dashboard-grid-lock-repair.test.mjs
node .\tests\current-v4.11x-compare-readability-trend-lift.test.mjs
node .\tests\current-v4.11u-column-lead-highlight.test.mjs
node .\tests\ui-render-layer.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
```
