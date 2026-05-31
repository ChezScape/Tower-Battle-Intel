# Tower Battle Intel v4.11z52w18 — History View Rebuild

Built from `Tower-Battle-Intel_v4.11z52w17_HistoryRawArchiveControlsRewire_FullBuild.zip`.

## Purpose

Rebuild History properly, visually and structurally, instead of only connecting the event/action layer. History is now the saved Battle Report management hub.

## Changed

- Mounted the real rebuilt History view in the active desktop shell.
- Replaced the parked History shell with a raw-archive-led layout.
- Added modular History-owned UI files under `src/ui/sections/history/`:
  - header
  - toolbar
  - run list
  - run card
  - inspector
  - empty state
  - modal mounts
  - shared helpers
- Added `styles/desktop/04-history-rebuild.css` using `.tbi-history2*` scoped classes so the new visual rebuild does not fight older History CSS.
- Kept existing `src/ui/sections/historyView.js` as a thin wrapper so older imports keep working.
- Added exact desktop mount test coverage proving the active History tab renders `data-history-view-rebuild="v4.11z52w18"` and not the parked shell.
- Updated current version markers to `v4.11z52w18`.

## History now shows

- Report Management Hub hero.
- Saved run count, visible count, raw archive count, archived count, Run A, and Run B state.
- Workflow strip: Find → Choose → Inspect → Protect.
- Normal/Deep search controls.
- Sort, build, tag, and archived shown/hidden filters.
- Saved report cards with exact Wave numbers.
- Source proof: raw archive vs parsed cache.
- Short raw report ID chip.
- Build style, tags, notes.
- Set A, Set B, Stats, Edit, Archive/Restore, Delete.
- Selected Report inspector with Run Intel Summary and Library Intel.

## Protected

- Dashboard visuals/layout remain untouched.
- Header remains untouched.
- Command Deck raw intake from w16 remains intact.
- History event/action/raw metadata sync from w17 remains intact.
- Mobile CSS and mobile modules remain unchanged from w17.

## Validation

- 53 Node tests passed.
- 151 JavaScript syntax checks passed.
- 53 MJS syntax checks passed.
- 36 CSS brace checks passed.
- Mobile CSS/modules unchanged from w17.
- Direct desktop History render smoke test passed.
- ZIP integrity passed.
