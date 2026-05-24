# Tower Battle Intel v4.11a6 Build Report

## Build type

Full project build, desktop-only Command Deck layout cleanup.

## Baseline

Built from `v4.11a4 Command Deck Dedup`.

## Main goal

Keep the mockup look, but make Command Deck placement logical at both normal and maximised desktop window sizes.

## Changes made

- Updated app version to `v4.11a6`.
- Added a Command Deck desktop layout lock class: `desktop-command-layout-a5`.
- Aligned Command Deck, Current Data, and Battle Report Input to one shared desktop width.
- Kept top row as Command Deck left + Current Data right.
- Kept Battle Report Input underneath as a full-width second row.
- Reduced oversized spacing in the Command Deck cards.
- Shortened Command Deck helper text so it does not stretch strangely on maximised windows.
- Preserved the v4.11a4 dedup rule: no duplicate Save/Clear buttons in the top Command Deck.
- Mobile remains untouched for the later v4.11b pass.

## Tests run

```powershell
node .\tests\current-v4.11a6-checkpoint.test.mjs
node .\tests\current-v4.11a6-command-layout.test.mjs
node .\tests\diagnostics-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\ui-render-layer.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
node .\tests\browser-interaction-bridge-foundation.test.mjs
node .\tests\dropdown-collapsible-fix.test.mjs
node .\tests\history-search-focus-fix.test.mjs
node .\tests\native-import-placement.test.mjs
```

All passed in the build environment.

## Browser checks

```js
TowerBattleIntel?.version
TowerBattleIntelPlatformIsolationGuard?.status()
TowerBattleIntelDesktopPolishGuard?.status()
```

Expected version: `v4.11a6`.
