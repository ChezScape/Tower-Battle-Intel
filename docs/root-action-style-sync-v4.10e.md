# Tower Battle Intel v4.10e Root / Action / Style Sync

## Purpose

Update the root shell files, config, README, active CSS files and action command bus so they are all on the same current rebuild line.

## Updated files

- `app.js`
- `bootstrap.js`
- `desktop.css`
- `index.html`
- `mobile.css`
- `README.md`
- `style.css`
- `config/appConfig.js`
- `src/actions/actions.js`
- `tests/root-shell-foundation.test.mjs`

## What changed

- Bumped version to `v4.10e`.
- Kept `app.js` startup-only and guarded against double boot.
- Kept `bootstrap.js` render-before-bind order.
- Kept `index.html` as the clean static shell.
- Kept `style.css` intentionally unloaded.
- Updated `README.md` to the current architecture and test list.
- Added root/action/style sync support markers to `desktop.css` and `mobile.css`.
- Expanded `actions.js` aliases so current `data-ui-action` names and legacy action names route through the command bus.

## Test result

Passed locally:

```powershell
node .\tests\root-shell-foundation.test.mjs
node .\tests\utils-foundation.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\diagnostics-foundation.test.mjs
```
