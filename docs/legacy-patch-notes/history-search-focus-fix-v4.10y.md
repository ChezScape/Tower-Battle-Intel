# v4.10y History Search Focus Fix

## Problem

The History search field:

```html
<input type="search" class="history-search" data-history-filter-query="true">
```

lost focus while typing because the History filter render path replaced the input element after each input update.

## Fix

Adds `src/ui/historySearchFocusGuard.js`, a classic script loaded before `app.js`.

It owns only the History search input:

- lets the browser type normally
- stops later capture bridges from stealing the input event
- debounces `history-set-filters`
- renders after the user pauses briefly
- restores focus, value, and caret after render

## Check

Chrome F12:

```js
TowerBattleIntel?.version
TowerBattleIntelHistorySearchFocusGuard?.status()
```

Expected:

```text
v4.10y
bound: true
inputExists: true
```
