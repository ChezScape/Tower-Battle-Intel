# Tower Battle Intel v4.11z1 — Growth Controls Fix

Built from v4.11z. Dashboard remains locked on v4.11x2 and `mobile.css` is untouched.

## Fix

- Replaced CSS-only growth range radio/label controls with real button controls.
- Added a Compare Growth Controls bridge so the range buttons work on localhost/static hosting.
- 30 Days / 90 Days / 6 Months / 1 Year / All now switch visible growth panels.
- Group By Report / Monthly Rollup / Best-Average Summaries now work as section-jump controls inside the active range.
- Added active states, aria-pressed updates, and a small focus flash after using controls.
- Kept Growth Matrix, Monthly Rollup, datasheet, DIFF+, and Compare visuals.

## Protected

- Dashboard stays locked on v4.11x2.
- `mobile.css` untouched.
- Compare-only CSS scope retained.

## Test checklist

```powershell
node .\tests\current-v4.11z1-growth-controls-fix.test.mjs
node .\tests\ui-render-layer.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
```
