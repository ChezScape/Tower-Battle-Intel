# Tower Battle Intel v4.11z52w12 — Storage Import Export Foundation

- Rebuilt `index.html` as an entry shell only.
- Added the `data:,` favicon fix to stop Chrome requesting missing `favicon.ico`.
- Removed old static input/mobile rail controls from `index.html` during shell phase.
- Split storage into focused modules for keys, utilities, History shape, Run A/B slot rules, import parsing, and export candidate selection.
- Kept `localStore.js` as the public compatibility wrapper for existing callers.
- Preserved saved history format, Run A/B saved values, Normal/Deep search mode, backup/legacy fallback, and saved draft text.
- Real workspace actions remain parked for the later phased rewiring.
