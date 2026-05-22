# v4.10c Root Shell Rebuild

Rebuilt root project files: `app.js`, `bootstrap.js`, `desktop.css`, `index.html`, `mobile.css`, `README.md`, and `style.css`.

## Main changes

- `app.js` is now startup-only and guarded against double boot.
- `bootstrap.js` validates the static shell, loads state, renders once, then binds core events so the rebuilt header debug-hold target exists.
- `index.html` no longer contains the old topbar/banner shell that could compete with the rebuilt UI.
- `desktop.css` and `mobile.css` gain shared startup/error panel styling only.
- `README.md` now documents the current architecture and test commands.
- `style.css` remains intentionally unloaded.

## Test

Run:

```powershell
node .\tests\root-shell-foundation.test.mjs
node .\tests\utils-foundation.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
```
