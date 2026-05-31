# Tower Battle Intel v4.11z52w7 — Dashboard Visual Shell Density Refactor

Built from `v4.11z52w6_LocalStoreExportRepair`.

## Purpose
Reduce Dashboard code density and stop Dashboard internals fighting the wider UI rebuild.

This phase keeps the approved Dashboard look direction, but parks the Dashboard as a compact visual shell while the engine/ownership layers are rebuilt in later phases.

## Dashboard refactor
- Added `src/ui/views/dashboardVisualShell.js` as one compact Dashboard visual owner.
- `src/ui/views/desktopView.js` now builds the desktop Dashboard from this single visual shell instead of importing many Dashboard section builders.
- Removed active desktop Dashboard calls to:
  - `buildRunHeader()`
  - `buildDashboardGameBrainStrip()`
  - `buildDifferenceOverview()`
  - `buildPrimaryStatGrid()`
  - `buildSecondaryStatGrid()`
  - `buildGapPanel()`
  - `buildSideIntel()`
- Old section files are left in place for reference/future reconnect work, but are no longer on the active desktop Dashboard path.

## Wiring intentionally parked
Dashboard visual buttons remain visible but no longer carry live Dashboard action ownership.

Parked in this phase:
- Dashboard quick action wiring.
- Dashboard DIFF+ wiring.
- Dashboard compare-section jump wiring.
- Dashboard Game Brain runtime calls.
- Dashboard recommendation/action callouts.

Top navigation and non-Dashboard tabs remain connected.

## Protected
- Dashboard visual direction preserved through the same CSS class structure.
- Header/top-nav preserved.
- Command Deck behaviour preserved from z52w6.
- History import/export/localStore repair preserved from z52w6.
- Mobile CSS/modules untouched.
- Game/parser/catalogue files untouched.

## Why this phase exists
The previous bug pattern showed that “protected” visual areas still had behaviour wiring underneath them. This build protects the Dashboard look, but removes the active Dashboard wiring density so the next rebuild phases can reconnect one clean owner at a time.

## Validation
- JS/MJS syntax checks passed.
- 41 Node tests passed.
- CSS brace check passed across 35 CSS files.
- Mobile CSS/modules verified unchanged from z52w6.
- ZIP integrity verified after packaging.
