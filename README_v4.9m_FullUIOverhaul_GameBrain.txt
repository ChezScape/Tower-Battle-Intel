Tower Battle Intel v4.9m - Full UI Overhaul + Game Brain
========================================================

This build corrects the v4.9l full-project issue where the Game Brain hardening was present but the full UI overhaul was not visible.

Included:
- v4.9l Game Brain hardening
- full desktop UI overhaul renderer
- split UI section files
- desktop mock-up styling
- mobile compatibility layer
- themed controls / scrollbars direction
- parser game-brain test pack

Main UI structure:
- src/ui/dashboard.js is now a small router/shell
- src/ui/views/desktopView.js
- src/ui/views/mobileView.js
- src/ui/sections/runHeader.js
- src/ui/sections/differenceOverview.js
- src/ui/sections/statPanels.js
- src/ui/sections/gapRadar.js
- src/ui/sections/sideIntel.js
- src/ui/sections/systemsMatrix.js
- src/ui/sections/compareView.js
- src/ui/sections/coachView.js
- src/ui/sections/historyView.js
- src/ui/sections/anomaliesView.js
- src/ui/sections/commandDeckView.js
- src/ui/sections/sectionUtils.js
- src/ui/components/topNav.js
- src/ui/components/radarChart.js

Tested:
- JavaScript syntax check passed
- Import path check passed
- node tests/report-parser-game-brain.test.mjs passed

Test order:
1. Hard refresh desktop.
2. Check Dashboard shows the rebuilt top bar and Run A / VS / Run B strip.
3. Check Compare, Systems, Coach, History, Anomalies, Command Deck.
4. Hold the header to open Debug.
5. Test mobile top and bottom navigation.
