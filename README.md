# Tower Battle Intel v4.10c

Current working line: **v4.10c Root Shell Rebuild**.

This project is a local, browser-based Battle Report Intelligence Dashboard for **The Tower - Idle Tower Defense**.

## Current architecture

The project is now split into clear layers:

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

## Running locally

Open `index.html` directly in a browser, or serve the folder with any simple local server.

For tests, run from the project root:

```powershell
node .\tests\utils-foundation.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
node .\tests\ui-action-foundation.test.mjs
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

## v4.10c root rebuild

Rebuilt these root files:

```text
app.js
bootstrap.js
desktop.css
index.html
mobile.css
README.md
style.css
```

Focus:

- cleaner startup entry
- safer bootstrap order
- rendered header debug-hold binding now works because initial render happens before core event binding
- no old topbar/banner shell competing with the rebuilt UI renderer
- static HTML only contains the true report input, mobile deck, dashboard root and debug roots
- updated README and inactive `style.css` note
```
