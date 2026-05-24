# Tower Battle Intel v4.11m — Desktop Responsive Diff Toggle

Build folder: `Tower-Battle-Intel_v4.11m_DesktopResponsiveDiffToggle_FullBuild`

## Goal
Keep the v4.11l desktop visuals and card hierarchy, while fixing the medium/small desktop issue where the Diff column can disappear or clip inside metric cards.

## Changes
- Updated runtime version to `v4.11m`.
- Desktop-only change; `mobile.css` was not touched.
- Added a tiny `DIFF ›` / `‹ RUNS` toggle for metric tables on medium/small desktop widths.
- The toggle appears only when the layout is narrow enough that the Diff column is likely to be hidden or cramped.
- Default narrow view shows `Metric / Run A / Run B`.
- Diff view switches to `Metric / Diff` without changing the card size.
- Added `metricTableDiffToggleBridge.js` with event delegation so it survives dashboard re-renders.
- Preserved the v4.11l card header polish, colours, Quick Actions styling, compact desktop behaviour, and desktop/mobile split.

## Notes
This is deliberately not a redesign. It is a focused usability polish for medium and compact desktop card tables.
