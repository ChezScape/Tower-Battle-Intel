# Build Report — v4.11z52w29 Command Deck Panel Hierarchy Rebuild

Build: `Tower-Battle-Intel_v4.11z52w29_CommandDeckPanelHierarchyRebuild_FullBuild.zip`

Base: `Tower-Battle-Intel_v4.11z52w28_HistoryTimeSearchCommandWaveRepair_FullBuild.zip`

## Purpose

Focused Command Deck visual/wording hierarchy pass after the rebuilt Command/History paths were working again.

## Changes

- Removed the duplicated Run A / Run B / History / Input mini-state row from the Command Deck hero.
- Reworded the hero as a workflow-only Report Intake and Control Room.
- Updated the four-step strip to: Paste, Validate, Save, Manage.
- Replaced `Next Steps` with `Report Flow` / dynamic `After Save` wording.
- Removed the visible Compare route from the Command Deck route panel while Compare remains parked.
- Renamed `Current Data` to `Active Data` and made it own Run A, Run B, saved report count, archived count, raw source records, latest saved report, and build style.
- Replaced `System Readiness / Control Health` with `Intake Health`, focused on Parser, Raw Archive, History Cache, Duplicate Check, Storage, and Import / Export.
- Updated Command Rules so History owns saved-run management and Settings later owns global/dangerous data management.

## Protected

- Dashboard visuals
- Header
- Command Deck action routing and raw intake spine
- Rebuilt History hub
- Stats/Edit modal ownership
- Raw archive storage
- Mobile CSS/modules/mobileView
