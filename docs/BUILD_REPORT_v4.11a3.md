# Tower Battle Intel v4.11a6 Build Report

## Build type

Full project build, desktop-only Command Deck placement correction.

## Baseline

Started from `v4.11a2 Desktop Polish`.

## Main change

The native **Battle Report Input** console no longer appears above the main header/nav on desktop. It now appears underneath the Command Deck view while staying hidden on other desktop tabs.

## What changed

- Updated app version to `v4.11a6`.
- Updated Command Deck helper text so it points to the input console below the deck.
- Added desktop-only CSS ordering for `#app`, `.layout`, `.input-section`, `#debugPanel`, and `#debug`.
- Kept mobile untouched for the future `v4.11b` pass.
- Kept the recovered import/export/download/dropdown/search stack intact.

## Browser check

```js
TowerBattleIntel?.version
TowerBattleIntelPlatformIsolationGuard?.status()
TowerBattleIntelDesktopPolishGuard?.status()
```

Expected version: `v4.11a6`.

## Test focus

1. Open Command Deck.
2. Confirm the header/nav remains at the top.
3. Confirm Command Deck content appears first.
4. Confirm Battle Report Input console appears underneath the Command Deck content.
5. Confirm Save Report, Clear Input, Clear Runs, build select, import/export/download still work.
