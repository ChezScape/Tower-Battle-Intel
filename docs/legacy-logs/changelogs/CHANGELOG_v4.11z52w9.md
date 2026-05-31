# Tower Battle Intel v4.11z52w9 — UI Visual Shell Reset

## Summary
- Built from v4.11z52w8 bones-contract checkpoint.
- Keeps the tested game/parser/catalogue/state/localStore bones intact.
- Keeps the Dashboard visual shell active.
- Converts Command Deck, History, Compare, Coach, Systems, Anomalies, and Settings into parked visual shells.
- Replaces the active UI event layer with a minimal shell owner: tab navigation, parked-action feedback, and simple mobile sheet open/close only.
- Removes active startup binding of the old core event bridge, Systems bridge, metric diff bridge, platform isolation guard script, and desktop polish guard script.
- Adds a mobile concept shell in JS without changing the blank mobile CSS scaffold.

## Intent
This is not a finished functional app build. It is a stable visual-shell checkpoint so events/actions can be rewired cleanly afterwards without old handlers fighting the rebuild.
