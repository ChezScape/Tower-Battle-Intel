# v4.9n History Confirm Fix

## Issue

Opening the History tab could show the destructive History confirmation modal immediately.

The modal markup was rendered inside the History view with `aria-hidden="true"`, but desktop CSS still displayed `.confirm-modal` as a grid. So the modal looked active even though no delete action had been requested.

## Fix

- Confirm modal now renders with `hidden` and `inert` by default.
- Desktop CSS now hides `.confirm-modal[aria-hidden="true"]` and only displays `.confirm-modal.active`.
- Opening a destructive History action removes `hidden` and `inert`.
- Closing safely blurs focused modal controls before hiding, preventing the browser `aria-hidden` focus warning.
- Escape now closes the History confirm modal.

## History controls checked

History UI still contains and wires:

- History tab navigation
- Search
- Sort / Build / Tag dropdowns
- Show archived
- Reset filters
- Swap A/B
- Clear A/B
- Export History
- Import History
- Delete Last Run confirmation
- Delete All History confirmation
- Per-run A and B compare buttons
- Per-run Stats
- Per-run Edit
- Per-run Archive / Restore
- Per-run Delete confirmation
- More Intel collapsible section

## Scope

This is a small UI safety patch. It does not change parser, game brain, compare maths, storage, saved history format, or dashboard layout.
