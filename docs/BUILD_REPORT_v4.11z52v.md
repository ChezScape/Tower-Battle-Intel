# Tower Battle Intel v4.11z52v — Src Ownership Clean Rebuild

Base: `Tower-Battle-Intel_v4.11z52u_OwnerBridgeStabilityCleanup_FullBuild`
References: `v4.8k` for simple search/import/export behaviour, `z52k` for Dashboard verification strip, `z52m` for Systems/Game Brain foundation, `z52s` for exact-wave and Normal/Deep History Search behaviour.

## Purpose
Remove the remaining old bridge fighting and return active UI ownership closer to the simpler v4.8k model while keeping the current protected visuals and features.

## Kept
- Dashboard frame/layout and compact Game Brain Verification strip.
- Header/nav frame lock.
- Command Deck foundation and in-page feedback.
- History visual style, Normal History Search, Deep Report Search, Clear buttons, Run A/B guard, and exact wave numbers.
- Systems/Game Brain Knowledge Base tabs and search.
- Mobile CSS/modules unchanged.

## Removed from active app source
- `src/ui/globalSearchBridge.js`
- `src/ui/historySearchFocusGuard.js`
- `src/ui/nativeImportHardBridge.js`
- `src/ui/universalDownloadBridge.js`
- Old fallback import input from `index.html`
- Old script tags for removed search/download bridges

Debug UI, startup message UI, and theme/display toggle remain absent.

## Rebuilt ownership
- `src/ui/events.js` owns rendered UI actions, History search, History Stats search, simple import picker, simple export/download, and restoring native Details across its own renders.
- `src/history/historyFilters.js` owns Normal History Search and Deep Report Search matching logic.
- `src/ui/systemsKnowledgeBridge.js` owns Systems tab switching and Systems search.
- `src/actions/actions.js` owns data/app actions only.
- `src/ui/nativeControlGuard.js` only protects browser-native controls; it no longer preserves or restores search state through the removed global bridge.

## Behaviour target
- History search uses the old stable state-backed input flow, updated with new Normal/Deep logic.
- Systems search uses simple DOM filtering in the Systems bridge.
- History Stats search is local to the modal and should not revert to Overview when clicking rows or outside content.
- Dashboard Verification Details is restored after app-owned renders and should not close from ordinary outside clicks.
- Import/export use direct v4.8k-style browser behaviours from `events.js`, while retaining current data formats.

## Validation
- 39 Node tests passed.
- 148 JS/MJS syntax checks passed.
- CSS brace checks passed.
- Mobile CSS/modules unchanged from z52u.
- ZIP integrity passed.
