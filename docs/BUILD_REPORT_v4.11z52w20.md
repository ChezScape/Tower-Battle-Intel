# Build Report — Tower Battle Intel v4.11z52w20

## Build name

`Tower-Battle-Intel_v4.11z52w20_ActivePathVerification_FullBuild.zip`

## Base

`Tower-Battle-Intel_v4.11z52w19_RebuildWiringCompletion_FullBuild.zip`

## Goal

Verify the rebuilt active paths before any legacy clutter cleanup. This is a safety phase, not a deletion phase.

## Summary

`v4.11z52w20` keeps old/parked/reference files in place, but strengthens proof that the current desktop app is using the rebuilt route:

- Command Deck is the active report intake view and event owner.
- Command Deck Save routes through raw archive intake first.
- Raw archive records remain the source-of-truth spine.
- Parsed History remains a rebuildable cache.
- Desktop History mounts the rebuilt modular report-management hub.
- History Run A/B controls route through the action layer and the duplicate guard.
- History JSON import/export browser IO stays owned by `importExportEvents.js`.
- Export metadata now reports the current build/action checkpoint, `v4.11z52w20`.
- Dashboard remains the protected visual shell.
- Compare/Coach/Systems/Anomalies/Settings remain deliberately parked.
- Mobile remains untouched.

## Files changed

- `config/appConfig.js`
- `index.html`
- `src/actions/actionUtils.js`
- `src/actions/importExportActions.js` via action version metadata
- `src/ui/events/importExportEvents.js`
- `src/ui/events/historyEvents.js`
- `src/ui/sections/history/historyShared.js`
- `src/ui/sections/history/historyView.js`
- `src/ui/sections/historyView.js`
- `src/ui/views/desktopView.js`
- `styles/desktop/04-history-rebuild.css`
- `docs/ARCHITECTURE_OWNERSHIP_RULES.md`
- `docs/BUILD_HISTORY_INDEX.md`
- `docs/ACTIVE_REBUILD_STATUS_v4.11z52w20.md`
- `tests/v4.11z52w20-active-path-verification.test.mjs`

Most source/CSS changes are version-marker updates so runtime, export metadata, and tests agree on the current checkpoint.

## Active-path verification added

The new test proves:

- Desktop Command Deck does not route through a parked shell.
- Desktop History does not route through the parked History shell.
- Dashboard still uses the protected visual shell.
- Parked tabs are intentionally parked, not half-wired.
- Mobile History remains parked/untouched.
- Command Deck and History handlers run before parked fallback.
- Shared import/export owner is active.
- Command Deck save creates both a raw archive record and parsed History cache.
- History Set A/B uses the duplicate guard and does not keep the same report in both slots.
- History export includes `rawArchive` and reports `v4.11z52w20`.

## Validation

- 55 Node tests passed.
- 151 JS syntax checks passed.
- 55 MJS syntax checks passed.
- 36 CSS files brace-checked.
- Core app/ui/events/actions/storage module import smoke checks passed.
- Mobile root CSS and mobile modules unchanged from w19.
- ZIP integrity passed.

## Notes

Legacy cleanup is still intentionally delayed. The next phase can start classifying and removing clutter because the rebuilt active paths now have stronger proof.
