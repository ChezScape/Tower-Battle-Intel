# Tower Battle Intel v4.11z52w36 — History Pager Probe Guard

## Changed
- Kept Click Truth Probe active for the rebuild phase.
- Fixed History Jump-to-page Enter/blur timing by removing the change/blur-triggered second render.
- Jump-to-page now commits through Go or Enter only.
- Jump-to-page render is deferred safely so the input is not replaced mid-key event.
- Added stale DOM guards around `clearElement()` / `replaceChildren()` timing.
- Click Truth Probe now classifies stale render timing as guarded instead of a scary app error if it ever reaches the probe.
- Kept History pager behaviour from w35: First / Previous / Next / Last / Jump / Go.
- Moved w31 changelog into legacy logs so root keeps the latest five changelogs.

## Protected
- Dashboard visuals and frame.
- Header.
- Command Deck raw save path.
- History card/page layout except the pager timing guard.
- Stats modal.
- Edit modal.
- Raw source/archive spine.
- Mobile files.
