# Tower Battle Intel v4.11z52w27 — History Stats Modal Control Repair

Built from `Tower-Battle-Intel_v4.11z52w25_HistoryStatsModalMountRepair_FullBuild.zip`.

## Purpose

Repair the rebuilt History Stats modal controls after local browser testing showed the modal opened correctly but its Close, Summary, Sections, and Download JSON controls did not visibly act. Set Run A / Set Run B worked because those controls used the modal slot route and triggered a full render.

## Changes

- Added modal-first control routing in `src/ui/events/workspaceEvents.js`.
- History Stats modal controls are now handled before broad History card/list controls.
- Close clears the exact stats modal mount and has a defensive fallback to remove any stray `.tbi-history2-stats-modal` instance.
- Summary / Sections / Raw Source tab switching targets the active modal directly and normalises tab names.
- Copy JSON / Download JSON use the active modal root as their data source.
- Added `data-ui-action` markers to rebuilt modal controls so Click Truth Probe shows specific actions instead of only `history`.
- Kept Set Run A / Set Run B modal behaviour intact.

## Protected

- Dashboard visual shell untouched.
- Header untouched.
- Command Deck layout and raw intake protected.
- Rebuilt History hub protected.
- Raw archive spine protected.
- Mobile CSS/modules and `mobileView.js` unchanged from w25.
- Old active History Stats modal remains deleted.

## Validation

- 60 Node tests passed.
- 148 JS syntax checks passed.
- 60 MJS syntax checks passed.
- 35 CSS brace checks passed.
- Module import smoke test passed.
- Mobile root CSS/modules/mobileView unchanged from w25.
- ZIP integrity passed.
