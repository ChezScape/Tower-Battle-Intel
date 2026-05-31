# Build Report — v4.11z52w9 UI Visual Shell Reset

Base: `Tower-Battle-Intel_v4.11z52w8_BonesContractAudit_FullBuild.zip`

## Protected/Preserved
- `game/` catalogues and parser source remain intact.
- `src/core/state.js` bones-contract fixes remain intact.
- `src/storage/localStore.js` bones-contract/export candidate helpers remain intact.
- Dashboard visual shell remains active.
- Saved history data format and Run A/B state shape remain unchanged.

## Changed
- `src/ui/views/desktopView.js` now routes all non-Dashboard tabs to parked visual shells.
- `src/ui/views/mobileView.js` now provides a mobile concept shell and parked mobile workspace shells.
- `src/ui/sections/workspaceResetView.js` now owns reusable shell cards and parked action maps.
- `src/ui/events.js` is now a minimal shell event owner for tab navigation, parked-action feedback, and basic mobile sheet open/close.
- `bootstrap.js` no longer binds the old core event bridge, Systems bridge, or metric-table bridge during shell phase.
- `index.html` no longer loads platform/desktop polish guard scripts; device mode is owned by `src/ui/deviceMode.js`.
- Mobile JS view now exposes a concept-shell marker, while mobile CSS modules remain the blank scaffold for the later dedicated mobile pass.

## Notes
This build deliberately parks functional buttons. The purpose is to stop hidden old event/action paths from fighting while future phases reconnect one owner at a time.
