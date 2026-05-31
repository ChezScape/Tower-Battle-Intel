# Tower Battle Intel v4.11z52w45 — History Search Full Library Repair

## Changed
- Fixed History Search so Normal Search searches the full saved-report library, not only the six cards currently rendered on the page.
- Typing in the History search now updates saved filter state, resets to page 1, and re-renders the filtered result list.
- Added focus/caret restore after the search re-render so typing should still feel stable.
- Kept Deep Report Search as the raw-label search mode.

## Why
Searching `ray` could show `0 visible of 6 shown` until the Normal/Deep mode button was clicked, because the live DOM filter was only checking the current page cards.

## Protected
- Dashboard visuals, Header, Command Deck, History pager/cards/inspector layout, Stats/Edit modals, Click Truth Probe, raw source/archive spine, and mobile files remain protected.
