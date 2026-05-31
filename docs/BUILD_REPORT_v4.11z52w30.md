# Build Report — v4.11z52w30 Command Deck Report State + Raw Source Count Repair

Build: `Tower-Battle-Intel_v4.11z52w30_CommandDeckReportStateRawSourceRepair_FullBuild.zip`

## Purpose

Small Command Deck polish/repair after Andrew confirmed the app works on `localhost:5500`, but the side rail wording duplicated `Active Data` and Raw Sources needed clearer counting/wording.

## Changes

- Command Deck side rail now says `Current Loadout` / `Report State` instead of `Active Data` / `Active Data`.
- Saved/archived values are grouped under `Library`.
- Raw source row now says `Raw Report Sources`.
- Raw source count now defensively handles:
  - `rawArchive.reports[]` current schema
  - array-shaped legacy rawArchive
  - `rawArchive.records[]` older/alternate schema
  - normalised archive fallback
- Intake Health now says `Active / no source records` when the raw archive is active but empty.

- Batch raw source intake now strips paste separator artifacts such as `---`, `====`, `____`, `****`, `~~~~`, and long dash/bullet separator lines before storing each raw Battle Report source.
- Manual markers such as `Tournament--` are no longer stored as raw report text; they are converted into raw source metadata for the next Battle Report block.
- Raw intake now exposes `splitBattleReportEntries()` metadata so future History/Edit views can display manual run type hints without polluting the raw Battle Report viewer.

## Protected

- Dashboard/Header untouched.
- Command Deck save/import/export handlers untouched except display/counting.
- Rebuilt History hub, Stats modal, Edit modal untouched.
- Raw archive storage spine preserved.
- Mobile root CSS, mobile modules, and mobileView unchanged.
