# Build Report — v4.11z52w11 App Render Tabs Foundation

## Purpose

Create a clean app/startup/render/tab foundation before real workspace actions are rewired.

## Preserved

- z52w8 bones contract: game data, parser, catalogue, state shape, localStore helpers, saved history data format, and Run A/B saved values.
- z52w9 visual shell reset.
- z52w10 modular UI/core event foundation.
- Dashboard visual shell and parked workspace shells.
- Mobile CSS/modules unchanged.

## Changed

- Added `src/app/init.js` as the single startup owner.
- Added `src/app/render.js` as the single render/mount order owner.
- Added `src/app/tabs.js` as the single active tab state owner.
- Added `src/app/version.js` as the runtime version metadata owner.
- Changed root `app.js` into a small browser entry point only.
- Changed root `bootstrap.js` into a compatibility loader that delegates to `src/app/init.js`.
- Changed `src/ui/render.js` into a compatibility loader that delegates to `src/app/render.js`.
- Changed `src/ui/dashboard.js` so it composes shell visuals only and uses `src/app/tabs.js` for active tab stamping.
- Changed `src/ui/events/tabEvents.js` so tab clicks route through `src/app/tabs.js`.

## Parked on purpose

- Command Deck save/validate/clear/import/export.
- History cards/search/modals/import/export.
- Dashboard DIFF+/Game Brain/actions.
- Systems search/tabs.
- Compare/Coach/Anomalies/Settings real behaviour.

## Validation

- Node test suite updated to current shell foundation expectations.
- App/render/tabs foundation test added.
- JS/MJS syntax checks passed.
- CSS brace checks passed.
- Mobile CSS/modules unchanged from z52w10.
- ZIP integrity passed.
