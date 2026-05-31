# Tower Battle Intel v4.11z52w13a — Architecture Rulebook Catalogue Foundation

- Added `docs/ARCHITECTURE_OWNERSHIP_RULES.md` as the living architecture ownership rulebook.
- Catalogued the rebuilt foundation files from z52w7 through z52w13, including app, UI events, core events, storage, actions, Dashboard shell, workspace shell, and compatibility wrappers.
- Added explicit rules for what each layer is for and what it must not do.
- Added the hard rule that future rebuild phases must update the rulebook for every new, rebuilt, moved, or ownership-changing file.
- Added `tests/v4.11z52w13a-architecture-rulebook.test.mjs`.
- No real workspace actions were reconnected in this phase.
- Mobile CSS/modules remain unchanged.
- Updated visible/display build badge to `v4.11z52w13a`.
