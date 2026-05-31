# Build Report — v4.11z52w41 History Run Intel Summary Glance Polish

## Scope
Focused selected-report inspector polish only.

## Changed
- `src/ui/sections/history/historyInspector.js`
  - Replaced Run Intel Summary paragraph/bullets with compact labelled rows.
  - Added row helpers for Report read, Next target, Run band, Death pressure, and Mapping.
  - Reused friendly band shortening so `Deep run / farming endurance band` displays as `Deep farming`.

- `styles/desktop/04-history-rebuild.css`
  - Added compact row styling for `.tbi-history2-run-intel-compact` and `.tbi-history2-run-intel-row`.

- `tests/v4.11z52w41-run-intel-summary-glance-polish.test.mjs`
  - Verifies the compact feed, shortened wording, old bullet/paragraph removal, and root changelog hygiene.

## Protected
- Dashboard/Header untouched.
- Command Deck untouched.
- History cards/pager untouched.
- Library Intel untouched except shared styling context.
- Stats/Edit modals untouched.
- Click Truth Probe untouched.
- Raw source/archive spine untouched.
- Mobile untouched.

## Validation
- Focused w41 Run Intel Summary glance polish test passed.
- JS/MJS syntax checks passed.
- CSS brace check passed.
- Module import smoke test passed.
- Mobile unchanged from w40.
- ZIP integrity passed.
