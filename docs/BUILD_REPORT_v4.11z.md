# Tower Battle Intel v4.11z — Compare Long-Term Growth Charts

Desktop-only Compare growth-chart pass built from protected v4.11y/v4.11x2 line.

## Protected rules

- Dashboard remains locked on v4.11x2 visual baseline.
- No dashboard layout, dashboard card, dashboard table, or dashboard DIFF+ footer placement changes.
- `mobile.css` untouched.

## Changes

- Added long-term growth range controls inside Compare Trend Monitor:
  - 30 Days
  - 90 Days
  - 6 Months
  - 1 Year
  - All
- Added CSS-only range switching, so the controls work on localhost without extra JS.
- Added range summary cards:
  - report count
  - month groups
  - best wave
  - average coins/hour
  - average cells/hour
  - best coins
- Added Monthly Rollup cards for month-by-month history.
- Added Month-to-Month Charts using monthly grouped points.
- Kept report-level growth charts and key stat-family Growth Matrix.
- Kept single-report signal breakdown and Trend Findings rail.

## Notes

Reports are still end-of-run snapshots, not wave-by-wave timelines. Monthly charts aggregate saved reports by their battle dates.

## Tests run

```powershell
node .\tests\current-v4.11z-compare-long-term-growth-charts.test.mjs
node .\tests\ui-render-layer.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
```
