# Tower Battle Intel v4.11z52w11 — App Render Tabs Foundation

- Added `src/app/` foundation modules for startup, render, tabs, and version metadata.
- Root `app.js` now only waits for DOM readiness and starts the app.
- Root `bootstrap.js` now delegates to the new app init owner.
- `src/ui/render.js` is now a compatibility loader for `src/app/render.js`.
- `src/ui/dashboard.js` now composes visuals and no longer owns tab/render state.
- `src/ui/events/tabEvents.js` now routes tab changes through `src/app/tabs.js`.
- Real workspace actions remain parked for later phased rewiring.
