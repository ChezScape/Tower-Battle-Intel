# Tower Battle Intel — Build Report v4.11z52w27

## Build

`Tower-Battle-Intel_v4.11z52w27_HistoryEditModalControlRepair_FullBuild.zip`

## Base

Built from `Tower-Battle-Intel_v4.11z52w26_HistoryStatsModalControlRepair_FullBuild.zip`.

## Reason

Andrew tested w26 and confirmed the rebuilt Stats modal controls work, but the History Edit modal still used the broad History route. Notes and Tags typing could bounce focus and clear text, Close did not work, and the Click Truth Probe showed generic `workspaceEvents / history` handling for Edit controls.

## Changes

- Added rebuilt History-owned Edit modal file:
  - `src/ui/sections/history/historyEditModal.js`
- Removed old active Edit modal path:
  - `src/ui/layouts/historyEditModal.js`
- Updated `src/ui/events/workspaceEvents.js` so Edit modal controls are handled before broad History controls.
- Isolated Notes/Tags input so typing does not trigger a History render or reset modal content.
- Added specific `data-ui-action` markers for Click Truth Probe output:
  - `history-edit-close`
  - `history-edit-cancel`
  - `history-edit-save`
  - `history-edit-notes`
  - `history-edit-tags`
  - `history-edit-build-choice`
- Also absorbed passive/field clicks inside the Stats modal so modal clicks do not reset tabs or hit History content behind the overlay.

## Protected

- Dashboard visual shell unchanged.
- Header unchanged.
- Command Deck layout and raw intake unchanged.
- Rebuilt History hub preserved.
- Rebuilt Stats modal preserved.
- Raw archive spine preserved.
- Mobile CSS/modules/mobileView unchanged from w26.

## Validation

- 61 Node tests passed.
- 148 JS files passed syntax check.
- 61 MJS files passed syntax check.
- 36 CSS files passed brace checks.
- Mobile CSS/modules/mobileView unchanged from w26.
- ZIP integrity passed.
