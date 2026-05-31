# Build Report — v4.11z52w45 History Search Full Library Repair

## Base
Built from `v4.11z52w44_HistorySelectedReportRealTimeFallback`.

## Scope
Focused History search repair only.

## Problem
History Normal Search was updating the top status and current DOM cards without rebuilding the full filtered History model. With pagination enabled, that meant search could only check the six cards currently rendered on the current page. Searching for `ray` could show no results unless the search mode button was clicked and forced a full re-render.

## Fix
- `src/ui/events/workspaceEvents.js`
  - History search input now writes the query into `historyFilters` with `page: 1` and `selectedIndex: null`.
  - It schedules a full History re-render instead of calling the old current-page DOM filter.
  - It restores search focus and cursor position after render.

## Protected
- Dashboard/Header untouched.
- Command Deck untouched.
- History card, pager, hero, and selected inspector visual layout untouched.
- Stats/Edit modals untouched.
- Click Truth Probe untouched.
- Raw source/archive spine untouched.
- Mobile untouched.

## Validation
- Focused w45 full-library History search test passed.
- Focused w44 selected-report Real Time fallback test passed after version update.
- 226 JS/MJS syntax checks passed.
- 33 CSS files brace-checked.
- Module import smoke test passed.
- Mobile unchanged from w44.
- ZIP integrity passed.
