# Build Report — v4.11z52w31 Raw Source Hydration + Tournament Metadata Repair

Build: `Tower-Battle-Intel_v4.11z52w31_RawSourceHydrationTournamentRepair_FullBuild.zip`

## Purpose

Repair the remaining Command Deck raw-source gap after v4.11z52w30: batch saves could show parsed History entries while Raw Report Sources still displayed 0, and manual `Tournament--` markers were converted during intake but not visible/searchable in History.

## Changes

- `src/actions/commandDeckReportActions.js`
  - Re-applies the raw archive plan after parser/History save completes.
  - Syncs raw source metadata and raw report text into parsed History entries.
  - Keeps Run A/B/current run aligned when a saved report receives raw metadata.

- `src/storage/rawReportArchiveStore.js`
  - `normaliseRawArchive()` now accepts legacy `records[]` as well as `reports[]`.
  - Raw archive merge now preserves run type, source marker, and manual markers.

- `src/ui/sections/commandDeckView.js`
  - Raw Report Sources count can fall back to raw-backed History entries when needed.

- `src/history/historyFilters.js`
  - Normal and Deep History search include run type and manual marker metadata.

- `src/ui/sections/history/historyShared.js` and `historyRunCard.js`
  - History cards can show non-normal run type chips such as Tournament.

## Batch fixture result

Using Andrew's uploaded batch paste:

- 31 reports split.
- 31 parsed History entries saved.
- 31 raw source records retained.
- 5 tournament markers detected and searchable.
- 0 stored raw records contain separator junk.

## Validation

- Focused w31 Node test passed.
- Updated w30 raw-source test passed.
- 146 JS syntax checks passed.
- 65 MJS syntax checks passed.
- 33 CSS brace checks passed.
- ZIP integrity passed.
