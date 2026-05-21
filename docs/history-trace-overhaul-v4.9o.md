# v4.9o History Trace Overhaul

## Purpose

Fix Battle History Trace so the whole section is usable and styled to match the new desktop/mobile UI.

## Fixed

- History no longer appears as plain text rows.
- History Tools are visible as a themed action bar.
- Filter Console is open and usable by default.
- History Summary is open and styled.
- Per-run actions are visible: A, B, Stats, Edit, Archive/Restore, Delete.
- Tools are no longer hidden inside a tiny collapsed row.
- History action buttons use stable delegated handlers so they still work after render/re-render.
- The delete confirmation modal remains hidden until a destructive button is clicked.

## Changed files

- `config/appConfig.js`
- `desktop.css`
- `mobile.css`
- `src/ui/events.js`
- `src/ui/components/confirmModal.js`
- `src/ui/components/historyCard.js`
- `src/ui/layouts/historyLayout.js`

## Test list

1. Open History.
2. Confirm the delete popup does not show automatically.
3. Check History Tools buttons: Swap A/B, Clear A/B, Export, Import, Delete Last, Delete All.
4. Check Filter Console: search, sort, build, tag, show archived, reset filters.
5. Check each saved run: A, B, Stats, Edit, Archive/Restore, Delete.
6. Check More Intel opens and closes.
7. Check mobile History.
