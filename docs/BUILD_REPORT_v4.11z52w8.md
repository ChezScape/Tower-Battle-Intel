# Tower Battle Intel v4.11z52w8 — Bones Contract Audit

Built from `v4.11z52w7_DashboardVisualShellDensityRefactor`.

Dashboard Visual Shell from z52w7 remains protected; this build hardens the bones underneath it.

## Purpose

This is a contract-layer hardening build before more UI shell work. It checks and protects the pieces that need to slot back into the future rewired UI:

- `game/` catalogues and v28.2.0 static audit files.
- parser / compute pipeline output shape.
- catalogue safe-use boundaries.
- `localStore` base helpers.
- runtime state shape.
- saved History data format.
- Run A / Run B saved-value distinctness.
- Normal/Deep History search mode persistence.

## Fixes

- Fixed `src/core/state.js` so `normaliseHistoryFilters()` preserves `mode` / `searchMode` instead of dropping Deep/Normal search mode during runtime state updates or hydration.
- Strengthened `src/storage/localStore.js` `readSavedHistoryCandidates()` so primary storage history candidates are de-duplicated and legacy/backup candidates are normalised through one helper.

## Protected

- Dashboard visual shell from z52w7 remains the active Dashboard owner.
- Dashboard look/class structure remains protected.
- Header/top-nav preserved.
- Command Deck visuals/behaviour preserved.
- History visuals/behaviour preserved, except the state-mode preservation fix.
- Game/parser/catalogue content preserved.
- Mobile CSS/modules untouched.

## Tests added

- `tests/v4.11z52w8-bones-contract.test.mjs`

Covers:

- parser/compute exact report output shape
- runtime state Deep/Normal mode persistence
- localStore Deep/Normal mode persistence
- localStore history candidate fallback/de-duplication
- Run A/B duplicate-slot cleanup
- saved History metadata shape
- Normal vs Deep History search behaviour
- game catalogue JSON validity
- v28.2.0 audit counts and safe-use boundaries

## Validation

- Full Node test suite passed.
- JS/MJS syntax checks passed.
- CSS brace checks passed.
- Mobile CSS/modules unchanged from z52w7.
- ZIP integrity passed.
