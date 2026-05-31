# Tower Battle Intel v4.11z52w — History Button/Search Mode Repair

Built from `v4.11z52v_SrcOwnershipCleanRebuild`.

## Purpose
Repair History controls after the source ownership cleanup while keeping the cleaner z52v ownership model.

## Changes
- Removed the explicit Clear button from Search History. The native search X remains the clear control.
- Changed Deep Report Search from a checkbox-style strip into an Archive-style on/off button.
- History run-card controls are now handled by a History-first click path before generic UI handlers.
- History Library buttons are also handled in the History-first path.
- Normal/Deep search mode is now stored in History filters and used by `historyFilters.js`.
- Wave displays now use full digits with no compact K notation and no commas.

## Protected
- Dashboard frame/layout protected.
- Header protected.
- Command Deck protected.
- History visual style protected except the requested search controls.
- Run A/B guard protected.
- Mobile untouched.

## Search scope
Normal History Search remains the default. Deep Report Search is an explicit on/off mode.
