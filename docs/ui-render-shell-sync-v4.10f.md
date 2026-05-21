# Tower Battle Intel v4.10f - UI Render Shell Sync

## Scope

Rebuilt/synchronised the UI render shell files Andrew listed:

- `src/ui/dashboard.js`
- `src/ui/deviceMode.js`
- `src/ui/dom.js`
- `src/ui/events.js`
- `src/ui/mount.js`
- `src/ui/numbers.js`
- `src/ui/render.js`
- `src/ui/uistate.js`
- `src/ui/views/desktopView.js`
- `src/ui/views/mobileView.js`

## Extra sync files

Also synced root/version support so tests remain aligned:

- `config/appConfig.js`
- `app.js` comment marker only
- `bootstrap.js` comment marker only
- `desktop.css` version marker only
- `mobile.css` version marker only
- `README.md`
- `tests/root-shell-foundation.test.mjs`
- `tests/ui-render-layer.test.mjs`

## Main fixes

- Device mode now owns desktop/mobile class state and can correct the loaded CSS file.
- Desktop remains desktop down to the 800px minimum target.
- Dashboard renderer is a small shell/orchestrator again.
- UI state normalisation now lives in `uistate.js`.
- Render now applies device mode before building the dashboard.
- Mobile accordion rows now route through `open-compare-section` instead of a plain tab jump.
- History card action payloads now correctly pass archive/restore/delete/stats/edit indexes through the UI bridge.
- Import History file picker uses a persistent direct input route from the click event.

## Tests run

- JavaScript syntax check
- Import path check
- diagnostics-foundation.test.mjs
- history-storage-ui-utils.test.mjs
- pipeline-foundation.test.mjs
- report-parser-game-brain.test.mjs
- root-shell-foundation.test.mjs
- ui-action-foundation.test.mjs
- ui-render-layer.test.mjs
- utils-foundation.test.mjs
