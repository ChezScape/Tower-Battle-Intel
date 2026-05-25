# Tower Battle Intel v4.11x2 — Dashboard Footer DIFF Placement

Desktop-only dashboard grid repair built from v4.11x1.

## Protected rules

- Keep v4.11x Compare/Trend improvements.
- Keep the protected v4.11u dashboard visual direction.
- Do not redesign dashboard cards.
- `mobile.css` untouched.

## Fix

- Removed the DIFF+ control from the dashboard table/header area.
- Added a footer action row inside dashboard metric cards.
- The existing full-breakdown button stays wide on the left.
- DIFF+ sits as a compact pill on the bottom-right of the same row.
- Run A / Run B / Diff table headers stay clean and aligned.
- The DIFF+ popup can use full section rows from `data-metric-full-rows`.

## Tests

```powershell
node .\tests\current-v4.11x2-dashboard-footer-diff-placement.test.mjs
node .\tests\ui-render-layer.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
```
