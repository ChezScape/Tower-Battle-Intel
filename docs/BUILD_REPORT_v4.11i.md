# Tower Battle Intel v4.11i — Desktop Final Pixel Polish

Build folder: `Tower-Battle-Intel_v4.11i_DesktopFinalPixelPolish_FullBuild`

## Scope

Desktop-only finishing pass based on v4.11h. v4.11h is the current best visual candidate, so this build avoids a redesign and focuses on small pixel-level improvements only. Mobile CSS remains untouched.

## Changes

- Updated runtime version to `v4.11i`.
- Preserved the v4.11h maximised and medium dashboard layout.
- Preserved the v4.11h compact desktop reflow for narrow/tall windows.
- Tightened lower full-width side-intel sections in compact desktop mode.
- Slightly improved small-short desktop first impression by reducing top/header pressure.
- Kept Run A / VS / Run B styling, cyan/gold trim, and game-style metric art intact.
- Added a dedicated v4.11i final pixel polish regression test.

## Testing

Run with:

```powershell
node .\tests\current-v4.11i-final-pixel-polish.test.mjs
```

Also rerun the existing foundation and v4.11i checkpoint tests.
