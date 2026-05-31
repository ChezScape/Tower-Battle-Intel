# BUILD REPORT — v4.11z52w16

## Build
- Visible/display build: `v4.11z52w16`
- Protected rollback core: `v4.11z52`
- Base: `v4.11z52w15_RawArchiveStorageFoundation`

## Purpose
Rewire Command Deck save/validate around the raw Battle Report archive spine so pasted reports are checked as raw source records before parser/History cache work happens.

## What changed
- Added `src/actions/commandDeckRawIntake.js` as the pure Command Deck raw-intake planner.
- Command Deck Save Report now builds a raw-intake plan first:
  - splits single/batch pasted reports,
  - creates stable raw report IDs,
  - checks raw archive + History + Run A/B/currentRun fingerprints,
  - separates new reports from duplicates before parser save.
- Command Deck saves new raw report records into `state.rawArchive` first, then parses only the new raw report text into the active History cache.
- Duplicate Command Deck saves are blocked before parser/History cache writes.
- Mixed batches now save only the new reports and report duplicate IDs in the same action result.
- Duplicate feedback keeps the clearer raw-archive wording and still preserves Game Brain context.
- `src/storage/rawReportArchiveStore.js` now prefers stable raw report IDs over legacy parser `report_` IDs while keeping legacy IDs for compatibility.
- `src/core/state.js` now carries `rawArchive` as an explicit runtime state field.
- Existing RULE book updated in place with the Command Deck raw archive rewire ownership section.

## Preserved
- Dashboard visuals and parked Dashboard wiring remain protected.
- Header/frame layout remains protected.
- Command Deck visual layout remains unchanged apart from data/action behaviour.
- History / Compare / Coach / Systems / Anomalies / Settings shell state remains unchanged.
- Mobile CSS/modules remain unchanged from `v4.11z52w15`.
- Existing RULE book was updated; no duplicate rulebook was created.

## Deferred
- Raw archive import/export UI manifest/parts.
- History raw-only archive cards/paging.
- History Edit metadata rebuild.
- Compare/Coach/Systems/Anomalies rewire.
- Mobile-only rebuild.

## Validation
- 51 Node tests passed.
- 142 JS syntax checks passed.
- 51 MJS syntax checks passed.
- 35 CSS files brace-checked.
- `mobile.css` unchanged from `v4.11z52w15`.
- `styles/mobile/` unchanged from `v4.11z52w15`.
- ZIP integrity checked after packaging.
