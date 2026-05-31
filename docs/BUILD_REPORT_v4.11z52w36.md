# Build Report — v4.11z52w36 History Pager Probe Guard

## Scope
Focused repair after browser testing showed Jump-to-page works, but Click Truth Probe displayed a stale `replaceChildren` DOM error after typing a page number and pressing Enter.

## Cause
The page jump committed correctly, then History re-rendered and replaced the Jump input while the browser still had Enter/change/blur timing pending for the old input. That could make the probe/event layer see a stale DOM clear error after the successful action.

## Changes
- `src/ui/events/workspaceEvents.js`
  - Jump input no longer commits on `change` / blur.
  - Jump commits through Go or Enter only.
  - Jump commits use deferred render to avoid replacing the focused input during the key event.
  - Jump value is clamped between 1 and max page.

- `src/ui/dom.js`
  - `clearElement()` now ignores disconnected stale nodes.
  - `replaceChildren()` stale browser timing errors are guarded and safely ignored.

- `src/ui/events/browserClickTruthProbe.js`
  - Click Truth Probe stays active.
  - Stale DOM timing is classified as guarded if it is ever recorded.

- `src/ui/events/index.js`
  - Event error handling is centralised.
  - Guarded stale DOM timing does not show a scary toast.

- `tests/v4.11z52w36-history-pager-probe-guard.test.mjs`
  - Verifies w36 version, deferred jump render, no blur/change second jump, guarded probe classification, guarded clearElement, and pager render remains intact.

## Changelog hygiene
- Root changelogs now remain latest five: w32–w36.
- w31 moved to `docs/legacy-logs/changelogs/`.

## Protected
- Dashboard/Header untouched.
- Command Deck raw intake/save untouched.
- Rebuilt History layout protected except pager timing guard.
- Stats/Edit modals untouched.
- Raw archive spine untouched.
- Mobile untouched.
