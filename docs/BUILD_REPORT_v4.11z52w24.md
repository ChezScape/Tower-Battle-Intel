# Build Report — v4.11z52w24 History Stats Modal Rebuild

## Base

`Tower-Battle-Intel_v4.11z52w23_TabActionRouterRepair_FullBuild.zip`

## Goal

Replace the still-active old History Stats modal after the w23 router fix proved buttons now reach the rebuilt workspace owner.

## Main result

History Stats is now owned by:

```text
src/ui/sections/history/historyStatsModal.js
```

The old active modal file was removed:

```text
src/ui/layouts/historyStatsModal.js
```

## New modal shape

The rebuilt modal uses the `.tbi-history2-stats-*` namespace and presents:

- Summary tab
- Sections tab
- Raw Source tab
- exact Wave display
- raw archive/source proof
- short report ID proof
- Run A / Run B actions
- section search
- copy/download parsed JSON hooks

## Active routing

`workspaceEvents.js` now imports the rebuilt modal from the History section folder and routes modal clicks through `.tbi-history2-stats-modal`.

## Protected areas

- Dashboard visual shell unchanged
- Header unchanged
- Command Deck layout unchanged
- History hub layout unchanged except Stats modal ownership
- Raw archive storage spine unchanged
- Mobile files unchanged

## Notes

This build deliberately does not remove general legacy clutter. It only removes the old active Stats modal path because it was still reachable through the working Stats button.
