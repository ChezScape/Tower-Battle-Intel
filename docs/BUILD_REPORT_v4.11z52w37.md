# Build Report — v4.11z52w37 History Sort Order Polish

## Scope
Small History UI polish pass only.

## Purpose
Andrew noticed the History Sort dropdown worked but the option order felt less logical. This build keeps the same sort options and behaviour, but reorders the list so it reads naturally.

## Changed file
- `src/history/historyFilters.js`

## Sort order after polish
- Newest
- Oldest
- Highest Tier
- Highest Wave
- Best Score
- Highest Coins
- Highest Coins/h
- Highest Cells
- Highest Cells/h

## Protected areas
- Dashboard/Header untouched.
- Command Deck untouched.
- History pagination/card/inspector behaviour untouched.
- Stats/Edit modals untouched.
- Raw source/archive storage untouched.
- Click Truth Probe untouched.
- Mobile untouched.

## Validation
- Focused w37 History sort order test passed.
- JS/MJS syntax checks passed.
- CSS brace check passed.
- Mobile files unchanged from w36.
- ZIP integrity passed.
