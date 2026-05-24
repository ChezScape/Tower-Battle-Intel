# v4.10k Native Control Hardening

Findings from the live-site export:

- v4.10j is live.
- Native control bridge is bound.
- Permanent hidden file picker exists.
- The console helper returning the input proves the element exists, but not that a real trusted file picker opens from a visible click.

Fixes:

- History Import now has a real visible native file input overlay in History Tools.
- Hidden fallback file picker remains for console/helper route.
- Debug close no longer immediately rerenders/reopens if state fallback is slow.
- Debug Health summary gets explicit UI styling.
- History Stats/Edit modals get a proper themed modal skin.
