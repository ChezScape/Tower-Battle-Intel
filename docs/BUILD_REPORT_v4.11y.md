# Tower Battle Intel v4.11y — Compare Datasheet + Growth Trends

Built from protected `v4.11x2`.

## Protected areas

- Dashboard remains locked on v4.11x2.
- Dashboard visuals/layout/metric grid/DIFF+ footer placement were not redesigned.
- `mobile.css` untouched.

## Compare changes

- Compare now treats the main breakdown as a full datasheet instead of compact top movers only.
- Removed the non-functional `View Damage Dealt`, `View Utility`, etc. footer buttons from Compare cards.
- Kept DIFF+ as the working full no-squash popup for each category.
- Added datasheet row count in the Compare header area.
- Added jump controls for Full Datasheet and Growth Charts.
- Added responsive Compare-only compacting for smaller desktop sizes.

## Trend/Growth changes

- Kept key history charts: Wave, Coins, Cells, Coins / Hour.
- Added Growth Matrix charts for:
  - Cells / Hour
  - Damage Output
  - Economy Total
  - Defense / Survival
  - Utility Total
  - Enemies Hit By
  - Counts
  - Effects Active
- Kept single-report signal cards marked as derived from final totals.

## Tests run

```powershell
node .\tests\current-v4.11y-compare-datasheet-growth-trends.test.mjs
node .\tests\ui-render-layer.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
```
