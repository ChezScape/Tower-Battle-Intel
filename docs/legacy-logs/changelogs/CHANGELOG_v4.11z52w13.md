# Tower Battle Intel v4.11z52w13 — Actions Module Foundation

- Rebuilt the action layer into focused modules while keeping `src/actions/actions.js` as the public compatibility wrapper.
- Added `src/actions/index.js`, `actionUtils.js`, `appActions.js`, `commandDeckActions.js`, `historyActions.js`, `importExportActions.js`, and `parkedActions.js`.
- Kept Command Deck report internals in `commandDeckReportActions.js` for future Command Deck rewire.
- Kept UI workspace actions parked; this phase only creates clean command rails.
- Preserved z52w8 bones, z52w9 shells, z52w10 event modules, z52w11 app/render/tabs, z52w12 storage split, saved history compatibility, and mobile CSS/modules.
- Updated visible/display build badge to `v4.11z52w13`.
