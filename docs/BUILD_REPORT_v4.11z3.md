# Tower Battle Intel v4.11z3 — Growth Intelligence Workspace

Built from v4.11z2 while keeping the protected v4.11x2 dashboard locked.

## Protected areas

- Dashboard remains locked on v4.11x2.
- No dashboard visual/layout/card/grid changes.
- `mobile.css` untouched.
- Compare/Growth changes are scoped to the Compare tab and the v4.11z3 Growth workspace.

## What changed

- Rebuilt Growth as a verdict-first Growth Command Centre.
- Added Growth Verdict panel with core movement cards.
- Added Top Gains / Top Drops and Focus Next.
- Added bigger Main Trends charts for Wave, Coins, Cells, Coins/hour, Cells/hour.
- Reworked monthly handling with compact locked state when only one month exists.
- Rebuilt Stat Families into Farming / Combat / Survival / Utility groups.
- Expanded Best / Average summaries.
- Rebuilt the right rail into Verdict / Top Gains / Top Drops / Data Coverage.
- Kept anchor navigation only: no fragile hidden panels or fake range buttons.

## Tests run

```powershell
node .\tests\current-v4.11z3-growth-intelligence-workspace.test.mjs
node .\tests\ui-render-layer.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
```
