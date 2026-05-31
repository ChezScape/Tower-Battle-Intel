# Tower Battle Intel v4.11z52w44 — History Selected Report Real Time Fallback

## Fixed
- Fixed the Selected Report inspector showing `Real Time` as `-` when the saved run had `core.time` seconds but no `core.realTime` display string.
- Added a focused Selected Report real-time resolver that checks display strings first, then falls back to numeric seconds.
- The History cards already used `core.time`; this makes the Selected Report panel match the cards.

## Protected
- Dashboard untouched.
- Header untouched.
- Command Deck untouched.
- History cards, pager, and hero untouched.
- Stats/Edit modals untouched.
- Click Truth Probe untouched.
- Raw source/archive spine untouched.
- Mobile untouched.
