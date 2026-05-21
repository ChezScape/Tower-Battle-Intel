# v4.9p History Controls Fix

Focused patch for Battle History Trace controls.

## Fixes

- Import History now uses a real file-picker label + input instead of relying on a hidden file input button path.
- Filter Console Sort / Build / Tag controls are now native themed select menus so they always open reliably.
- Filter Console drawer collapse state is remembered in session storage.
- History Summary drawer collapse state is remembered in session storage.
- Delete Last Run and Delete All History now use distinct confirmation phrases:
  - Delete Last Run: type `LAST`
  - Delete All History: type `DELETE ALL`
  - Delete individual run: type `DELETE`

## Changed files

- config/appConfig.js
- desktop.css
- mobile.css
- src/ui/events.js
- src/ui/layouts/historyLayout.js
- src/ui/components/confirmModal.js

## Test

1. Open History.
2. Try collapsing Filter Console.
3. Try collapsing History Summary.
4. Open Sort, Build and Tag dropdowns.
5. Click Import History and confirm the file picker opens.
6. With saved runs present, test Delete Last and Delete All confirm wording.
