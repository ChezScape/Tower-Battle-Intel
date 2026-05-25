# Tower Battle Intel v4.11x — Compare Readability + Trend Lift

Desktop-only Compare refinement built from v4.11w while keeping the protected v4.11u dashboard visuals untouched.

## Protected areas

- Dashboard visuals remain protected.
- `mobile.css` untouched.

## Changes

- Strengthened the Compare Overall Lean verdict card.
- Added verdict facts: category leads, biggest gain, and tradeoff.
- Added a Jump to Trend Monitor chip near the Compare hero.
- Reduced default deep-diff tables to compact top movers.
- Preserved full DIFF+ details by storing full comparison rows for the modal.
- Reworded column-highlight helper text to Run A/Run B language instead of colour-code language.
- Softened compare-only winning-column highlights.
- Kept Trend Monitor direction from v4.11w.

## Test checklist

```powershell
node .\tests\current-v4.11x-compare-readability-trend-lift.test.mjs
node .\tests\ui-render-layer.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
```
