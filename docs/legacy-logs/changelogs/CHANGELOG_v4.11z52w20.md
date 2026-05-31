# Tower Battle Intel v4.11z52w20 — Active Path Verification

Built from `Tower-Battle-Intel_v4.11z52w19_RebuildWiringCompletion_FullBuild.zip`.

## Purpose

Prove that the rebuilt Command Deck + raw archive + History + import/export route is the active desktop route before starting legacy clutter cleanup.

## Changed

- Updated visible/display build markers to `v4.11z52w20` while keeping protected core version `v4.11z52`.
- Updated action/build version metadata so History export reports `v4.11z52w20` instead of a stale checkpoint.
- Added `tests/v4.11z52w20-active-path-verification.test.mjs`.
- Added `docs/ACTIVE_REBUILD_STATUS_v4.11z52w20.md` as a cleanup-planning checklist.
- Updated the existing RULE book in place with the active-path verification phase.
- Updated the build history index with the current checkpoint.

## Protected

- Dashboard visual shell remains protected.
- Header remains protected.
- Command Deck layout remains protected.
- Rebuilt History visual layout remains protected.
- Raw archive storage and metadata sync remain protected.
- Mobile root CSS and `styles/mobile/` remain unchanged from w19.
- Compare/Coach/Systems/Anomalies/Settings remain parked rebuild shells.

## Validation

- 55 Node tests passed.
- 151 JavaScript syntax checks passed.
- 55 MJS syntax checks passed.
- 36 CSS files brace-checked.
- Core app/ui/events/actions/storage modules imported successfully.
- Mobile root CSS and mobile modules unchanged from w19.
- ZIP integrity passed.
