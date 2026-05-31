# Tower Battle Intel v4.11z52w24 — Hard Event Owner Rebuild

Built from `Tower-Battle-Intel_v4.11z52w20_ActivePathVerification_FullBuild.zip`.

## Fixed

- Rebuilt the active event route after Andrew reported that only the top nav worked.
- Removed the old parked catch-all event handler from the active project.
- Removed old separate `commandDeckEvents.js` and `historyEvents.js` event owners from the project.
- Added `workspaceEvents.js` as the single active Command Deck + History event owner.
- Updated the event root so active buttons no longer fall through into parked fallback handling.
- Kept import/export browser IO as one shared helper through `importExportEvents.js`.

## Protected

- Dashboard visual layout.
- Command Deck visual layout.
- Rebuilt History visual layout.
- Raw archive/source-of-truth spine.
- Mobile CSS/modules and mobile view file.

## Validation

- 55 Node tests passed in two batches.
- 151 JS syntax checks passed.
- 55 MJS syntax checks passed.
- 36 CSS brace checks passed.
- Mobile CSS/modules and mobile view unchanged from w20.
- ZIP integrity passed.
