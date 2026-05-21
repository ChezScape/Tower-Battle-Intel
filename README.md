# Tower Battle Intel v4.8r — UI Wiring + Menu Polish

Protected rollback remains:

```text
Tower-Battle-Intel_Phase4.7 Stable.zip
```

This build is based on v4.8o and focuses on making the Battle History Trace easier to use on phone and desktop without removing the existing history tools.

## Main changes

- Keeps the true CSS split: `desktop.css` for the large-screen layout and `mobile.css` for the phone layout.
- Keeps the current banners and hidden banner-hold debug access.
- Keeps the v4.8o mobile stabilisation work: tab-to-top behaviour, compact report button, scroll locking, and debug scroll improvements.
- Makes the History tool area collapsible under **History Tools**.
- Makes the History filter area collapsible under **Filter Console**.
- Replaces the Sort / Build / Tag button walls with styled dropdown menus.
- Makes the History Summary collapsible so it does not eat space when checking runs.
- Redesigns each run card action area:
  - **A / B** are grouped under **Compare Slots**.
  - **Stats / Edit / Archive / Delete** are grouped under **Run Tools**.
  - extra run details are tucked under **More Intel**.
- Updates version labels to `v4.8r`.

## Test order

1. Open `index.html` on phone.
2. Go to History.
3. Open **Filter Console** and check Sort / Build / Tag dropdowns.
4. Change each dropdown once and confirm the history list updates.
5. Open **History Summary** and close it again.
6. On a run card, press **A** and **B** under Compare Slots.
7. Open **Run Tools** and try Stats / Edit / Archive / Delete.
8. Open **More Intel** on a run and check the hidden details.
9. Check desktop after phone.
10. Hold the banner to make sure debug still opens.


## v4.8r fixes

- Fixed missing `isMobileMode()` helper in the UI event layer, which broke desktop Subsystem Matrix clicks and mobile bottom-tab switching.
- Replaced History native select popups with sci-fi styled dropdown panels for Sort, Build, and Tag.
- Kept Filter Console open while typing/searching so the search box no longer collapses after each key.
- Added stronger mobile/desktop dropdown styling and preserved the compact run tools layout.
