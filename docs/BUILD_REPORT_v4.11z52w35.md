# Build Report — v4.11z52w35 History Pager Jump + Legacy Changelog Trim

## Scope
Focused History navigation and project-tree hygiene pass.

## History pager
- Kept the 2-card grid and 6-cards-per-page model.
- Added First / Previous / Next / Last controls.
- Added a Jump-to-page numeric input and Go button.
- Enter inside the Jump field also changes page.
- Pagination continues to work inside the current sorted/filtered result set.

## Logs
- Root changelog clutter was reduced.
- Older changelogs were moved into `docs/legacy-logs/changelogs/`.
- The current active root changelogs remain visible.

## Protected areas
- Dashboard/Header untouched.
- Command Deck raw report intake untouched.
- Rebuilt History logic protected except pagination controls.
- Stats/Edit modals untouched.
- Raw archive spine untouched.
- Mobile untouched.
