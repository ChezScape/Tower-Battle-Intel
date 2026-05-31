# Build Report — v4.11z52w40 History Library Intel Glance Polish

## Scope
Focused Selected Report / Library Intel wording pass.

## Changes
- `src/history/historyGameBrain.js`
  - Added death-family details for Common / Elite / other family groupings.
  - Keeps existing top-family counts intact, but adds clearer detail for display.
- `src/ui/sections/history/historyInspector.js`
  - Replaced vague Library Intel labels:
    - `Common band` → `Run band mix`
    - `Top family` → `Death family`
  - Shows friendlier values:
    - `Deep run / farming endurance band` → `Deep farming`
    - `Enemy / Common` → `Common enemies`
  - Adds `Elite deaths` row when present, such as `Scatter + Ray · 5 runs`.

## Verified fixture result
Using the 31-report fixture:
- Most common deaths: Basic + Fast, 7 each.
- Run band mix: Deep farming, 26 runs.
- Death family: Common enemies, 26 runs.
- Elite deaths: Scatter + Ray, 5 runs.

## Protected
- Dashboard/Header untouched.
- Command Deck untouched.
- History card/pager behaviour untouched.
- Stats/Edit modals untouched.
- Click Truth Probe untouched.
- Raw source/archive spine untouched.
- Mobile untouched.
