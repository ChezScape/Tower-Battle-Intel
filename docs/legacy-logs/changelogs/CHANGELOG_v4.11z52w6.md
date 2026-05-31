# Changelog v4.11z52w6

- Removed the active native-control guard safeguard from startup and removed its source file.
- Kept Dashboard visuals and existing visible buttons intact.
- Added a direct import/export click owner in `src/ui/events.js` before generic History/UI routing.
- Rebuilt History export around a direct Blob/ObjectURL download path with delayed cleanup for larger JSON files.
- Updated export payloads to prefer live state history and fall back to the primary localStore history when live history is unavailable.
- Added localStore inspection helpers for raw storage, primary storage, backup storage, and saved history candidates.
- Preserved Normal/Deep History search mode in localStore UI filter persistence.
- Added `TowerBattleIntelDirectFileIO` console helpers for export/status checks.
