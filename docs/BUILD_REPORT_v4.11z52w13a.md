# Build Report — v4.11z52w13a Architecture Rulebook Catalogue Foundation

## Purpose

Create the living architecture ownership rulebook inside the project before real Command Deck/History rewiring begins. This phase does not reconnect real workspace behaviour. It catalogues the rebuilt foundation files so future work has a written ownership law instead of relying on memory.

## Preserved

- z52w8 bones contract: game data, parser, catalogue, state shape, saved history data format, and Run A/B saved values.
- z52w9 visual shells.
- z52w10 modular UI/core event foundation.
- z52w11 app/render/tabs foundation.
- z52w12 storage/import/export foundation.
- z52w13 actions module foundation.
- Dashboard visual shell and parked workspace shells.
- Saved history compatibility.
- Mobile CSS/modules unchanged.

## Changed

- Added `docs/ARCHITECTURE_OWNERSHIP_RULES.md` as the project living rulebook.
- Catalogued the rebuilt/ownership-changing files from the foundation rebuild chain:
  - root entry/config files
  - `src/app/`
  - `src/ui/events/`
  - `src/core/events/`
  - `src/storage/`
  - `src/actions/`
  - Dashboard visual shell files
  - workspace shell files
  - compatibility wrapper files
- Each catalogue entry defines:
  - purpose
  - what the file is not allowed to do
  - what can call it
  - what it may call
  - red-line ownership rules
- Added the phase rule that every future rebuild must update the rulebook before packaging.
- Updated visible/display build badge to `v4.11z52w13a`.

## Parked on purpose

- Command Deck UI save/validate/clear/import/export wiring.
- History UI cards/search/modals/import/export wiring.
- Dashboard DIFF+/Game Brain/actions.
- Systems search/tabs.
- Compare/Coach/Anomalies/Settings real behaviour.

## Validation

- Added `tests/v4.11z52w13a-architecture-rulebook.test.mjs`.
- The new test verifies that the rulebook exists and catalogues the rebuilt foundation files.
- Full Node test suite passed.
- JS/MJS syntax checks passed.
- App/UI/Core/Storage/Actions module imports passed.
- CSS brace check passed across 35 CSS files.
- Mobile CSS/modules unchanged from z52w13.
- SHA256 manifest regenerated.
- ZIP integrity passed.
