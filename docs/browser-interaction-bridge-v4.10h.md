# v4.10h Browser Interaction Bridge

Focused fix for the live-site issue where visible controls rendered correctly but browser clicks were not reliably reaching their actions.

## Fixes

- Adds `src/ui/liveInteractionBridge.js` and binds it from `bootstrap.js`.
- Debug Close, Copy, Download Health Scan JSON and Download Full Debug JSON work through delegated handlers.
- History Import uses a live file input fallback and History Export uses a Blob download fallback.
- History Stats / Edit modals are created inside real modal mounts if missing.
- Delete confirmations can be created even if the History view has not mounted its confirm modal yet.
- Native `details > summary`, `select`, labels and buttons are protected from pointer-event blocking CSS.

## Files changed

- `bootstrap.js`
- `config/appConfig.js`
- `src/ui/liveInteractionBridge.js`
- `src/ui/dev/inspectionPanel.js`
- `desktop.css`
- `mobile.css`
