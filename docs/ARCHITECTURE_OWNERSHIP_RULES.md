# Tower Battle Intel — Architecture Ownership Rules

**Current catalogue checkpoint:** `v4.11z52w32`  
**Protected rollback core:** `v4.11z52`  
**Rulebook status:** living catalogue; this file must be updated in every rebuild phase.

This document is the ownership law for Tower Battle Intel. It is not a loose guide. When a file is rebuilt, added, moved, or changes responsibility, its catalogue entry must be added or updated here before the build is packaged.

## 1. Prime rule

Every active file must have one clear job. A file may help another layer, but it must not secretly own another layer's job.

Correct flow:

```text
Browser/UI event
↓
src/ui/events/*
↓
src/actions/*
↓
src/core/* and/or src/storage/*
↓
src/app/render.js
↓
src/ui/views/* / src/ui/workspaces/*
```

Wrong flow:

```text
Button click
↓
ui events + core events + guards + bridges + localStore + random fallback handlers all trying to act
```

## 2. Layer ownership rules

| Layer | Owns | Must not own |
|---|---|---|
| `index.html` | Static entry shell only | App logic, hidden controls, duplicate Command Deck input, import/export wiring |
| `app.js` / `bootstrap.js` | Starting the app and compatibility startup only | UI layout, storage rules, parser rules, button commands |
| `src/app/` | Startup, render order, active tab, runtime version metadata | Workspace business logic, direct localStorage keys, parser formulas |
| `src/ui/events/` | Browser clicks, keyboard hooks, tab clicks, shell parked feedback | State mutation rules, localStorage schema, parsing reports, rendering HTML |
| `src/core/events/` | No-DOM domain signal bus and future state/storage signals | DOM clicks, HTML, browser file pickers, downloads |
| `src/actions/` | Commands such as save report, validate, export, set Run A/B, archive | Direct DOM event listening, visual HTML rendering, owning raw localStorage keys |
| `src/storage/` | localStorage keys, saved state, import/export data conversion | Button clicks, UI rendering, report parsing intelligence |
| `src/core/` | State shape and state rules | DOM, file downloads, view styling |
| `src/ui/views/` | Desktop/mobile view composition | State mutation, localStorage schema, parser ownership |
| `src/ui/sections/` | Reusable visual shell/section builders | App startup, action command ownership, raw storage |
| `src/game/` and `game/` | Game knowledge, catalogues, source confidence, version audits | Live gameplay automation, UI buttons, storage writes |
| `src/pipeline/` | Parsing, normalisation, compute, compare, intelligence | DOM events, localStorage keys, CSS/layout ownership |
| `src/history/` | History search/filter/selectors/stat helpers | Browser events, app startup, direct downloads |
| `src/utils/` | Small pure helpers | Owning feature workflows |
| `styles/` | Visual presentation only | JavaScript behaviour or data ownership |
| `tests/` | Contract proof and regression checks | Runtime ownership |

## 3. Red-line rules

1. **No DOM in core domain events.** `src/core/events/*` must never call `document.querySelector`, attach browser listeners, or create HTML.
2. **No raw localStorage outside storage modules.** Only `src/storage/*` may own storage keys and persistence details.
3. **No button action directly inside views.** Views may emit data attributes, but commands belong in `src/actions/*`.
4. **No parser/Game Brain calls inside button listeners.** Button listeners route to actions only.
5. **No bridge/guard stacking.** If a file exists only to catch another file's broken ownership, rebuild the owner instead.
6. **No duplicate event owners.** One control/action selector must have one active owner.
7. **No Dashboard visual redesign during shell/foundation phases.** The visual result stays protected while wiring is rebuilt underneath.
8. **Wave formatting rule:** waves display as exact plain digits such as `7600`, never `7.6K`, `7,600`, or `W7.6K` unless Andrew explicitly changes the rule.
9. **Compatibility wrappers must stay thin.** Wrappers may delegate, expose old APIs, or protect old imports. They must not grow new feature ownership.
10. **Rulebook update required.** Any new, rebuilt, moved, or ownership-changing file must be catalogued here in the same build.
11. **App start rule:** Command Deck is the natural starting point for report intake. The default active workspace should be `command`, not `overview`, unless Andrew changes the workflow later.
12. **Dashboard ownership rule:** Dashboard is a read-only intelligence view, not the app action hub. Do not re-add Dashboard Quick Actions.
13. **Dashboard action exception:** The only direct Dashboard control currently allowed is `Swap A/B`, and it belongs inside the central Run A vs Run B / VS comparison area.
14. **Dashboard Game Brain rule:** Full Game Brain verification details belong in Command Deck and Systems/Game Brain. Dashboard may only show tiny passive per-run confidence/status chips inside the existing top Run A / Run B metadata strip without increasing its height.
15. **Dashboard symmetry rule:** Run A and Run B header/stat metadata should flow inward toward the VS area. Run B keeps its RUN B label anchored right while metadata mirrors inward.
16. **Raw truth rule:** Raw Battle Report text is the permanent source of truth. Parsed report objects are rebuildable cache/working data.
17. **Duplicate report rule:** One Battle Report equals one stable `reportId` and one saved record. Duplicate reports are forbidden in History/raw archive.
18. **Run slot duplicate rule:** Run A and Run B must never point to the same `reportId`/fingerprint. Compare requires two different reports.
19. **History metadata rule:** Tags, notes, build style, pinned state, and archive state are History-owned user metadata. Command Deck must not apply one metadata set to bulk imports.
20. **Archive shrink rule:** Archived reports may become raw-only lightweight records, but only when raw text exists. Restore/open/set A/B reparses raw text.

## 4. Current rebuild catalogue

The entries below catalogue the active ownership changes from `z52w7` through `z52w13a`.

---

# Root and app entry

## `index.html`

**Purpose:** Static entry shell for the browser app. Loads CSS and JavaScript entry points and provides the root mount elements.

**Allowed to contain:** `#app`, `#dashboard`, CSS links, script entry links, metadata, favicon declaration.

**Not allowed to:** Own Command Deck input, duplicate mobile rails, bind buttons, run import/export, hold debug UI, own startup messages, own device routing.

**Called by:** Browser.

**May call/load:** CSS files and JavaScript entry files only.

**Red line:** If a feature needs behaviour, put it in `src/app/*`, `src/ui/events/*`, or `src/actions/*`, not in `index.html`.

## `app.js`

**Purpose:** Browser DOM-ready entry point.

**Not allowed to:** Hydrate storage, render views directly, attach workspace events, own parser/storage/actions.

**Calls:** `src/app/init.js`.

**Called by:** `index.html` script module.

**Red line:** Keep it tiny. It starts the app and catches startup failure only.

## `bootstrap.js`

**Purpose:** Compatibility startup loader for older imports/snippets that expect a bootstrap module.

**Not allowed to:** Recreate old startup logic, bind old event bridges, own storage, own UI rendering.

**Calls:** `src/app/init.js`.

**Called by:** Legacy imports/tests only.

**Red line:** If this file grows real logic again, the startup layer is regressing.

## `config/appConfig.js`

**Purpose:** Central runtime configuration and public version/display metadata.

**Not allowed to:** Own live state, UI rendering, storage migrations, or feature commands.

**Called by:** `src/app/version.js`, tests, and modules needing static config.

**May call:** Nothing active.

**Red line:** Do not put behaviour in config.

---

# App foundation

## `src/app/init.js`

**Purpose:** Single startup owner for the shell-phase app.

**Owns:** Device-mode init call, version stamping, storage hydration, first render, binding UI events, autosave/exit-save shell guards, console status helpers.

**Not allowed to:** Own workspace-specific actions, parse reports directly, build workspace HTML, own raw storage keys, bind duplicate event bridges.

**Called by:** `app.js`, `bootstrap.js`.

**May call:** `src/ui/deviceMode.js`, `src/storage/localStore.js`, `src/core/state.js`, `src/app/render.js`, `src/ui/events/index.js`, `src/app/version.js`.

**Red line:** Startup can sequence owners; it must not become another feature owner.

## `src/app/render.js`

**Purpose:** Single render/mount order owner.

**Owns:** Calling the shell dashboard/view builder and stamping render runtime state.

**Not allowed to:** Decide button commands, mutate storage directly, parse reports, own tab-click events.

**Called by:** `src/app/init.js`, `src/ui/events/*`, console helper.

**May call:** `src/ui/dashboard.js`, `src/core/state.js`, mount helpers.

**Red line:** Render reads state and renders. It does not perform actions.

## `src/app/tabs.js`

**Purpose:** Single active-tab state owner.

**Owns:** Valid app tab list, tab normalisation, active tab updates, tab status.

**Not allowed to:** Attach DOM click handlers, render HTML, run actions, save directly to localStorage.

**Called by:** `src/ui/events/tabEvents.js`, view builders that need active-tab stamps.

**May call:** `src/core/state.js` for tab state updates.

**Red line:** Tab clicks belong in UI events; tab state belongs here.

## `src/app/version.js`

**Purpose:** Runtime version metadata owner.

**Owns:** Build/core version readout and DOM dataset stamping for runtime version.

**Not allowed to:** Own feature flags, migrations, or behaviour.

**Called by:** `src/app/init.js`, console/status helpers.

**May call:** `config/appConfig.js`.

**Red line:** Version metadata only.

---

# UI view shell foundation

## `src/ui/dashboard.js`

**Purpose:** Composes the current shell UI into the dashboard/root mount.

**Owns:** Choosing desktop/mobile shell output based on state/device context and active tab.

**Not allowed to:** Own app startup, bind events, mutate storage, run parser/Game Brain actions.

**Called by:** `src/app/render.js` / compatibility render path.

**May call:** `src/ui/views/desktopView.js`, `src/ui/views/mobileView.js`, `src/app/tabs.js`.

**Red line:** This is a view composer, not an action bus.

## `src/ui/views/desktopView.js`

**Purpose:** Desktop shell view router.

**Owns:** Selecting Dashboard visual shell or parked workspace shell for active desktop tab.

**Not allowed to:** Bind click handlers, mutate state, run Command Deck/History real actions.

**Called by:** `src/ui/dashboard.js`.

**May call:** `src/ui/views/dashboardVisualShell.js`, `src/ui/sections/workspaceResetView.js`.

**Red line:** Desktop visual routing only.

## `src/ui/views/mobileView.js`

**Purpose:** Mobile shell view router/concept marker.

**Owns:** Mobile shell structure and parked mobile workspace routes during desktop-first proof phase.

**Not allowed to:** Redesign mobile CSS without a mobile phase, bind hidden controls, own app/device detection.

**Called by:** `src/ui/dashboard.js`.

**May call:** `src/ui/sections/workspaceResetView.js`.

**Red line:** Mobile can be prepared, but not secretly rewired while desktop behaviour is still parked.

## `src/ui/views/dashboardVisualShell.js`

**Purpose:** Single active desktop Dashboard visual shell owner.

**Owns:** Dashboard visual structure, cards, run panels, visual button placement, visual shell markers.

**Not allowed to:** Run live Dashboard actions, call Game Brain runtime as a command, bind DIFF+ handlers, export/import, mutate storage.

**Called by:** `src/ui/views/desktopView.js`.

**May call:** Formatting/HTML escaping helpers only and read state passed into it.

**Red line:** The Dashboard look can stay; live wiring must be reconnected later through actions/events, not inside this file.

## `src/ui/sections/workspaceResetView.js`

**Purpose:** Reusable parked workspace shell/card builder.

**Owns:** Visual placeholder cards, parked action buttons, parked route buttons.

**Not allowed to:** Own real workspace behaviour, bind click events, mutate state/storage.

**Called by:** `src/ui/views/desktopView.js`, `src/ui/views/mobileView.js`.

**May call:** HTML escape helpers.

**Red line:** It may show buttons, but it must never make those buttons work.

## `src/ui/render.js`

**Purpose:** Compatibility loader for the new app render owner.

**Not allowed to:** Recreate a second render pipeline.

**Calls:** `src/app/render.js`.

**Called by:** Older imports/tests.

**Red line:** Must remain a thin wrapper.

---

# UI event foundation

## `src/ui/events.js`

**Purpose:** Compatibility loader for modular UI events.

**Not allowed to:** Become a giant event file again.

**Calls:** `src/ui/events/index.js`.

**Called by:** Legacy imports/tests/startup.

**Red line:** No new event logic here.

## `src/ui/events/index.js`

**Purpose:** One browser listener owner that delegates to modular shell handlers.

**Owns:** Binding the document-level shell click/keydown listeners and exposing shell event status.

**Not allowed to:** Perform real workspace actions, mutate storage directly, render HTML directly, parse reports.

**Called by:** `src/app/init.js`.

**May call:** `tabEvents.js`, `mobileShellEvents.js`, `parkedActionEvents.js`, event status modules.

**Red line:** One listener owner, many small handlers. Do not attach duplicate document click owners elsewhere.

## `src/ui/events/shellEventUtils.js`

**Purpose:** Shared helpers for shell event modules.

**Owns:** Event consumption, nearest-enabled element lookup, action label normalisation.

**Not allowed to:** Know about specific workspace business logic, state mutations, storage writes.

**Called by:** `src/ui/events/*` modules.

**May call:** Nothing feature-specific.

**Red line:** Pure UI helper only.

## `src/ui/events/tabEvents.js`

**Purpose:** Owns top-nav/workspace tab click routing during shell phase.

**Owns:** `[data-dashboard-tab]` click handling and routing to app tab owner.

**Not allowed to:** Render full views itself, mutate unrelated state, run workspace actions.

**Called by:** `src/ui/events/index.js`.

**May call:** `src/app/tabs.js` and render callback supplied by context.

**Red line:** Tab buttons only.

## `src/ui/events/parkedActionEvents.js`

**Purpose:** Owns parked-button feedback while real actions are disconnected.

**Owns:** Parked action selector handling, parked toast, parked status.

**Not allowed to:** Perform real save/validate/import/export/history actions.

**Called by:** `src/ui/events/index.js`.

**May call:** `shellEventUtils.js`.

**Red line:** If a button becomes real, move it out of parked handling into its workspace event module.

## `src/ui/events/mobileShellEvents.js`

**Purpose:** Minimal mobile shell open/close and route handling.

**Owns:** Mobile shell open/close classes and basic mobile route commands during shell phase.

**Not allowed to:** Rebuild mobile real actions, duplicate desktop actions, mutate storage.

**Called by:** `src/ui/events/index.js`.

**May call:** `tabEvents.js` for mobile route-to-tab.

**Red line:** Mobile shell only until the mobile phase.

## `src/ui/events/dashboardEvents.js`

**Purpose:** Parked future home for Dashboard-specific events.

**Owns now:** Status contract only.

**Not allowed to:** Bind real Dashboard DIFF+/Game Brain/actions before Dashboard rewire phase.

**Called by:** `src/ui/events/index.js` for status.

**May call now:** Nothing active beyond status helpers.

**Red line:** Dashboard real actions later route to `src/actions/dashboardActions.js`, not direct state/storage from here.

## `src/ui/events/commandDeckEvents.js`

**Purpose:** Parked future home for Command Deck-specific UI events.

**Owns now:** Status contract only.

**Not allowed to:** Reconnect save/validate/clear/import/export until Command Deck rewire phase.

**Called by:** `src/ui/events/index.js` for status.

**May call later:** `src/actions/commandDeckActions.js` and `src/actions/importExportActions.js`.

**Red line:** Must not call parser/storage directly when rewired.

## `src/ui/events/historyEvents.js`

**Purpose:** Parked future home for History-specific UI events.

**Owns now:** Status contract only.

**Not allowed to:** Reconnect cards/search/modals/import/export until History rewire phase.

**Called by:** `src/ui/events/index.js` for status.

**May call later:** `src/actions/historyActions.js`, `src/actions/importExportActions.js`.

**Red line:** History events must not become another all-purpose event file.

## `src/ui/events/importExportEvents.js`

**Purpose:** Parked future home for browser file picker/download UI events.

**Owns now:** Status contract only.

**Not allowed to:** Own storage schema or JSON shape. That belongs in `src/storage/importStore.js` and `src/storage/exportStore.js`.

**Called by:** `src/ui/events/index.js` for status.

**May call later:** `src/actions/importExportActions.js`.

**Red line:** Browser I/O trigger only; data building belongs in storage/actions.

---

# Core state and core events

## `src/core/state.js`

**Purpose:** State shape and state mutation rules.

**Owns:** App state structure, hydration, Run A/B distinctness, History filter mode preservation.

**Not allowed to:** Attach DOM listeners, perform downloads, read raw file inputs, format visual HTML.

**Called by:** app/actions/storage/selectors/tests.

**May call:** Pure helpers only.

**Red line:** Core state protects data shape; UI behaviour must not leak in.

## `src/core/events.js`

**Purpose:** Compatibility loader for the no-DOM core event bus.

**Not allowed to:** Recreate old core DOM bridge behaviour.

**Calls:** `src/core/events/index.js`.

**Called by:** Legacy imports/tests.

**Red line:** Must remain no-DOM and thin.

## `src/core/events/index.js`

**Purpose:** Lightweight no-DOM domain signal bus.

**Owns:** Future state/storage/history/run-slot signal contracts and status.

**Not allowed to:** Touch DOM, attach browser listeners, render HTML, download files.

**Called by:** Future actions/core modules.

**May call:** Specific core event modules for status/contracts.

**Red line:** Domain signals only; browser events belong in `src/ui/events/`.

## `src/core/events/stateEvents.js`

**Purpose:** Future state-change signal contract.

**Owns now:** Status/contract definition only.

**Not allowed to:** Mutate state independently of `src/core/state.js`.

**Called by:** `src/core/events/index.js`.

**May call:** No DOM.

**Red line:** Signal contract, not a second state owner.

## `src/core/events/historyStateEvents.js`

**Purpose:** Future History state signal contract.

**Owns now:** Status/contract definition only.

**Not allowed to:** Own History UI clicks or search inputs.

**Called by:** `src/core/events/index.js`.

**May call:** No DOM.

**Red line:** History state signals only.

## `src/core/events/runSlotEvents.js`

**Purpose:** Future Run A/B slot signal contract.

**Owns now:** Status/contract definition only.

**Not allowed to:** Own Run A/B UI button clicks or storage schema.

**Called by:** `src/core/events/index.js`.

**May call:** No DOM.

**Red line:** Run slot signals only; state rules stay in `src/core/state.js`.

## `src/core/events/storageEvents.js`

**Purpose:** Future storage signal contract.

**Owns now:** Status/contract definition only.

**Not allowed to:** Own localStorage keys or import/export JSON shape.

**Called by:** `src/core/events/index.js`.

**May call:** No DOM.

**Red line:** Storage events are signals, not storage implementation.

---

# Storage foundation

## `src/storage/localStore.js`

**Purpose:** Public storage compatibility wrapper.

**Owns:** Backwards-compatible API for older callers, delegating actual storage work to focused modules.

**Not allowed to:** Become the only giant storage file again, bind UI events, build HTML, parse report text.

**Called by:** `src/app/init.js`, actions, tests, older imports.

**May call:** `storageKeys.js`, `storageUtils.js`, `historyStore.js`, `runSlotStore.js`, `importStore.js`, `exportStore.js`.

**Red line:** Public wrapper, not dumping ground.

## `src/storage/storageKeys.js`

**Purpose:** Single owner for localStorage key names.

**Owns:** Primary, backup, legacy, and related storage key constants.

**Not allowed to:** Read/write storage, mutate state, import UI.

**Called by:** Storage modules.

**May call:** Nothing active.

**Red line:** No localStorage operation here; keys only.

## `src/storage/storageUtils.js`

**Purpose:** Shared storage utility helpers.

**Owns:** Safe JSON parse/stringify, browser storage availability checks, cloning/normalisation helpers where needed.

**Not allowed to:** Own app-specific storage schema, UI events, or actions.

**Called by:** Storage modules.

**May call:** Pure helpers only.

**Red line:** Utilities must stay generic.

## `src/storage/historyStore.js`

**Purpose:** Saved History read/write and candidate normalisation owner.

**Owns:** History entries from state/storage, backup/legacy candidate handling, History data compatibility.

**Not allowed to:** Render History cards, bind History buttons, parse raw Battle Report text.

**Called by:** `localStore.js`, future `historyActions.js`.

**May call:** `storageKeys.js`, `storageUtils.js`.

**Red line:** Storage shape only; UI History behaviour belongs elsewhere.

## `src/storage/runSlotStore.js`

**Purpose:** Run A/B saved values and slot persistence helper.

**Owns:** Run slot persistence compatibility and duplicate-slot cleanup support.

**Not allowed to:** Bind Set A/B buttons or render Dashboard.

**Called by:** `localStore.js`, future run-slot/history actions.

**May call:** `storageUtils.js` and state-safe helpers.

**Red line:** Slot storage helper, not UI slot owner.

## `src/storage/importStore.js`

**Purpose:** Import JSON text/data conversion and validation foundation.

**Owns:** Safe imported JSON parsing and import payload shape preparation.

**Not allowed to:** Open browser file picker, bind input change events, decide UI toasts.

**Called by:** `localStore.js`, future `importExportActions.js`.

**May call:** `storageUtils.js`, storage contract helpers.

**Red line:** Browser file selection belongs in UI events; import data handling belongs here.

## `src/storage/exportStore.js`

**Purpose:** Export payload building foundation.

**Owns:** Deciding export source payload from state/storage candidates and producing exportable JSON data.

**Not allowed to:** Click download links, create UI buttons, attach events.

**Called by:** `localStore.js`, future `importExportActions.js`.

**May call:** `historyStore.js`, `runSlotStore.js`, `storageUtils.js`.

**Red line:** Builds data only; browser download trigger belongs in UI/actions.

---

# Action foundation

## `src/actions/actions.js`

**Purpose:** Public compatibility loader for the new modular action API.

**Not allowed to:** Become the giant action bus again.

**Calls:** `src/actions/index.js`.

**Called by:** Legacy imports/tests/console snippets.

**Red line:** Thin wrapper only.

## `src/actions/index.js`

**Purpose:** Main public action API and dispatcher.

**Owns:** Action exports, compatibility aliases, `performUIAction()` dispatch, global `TowerBattleIntelActions` installation.

**Not allowed to:** Listen to DOM events, build HTML, own storage keys, parse by itself.

**Called by:** UI event modules later, compatibility wrapper/tests/console.

**May call:** Focused action modules only.

**Red line:** Dispatch to owners; do not re-centralise full behaviour here.

## `src/actions/actionUtils.js`

**Purpose:** Shared action helpers.

**Owns:** Action key normalisation, global bridge installer, action foundation constants.

**Not allowed to:** Run workspace commands, mutate state directly, access DOM controls directly except for installing the explicit global action API.

**Called by:** `src/actions/index.js` and action modules.

**May call:** Pure helpers.

**Red line:** Utility helper only.

## `src/actions/appActions.js`

**Purpose:** App-level commands.

**Owns:** Reset/clear-runs/tab-selection/build-style style commands that are not workspace-specific.

**Not allowed to:** Bind clicks, render HTML, own import/export JSON, parse Battle Reports.

**Called by:** `src/actions/index.js`.

**May call:** `src/core/state.js`, app tab helpers where appropriate.

**Red line:** App commands only.

## `src/actions/commandDeckActions.js`

**Purpose:** Command Deck command home.

**Owns:** Future validate/save/save+dashboard/clear input action flow and input resolution helpers.

**Not allowed to:** Bind textarea/button events, own visual Command Deck HTML, own localStorage keys directly.

**Called by:** `src/actions/index.js`; later `src/ui/events/commandDeckEvents.js`.

**May call:** `commandDeckReportActions.js`, parser/pipeline via action flow, state/storage via proper modules.

**Red line:** UI events tell it what to do; it does not listen to UI itself.

## `src/actions/commandDeckReportActions.js`

**Purpose:** Existing Command Deck report-intake internals kept for future reconnect.

**Owns:** Report parse/save internals from earlier working Command Deck stack until replaced or integrated.

**Not allowed to:** Bind new browser events or become a second Command Deck UI owner.

**Called by:** `src/actions/commandDeckActions.js` when reconnected.

**May call:** Parser/pipeline/state/storage helpers as needed by report intake.

**Red line:** Internal engine only; public Command Deck actions go through `commandDeckActions.js`.

## `src/actions/historyActions.js`

**Purpose:** History command home.

**Owns:** Future load run, swap slots, archive/restore/delete, clear history, filters, metadata update commands.

**Not allowed to:** Bind History card clicks/search inputs, render cards/modals, own export downloads.

**Called by:** `src/actions/index.js`; later `src/ui/events/historyEvents.js`.

**May call:** `src/core/state.js`, `src/storage/historyStore.js`, `src/storage/runSlotStore.js`.

**Red line:** History commands only; UI stays in events/views.

## `src/actions/importExportActions.js`

**Purpose:** Import/export command home.

**Owns:** Future action flow for import text and export History JSON.

**Not allowed to:** Own raw storage keys, parse Battle Reports, bind file input changes directly, render UI.

**Called by:** `src/actions/index.js`; later `src/ui/events/importExportEvents.js`, Command Deck/History actions where appropriate.

**May call:** `src/storage/importStore.js`, `src/storage/exportStore.js`, `src/storage/localStore.js`.

**Red line:** It coordinates import/export; data shape lives in storage, browser click trigger lives in UI events.

## `src/actions/parkedActions.js`

**Purpose:** Action-layer parked response helpers.

**Owns:** Safe parked-action responses/status while UI remains shell-only.

**Not allowed to:** Perform real workspace commands.

**Called by:** `src/actions/index.js`, tests/console.

**May call:** Nothing feature-specific.

**Red line:** Parked means parked. No hidden side effects.

---

# Tests added during this rebuild chain

## `tests/v4.11z52w8-bones-contract.test.mjs`

**Purpose:** Proves the bones contract: parser/compute shape, game catalogue JSON, state/localStore mode persistence, saved history shape, Run A/B cleanup, Normal vs Deep History search.

**Not allowed to:** Depend on visual layout details.

## `tests/v4.11z52w9-ui-shell-reset.test.mjs`

**Purpose:** Proves UI shells are parked and old active workspace wiring is disconnected.

**Not allowed to:** Require real workspace actions to run.

## `tests/v4.11z52w10-event-module-foundation.test.mjs`

**Purpose:** Proves modular UI/core event foundations exist and old giant event ownership is not active.

**Not allowed to:** Reconnect real Command Deck/History actions.

## `tests/v4.11z52w11-app-render-tabs-foundation.test.mjs`

**Purpose:** Proves app startup/render/tabs/version ownership files exist and compatibility loaders delegate.

**Not allowed to:** Require real workspace behaviour.

## `tests/v4.11z52w12-storage-import-export-foundation.test.mjs`

**Purpose:** Proves storage modules exist, index is entry shell only, favicon fix exists, `localStore.js` remains public wrapper, and saved data compatibility remains protected.

**Not allowed to:** Trigger browser file picker/download UI.

## `tests/v4.11z52w13-actions-module-foundation.test.mjs`

**Purpose:** Proves action modules exist, `actions.js` is a compatibility loader, and real UI actions remain parked.

**Not allowed to:** Require real UI button behaviour.

## `tests/v4.11z52w13a-architecture-rulebook.test.mjs`

**Purpose:** Proves this rulebook exists and catalogues the rebuilt foundation layers/files.

**Not allowed to:** Validate implementation logic beyond rulebook coverage.

---

# Compatibility wrappers currently allowed

These wrappers are allowed only because they protect old imports while the rebuild progresses:

```text
bootstrap.js
src/ui/render.js
src/ui/events.js
src/core/events.js
src/storage/localStore.js
src/actions/actions.js
```

They must stay thin. If any compatibility wrapper starts growing real feature logic, that is a rebuild failure.

---

# Phase checklist

Before packaging a future build:

- [ ] Every new/rebuilt/ownership-changing file has an entry in this rulebook.
- [ ] Each entry states purpose, not allowed, called by, may call, and red line.
- [ ] No file owns another layer's job.
- [ ] Compatibility wrappers remain thin.
- [ ] Tests cover the ownership change.
- [ ] Saved data compatibility is protected.
- [ ] Mobile CSS/modules are changed only in a declared mobile phase.
- [ ] Dashboard visual result is not redesigned unless Andrew explicitly asks.

## `src/ui/sections/commandDeckView.js`

**Purpose:** Active Command Deck workspace view.

**Owns:** Command Deck visual layout, report intake textarea, build-style select, action button placement, current data/readiness side cards, and the in-page result shell markup.

**Not allowed to:** Attach click handlers, read files directly, trigger downloads directly, mutate state/storage, or parse reports.

**Called by:** `src/ui/views/desktopView.js`.

**May call:** Pure formatting/escape helpers and parked shell builders only.

**Red line:** This file defines what Command Deck looks like. It does not own how Command Deck behaves.

## `src/ui/events/commandDeckEvents.js`

**Purpose:** Single browser event owner for the rewired Command Deck workspace.

**Owns:** Delegated click handling for Command Deck buttons, delegated draft-input tracking for the report textarea, delegated build-style changes, and browser-only file import/export picker/download triggers for Command Deck controls.

**Not allowed to:** Parse reports directly, own storage schema, render HTML, or silently mutate unrelated workspace state.

**Called by:** `src/ui/events/index.js`.

**May call:** `src/actions/index.js` command/app/import-export actions and shared UI event helpers.

**Red line:** This is the one active event owner for Command Deck controls. Do not add backup/parallel listeners elsewhere.

## `src/actions/commandDeckActions.js`

**Purpose:** Active Command Deck action home.

**Owns:** Command Deck action exports, parser-entry command bridge, draft persistence helpers, and Command Deck feedback state helpers.

**Not allowed to:** Attach DOM listeners, compose Command Deck HTML, or own raw localStorage keys.

**Called by:** `src/actions/index.js`, `src/ui/events/commandDeckEvents.js`.

**May call:** `src/actions/commandDeckReportActions.js`, `src/core/update.js`, `src/core/state.js`, action utility helpers.

**Red line:** Keep Command Deck commands here. If another workspace needs report-intake logic, route into this file instead of duplicating it.


---

# Raw archive storage foundation — `v4.11z52w15`

## `src/storage/rawReportArchiveStore.js`

**Purpose:** Source-of-truth raw Battle Report archive contract.

**Owns:** Stable report ID generation, raw text normalisation, raw fingerprinting, raw archive records, user metadata shape, archive summaries, and raw archive de-duplication.

**Not allowed to:** Render History UI, attach browser file picker/download events, parse reports into full Game Brain output, or mutate app state directly.

**Called by:** `src/core/update.js`, `src/storage/localStore.js`, tests, and future raw import/export/archive actions.

**May call:** Pure History metadata normalisers from `src/storage/historyStore.js`.

**Red line:** Raw report text is truth. This file must never throw away raw text or create duplicate records for the same report ID/fingerprint.

## `src/core/update.js` — raw archive identity update

**Purpose:** Parse pasted report text into computed runs and now attach raw archive identity metadata to each new saved report.

**Owns:** Ensuring every newly parsed/saved report has raw text, stable report ID, raw fingerprint, and raw archive schema/version metadata.

**Not allowed to:** Own raw archive import/export files, History paging, or History edit metadata UI.

**Called by:** Command Deck report actions and lower-level update callers.

**May call:** Parser/compute pipeline, History push helpers, raw archive metadata helper, analysis refresh.

**Red line:** New saved reports must keep original raw report text when available.

## `src/storage/localStore.js` — raw archive persistence update

**Purpose:** Compatibility storage front door that now persists a `rawArchive` section beside the existing app state.

**Owns:** Merging existing raw archive records with raw records recoverable from History/Run A/Run B/currentRun during save/load.

**Not allowed to:** Shrink/delete full parsed History records yet, render UI, parse raw reports, or own browser import/export button behaviour.

**Called by:** App startup, actions, core refresh, tests.

**May call:** `rawReportArchiveStore.js`, existing storage key/utils/history/run-slot/import/export modules.

**Red line:** This phase is non-destructive. It may add raw archive data, but it must not remove old parsed data yet.

## `src/storage/historyStore.js` — duplicate-aware normalisation update

**Purpose:** Persisted History normalisation now also blocks duplicate report records by `reportId`, fingerprint, or fallback run key.

**Owns:** Tags, notes, build style, archive metadata, History filter shape, and storage-level History de-duplication.

**Not allowed to:** Own visible History edit UI, paging UI, file imports, or raw archive rehydration.

**Called by:** `localStore.js`, export candidate selection, tests.

**May call:** Pure local helpers only.

**Red line:** History must not store two records for the same report identity.

## `src/storage/runSlotStore.js` — fingerprint guard update

**Purpose:** Persisted Run A/Run B slot guard now treats matching report ID or matching fingerprint as the same report.

**Owns:** Cleaning/guarding impossible duplicate comparison slot state during storage normalisation.

**Not allowed to:** Decide UI feedback, render Dashboard/Compare, or choose which report the user meant.

**Called by:** `localStore.js`.

**May call:** Pure local helpers only.

**Red line:** Compare storage must never preserve Run A and Run B as the same report.


---

# Command Deck raw archive rewire — `v4.11z52w16`

## `src/actions/commandDeckRawIntake.js`

**Purpose:** Pure Command Deck raw intake planner. It separates pasted Battle Reports into new source records, duplicate source records, and invalid raw chunks before parser/History cache work starts.

**Owns:** Command Deck raw-intake planning, stable report ID candidate lists, fingerprint duplicate checks against existing raw archive/History/run slots, and batch new-vs-duplicate splitting.

**Not allowed to:** Touch the DOM, render Command Deck, save localStorage directly, mutate app state directly, or parse reports into full History runs.

**Called by:** `src/actions/commandDeckReportActions.js` and tests.

**May call:** `src/utils/reportSplitter.js` and `src/storage/rawReportArchiveStore.js`.

**Red line:** Command Deck must check the raw archive plan before parser/History cache writes. Do not let another bridge bypass this duplicate check for Command Deck save.

## `src/actions/commandDeckReportActions.js` — raw archive rewire

**Purpose:** Command Deck save/validate/clear feedback owner now uses the raw-intake plan first, saves new raw records into state, then asks the existing parser/update pipeline to rebuild active History cache from new raw text only.

**Owns:** Visible Command Deck report action behaviour, in-page feedback, save/duplicate messages, input draft handling, and the Command Deck raw archive to parser/History action sequence.

**Not allowed to:** Bind browser click/input listeners, render Command Deck layout, mutate Dashboard visuals, change mobile CSS, or create a second storage key.

**Called by:** `src/actions/commandDeckActions.js` through the public action API.

**May call:** `commandDeckRawIntake.js`, `core/update.js`, `core/state.js`, `core/history.js`, parser feedback helpers, and `localStore.js` persistence.

**Red line:** Save Report must not parse/save duplicate raw reports again. New raw source records are archived first; parsed History remains rebuildable cache.

---

# History raw archive controls rewire — `v4.11z52w17`

## `src/ui/events/historyEvents.js`

**Purpose:** Active browser event owner for the desktop History workspace controls.

**Owns:** History card Run A/Run B loading, Normal/Deep search input, History filters, archive/restore/delete controls, Stats/Edit modal controls, and History import/export button clicks.

**Not allowed to:** Parse Battle Reports, mutate storage directly, render Dashboard visuals, touch mobile CSS, or bypass `actions/historyActions.js` and `actions/importExportActions.js` for state changes.

**Called by:** `src/ui/events/index.js` through the one-document-listener event foundation.

**May call:** Public action API, History modal builders, pure History filter helpers, and local browser file/download helpers for History JSON only.

**Red line:** History controls must be handled before the parked fallback owner. Do not reintroduce legacy global/bridge click handlers for the same buttons.

## `src/actions/historyActions.js` — raw archive metadata sync

**Purpose:** History domain action owner now also mirrors History user metadata into matching raw archive records.

**Owns:** History Run A/B loading, filter state, archive/restore/delete parsed cache actions, metadata updates, and raw archive user metadata sync.

**Not allowed to:** Bind browser events, render History, parse raw Battle Reports, or delete raw source records during parsed History cache deletes.

**Called by:** `src/ui/events/historyEvents.js` and the public action API.

**May call:** `core/history.js`, `core/update.js`, `storage/rawReportArchiveStore.js`, and persistence helpers.

**Red line:** Editing/archive/restore of a History run must not leave the matching raw archive `userMeta` stale.

## `src/storage/rawReportArchiveStore.js` — user metadata patch helper

**Purpose:** Adds `patchRawReportRecordUserMeta()` so History can update source-record metadata without owning the whole raw archive store.

**Owns:** Matching raw records by report ID/fingerprint and normalising the raw archive `userMeta` shape.

**Not allowed to:** Decide UI behaviour, render History, parse full reports, or choose whether a user action should happen.

**Called by:** `src/actions/historyActions.js` and tests.

**May call:** Existing raw archive normalisation helpers.

**Red line:** Raw report text remains the source of truth and must not be changed by metadata patching.

## `src/actions/importExportActions.js` — raw archive payload carry-through

**Purpose:** History export/import now carries the raw archive section alongside parsed History cache where available.

**Owns:** Action-level History JSON export payload creation and import-time raw archive merging.

**Not allowed to:** Own browser file picker styling, render feedback UI, parse pasted Battle Reports, or mutate Dashboard/mobile state.

**Called by:** History/Command Deck event owners through the public action API.

**May call:** Import/export storage helpers, raw archive merge helpers, core History import, and persistence.

**Red line:** History export must not drop `rawArchive` once raw source records exist.

# History view rebuild — `v4.11z52w18`

## `src/ui/sections/historyView.js`

**Purpose:** Thin compatibility wrapper for the rebuilt modular History view.

**Owns:** Preserving the old import path for `buildHistoryView`.

**Not allowed to:** Grow layout logic, bind events, own History actions, or mutate state.

**Calls:** `src/ui/sections/history/historyView.js`.

**Red line:** Keep this wrapper thin; real History UI belongs in the `src/ui/sections/history/` folder.

## `src/ui/sections/history/`

**Purpose:** Modular desktop History report-management view.

**Owns:** History header, toolbar, saved report card list, report cards, selected report inspector, empty state, modal mount points, and shared view formatting helpers.

**Not allowed to:** Bind browser events, mutate app state, save localStorage, parse raw Battle Reports, or download/import files directly.

**Called by:** `src/ui/sections/historyView.js`, then `src/ui/views/desktopView.js`.

**May call:** Pure History filter helpers, History Game Brain summary helpers, shared UI formatters.

**Red line:** History visual components emit data attributes only. Real commands stay in `src/ui/events/historyEvents.js` and `src/actions/historyActions.js`.

## `styles/desktop/04-history-rebuild.css`

**Purpose:** Scoped visual styling for the w18 History rebuild.

**Owns:** `.tbi-history2*` classes only.

**Not allowed to:** Change Dashboard, Command Deck, mobile, or non-History workspace visuals.

**Called by:** `desktop.css`.

**Red line:** Do not use this file as a general desktop override sheet.

## `src/ui/views/desktopView.js` update

**Purpose:** Desktop History panel now mounts the real rebuilt History view instead of the parked History shell.

**Owns:** View composition only.

**Not allowed to:** Own History buttons, filters, import/export, or metadata actions.

**Red line:** Mounting a view is allowed; action ownership must remain outside `desktopView.js`.


# Rebuild wiring completion — `v4.11z52w19`

## `src/ui/events/importExportEvents.js` — shared active browser import/export owner

**Purpose:** Finishes the current desktop rebuild wiring by making History JSON browser import/export one shared active owner instead of duplicated Command Deck and History helper code.

**Owns:** History JSON file picker creation, browser download creation, rawArchive-aware import/export action calls, and shared feedback wording for Command Deck and History import/export buttons.

**Not allowed to:** Decide Command Deck layout, decide History card layout, parse pasted Battle Reports directly, mutate Dashboard/mobile UI, or bypass `src/actions/importExportActions.js`.

**Called by:** `src/ui/events/commandDeckEvents.js` and `src/ui/events/historyEvents.js` after those workspace owners identify their own visible buttons.

**May call:** Public action API from `src/actions/index.js` and browser-only download/file APIs.

**Red line:** Command Deck and History may delegate browser import/export IO here, but they must not each grow separate hidden file picker/download implementations again.

## `src/ui/events/commandDeckEvents.js` and `src/ui/events/historyEvents.js` update

**Purpose:** Keep workspace-specific event ownership while delegating shared JSON import/export browser IO to `importExportEvents.js`.

**Owns:** Workspace button identification, input ownership, modal/card/filter controls, and render refresh after actions.

**Not allowed to:** Recreate local duplicate `pickHistoryFileText()` or History export download helpers.

**Red line:** Rebuilt active handlers must run before parked fallback handlers; old global/bridge handlers must not retake Command Deck or History buttons.

## Rebuild completion policy before clutter cleanup

**Purpose:** Finish and prove active wiring first, then remove old clutter later in a separate cleanup pass.

**Owns:** Current phase order: active workspace routes, new event handlers, action calls, storage/raw archive path, and import/export payload path must work before legacy deletion.

**Not allowed to:** Delete parked/reference/compatibility files blindly while active routes are still being proven.

**Red line:** Clutter cleanup comes after the rebuilt Command Deck + History + raw archive spine is verified end-to-end.


# Active path verification — `v4.11z52w20`

## Phase policy

**Purpose:** Prove the rebuilt Command Deck + raw archive + History + import/export path is actually the active desktop path before any legacy clutter deletion.

**Owns:** Verification of active workspace routes, event-handler order, action ownership, export version metadata, raw archive carry-through, and deliberately parked workspace status.

**Not allowed to:** Delete old/legacy files, rebuild Compare/Coach/Systems/Anomalies/Settings, redesign Dashboard, or touch mobile CSS/modules.

**Red line:** Clutter cleanup must wait until active-path tests confirm the rebuilt handlers and imports are the browser-facing route.

## Active desktop routes verified

- `Command Deck` → `src/ui/sections/commandDeckView.js` plus `src/ui/events/commandDeckEvents.js`.
- `History` → `src/ui/sections/history/historyView.js` through the thin `src/ui/sections/historyView.js` wrapper, plus `src/ui/events/historyEvents.js`.
- `Dashboard` → protected `src/ui/views/dashboardVisualShell.js`.
- `Compare`, `Coach`, `Systems`, `Anomalies`, and `Settings` → deliberate `src/ui/sections/workspaceResetView.js` parked shells.

## Import/export active owner verified

`src/ui/events/importExportEvents.js` remains the shared browser owner for History JSON file picker/download behaviour.

`src/actions/importExportActions.js` remains the payload/action owner and must export the current action/build checkpoint version so saved JSON does not carry stale build metadata.

## Test owner

`tests/v4.11z52w20-active-path-verification.test.mjs` proves that the real desktop routes, event imports/order, action status, raw archive save path, Run A/B duplicate guard, and export metadata are aligned before cleanup starts.


# Hard event-owner rebuild — `v4.11z52w24`

## Phase policy

**Purpose:** Remove the old active handler chain that allowed broad parked catch-all selectors to swallow rebuilt Command Deck and History buttons. The active desktop route now has one top-nav owner and one rebuilt workspace owner.

**Owns:** Active event root cleanup, Command Deck/History browser event routing, removed parked catch-all policy, and current build verification after Andrew reported that only the top navigation worked.

**Not allowed to:** Reintroduce `data-ui-action` catch-all parked handlers, route real Command Deck/History buttons through old per-workspace handler files, or mark broken active buttons as merely parked.

**Red line:** The old parked catch-all is not allowed back into the active event chain.

## `src/ui/events/index.js` update

**Purpose:** One browser listener set for the current app shell. It calls `tabEvents.js` for top navigation and `workspaceEvents.js` for rebuilt Command Deck/History controls.

**Owns:** Document click/change/input/keydown listener binding, handler order, event status, and runtime event markers.

**Not allowed to:** Own report parsing, raw archive writes, History metadata, browser file parsing, or visual HTML.

**Called by:** `src/app/init.js` through `bindUIEvents()`.

**May call:** `src/ui/events/tabEvents.js`, `src/ui/events/mobileShellEvents.js`, `src/ui/events/workspaceEvents.js`, and `src/ui/events/importExportEvents.js` status helpers.

**Red line:** `handleParkedActionClick` and any broad `[data-ui-action]` parked fallback must not be re-added.

## `src/ui/events/workspaceEvents.js`

**Purpose:** New single active desktop workspace event owner for rebuilt Command Deck and rebuilt History. It replaces the old separate `commandDeckEvents.js`, `historyEvents.js`, and parked catch-all chain.

**Owns:** Command Deck clicks/input/change, History cards/search/filter/modals, Run A/B loading from History, and delegation to the shared import/export browser helper.

**Not allowed to:** Parse reports directly, mutate localStorage directly, build workspace HTML, own Dashboard visual shell buttons, or touch mobile-specific behaviour.

**Called by:** `src/ui/events/index.js` only.

**May call:** Public action API from `src/actions/index.js`, `src/history/historyFilters.js`, History modal layout builders, and `src/ui/events/importExportEvents.js` for file picker/download helpers.

**Red line:** If a Command Deck or History button does not match here, it must fail visibly in tests; it must not fall through to an old parked handler.

## Removed active handler files

The following old handler/parked files were removed from the project in `v4.11z52w24`:

- `src/ui/events/parkedActionEvents.js`
- `src/ui/events/dashboardEvents.js`
- `src/ui/events/commandDeckEvents.js`
- `src/ui/events/historyEvents.js`
- `src/actions/parkedActions.js`

**Purpose:** Stop old/fallback event ownership from existing beside the rebuilt active owner.

**Not allowed to:** Return as compatibility shims or hidden fallback handlers.

**Called by:** Nobody; these paths are intentionally gone.

**May call:** Nothing.

**Red line:** Do not recreate these files unless the RULE book is changed first and Andrew explicitly asks for a separated event owner again.

## Inactive visual action attributes update

`data-dashboard-button-parked` and `data-ui-shell-action` were removed from current UI builders. Inactive parked/rebuild buttons now use neutral inactive markers such as `data-workspace-action-inactive` or `data-dashboard-action-inactive` without a click-catching fallback.

**Purpose:** Keep unfinished tabs and protected Dashboard buttons visually present without letting a hidden parked event layer consume real rebuilt actions.

**Red line:** Inactive markers are labels only; they must not become another global click owner.

---

# Browser click truth probe — `v4.11z52w24`

## Why this phase exists

Andrew tested `v4.11z52w21` in local Chrome and reported that only the top navigation worked. That means source-level active-path checks were not enough. The browser must visibly show whether a click reaches the rebuilt event owner, whether the correct handler catches it, whether an action runs, whether render follows, and whether a runtime error is thrown.

## `src/ui/events/browserClickTruthProbe.js`

**For:** temporary browser-visible click/action/render/error proof during the rebuild. It owns the fixed `Click Truth Probe` strip and `window.TowerBattleIntelClickTruth.status()`.

**Not allowed to:** mutate History, Command Deck, raw archive, parser state, Run A/B state, Dashboard state, or storage. It may only observe/report event outcomes.

**May be called by:** `src/ui/events/index.js` and browser console helpers.

**May call:** DOM APIs for its own probe panel only.

**Red line:** this is not a replacement Debug UI and must not become a second diagnostics system. Remove or hide it after browser click ownership is proven.

## `src/ui/events/index.js` capture owner update

**For:** active shell event ownership now binds click/pointer/change/input/keydown at capture phase so rebuilt events are seen before any old bubble-phase code can swallow them.

**Not allowed to:** own Command Deck or History business logic. It routes to the single active event owner modules and records proof/error status.

**May call:** `tabEvents.js`, `mobileShellEvents.js`, `workspaceEvents.js`, `importExportEvents.js` status helpers, and `browserClickTruthProbe.js`.

**Red line:** no old parked catch-all handler may be reintroduced into this event root.

## `src/ui/events/workspaceEvents.js` w22 fallback update

**For:** single active desktop workspace owner for Command Deck and History. In w22 it also has a small known-action fallback for Command Deck buttons so `save-report`, `validate-report`, `save-load-dashboard`, `clear-input`, `open-dashboard`, `open-history`, `open-compare`, `import-history`, and `export-history` can be caught even if the Command root selector misses.

**Not allowed to:** handle parked Compare/Coach/Systems/Anomalies/Settings features, or own Dashboard visual actions.

**Red line:** this fallback is only for current rebuilt Command Deck actions. Do not turn it into a new global catch-all.


## v4.11z52w24 Tab Router Safety Rule

`data-dashboard-tab` may exist on `<html>` and `<body>` as passive runtime state. Tab routing must never use a broad `closest("[data-dashboard-tab]")` selector because it allows any workspace button to climb to the body and be swallowed by `tabEvents`.

Tab navigation may only be handled from explicit interactive triggers such as `button[data-dashboard-tab]`, `a[data-dashboard-tab]`, `[role="button"][data-dashboard-tab]`, or `[role="tab"][data-dashboard-tab]`. Workspace actions using `data-ui-action` must be allowed to reach `workspaceEvents.js`.

---

## v4.11z52w24 History Stats Modal Ownership

History Stats is now owned by the rebuilt History section folder, not the old layout modal path.

**Active owner:** `src/ui/sections/history/historyStatsModal.js`

**Old active path removed:** `src/ui/layouts/historyStatsModal.js`

**CSS owner:** `styles/desktop/04-history-stats-modal.css`

**Event owner:** `src/ui/events/workspaceEvents.js` remains the only active desktop workspace event owner. It may open/close the modal and handle the modal's section tabs, search, Set A/B, copy JSON, and download JSON hooks.

**Purpose:** Keep History cards compact while opening a focused rebuilt Run Stats modal with Summary, Sections, and Raw Source tabs, exact Wave digits, raw archive proof, report ID proof, section search, and preserved Run A/B actions.

**Not allowed to:** Reintroduce `src/ui/layouts/historyStatsModal.js`, render the old `.history-stats-modal` / `.history-stats-card.phase3` modal as the active Stats view, or let the Stats button call a second modal owner.

**May call:** `historyShared.js` for History view-model helpers, `historyStats.js` for pure summary/delta scoring helpers, and `src/ui/utils/format.js` for labels/deltas.

**Red line:** the History Stats button must open only the rebuilt `tbi-history2-stats-modal` route. If old modal classes appear in active Stats output, the build is considered regressed.

---

## v4.11z52w27 History Stats Modal Mount Repair

Andrew tested `v4.11z52w24` and found the rebuilt Run Stats content rendered inline under the History run card / in the page void instead of as a proper modal window. Root cause: the new modal CSS only targeted `html.desktop-polish`, but the current shell adds `device-desktop` / `data-device-mode="desktop"` and does not actively load `desktopPolishGuard.js` during this rebuild phase.

**Active owner:** `styles/desktop/04-history-stats-modal.css`

**For:** ensuring the rebuilt `.tbi-history2-stats-modal` is always a fixed, centred overlay window on desktop whenever the desktop stylesheet is active.

**Not allowed to:** depend only on `html.desktop-polish`, render Stats as inline card content, place Stats under a run card, or require the old `desktopPolishGuard.js` to make the modal become a window.

**Required selector shape:** modal CSS must apply through the current shell markers:

`html.device-desktop` and/or `html[data-device-mode="desktop"]`, with `html.desktop-polish` allowed only as a backwards-compatible extra selector.

**Red line:** if clicking History Stats displays modal content inline in the History page instead of a centred overlay card, the modal mount is considered broken.

## v4.11z52w27 History Stats Modal Ownership Current Marker

The active History Stats modal owner remains `src/ui/sections/history/historyStatsModal.js`; w25 only repairs the mount/styling condition so the rebuilt modal opens as an overlay under the current desktop shell markers.


## v4.11z52w27 Tab Router Safety Rule Current Marker

The explicit tab trigger gate from w23 remains active in w25. `data-dashboard-tab` on `<html>` or `<body>` is passive state only; workspace actions must continue to reach `workspaceEvents.js`.

## v4.11z52w27 — History Stats Modal Control Ownership

The rebuilt History Stats modal is owned by `src/ui/sections/history/historyStatsModal.js` for markup and `src/ui/events/workspaceEvents.js` for active controls.

Modal controls must be routed before broad History card/list controls. This prevents modal buttons from being seen only as generic History clicks.

Owned modal controls:

- `data-history-stats-close` closes the modal/mount directly.
- `data-history-stats-tab` switches Summary / Sections / Raw Source inside the active modal only.
- `data-history-stats-copy` copies the active modal JSON.
- `data-history-stats-download` downloads the active modal JSON.
- `data-global-search-clear="history-stats"` clears the stats-section search inside the active modal.
- `data-history-modal-slot` remains the Run A / Run B modal route and may close/render after loading a slot.

The old `src/ui/layouts/historyStatsModal.js` path remains deleted. Do not reintroduce the old modal owner.

---

## v4.11z52w27 — History Edit Modal Control Ownership

The rebuilt History Edit modal is now owned by the rebuilt History section folder, not the old layouts folder.

**Active owner:** `src/ui/sections/history/historyEditModal.js`

**Old active path removed:** `src/ui/layouts/historyEditModal.js`

**Event owner:** `src/ui/events/workspaceEvents.js`

**For:** editing saved-run metadata from the rebuilt History hub: notes, tags, and build style.

**Not allowed to:** route notes/tags typing through the broad History card/list route, trigger a full History render while the user is typing, clear typed text during focus/input, or let buttons behind the modal receive modal clicks.

**Owned modal controls:**

- `data-history-edit-close` closes only the active Edit modal mount.
- `data-history-edit-save` saves metadata from the active modal root and then closes/renders.
- `data-history-edit-build-choice` changes the active build choice without rendering.
- `data-history-edit-notes` and `data-history-edit-tags` are isolated text fields. Input must be absorbed by the modal route without a broad History render.

**Red line:** if Notes or Tags loses focus, clears text, or bounces the user out while typing, the Edit modal route is considered regressed.


## v4.11z52w28 — History Time/Search/Command Wave Display Repair

- History Stats Summary owns its displayed Game Time and Real Time by reading the preserved parser/core/section time evidence before falling back to computed run time.
- Main History search input must update visible cards in-place and must not call a full render on every typed character, because full render resets focus/caret.
- History Raw Sources wording must distinguish raw Battle Report source records from archived parsed runs. Archived runs are not the same thing as raw archive records.
- Command Deck run labels and feedback must show exact raw wave digits with `Wave ####`, never compact `W7.61K` style output.

## v4.11z52w28 Tab Router Safety Rule

The explicit tab trigger gate remains active. `data-dashboard-tab` on `<html>` or `<body>` is passive runtime state only; workspace controls must never be swallowed by broad tab routing and must continue to reach `workspaceEvents.js`.


## v4.11z52w28 History Stats Modal Ownership

Current ownership marker preserved for v4.11z52w28.


## v4.11z52w28 History Stats Modal Mount Repair

Current ownership marker preserved for v4.11z52w28.


## v4.11z52w28 History Stats Modal Ownership Current Marker

Current ownership marker preserved for v4.11z52w28.


## v4.11z52w28 History Stats Modal Control Ownership

Current ownership marker preserved for v4.11z52w28.


## v4.11z52w28 History Edit Modal Control Ownership

Current ownership marker preserved for v4.11z52w28.


## v4.11z52w30 — Command Deck Panel Hierarchy Ownership

- Command Deck hero owns workflow guidance only. It must not mirror Active Data state rows.
- `Active Data` owns current Run A, Run B, saved report counts, archived count, raw source count, latest saved report, and build style.
- `Intake Health` owns parser/raw archive/history cache/duplicate/storage/import-export status. It must not repeat generic feedback-location text.
- `Report Flow` owns safe route actions after validation/save. Compare must stay hidden here while Compare is parked.
- History owns stats, edit, archive, delete, and Run A/B assignment.
- Settings will own future global/dangerous data management, backups, rebuilds, and resets.

**Red line:** the Command Deck top hero must not become another current-state panel. If Run A/Run B/history counts need showing, they belong in Active Data.

## v4.11z52w30 Tab Router Safety Rule

The explicit tab trigger gate remains active. `data-dashboard-tab` on `<html>` or `<body>` is passive runtime state only; workspace controls must never be swallowed by broad tab routing and must continue to reach `workspaceEvents.js`.

## v4.11z52w30 History Stats Modal Ownership

Current ownership marker preserved for v4.11z52w30. The rebuilt modal owner remains `src/ui/sections/history/historyStatsModal.js`; old `src/ui/layouts/historyStatsModal.js` must stay deleted.


## v4.11z52w32 — Raw Source Hydration + Manual Marker Ownership

- Command Deck raw intake remains owned by `src/actions/commandDeckRawIntake.js`.
- The final post-parser raw source hydration step is owned by `src/actions/commandDeckReportActions.js`; it may re-assert `state.rawArchive` and copy raw metadata onto parsed History cache entries after `saveReportToHistory()` completes.
- Raw archive record shape and metadata merge rules are owned by `src/storage/rawReportArchiveStore.js`.
- Manual batch markers such as `Tournament--` must be stored as metadata (`runType`, `sourceMarker`, `manualMarkers`) and must not pollute stored raw Battle Report text.
- History display/search of run type markers is owned by `src/history/historyFilters.js` and `src/ui/sections/history/*`.
- Separator artifacts such as `---`, `====`, `____`, `****`, and long dash/bullet lines are batch wrappers only; they are not game data and must not appear inside stored raw source records.

## v4.11z52w32 — History Hero + Run Type Metadata Ownership

- The rebuilt History hero must not expose internal cache wording such as `parsed-cache runs` to the user.
- History raw-source summary must use the same raw archive normalisation rules as the rest of the app and may fall back to raw-backed History entries when active state contains parsed runs with attached raw source text.
- Manual run classification belongs in the History Edit modal, not in Command Deck raw text. Command Deck may detect markers such as `Tournament--`, but History must let the user correct Run Type later.
- Run Type metadata is user metadata. It must be saved through History metadata actions and mirrored into raw archive user metadata when a matching raw source record exists.
- User-facing History cards, search, and Stats modal should read Run Type from History metadata first, then raw archive/user metadata fallback.


## v4.11z52w33 — History Stats Modal Polish Ownership

- `src/ui/sections/history/historyStatsModal.js` remains the single owner of the rebuilt Run Stats modal markup.
- The modal keeps three user-facing views: Summary, Sections, and Raw Source.
- Source proof should use user-facing `Raw Source` wording, not internal `Raw Archive` wording, except in storage/module code.
- Run actions inside the Stats modal belong near the modal identity area: Set Run A, Set Run B, Edit Metadata.
- Data/export actions belong in the modal footer: Copy JSON and Download JSON.
- Stats modal comparison wording must explain when deltas compare different run types, so Tournament runs are not framed as bad data.

## v4.11z52w35 — History Pagination / Card Selection / Inspector Polish Ownership

### `src/ui/sections/history/historyRunList.js`
- **For:** Rendering the saved-report card page, pagination labels, Previous/Next controls, and safe page archive/restore controls.
- **May call:** History card rendering helpers and shared formatting helpers.
- **Must not:** Mutate History, raw archive, or Run A/B slots directly.
- **Red line:** Pagination display must remain a History view concern; storage must not know about page layout.

### `src/ui/sections/history/historyRunCard.js`
- **For:** Rendering one compact saved-report card with key facts, run actions, source/type chips, and selectable card metadata.
- **May call:** Shared History view-model and formatting helpers.
- **Must not:** Open modals, change slots, archive, delete, or filter directly.
- **Red line:** Card background selection is routed through `workspaceEvents.js`; button actions stay explicit button actions.

### `src/ui/events/workspaceEvents.js`
- **For:** Owning History page changes, Archive Page/Restore Page, and card background selection.
- **May call:** `performUIAction()` and render through the active UI context.
- **Must not:** Add a second broad fallback chain or bypass History actions/storage.
- **Red line:** History page actions must operate on currently rendered page card indices only; destructive delete-all/page-delete controls do not belong here.

### `src/history/historyFilters.js`
- **For:** Pure filter state for Run Type and page number, plus normalising selected card index.
- **May call:** pure run metadata helpers only.
- **Must not:** Read DOM, render UI, or mutate state.
- **Red line:** Run Type filtering is metadata filtering, not a raw-text guesser.

### `src/ui/sections/history/historyInspector.js`
- **For:** Selected-report actions and compact selected-report intel.
- **May call:** shared view-model helpers.
- **Must not:** Duplicate global History toolbar actions such as Clear A/B or Swap A/B.
- **Red line:** The inspector is selected-report scoped; global library controls belong in the toolbar or future Settings/Data Management.


## v4.11z52w36 — History Pager / Click Truth Probe Guard Ownership

- `src/ui/events/workspaceEvents.js` owns History Jump-to-page commit timing. Jump should commit through Go or Enter only, not through native blur/change.
- `src/ui/dom.js` owns low-level stale DOM guard behaviour for `clearElement()` / `replaceChildren()`. It may ignore disconnected stale nodes caused by browser focus timing after a render.
- `src/ui/events/browserClickTruthProbe.js` stays active during the rebuild phase and may classify known stale render timing as guarded. It must not become the final Debug system yet.
- `src/ui/events/index.js` owns event error routing and should avoid showing scary toasts for guarded stale DOM timing while still reporting real errors.
- Final Debug/Diagnostics ownership remains deferred until the end of the rebuild project.

## v4.11z52w37 — History Sort Order Ownership

- `src/history/historyFilters.js` remains the pure owner of History sort option order and sort behaviour.
- Reordering dropdown labels must not change the actual comparator logic unless explicitly requested.
- User-facing sort order should group by purpose: time, progression, performance/score, then rewards/rates.
- Toolbar rendering must consume `HISTORY_SORT_OPTIONS`; it must not duplicate its own separate sort list.

## v4.11z52w38 — History Pager Action Grouping Ownership

- `src/ui/sections/history/historyRunList.js` owns pager display order and grouping.
- Pager navigation controls must stay separate from page-level actions.
- Page-level actions may archive/restore the currently rendered page only.
- Sort/filter state continues to decide the result list; the pager must not create its own ordering rules.
- Page delete controls remain forbidden in the History pager.

## v4.11z52w39 — History Selected Report Inspector + Library Tie Ownership

- `src/history/historyGameBrain.js` owns read-only Library Intel aggregation and tie detection.
- `src/ui/sections/history/historyInspector.js` owns selected-report inspector layout and must not duplicate global toolbar controls.
- Selected-report proof chips should avoid duplicating facts already covered by Run Intel Summary.
- Library Intel must represent tied top patterns explicitly instead of hiding equal-count leaders.
- Dashboard, Command Deck, Stats modal, Edit modal, and raw archive storage are not allowed to depend on inspector layout details.


## v4.11z52w40 — Library Intel Glance Wording Ownership

- `src/history/historyGameBrain.js` owns pure Library Intel aggregation and death-family details.
- `src/ui/sections/history/historyInspector.js` owns user-facing Library Intel wording.
- Internal family labels such as `Enemy / Common` may remain in data, but user-facing Selected Report wording should prefer readable labels such as `Common enemies`.
- Library Intel should explain ties and family groupings without implying a single winner when the data is tied.

## v4.11z52w41 — Selected Report Run Intel Summary Ownership

- `src/ui/sections/history/historyInspector.js` owns the selected-report Run Intel Summary display.
- Run Intel Summary should remain a compact glance feed, not a paragraph/bullet explanation panel.
- Friendly wording such as `Deep farming` is a view-layer label only; source Game Brain labels remain unchanged.
- This panel may show selected-run facts only. Library-wide facts stay in Library Intel.


## v4.11z52w42 — History Hero Logic Order Ownership

- `src/ui/sections/history/historyHeader.js` owns the History hero summary order, workflow wording, and top-level library-intel row.
- The hero should read as data state → loaded slots → workflow guidance → library intelligence.
- `Parser Mapping` is the user-facing wording for mapping health in the History hero; deeper parser detail remains in Stats/Raw Source views.
- History hero polish must not change card pagination, selected-report inspector, Stats/Edit modals, Command Deck, Dashboard, raw archive storage, or mobile.

## v4.11z52w43 — Run A/B State Visibility Ownership

- History card, inspector, and Stats modal A/B button wording may describe state (`Run A active`) but must still route through the existing History slot action handlers.
- Run A uses cyan active styling. Run B uses gold active styling.
- Visual active-state classes must not create a second source of truth; `sameRun()`/view-model slot checks remain the source.
- Command Deck Current Loadout may show active-slot shell emphasis, but Command Deck must not own Run A/B assignment logic.

## v4.11z52w45 — History Selected Report Real Time Fallback Ownership

- `src/ui/sections/history/historyInspector.js` owns Selected Report inspector display fallbacks.
- Real Time display should prefer report display strings but may fall back to numeric `core.time`, matching the History card behaviour.
- This fallback is display-only and must not mutate saved History data, raw source records, or parser output.

## v4.11z52w45 — History Search Ownership

- History search input must update `historyFilters.query` and render from the full saved-report library model.
- Search must not filter only the already-rendered page DOM cards because pagination only shows six cards at a time.
- Normal Search owns clean run facts such as killed by, tier, wave, date, coins, cells, tags, and notes.
- Deep Report Search owns raw-label evidence and parser/raw Battle Report text.
- Search changes should reset to page 1 and clear stale selected-index state, then restore input focus/caret after render.

## v4.11z52w46 — Command Deck Build Style Input Retention

- `src/ui/events/workspaceEvents.js` owns the Command Deck Build Style dropdown event.
- Before a Build Style change triggers `set-build-style` and a render, the visible Command Deck textarea must be cached through `actionCacheCommandInputDraft()`.
- Build Style changes must never wipe or replace unsaved pasted report text.
- Build Style remains metadata/state only; it must not parse, save, clear, or mutate raw report text.

## v4.11z52w47 — Command Deck Build Style Change Ownership

- Build Style changes in Command Deck are metadata-only changes.
- `src/ui/events/workspaceEvents.js` owns the Command Deck Build Style change path.
- That path must cache the visible report draft and update build style state/storage.
- It must not full-render Command Deck, because full render can replace the textarea and lose pasted report text during native select timing.
- `src/ui/sections/commandDeckView.js` may expose stable `data-command-side-stat` hooks for safe in-place text updates.
- Validate/Save/Clear Input remain the only Command Deck actions allowed to intentionally change the report textarea content.

## v4.11z52w48 — Compare & Analyse Foundation Ownership

### `src/ui/sections/compareView.js`
- **For:** Rebuilt desktop Compare & Analyse workspace.
- **Owns:** Compare mode selection by loaded slot state, Library Intel, Single Report Intel, and A/B Compare foundation markup.
- **May read:** `state.history`, `state.rawArchive`, `state.runA`, `state.runB`, History/Game Brain pure summary helpers.
- **Must not:** Mutate History, Command Deck, raw archive, Run A/B slots, or storage.
- **Red line:** Compare is analysis-only in this phase. Run selection remains owned by History.

### `src/ui/views/desktopView.js`
- **For:** Mounting the rebuilt Compare view into the existing desktop workspace panel.
- **Must not:** Reintroduce old datasheet/growth systems or old Compare event bridges.

### `styles/desktop/05-compare.css`
- **For:** Desktop-only Compare & Analyse visual foundation.
- **Must not:** Change Command Deck, History, Dashboard, or mobile styles.

### Compare build rule
- Command Deck and History are locked at `v4.11z52w47`; Compare work may read their state but must not alter their behaviour unless Andrew explicitly asks or reports a bug.

## v4.11z52w49 — Compare Glance Polish Ownership

- `src/ui/sections/compareView.js` owns Compare & Analyse mode selection, verdict wording, difference tiles, and library context display.
- `styles/desktop/05-compare.css` owns Compare-only desktop presentation.
- Compare may read Command Deck/History state, but must not mutate Command Deck or History ownership paths.
- History remains the source for choosing Run A / Run B; Compare explains loaded runs and saved-library patterns.
- Click Truth Probe remains a temporary rebuild diagnostic until the final Debug/Diagnostics rebuild.

## v4.11z52w50 — Compare Insight Density Ownership

- `src/ui/sections/compareView.js` owns Compare & Analyse panels only.
- Compare may read locked History/Command Deck output state, but must not mutate Command Deck or History layout/logic.
- Dashboard keeps `Key Takeaways`; Compare uses `Insights`, `Biggest Differences`, rank context, death context, and next-test wording.
- Compare guidance must stay cautious and report-based. It should not invent hidden formula claims or pretend to know build changes not present in the report/library data.
- Graphs remain parked for later; w50 is an intel-density pass only.

## v4.11z52w51 — Compare Fairness Context Ownership

- `src/ui/sections/compareView.js` owns Compare-only fairness and similar-runs display logic.
- Compare may read saved History and raw-source presence for analysis, but must not mutate History, Command Deck, raw archive storage, or Run A/B slots.
- `Comparison Fairness` is advisory context only; it must not block comparison rendering.
- `Similar Runs Context` compares loaded runs against same-tier / same-run-type saved reports and must remain read-only.
- Command Deck and History remain locked checkpoints and must not be edited for Compare polish unless Andrew explicitly reports a bug there.

## v4.11z52w53 — Compare Library Intel Layout Ownership

### `src/ui/sections/compareView.js`
- **For:** Compare & Analyse rendering, including Library Intel, Single Report Intel, and A/B Compare.
- **May call:** History summary/Game Brain read helpers and pure formatting helpers.
- **Must not:** Mutate Command Deck, History, raw archive, Run A/B slots, or storage.
- **Red line:** Compare explains saved-run data; History manages runs and Command Deck intakes reports.

### Library Intel layout
- **For:** Snapshot, Insights, Top Records, Efficiency Leaders, Death Patterns, Run Band Mix, Next Targets, and Data Confidence.
- **May use:** current saved History plus raw archive summary.
- **Must not:** edit, archive, restore, delete, or import runs.
- **Red line:** Data Confidence is read-only evidence display, not a repair action panel.

## v4.11z52w53 — Compare Library Intel Column Alignment Ownership

### `src/ui/sections/compareView.js`
- **For:** Rendering Compare & Analyse panels, including Library Intel stacked column layout.
- **May call:** pure History/Compare view-model helpers and formatter helpers.
- **Must not:** Mutate Command Deck, History, Run A/B slots, raw source storage, or mobile view files.
- **Red line:** Library Intel layout may reorder display panels, but must not change saved-report data ownership or History management behaviour.

### `styles/desktop/05-compare.css`
- **For:** Desktop Compare-only layout, density, and alignment polish.
- **May style:** `.tbi-compare-*` desktop selectors scoped to Compare.
- **Must not:** Style Command Deck, History, Dashboard, or mobile selectors.
- **Red line:** Compare desktop layout changes must not depend on mobile CSS or protected History/Command Deck classes.

## v4.11z52w54 — Compare Single Report Column Alignment Ownership

### `src/ui/sections/compareView.js`
- **For:** Rendering Single Report Intel as a two-column Compare-only analysis layout.
- **May call:** Compare model helpers, History Game Brain summaries, and shared formatting helpers.
- **Must not:** Mutate History, Command Deck, raw archive, or Run A/B slots.
- **Red line:** Single Report panel order is presentation only; report selection and saved-run management remain owned by History.

### `styles/desktop/05-compare.css`
- **For:** Desktop-only Single Report column alignment and compact efficiency tile spacing.
- **May style:** `.tbi-compare-layout.single-mode`, `.tbi-compare-single-efficiency`, and Compare-only row alignment hooks.
- **Must not:** Style Command Deck, History, Dashboard, or mobile selectors.
- **Red line:** Compare spacing fixes must stay scoped under `body[data-dashboard-tab="compare"]`.

## v4.11z52w55 — Compare A/B Visual Identity Ownership

### `src/ui/sections/compareView.js`
- **For:** Rendering A/B Compare identity, verdicts, insight rows, difference tiles, and Compare-only A/B layout.
- **May call:** Compare model helpers, History Game Brain summaries, and shared formatting helpers.
- **Must not:** Mutate History, Command Deck, raw archive, Run A/B slots, or storage.
- **Red line:** Run A/B colour identity is presentation only; History still owns slot selection and state changes.

### `styles/desktop/05-compare.css`
- **For:** Desktop-only A/B identity styling, Run A cyan/Run B gold labels, and A/B column alignment.
- **May style:** `.tbi-run-slot-*`, `.tbi-run-letter`, `.tbi-compare-layout.ab-mode`, and Compare-only A/B hooks.
- **Must not:** Style Command Deck, History, Dashboard, or mobile selectors.
- **Red line:** A/B Compare polish must remain scoped under `body[data-dashboard-tab="compare"]`.

## v4.11z52w56 — Compare A/B Text Alignment Ownership

### `src/ui/sections/compareView.js`
- **For:** A/B Compare presentation wording, Run A/Run B chip labels, and Compare-only row markup.
- **May call:** Compare view-model helpers and formatting helpers.
- **Must not:** Mutate History, Command Deck, raw archive, or Run A/B storage.
- **Red line:** A/B chip and row alignment changes are presentation only.

### `styles/desktop/05-compare.css`
- **For:** Desktop Compare-only A/B chip, title, and row alignment polish.
- **May style:** `.tbi-compare-layout.ab-mode`, `.tbi-run-slot`, `.tbi-compare-title-slot`, and Compare-only alignment hooks.
- **Must not:** Style Command Deck, History, Dashboard, or mobile selectors.

## v4.11z52w57 — Compare A/B Stat Badge Ownership

### `src/ui/sections/compareView.js`
- **For:** Compare-only A/B badge, winner, and metric-pair rendering.
- **May call:** pure Compare formatting helpers and view-model helpers.
- **Must not:** Mutate Command Deck, History, Run A/B slots, raw archive, or storage.
- **Red line:** A/B stat badges are display-only; they must not become new state or routing owners.

### `styles/desktop/05-compare.css`
- **For:** Desktop Compare-only A/B chip and mini-stat badge colour profile.
- **May style:** `.tbi-run-slot`, `.tbi-run-stat-badge`, and `.tbi-compare-slot-metric-pair` only under Compare desktop scope.
- **Must not:** Style Command Deck, History, Dashboard, or mobile selectors.

## v4.11z52w58 — Compare A/B Metric Arrow Ownership

### `src/ui/sections/compareView.js`
- **For:** Compare-only A/B metric-pair markup in Difference, Ranked Differences, and Purpose Verdict.
- **May call:** pure Compare formatting helpers such as `slotMetricPair()` and `slotLetterTag()`.
- **Must not:** Change Command Deck, History, raw archive, Run A/B slot storage, or mobile rendering.
- **Red line:** Full Run A/Run B chips and metric-pair arrows are presentation only; they must not change report comparison maths.

### `styles/desktop/05-compare.css`
- **For:** Desktop-only Compare A/B metric arrow styling.
- **May style:** `.tbi-run-stat-arrow`, `.tbi-compare-slot-metric-pair`, and Compare-only metric pair descendants.
- **Must not:** Re-style History/Command Deck run buttons or mobile classes.
- **Red line:** Circular A/B stat badge styles may remain for backwards compatibility, but active Compare metric pairs should use arrow markers after w58.

## v4.11z52w59 — Compare A/B Difference Overflow Ownership

### `styles/desktop/05-compare.css`
- **For:** Desktop-only overflow containment for Compare A/B Difference metric cards.
- **May style:** `.tbi-compare-layout.ab-mode .tbi-compare-diff-grid`, `.tbi-compare-diff-tile`, and metric-pair children.
- **Must not:** Change Command Deck, History, Dashboard, raw source storage, or mobile layout.
- **Red line:** Overflow fixes must remain Compare-scoped under `body[data-dashboard-tab="compare"]`.

### `src/ui/sections/compareView.js`
- **For:** Compare markup/version identity only for this pass.
- **Must not:** Change report parsing, saved History management, Command Deck intake, or Run A/B slot state.
