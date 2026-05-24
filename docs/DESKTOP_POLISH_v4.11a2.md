# Tower Battle Intel v4.11a6 Desktop Polish

## Purpose

Desktop-only presentation polish after the v4.11a6 desktop lock and v4.11a6 stability check.

The goal is to keep the same mockup look but make three desktop areas more usable:

- History Stats modal
- Systems / Subsystem Matrix
- Command Deck

Mobile is intentionally not repaired in this build. That remains v4.11b.

## Changes

### History Stats modal

- Tighter modal spacing.
- More compact section rows.
- Section-search matches now get a glowing section border.
- Matching rows get a gold-highlighted border.
- Match pill shows when a section or row matches.

### Systems

- Subsystem Matrix tiles are shorter and tighter.
- Records/detail rows are denser.
- Detail panel has reduced padding and row height.

### Command Deck

- Reworked desktop Command Deck into a clearer workflow panel.
- Added three desktop workflow steps.
- Kept the real Battle Report Input console above the nav.
- Kept Current Data in a right-side summary panel.
- Removed the feeling of two unrelated command systems.

## Browser checks

```js
TowerBattleIntel?.version
TowerBattleIntelPlatformIsolationGuard?.status()
TowerBattleIntelDesktopPolishGuard?.status()
TowerBattleIntelNativeControls?.status()
```

Expected version: `v4.11a6`.

## Protected baseline rule

Treat this as desktop polish only. Do not start mobile fixes inside this version.
