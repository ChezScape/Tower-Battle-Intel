# Tower Battle Intel v4.11z52w19 — Rebuild Wiring Completion

Built from `Tower-Battle-Intel_v4.11z52w18_HistoryViewRebuild_FullBuild.zip`.

## Purpose

Finish the current rebuild wiring before any legacy clutter deletion. This phase keeps old/reference files in place, but makes sure the active Command Deck + History + raw archive + import/export path uses the rebuilt handlers and shared owners.

## Changed

- Updated visible/display build markers to `v4.11z52w19` while keeping protected core version `v4.11z52`.
- Reworked `src/ui/events/importExportEvents.js` from an inactive future stub into the shared active browser import/export owner.
- Command Deck import/export controls now delegate browser file picker/download behaviour to `importExportEvents.js`.
- History import/export controls now delegate browser file picker/download behaviour to `importExportEvents.js`.
- Removed the duplicated local History JSON file picker/download helper copies from Command Deck and History event modules.
- Kept Command Deck and History as the workspace-specific button owners; import/export only owns the shared browser IO and feedback path.
- Updated the existing RULE book in place with the new import/export ownership rules and the “finish wiring before clutter cleanup” policy.
- Added `tests/v4.11z52w19-rebuild-wiring-completion.test.mjs` to prove the active routes and shared handlers are in place.

## Protected

- Dashboard visual shell remains protected.
- Header remains protected.
- Command Deck layout remains protected.
- Rebuilt History visual layout remains protected.
- Raw archive storage and metadata sync remain protected.
- Mobile root CSS and `styles/mobile/` remain unchanged from w18.
- Compare/Coach/Systems/Anomalies/Settings remain parked rebuild shells until their own phases.

## Validation

- 54 Node tests passed.
- 149 JavaScript syntax checks passed.
- 54 MJS syntax checks passed.
- 33 CSS files brace-checked.
- Core app/ui/events/actions/storage modules imported successfully.
- Mobile root CSS and mobile modules unchanged from w18.
- ZIP integrity passed.
