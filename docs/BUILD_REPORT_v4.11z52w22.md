# Build Report — Tower Battle Intel v4.11z52w24

Build: `Tower-Battle-Intel_v4.11z52w24_BrowserClickTruthProbe_FullBuild.zip`

## Purpose

This is a blocker investigation/repair build after local Chrome testing of `v4.11z52w21` reported that only the top navigation worked.

The goal is to stop guessing and make the browser show what actually happens when a user clicks an in-page control.

## Changes

- Added `src/ui/events/browserClickTruthProbe.js`.
- Added a visible, fixed `Click Truth Probe` panel showing:
  - last pointer target,
  - last click target/action,
  - which handler caught the click,
  - render confirmation,
  - last caught error.
- Added `window.TowerBattleIntelClickTruth.status()` for Chrome DevTools.
- Moved active shell click ownership to capture phase in `src/ui/events/index.js`.
- Removed the old bubble-phase click owner from the active event root.
- Added capture-level `pointerdown`, `click`, `change`, `input`, and `keydown` binding.
- Wrapped handler calls so runtime action errors show in the probe/toast instead of silently looking like a dead button.
- Strengthened `workspaceEvents.js` so known Command Deck actions can still be caught if the root selector misses.

## Protected

- Core protected version remains `v4.11z52`.
- Dashboard visual shell remains protected.
- Command Deck visual layout remains protected.
- Rebuilt History visual layout remains protected.
- Raw archive spine remains protected.
- Mobile CSS/modules remain unchanged from `w21`.

## Testing focus for Andrew

Open the build in local Chrome and click:

1. Command Deck → Validate.
2. Command Deck → Save Report.
3. Command Deck → Clear Input.
4. History → Set A / Set B / Stats / Edit.
5. History → Export JSON.

The bottom-left probe should update after every click. If a button still appears dead, the probe should show whether the click was seen, missed, or errored.
