# Tower Battle Intel — v4.11z52w28

## History Time/Search/Command Wave Display Repair

- Fixed rebuilt History Stats Summary so Game Time and Real Time display from preserved run evidence instead of showing `-` while the Sections tab had the data.
- Stopped the main History search input from full-rendering on every typed character, which caused focus/caret bounce.
- Added DOM-first live card filtering for the rebuilt History search box.
- Clarified History header wording so Raw Sources means raw Battle Report source records, not archived parsed runs.
- Changed Command Deck run labels and Command Deck feedback to show exact raw wave digits with `Wave ####` wording rather than short `W`/compact-style labels.
- Dashboard, Header, Command Deck layout, rebuilt History hub/modal ownership, raw archive spine, and mobile remain protected.
