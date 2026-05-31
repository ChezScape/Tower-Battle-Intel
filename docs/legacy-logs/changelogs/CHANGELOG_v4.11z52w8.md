# Tower Battle Intel v4.11z52w8 — Bones Contract Audit

- Built from `v4.11z52w7_DashboardVisualShellDensityRefactor`.
- Keeps the z52w7 Dashboard visual shell and parked Dashboard wiring.
- Fixes runtime state history filter normalisation so Normal/Deep search `mode` survives `setState()` and `hydrateState()`.
- Strengthens localStore saved-history candidate inspection so primary storage is not duplicated and backup/legacy candidates use one clean add path.
- Adds `tests/v4.11z52w8-bones-contract.test.mjs` covering game/parser/catalogue/localStore/state/saved-history/Run A-B slot contracts.
- Leaves mobile CSS/modules untouched from z52w7.
