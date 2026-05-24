# Tower Battle Intel v4.11b Build Report

## Build type

Full build from the working v4.11a9 folder.

## Scope

Desktop-only Dashboard Concept 5 pixel polish and art pass.

Mobile layout/CSS was intentionally left alone.

## Key changes

- Updated runtime version to `v4.11b`.
- Rebalanced the desktop Dashboard grid to give the main dashboard more room and reduce right-rail dominance.
- Improved the Run A / VS / Run B composition with taller premium run panels and a larger neon VS centrepiece.
- Added original game-inspired metric art for:
  - Wave
  - Killed By
  - Coins
  - Cells
- Added stronger Concept 5 decorative treatment for:
  - Key Takeaways target art
  - Recommendations growth art
  - Anomalies warning sigil
  - Quick Actions icon styling
  - panel corner trims and neon depth
- Kept the desktop run duel horizontal for smaller desktop Chrome windows down to the compact desktop range.
- Avoided helper patch scripts and overlay dashboard JavaScript.

## Files changed

- `desktop.css`
- `README.md`
- `config/appConfig.js`
- `app.js`
- `bootstrap.js`
- `src/ui/*.js` version labels
- `src/ui/sections/runHeader.js`
- `src/ui/sections/differenceOverview.js`
- `src/ui/sections/statPanels.js`
- `src/ui/sections/sideIntel.js`
- `tests/current-v4.11b-*.mjs`

## Desktop test target

Designed against Andrew's real desktop setup:

- physical display: 3840 × 2400
- Windows scale: 200%
- effective browser workspace: around 1920 × 1200 style
- also checked for compact desktop / 720p-style browser behaviour

## Test commands run

```powershell
node .\tests\browser-interaction-bridge-foundation.test.mjs
node .\tests\current-v4.11b-checkpoint.test.mjs
node .\tests\current-v4.11b-command-layout.test.mjs
node .\tests\current-v4.11b-save-feedback.test.mjs
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

## Notes

This is still a desktop visual/polish pass, not the mobile repair pass. Mobile should be handled separately after the desktop dashboard is accepted.
