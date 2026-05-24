# Tower Battle Intel v4.11r — Desktop Quick Actions Mockup Rematch

## Scope
Desktop dashboard only. `mobile.css` was not changed.

## Base
Built from v4.11q Desktop Compact VS Removal.

## Changes
- Kept v4.11q compact VS removal, v4.11n DIFF+ modal, and v4.11o/p advantage meter behaviour.
- Reworked only the Quick Actions presentation.
- Made the Quick Actions panel closer to the Concept 5 mockup.
- Reduced the bubbly/pill button look.
- Replaced heavy inner icon capsule styling with flatter neon line-icon control cards.
- Restored calmer title-case action labels: Paste Report, Save Report, Export, Import, Health Scan, Clear Runs.
- Preserved the same six actions and data-ui-action wiring.
- Kept the panel footprint stable for maximised, medium, compact, and small-long desktop.

## Testing
Run the normal test set plus:

```powershell
node .\tests\current-v4.11r-checkpoint.test.mjs
node .\tests\current-v4.11r-quick-actions-rematch.test.mjs
```
