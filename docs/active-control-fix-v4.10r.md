# Tower Battle Intel v4.10r Active Control Fix

Fixes the next group of working-top-tab / broken-inner-control issues.

Targets:

- Dashboard quiet display toggle.
- System Matrix tile detail fallback.
- History export download fallback.
- Delete Last / Delete All confirm overlay with typed phrase.
- Stats modal JSON download.
- Edit modal text fields and build-style buttons.
- Filter selects and text fields being stolen by older click bridges.
- Collapsible `<details><summary>` panels.
- Command Deck root buttons: Save Report, Clear Input, Clear Runs.
- Debug Health / Full Debug downloads.

The bridge now shields native controls using capture-phase pointer handling, but without preventing browser default behaviour for typing, selects, and textareas.
