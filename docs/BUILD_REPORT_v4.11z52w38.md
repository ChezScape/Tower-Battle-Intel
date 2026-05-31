# Build Report — v4.11z52w38 History Pager Action Order Polish

## Base
Built from `Tower-Battle-Intel_v4.11z52w37_HistorySortOrderPolish_FullBuild.zip`.

## Goal
Make the History pager read more logically and expose Archive Page while archived runs are visible.

## Pager order
The pager now groups controls as:

```text
First / Previous / Jump / Go / Next / Last | Archive Page / Restore Page
```

## Behaviour
- Sort still decides the order of the visible report list.
- Filters still decide which reports are included.
- Pagination only moves through the current sorted/filtered list.
- Archive Page stays visible as the main page-level action.
- Restore Page appears alongside Archive Page when archived runs are included.
- No page delete was added.

## Protected areas
- Dashboard/Header
- Command Deck raw report intake
- Rebuilt History card layout and inspector behaviour except pager control grouping
- Stats/Edit modals
- Click Truth Probe
- Raw source archive spine
- Mobile files
