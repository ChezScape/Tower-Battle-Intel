# Tower Battle Intel v4.11a6 Save Report Feedback

## Purpose

When the user presses **Save Report**, the UI now confirms what happened.

## Feedback states

- **Report saved** — shows the loaded report ID.
- **Reports saved** — shows all loaded report IDs for multi-report input.
- **Duplicate not loaded** — shows the duplicate report ID and keeps the input text.
- **Report not loaded** — shown when the input could not be parsed as a valid report.
- **Nothing to save** — shown when the input is empty.

## Browser checks

```js
TowerBattleIntel?.version
TowerBattleIntelLastSaveReport
```

Expected version: `v4.11a6`.

After a save attempt, `TowerBattleIntelLastSaveReport` should include:

```js
status
loaded
reportId
addedIds
duplicateIds
message
```
