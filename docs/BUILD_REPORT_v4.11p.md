# Tower Battle Intel v4.11q — Desktop Meter, DIFF+ and VS Fix

Build folder: `Tower-Battle-Intel_v4.11q_DesktopMeterDiffAndVSFix_FullBuild`

## Scope

Desktop-only polish pass. Mobile CSS remains untouched.

## Changes

- Updated runtime version to `v4.11q`.
- Kept the v4.11l/v4.11n/v4.11o visual base and DIFF+ modal behaviour.
- Made the centre-split A/B advantage meter calmer and less busy.
- Hid tiny A/B labels inside the meter so the value and direction are easier to read.
- Kept positive totals filling toward B and negative totals filling toward A.
- Cleaned DIFF+ placement so it acts as a details action without fighting Run A / Run B headers.
- Fixed the VS centre-lane drift in maximised and medium desktop layouts.
- Polished the stacked compact desktop VS divider while preserving the compact reflow.

## Guardrails

- No mobile layout/CSS changes.
- No dashboard redesign.
- Card sizes remain stable.
- DIFF+ continues to open the full details modal.
