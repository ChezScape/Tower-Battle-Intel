# CSS Module Map — Current Active Build

The desktop and mobile loaders are intentionally tab-ordered. Keep new tab work inside the matching module instead of stacking unrelated overrides elsewhere.

## Desktop loader order

- `00-core.css` — core variables, reset, layout primitives
- `00-desktop-isolation.css` — desktop/mobile isolation
- `01-header-nav.css` — header, brand, top nav visuals, Settings tab icon, version/theme controls
- `02-command-base.css` — Command Deck base helpers
- `02-command-input.css` — report input shell and form controls
- `02-command-deck.css` — Command Deck desktop polish
- `03-dashboard-base.css` — Dashboard primitives
- `03-dashboard-locked.css` — protected Dashboard visual lock
- `03-dashboard-gamebrain.css` — Dashboard Game Brain strip
- `04-history-base.css` — History base panels and run cards
- `04-history-main.css` — History full desktop layout
- `04-history-stats-modal.css` — History rebuilt Run Stats modal
- `05-compare.css` — Compare blank restart foundation
- `06-coach.css` — Coach/advice rows
- `07-systems.css` — Systems base styling
- `07-systems-polish.css` — Systems desktop polish
- `08-anomalies.css` — Anomalies list base layout
- `09-settings-base.css` — Settings shared base styling
- `09-settings-controls.css` — Debug panel and modals
- `09-settings-controls.css` — Action audit/toasts/download controls
- `10-responsive-foundation.css` — shared responsive foundation, app-frame lock, current header grid areas
- `11-workspace-reset.css` — blank rebuild shells

## Mobile loader order

Mobile remains a blank scaffold for future work. The loader points to `styles/mobile/*.css`, but those modules are intentionally empty/minimal until mobile rebuild starts.
