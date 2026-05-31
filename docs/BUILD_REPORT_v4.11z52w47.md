# Build Report — v4.11z52w47 Command Deck Build Style No-Render Retention

## Source
Built from `v4.11z52w46_CommandDeckBuildStyleInputRetention` after video testing showed the pasted report was still cleared when choosing a Build Style.

## Root cause
The Build Style change handler still called the app render path after changing build style. That render replaced the Command Deck textarea, so browser/native select timing could lose the visible pasted report.

## Fix
- `src/ui/events/workspaceEvents.js`
  - Build Style change now caches the visible textarea draft defensively.
  - Applies `set-build-style` to update runtime state/storage.
  - Updates the visible Current Loadout Build Style label directly.
  - Does **not** call full render for Build Style changes.

- `src/ui/sections/commandDeckView.js`
  - Side stat rows now expose `data-command-side-stat`, allowing safe in-place updates.

- `tests/v4.11z52w47-command-build-style-no-render-retention.test.mjs`
  - Verifies the Build Style handler does not call render.
  - Verifies draft caching remains.
  - Verifies Command Deck still renders preserved pasted report text.

## Protected
Dashboard, Header, History, Stats/Edit modals, Click Truth Probe, raw archive spine, and mobile files were not functionally changed.
