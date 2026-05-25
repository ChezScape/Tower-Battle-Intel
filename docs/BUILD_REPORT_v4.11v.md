# Tower Battle Intel v4.11v — Compare Trend Workspace

Desktop-only Compare workspace pass built from the protected v4.11u dashboard baseline.

## Protected baseline

- v4.11u dashboard visual design remains locked/protected.
- No dashboard layout, dashboard card, dashboard rail, or mobile CSS redesign changes.
- `mobile.css` untouched.

## Changes

- Redesigned Compare as an analysis workspace instead of a plain table list.
- Added Compare hero summary with Run A / Run B chips, overall lean, biggest gap and history count.
- Added category summary cards before the deep tables.
- Kept full deep-diff tables and DIFF+ modal compatibility.
- Added Trend Monitor inside Compare:
  - history trend graphs for Wave, Coins, Cells, Coins / Hour
  - single-report derived trend signal cards
  - trend findings rail
- Added clear note that single-report graphs are derived from final totals until richer wave checkpoints exist.

## Version

`TowerBattleIntel.version` should report `v4.11v`.
