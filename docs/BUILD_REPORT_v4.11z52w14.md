# BUILD REPORT — v4.11z52w14

## Build
- Visible/display build: `v4.11z52w14`
- Protected rollback core: `v4.11z52`
- Base: `v4.11z52w13a`

## Purpose
Reconnect Command Deck as the app's first real active workspace while keeping Dashboard visually protected and the other workspaces parked.

## What changed
- Set the default active workspace/start point to **Command Deck**.
- Replaced the parked desktop Command Deck shell with the active `commandDeckView` workspace.
- Rewired Command Deck button clicks through `src/ui/events/commandDeckEvents.js`.
- Activated Command Deck actions for Validate, Save Report, Save + Dashboard, Clear Input, Import History, Export History, and tab routing buttons.
- Added delegated draft-input tracking for the Command Deck textarea and delegated build-style select handling.
- Kept Command Deck result feedback inside the page and used action-level feedback state for import/export messages.
- Updated the architecture rulebook with the Command Deck active-owner catalogue and the new Dashboard ownership rules.

## Preserved
- Dashboard visual shell remains protected.
- Compare / History / Coach / Systems / Anomalies / Settings remain parked shells.
- Saved history format, Run A/B saved values, and local storage compatibility remain protected.
- Mobile CSS/modules remain unchanged.

## Notes
- Dashboard behaviour/layout redesign rules were documented in the rulebook, but the visual Dashboard shell itself was not rewired in this build.
- Command Deck import/export is browser-local and routes through the new Command Deck event owner rather than static hidden controls in `index.html`.

## Validation
- 49 Node tests passed.
- 189 JS/MJS syntax checks passed.
- 35 CSS files checked.
- `mobile.css` unchanged from `v4.11z52w13a`.
- `styles/mobile/` unchanged from `v4.11z52w13a`.
