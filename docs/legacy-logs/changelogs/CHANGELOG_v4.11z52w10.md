# Tower Battle Intel v4.11z52w10 — Event Module Foundation

## Summary
- Built from the z52w9 UI visual-shell reset checkpoint.
- Keeps the tested bones and visual shells intact.
- Splits the active UI shell event owner into `src/ui/events/` modules.
- Adds a no-DOM `src/core/events/` domain event foundation for later state/storage/history/run-slot signals.
- Leaves real Command Deck, History, Dashboard, Systems, and Import/Export behaviour parked for the later rewire phases.

## Intent
This phase gives the project clean event rails before reconnecting real actions. It avoids putting every future click and state rule back into one giant `events.js` file.
