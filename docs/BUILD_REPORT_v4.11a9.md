# Tower Battle Intel v4.11a9 Build Report

## Focus

Dashboard-only desktop rebuild toward Concept 5 while keeping the working v4.11a6/v4.11a7 desktop state safe.

## What changed

- Reworked the desktop Dashboard composition inside the existing renderer instead of using helper overlay JS.
- Kept the Concept 5 desktop layout active down to 1280px-wide desktop browser windows.
- Added compact desktop height rules for 720p-style Chrome viewports.
- Restyled Run A / VS / Run B into a tighter duel strip.
- Added Concept 5-style metric delta bars inside the main dashboard cards.
- Restyled Quick Actions into the mockup-style small action tiles with wider Health Scan and Clear Runs buttons.
- Kept mobile isolated. No mobile CSS rebuild was performed in this pass.

## Files changed

- `config/appConfig.js`
- `README.md`
- `desktop.css`
- `mobile.css` version comments only
- `app.js` version comment only
- `bootstrap.js` version comment only
- `src/ui/sections/runHeader.js`
- `src/ui/sections/statPanels.js`
- `src/ui/sections/sideIntel.js`
- version comments across current UI guard files
- current tests updated to expect `v4.11a9`

## Removed from this full build

- Broken patch helper scripts
- Broken helper CSS/JS files
- temporary desktop/index backup files
- `.git` folder from the distributable zip

## Test commands run

```powershell
node .\tests\browser-interaction-bridge-foundation.test.mjs
node .\tests\current-v4.11a9-checkpoint.test.mjs
node .\tests\current-v4.11a9-command-layout.test.mjs
node .\tests\current-v4.11a9-save-feedback.test.mjs
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

All passed.

## Notes

This build intentionally avoids adding a new dashboard helper JS file. The previous helper approach caused duplicated shell/input/nav presentation. This build changes the real dashboard components and desktop CSS directly.
