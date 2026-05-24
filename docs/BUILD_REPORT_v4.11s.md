# Tower Battle Intel v4.11s — Desktop Gap + Quick Actions Polish

## Build type

Full build, desktop polish pass.

## Built from

`Tower-Battle-Intel_v4.11r_DesktopQuickActionsMockupRematch_FullBuild.zip`

## Scope

Desktop dashboard only.

`mobile.css` was not modified.

## Changes

- Keeps the v4.11q compact VS removal.
- Keeps the v4.11n DIFF+ details modal.
- Keeps the v4.11o/p centre-split advantage meter behaviour.
- Improves Quick Actions in maximised/right-rail desktop layout.
- Adds shared optical alignment rules for dashboard icons and action icons.
- Makes card header icons, action icons, and metric art sit on a more consistent visual centre.
- Changes the metric comparison label from arrow shorthand to clearer wording such as `Better for B`, `Better for A`, and `Even`.
- Simplifies the advantage meter styling so it reads more like a comparison meter and less like a generic progress bar.
- Reworks `The Gap In Numbers` into the same card family as the other dashboard cards.
- Adds a small Gap card header icon.
- Enlarges and tightens the radar chart area.
- Replaces the loose A/B legend with a compact `Run A | Gap = B - A | Run B` legend.
- Repositions recommendation chart art so it looks less jammed into the corner.

## Guardrails

- No mobile styling changes.
- No parser changes.
- No save-format changes.
- No report/history storage changes.
- No action rewiring.
- No compact VS rollback.

## Suggested checks

```powershell
node .\tests\current-v4.11s-checkpoint.test.mjs
node .\tests\current-v4.11s-gap-quick-actions-polish.test.mjs
node .\tests\ui-render-layer.test.mjs
```

Then check in browser:

```js
TowerBattleIntel?.version
```

Expected:

```text
v4.11s
```
