# Tower Battle Intel v4.11g Build Report

`Tower-Battle-Intel_v4.11g_DesktopHeightFitPolish_FullBuild`

## Purpose
Desktop-only height and scroll fit polish for the Concept 5 dashboard.

## Starting point
Built from `v4.11d Desktop Top Strip Fit Polish`.

## Changes
- Updated runtime version to `v4.11g`.
- Kept v4.11d Run A cyan trim, Run B gold trim, VS styling, and metric art.
- Reduced vertical pressure across the dashboard grid.
- Tightened card padding, row heights, footer actions, and status footer sizing.
- Tightened right-rail sections so Quick Actions is less likely to be pushed below the visible desktop viewport.
- Added a 1080-height desktop fit rule for Andrew's high-DPI maximised browser style.
- Preserved compact desktop behaviour for small desktop windows.

## Scope
- Desktop dashboard CSS only for visual layout changes.
- `mobile.css` intentionally untouched.
- No helper patch scripts.
- No overlay dashboard JavaScript.

## Test focus
- Version checkpoint.
- Top-strip fit regression.
- Height/scroll fit CSS presence.
- Save report feedback still working.
- Existing foundation, pipeline, render, and native-control checks.
