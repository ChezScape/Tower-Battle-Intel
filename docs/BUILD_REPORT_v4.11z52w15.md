# BUILD REPORT — v4.11z52w15

## Build
- Visible/display build: `v4.11z52w15`
- Protected rollback core: `v4.11z52`
- Base: `v4.11z52w14`

## Purpose
Add the Raw Archive Storage Foundation before rebuilding History and import/export around the new data model.

## What changed
- Added `src/storage/rawReportArchiveStore.js`.
- Added stable report ID generation from Battle Report date, tier, wave, and raw text fingerprint.
- Added raw report fingerprinting and raw text normalisation.
- New saved reports now keep raw Battle Report text and raw archive identity metadata.
- `localStore.js` now persists a non-destructive `rawArchive` section alongside existing state.
- `historyStore.js` now de-duplicates persisted History by report ID/fingerprint/fallback key.
- `runSlotStore.js` now treats matching fingerprints as duplicate Run A/B slot identity.
- Architecture rulebook updated with raw truth, duplicate, Run A/B, archive shrink, and History metadata ownership rules.

## Preserved
- Dashboard visual shell remains protected.
- Command Deck active workspace from w14 remains in place.
- History / Compare / Coach / Systems / Anomalies / Settings remain parked shells.
- Mobile CSS/modules remain unchanged.
- No destructive shrinking of existing parsed History happens in this phase.

## Deferred
- Raw archive import/export UI.
- Auto-archive shrink handler.
- Rehydrate/restore handler.
- History paging/raw archived cards.
- History Edit tags/notes/build/pin UI.

## Validation
- 50 Node tests passed.
- 191 JS/MJS syntax checks passed.
- 35 CSS files checked.
- `mobile.css` unchanged from `v4.11z52w14`.
- `styles/mobile/` unchanged from `v4.11z52w14`.
