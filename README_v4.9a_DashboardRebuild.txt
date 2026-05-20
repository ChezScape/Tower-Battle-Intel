Tower Battle Intel v4.9b Dashboard Rebuild

Full project rebuild based on the v4.8w2 fixed/neon line.

This is a deliberate UI rebuild, not a drop-in patch.
It keeps the runtime/parser/history/game-brain/debug systems, but replaces the dashboard presentation with the locked desktop/mobile concepts.

Main changes:
- New desktop dashboard workspace.
- New mobile app layout.
- Old dashboard layout files removed.
- Command Deck is a real workspace.
- Hidden debug hold now works from the rendered header.
- Desktop and mobile CSS are separated without cross-device CSS rules.

Test desktop and mobile before promoting this as stable.
