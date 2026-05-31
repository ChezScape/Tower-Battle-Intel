# Build Report — v4.11z52w28 History Time/Search/Command Wave Display Repair

Build: `Tower-Battle-Intel_v4.11z52w28_HistoryTimeSearchCommandWaveRepair_FullBuild.zip`

Base: `Tower-Battle-Intel_v4.11z52w27_HistoryEditModalControlRepair_FullBuild.zip`

## Purpose

Focused repair while staying inside the rebuilt History/Command display layer.

## Changes

- History Stats modal Summary now resolves Game Time and Real Time from `core`, `flat`, `sections.core`, and preserved raw parser evidence before falling back to computed time.
- History main search input updates cards in-place without forcing a full app render per keypress.
- History Raw Sources header label now distinguishes raw source records from archived parsed runs.
- Command Deck run labels and quick feedback now use exact raw wave digits with `Wave ####` wording.

## Protected

- Dashboard visuals
- Header
- Command Deck layout
- Rebuilt History hub layout
- Stats/Edit modal ownership
- Raw archive spine
- Mobile CSS/modules/mobileView

