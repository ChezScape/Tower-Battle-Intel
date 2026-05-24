# Tower Battle Intel v4.11q — Desktop Compact VS Removal

Build folder: `Tower-Battle-Intel_v4.11q_DesktopCompactVSRemoval_FullBuild`

## Scope

Desktop-only polish pass. `mobile.css` was not changed.

## Changes

- Updated runtime version to `v4.11q`.
- Kept the existing meter, DIFF+ modal, card hierarchy, and colour direction from the previous desktop candidate.
- Removed the leftover full VS gem from compact/small-long desktop layouts.
- Replaced the compact stacked VS area with a slim premium comparison divider.
- Normal/maximised and medium VS centrepiece rules are preserved above the compact breakpoint.
- Did not change card size, DIFF+ modal behaviour, main tables, or mobile styling.

## Test focus

- Runtime version reports `v4.11q`.
- Compact desktop CSS hides `.tbi-vs-gem` and `.tbi-vs-label` below the compact breakpoint.
- Compact desktop CSS supplies a slim `A VS B COMPARISON` divider via `.tbi-vs-core::after`.
- Mobile CSS does not include the v4.11q desktop patch marker.
