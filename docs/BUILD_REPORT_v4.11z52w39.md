# Build Report — v4.11z52w39 History Selected Report Inspector + Library Tie Polish

## Base
Built from `v4.11z52w38_HistoryPagerActionOrderPolish`.

## Scope
Focused History selected-report inspector polish only.

## Changes
- `src/ui/sections/history/historyInspector.js`
  - Balanced selected-report action buttons.
  - Added more complete compact metrics: Wave, Coins, Cells, Coins/h, Cells/h, Real Time.
  - Kept Report ID and Raw Source proof but removed duplicated Next Target / Mapping proof chips.
  - Changed Library Intel label to `Most common deaths`.
  - Uses tie-aware count text from History Game Brain insights.

- `src/history/historyGameBrain.js`
  - `topCount()` now returns tied labels and `countText`.
  - Library summaries can show `Basic + Fast` and `7 each` instead of hiding one tied result.

- `src/ui/sections/history/historyHeader.js`
  - Header common-death tile uses tie-aware label/count text.

- `styles/desktop/04-history-rebuild.css`
  - Added selected-report inspector density rules.

## Protected
- Dashboard/Header untouched.
- Command Deck raw report intake untouched.
- History cards and pager untouched except version markers.
- Stats/Edit modals untouched.
- Click Truth Probe untouched.
- Raw source/archive spine untouched.
- Mobile unchanged.
