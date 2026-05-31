# The Tower v28.2.0 Deep Static Game Brain Audit

Read-only audit of the uploaded APKPure XAPK for safe TBI Game Brain use.

## Safe conclusion

- BattleHistoryEntry metadata properties found: **142**
- Existing TBI parser fields still present: **142/142**
- TowerWrappedStats metadata properties found: **62**
- Feature signal categories recorded: **7**

No parser-breaking Battle Report property-name change was detected. Use v28.2.0 as a freshness/knowledge layer, not a hidden-formula source.

## Useful Game Brain modules

### Battle History Ui
BattleHistoryEntryUI, BattleHistoryStatData, BattleHistoryRoundStatsPanel, Button_CopyToClipboard, CreateBattleHistoryEntry, GetBattleHistoryValue, OpenBattleHistoryPanel, OpenBattleHistoryRoundStatsPanel

### Save Cloud Storage
AccountManager, LoadLocalSave, LoadSaveFromFirestore, SaveToFirestore, SaveToFirestoreUsingCloudFunction, LocalDataManager, SafePlayerPrefs, SaveLoad, PlayCloudDataManager, LoadFromCloud, SaveToCloud, AutoSaveFunction, ScheduleSave, DeleteLocalSave, UsingCloudSaveV2, BattleHistory

### Dissonance
DissonanceManager, DissonanceInfoUI, DissonanceBonusUI, DissonanceTypeIcon, DissonantRunButton, DissonantRunPanelUI, DissonantBoostViewer, DissonanceTabButton, DissonanceType, dissonanceType

### Overheat Heat
eLSDecayAmount, eLSDecayWavesUntilDecay, damageDecayPenalty, damageDecayWavesUntilDecay, healthDecayPenalty, healthDecayWavesUntilDecay, active_fixedHeatConditions, active_tournamentBattleConditions, AppendHeatDefinitionEntries, Tournament Heat Main Bar, Tournament Conditions Panel, damageDecay, healthDecay, fleetsSkipped, numFleetsSkipped, moreEliteSkipped, moreFleetSkipped

### Bots Plus
AllBotPlusUnlocked, AllBotsUnlocked, Bot+ Description Panel, Synchronicity Panel, ApplyTitanShock, Wildfire, TitanShock, BonusCells, EchoingShot, Synchronicity, AmplifyBotPresets, goldenBotCoinsEarned, thunderBotStuns, flameBotDamage

### Enemies
normalEnemyPool, scatterChildEnemyPool, rayEnemyPool, scatterEnemyPool, vampireEnemyPool, saboteurEnemyPool, commanderEnemyPool, overchargeEnemyPool, bossEnemyPool, TotalSaboteurs, TotalCommanders, TotalOvercharges, DiedToSaboteur, DiedToCommander, DiedToOvercharge

### Ultimate Weapons
ApplyDeathWaveEffects, ApplyGoldenTowerVFX, ApplySmartMissilesDamage, chainLightning, deathwave, chronoField, smartMissile, goldenTower, swamp, spotlight, Ultimate Weapon VFX Toggles, goldenTowerPlusCombo, goldenTowerPlusCashBonus, goldenTowerPlusCoinsBonus

## Notes
- All existing Battle Report parser fields remain visible by metadata name in v28.2.0.
- TowerWrappedStats metadata names are useful for a future account stats/knowledge view but are not readable account values by themselves.
- Save/cloud class names confirm Battle History is part of local/cloud save architecture, but TBI should continue using user-copied Battle Reports instead of trying to read another app save.
