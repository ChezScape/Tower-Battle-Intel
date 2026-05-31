# Build Report — Tower Battle Intel v4.11z52w24

## Build

`Tower-Battle-Intel_v4.11z52w24_HardEventOwnerRebuild_FullBuild.zip`

## Built from

`Tower-Battle-Intel_v4.11z52w20_ActivePathVerification_FullBuild.zip`

## Purpose

Andrew reported that only the top navigation worked. That means the previous active-path verification was too shallow: routes/imports existed, but real browser button ownership was still fragile. This build removes the old active handler chain and rebuilds the active workspace event owner so Command Deck and History buttons cannot fall through into old parked/fallback handling.

## Main changes

- Added `src/ui/events/workspaceEvents.js` as the single active desktop workspace event owner.
- Rebuilt `src/ui/events/index.js` so the active click chain is now:
  - `tabEvents.js` for top navigation
  - `mobileShellEvents.js` for mobile shell controls
  - `workspaceEvents.js` for rebuilt Command Deck and History controls
- Removed the old broad parked catch-all event file from the project.
- Removed the old separate active Command Deck and History event files from the project.
- Removed the old inactive Dashboard event placeholder from the project.
- Removed the old parked action module from the action layer.
- Kept `src/ui/events/importExportEvents.js` as a shared browser file-picker/download helper, delegated from `workspaceEvents.js`.
- Removed old `data-dashboard-button-parked` markers from the protected desktop Dashboard visual shell and replaced them with neutral inactive markers.
- Kept mobile CSS/modules and `src/ui/views/mobileView.js` unchanged from w20.

## Removed files

- `src/ui/events/parkedActionEvents.js`
- `src/ui/events/dashboardEvents.js`
- `src/ui/events/commandDeckEvents.js`
- `src/ui/events/historyEvents.js`
- `src/actions/parkedActions.js`

## Protected

- Protected core version remains `v4.11z52`.
- Visible/display build is now `v4.11z52w24`.
- Dashboard visual shell layout remains protected.
- Command Deck layout remains protected.
- Rebuilt History layout remains protected.
- Raw archive storage/action spine remains protected.
- Mobile CSS/modules remain unchanged from w20.
- `src/ui/views/mobileView.js` remains unchanged from w20.

## Active ownership after this build

```text
Top nav buttons
→ src/ui/events/tabEvents.js
→ src/app/tabs.js
→ render
```

```text
Command Deck buttons/input/select
→ src/ui/events/workspaceEvents.js
→ src/actions/index.js
→ Command Deck / raw archive actions
→ storage/state
→ render
```

```text
History cards/search/filter/modals
→ src/ui/events/workspaceEvents.js
→ src/actions/index.js
→ History / Run A-B / raw archive actions
→ storage/state
→ render
```

```text
Import/export file picker/download
→ src/ui/events/workspaceEvents.js
→ src/ui/events/importExportEvents.js
→ src/actions/importExportActions.js
→ storage/export/import
→ render/feedback
```

## Browser sandbox note

A true Chromium click-through was attempted, but this environment blocks Chromium navigation to both `file://` and local `http://127.0.0.1` with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. The build therefore includes stronger source/action tests and direct smoke checks, but Andrew still needs to test the real Chrome browser locally.

## Validation

- 55 Node tests passed, run in two batches to avoid sandbox command timeout.
- 151 JS files passed syntax checks.
- 55 MJS test files passed syntax checks.
- 36 CSS files passed brace/balance checks.
- Mobile root CSS unchanged from w20.
- `styles/mobile/` unchanged from w20.
- `src/ui/views/mobileView.js` unchanged from w20.
- ZIP integrity passed.
