# Build Report — v4.11z52w12 Storage Import Export Foundation

## Purpose

Create a clean storage/import/export foundation before Command Deck and History are rewired.

## Preserved

- z52w8 bones contract: game data, parser, catalogue, state shape, saved history data format, and Run A/B saved values.
- z52w9 visual shells.
- z52w10 modular UI/core event foundation.
- z52w11 app/render/tabs foundation.
- Dashboard visual shell and parked workspace shells.
- Saved history compatibility.
- Mobile CSS/modules unchanged.

## Changed

- Rebuilt `index.html` into a static entry shell only.
- Added `<link rel="icon" href="data:,">` to stop the browser requesting missing `favicon.ico`.
- Removed old static Command Deck/input/mobile rail controls from `index.html`; rendered workspace shells own visible UI now.
- Split storage ownership into focused modules:
  - `src/storage/storageKeys.js`
  - `src/storage/storageUtils.js`
  - `src/storage/historyStore.js`
  - `src/storage/runSlotStore.js`
  - `src/storage/importStore.js`
  - `src/storage/exportStore.js`
- Kept `src/storage/localStore.js` as the public compatibility wrapper so existing imports keep working.
- Added storage source inspection through the app console helper.
- Protected stored `lastInput` while Command Deck input is parked, so opening the shell does not wipe saved draft text just because the static input no longer exists.

## Parked on purpose

- Command Deck save/validate/clear/import/export UI actions.
- History cards/search/modals/import/export UI actions.
- Dashboard DIFF+/Game Brain/actions.
- Systems search/tabs.
- Compare/Coach/Anomalies/Settings real behaviour.

## Validation

- Storage module foundation test added.
- Node tests updated to current shell foundation expectations.
- JS/MJS syntax checks passed.
- CSS brace checks passed.
- Mobile CSS/modules unchanged from z52w11.
- ZIP integrity passed.
