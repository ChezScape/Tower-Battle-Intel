# Tower Battle Intel v4.10v Universal Download Fix

Fixes downloads that were still blocked after v4.10u:

- History → Export History
- History Stats → Download JSON
- Debug → Download Health Scan JSON
- Debug → Download Full Debug JSON

The fix adds a classic non-module script before `app.js` so it binds download buttons before later capture-phase dashboard bridges can steal those click events.

Browser checks:

```js
TowerBattleIntel?.version
TowerBattleIntelUniversalDownloadBridge?.status()
TowerBattleIntelNativeControls?.status()
```

Manual test:

1. Open History and click Export History.
2. Open a saved run Stats modal and click Download JSON.
3. Open Debug and click Download Health Scan JSON.
4. Open Debug and click Download Full Debug JSON.
