# Tower Battle Intel — v4.11z52w27 History Stats Modal Mount Repair

## Fixed

- Fixed the rebuilt History Stats modal rendering inline under the History run card / page void.
- Stats modal CSS now applies under the current desktop shell markers: `device-desktop` and `data-device-mode="desktop"`.
- The modal no longer depends only on the inactive `desktop-polish` class.

## Preserved

- Rebuilt History-owned stats modal from w24.
- Old `src/ui/layouts/historyStatsModal.js` remains deleted.
- Dashboard/Header/Command Deck/mobile protected.

## Added

- `tests/v4.11z52w27-history-stats-modal-mount-repair.test.mjs`
- `docs/BUILD_REPORT_v4.11z52w27.md`
