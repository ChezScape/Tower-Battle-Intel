# Changelog — v4.11z52w15

- Added Raw Archive Storage Foundation.
- Added `src/storage/rawReportArchiveStore.js`.
- Stable report IDs are generated from Battle Report date, tier, wave, and raw fingerprint.
- New saved reports keep raw Battle Report text as source-of-truth data.
- `localStore.js` now persists a non-destructive `rawArchive` section.
- History storage normalisation now blocks duplicate reports by identity.
- Run A/B storage guard now also checks fingerprints.
- Architecture rulebook updated with raw truth, duplicate, Run A/B, archive shrink, and History metadata rules.
