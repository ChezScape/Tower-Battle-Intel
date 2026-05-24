# Tower Battle Intel v4.11g — Desktop Small Window Reflow

## Scope
Desktop dashboard polish only. Mobile CSS was intentionally left untouched.

## Base
Built from the working v4.11f desktop small-window fit candidate.

## Focus
v4.11f looked good in maximised and medium desktop windows, but the small desktop layout still squeezed the Run A / VS / Run B comparison strip too aggressively. v4.11g keeps the normal desktop layout mostly intact and adds a deliberate compact desktop reflow for narrow desktop browser windows.

## Changes
- Updated app version to `v4.11g`.
- Preserved v4.11f maximised and medium desktop behaviour.
- Added a narrow desktop reflow for 860px–1040px wide browser windows.
- Reworked the small desktop top comparison strip so Run A, VS, and Run B stack as readable desktop cards instead of shrinking into a tiny horizontal strip.
- Kept the cyan Run A trim, gold Run B trim, and neon VS treatment.
- Restored readable metric labels/value hierarchy in narrow desktop mode.
- Kept the 2-column main card layout for narrow/tall desktop windows.
- Kept side intel and Quick Actions as lower full-width desktop sections at narrow widths rather than squeezing them into a narrow rail.
- Added an extra 860px–940px fallback where run metrics use two rows for readability.

## Files changed
- `desktop.css`
- `app.js`
- `bootstrap.js`
- `config/appConfig.js`
- versioned tests/docs

## Mobile isolation
`mobile.css` was not edited.

## Testing
Run the existing test suite plus the current v4.11g checks from the project root:

```powershell
node .\tests\browser-interaction-bridge-foundation.test.mjs
node .\tests\current-v4.11g-checkpoint.test.mjs
node .\tests\current-v4.11g-height-fit.test.mjs
node .\tests\current-v4.11g-save-feedback.test.mjs
node .\tests\current-v4.11g-small-window-fit.test.mjs
node .\tests\current-v4.11g-top-strip-fit.test.mjs
node .\tests\diagnostics-foundation.test.mjs
node .\tests\dropdown-collapsible-fix.test.mjs
node .\tests\history-search-focus-fix.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\ui-render-layer.test.mjs
```
