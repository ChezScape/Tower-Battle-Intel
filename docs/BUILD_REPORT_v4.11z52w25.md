# Build Report — v4.11z52w27 History Stats Modal Mount Repair

Build: `Tower-Battle-Intel_v4.11z52w27_HistoryStatsModalMountRepair_FullBuild.zip`

Base: `Tower-Battle-Intel_v4.11z52w24_HistoryStatsModalRebuild_FullBuild.zip`

## Reason

Andrew tested w24 and found the rebuilt History Stats content was not appearing as a real modal window. It rendered inline under the run card / in the History page void.

## Root cause

The rebuilt stats modal CSS was scoped only to `html.desktop-polish`, but the current shell marks desktop with `html.device-desktop` and `html[data-device-mode="desktop"]`. During this rebuild phase `desktopPolishGuard.js` is not active, so the modal HTML rendered correctly but the fixed overlay/window styling did not apply.

## Fix

- Updated `styles/desktop/04-history-stats-modal.css` to use `:where(html.desktop-polish, html.device-desktop, html[data-device-mode="desktop"])` selectors.
- Kept the modal owned by `src/ui/sections/history/historyStatsModal.js`.
- Kept the modal mount `#historyStatsModalMount` in the rebuilt History view, after the main workspace.
- Kept old `src/ui/layouts/historyStatsModal.js` deleted.
- Added `tests/v4.11z52w27-history-stats-modal-mount-repair.test.mjs` to prove the modal no longer depends only on `desktop-polish`.
- Updated the existing RULE book in place.

## Protected

- Dashboard visuals untouched.
- Header untouched.
- Command Deck layout untouched.
- Rebuilt History hub preserved.
- Raw archive spine preserved.
- Mobile CSS/modules unchanged from w24.

## Validation

- Node tests passed.
- JS/MJS syntax checks passed.
- CSS brace checks passed.
- Mobile CSS/modules unchanged from w24.
- ZIP integrity passed.
