# Changelog — v4.11z52w30 Command Deck Report State + Raw Source Count Repair

- Renamed the Command Deck side rail from duplicate `Active Data / Active Data` wording to `Current Loadout / Report State`.
- Compacted Report State wording so Library owns saved/archived totals and Raw Report Sources owns raw source records.
- Hardened Command Deck raw source counting so it counts the active raw archive `reports` structure and legacy `records` shape defensively.
- Clarified Intake Health empty raw archive wording as `Active / no source records`.
- Kept Dashboard, Header, rebuilt History, Stats/Edit modals, raw archive save spine, and mobile protected.

- Cleaned batch raw source storage so separator artifacts like `---` are stripped from saved raw Battle Report records.
- Converted `Tournament--` paste markers into raw source metadata for the following report instead of leaving them as junk inside the raw source viewer.
- Added metadata-aware batch splitting tests for clean raw source text and tournament marker preservation.
