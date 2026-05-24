# Tower Battle Intel v4.11k — Desktop Card Hierarchy Polish

Build folder: `Tower-Battle-Intel_v4.11k_DesktopCardHierarchyPolish_FullBuild`

## Scope

Desktop-only visual polish built from v4.11i. Mobile CSS was not edited.

## Changes

- Updated runtime version to `v4.11k`.
- Reworked major dashboard metric cards so the card title leads the header.
- Removed the large floating top-right summary value from metric-card headers.
- Kept the same comparison data but moved visual emphasis into the `A - B` comparison strip.
- Enabled clearer table headers: `Metric`, `Run A`, `Run B`, `Diff`.
- Added desktop CSS polish for centered card titles, improved compare strips, clearer tables, and stronger row hierarchy.
- Sharpened the VS treatment so it feels more integrated with the cyan/gold dashboard language.
- Restyled Key Takeaways reticle, Recommendations chart art, and Quick Actions command tiles so the side artwork feels more consistent.

## Notes

This is still a desktop candidate until Andrew checks the visual result and confirms the core buttons/actions still work.

## Tests

```powershell
node .\tests\current-v4.11k-checkpoint.test.mjs
node .\tests\current-v4.11k-card-hierarchy-polish.test.mjs
```
