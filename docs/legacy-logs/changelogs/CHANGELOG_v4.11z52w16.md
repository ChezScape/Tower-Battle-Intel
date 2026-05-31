# Changelog — v4.11z52w16

- Added `src/actions/commandDeckRawIntake.js`.
- Command Deck now plans raw archive intake before parser/History cache writes.
- Save Report archives new raw Battle Report source records first, then parses only new raw reports into History.
- Duplicate raw reports are blocked by stable report ID/fingerprint before save.
- Mixed batch saves now load new reports and report duplicates without re-saving them.
- Duplicate feedback keeps Game Brain context.
- Raw archive records now prefer stable `rpt_...` IDs over legacy parser `report_...` IDs.
- Runtime state now explicitly carries `rawArchive`.
- Existing architecture RULE book updated in place for the Command Deck raw archive rewire.
- Dashboard and mobile remain protected/unchanged.
