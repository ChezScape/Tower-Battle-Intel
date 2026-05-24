# Tower Battle Intel v4.11q — Desktop Diff Details Modal

Build folder: `Tower-Battle-Intel_v4.11q_DesktopDiffDetailsModal_FullBuild`

## Scope

Desktop-only polish/fix pass based on v4.11m/v4.11l visual work. Mobile CSS was not changed.

## Main changes

- Updated runtime version to `v4.11q`.
- Replaced the medium/small `DIFF ›` column toggle behaviour with a `DIFF+` details modal.
- Dashboard cards keep the same size in medium/small desktop views.
- Narrow metric tables keep `Metric / Run A / Run B` visible in-card.
- `DIFF+` opens a modal with the full comparison table: `Metric / Run A / Run B / Diff`.
- Modal supports close button, backdrop click, and Escape key.
- Added modal styling to `desktop.css` only.
- Added card metadata for clean modal titles.
- Kept v4.11j/v4.11k/v4.11l colours, card hierarchy, Quick Actions styling, and compact desktop behaviour.

## Tests

All tests in `tests/*.mjs` passed locally with Node.

## Notes

This build intentionally avoids changing the visual card sizes. It solves hidden/clipped Diff data by moving full comparison details into a focused popup rather than compressing the table further.
