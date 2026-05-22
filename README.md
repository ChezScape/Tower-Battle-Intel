# Tower Battle Intel v4.10j

Current working line: **v4.10e Root / Action / Style Sync**.

This project is a local, browser-based Battle Report Intelligence Dashboard for **The Tower - Idle Tower Defense**.

## Current architecture

```text
app.js / bootstrap.js        startup only
index.html                  static shell only
desktop.css                 desktop layout/theme only
mobile.css                  mobile layout/theme only
src/core/                   state, history, update, compute
src/pipeline/               parser, compare, coach, insights, schema
src/game/                   local game catalogue / report knowledge brain
src/actions/                visible UI command bus
src/ui/                     renderer, events, views, components, sections
src/history/                history filters, selectors, stats, badges
src/storage/                local persistence
src/utils/                  shared parsing/time/math/safety utilities
src/diagnostics/            health scan, trace, pipeline inspection
```

## Important rules

- Do not put desktop layout fixes in `mobile.css`.
- Do not put mobile layout fixes in `desktop.css`.
- Visible buttons should route through `src/ui/events.js` then `src/actions/actions.js`.
- Core files should not directly own visible UI button behaviour.
- `src/game/` is the local game-brain catalogue and should stay separate from UI code.
- `style.css` is intentionally not loaded unless the shell is deliberately changed.

## Running locally

Open `index.html` directly in a browser, or serve the folder with any simple local server.

For tests, run from the project root:

```powershell
node .\tests\root-shell-foundation.test.mjs
node .\tests\utils-foundation.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
```

## Console helpers

After the app starts, these are available in DevTools:

```js
TowerBattleIntel.state()
TowerBattleIntel.render()
TowerBattleIntel.save()
TowerBattleIntel.shell()
```

## v4.10e sync

Updated these files together so the visible shell, action bus, theme files and documentation agree with the current rebuild line:

```text
app.js
bootstrap.js
desktop.css
index.html
mobile.css
README.md
style.css
config/appConfig.js
src/actions/actions.js
```

Focus:

- sync root shell versioning
- keep startup guarded and bootstrapped once
- keep the static HTML shell clean
- keep desktop/mobile CSS split
- expand action aliases so visible UI actions have a single command bus
- keep style.css inactive


## v4.10j native control backbone

Adds a browser-native fallback for History Import/Export and Debug close/download controls so critical buttons still work even if rendered module handlers are blocked.
