# Tower Battle Intel v4.11z52w17 — History Raw Archive Controls Rewire

Built from `Tower-Battle-Intel_v4.11z52w16_CommandDeckRawArchiveRewire_FullBuild.zip`.

## Purpose

Continue the raw Battle Report spine after Command Deck. This build activates the modular History event owner so History controls use the current action/storage layers instead of falling through to parked or legacy handling.

## Changed

- Added active `src/ui/events/historyEvents.js` ownership for History controls:
  - Run A / Run B loading from History cards and Stats modal.
  - Normal/Deep search query input.
  - sort/build/tag/archive filters.
  - Reset Filters, Clear A/B, Swap A/B.
  - Archive/Restore/Delete parsed History cache controls.
  - History Stats and Edit modal controls.
  - History import/export clicks.
- Updated `src/ui/events/index.js` so History event handling runs before parked fallback handling.
- Updated `src/actions/historyActions.js` so History metadata edits/archive/restore sync into matching raw archive `userMeta` records.
- Added `patchRawReportRecordUserMeta()` to `src/storage/rawReportArchiveStore.js`.
- Updated History export/import action support so exports include `rawArchive`, and imports merge any `rawArchive` section back into state.
- Added passive History UI source indicators:
  - Raw archive count in the hero.
  - Per-card source chip showing raw archive vs parsed cache.
  - Short raw report ID chip when present.

## Protected

- Dashboard visuals/layout remain untouched.
- Header remains untouched.
- Command Deck raw intake from w16 remains intact.
- Mobile CSS and `styles/mobile/` remain unchanged from w16.
- Existing RULE book updated in place only; no duplicate rulebook was created.

## Validation

- 52 Node tests passed.
- 142 JavaScript syntax checks passed.
- 52 MJS syntax checks passed.
- 35 CSS brace checks passed.
- Mobile CSS/modules unchanged from w16.
- ZIP integrity passed.
