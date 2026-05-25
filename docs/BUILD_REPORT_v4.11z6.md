# Tower Battle Intel v4.11z6 — Growth Line Focus

Built from v4.11z5.

## Protected areas

- Dashboard remains locked on v4.11x2.
- `mobile.css` untouched.
- Compare/Growth only.

## Changes

- Combined family graphs now support metric focus.
- Click a legend chip, graph line/dot, or calculation row to focus that metric.
- Click the same metric again or All Lines to reset.
- Focused line becomes brighter/thicker; other lines dim.
- Matching legend chip and calculation row are highlighted.
- Added keyboard support for legend/calc rows with Enter/Space.
- Added `growthLineFocusBridge.js` and wired it into `bootstrap.js`.

## Checks

```powershell
node .\tests\current-v4.11z6-growth-line-focus.test.mjs
node .\tests\ui-render-layer.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
```
