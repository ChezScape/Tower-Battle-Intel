# The Tower v28.1.0 — Battle Report Data Audit

Static audit of readable Battle Report / Battle History data found in the uploaded XAPK. This is designed for Tower Battle Intel, especially parser, History, Compare, Systems, Command Deck, and Debug Panel work.

## What this proves

- The app has a `BattleHistoryEntry` schema with **142 fields**.

- The report system uses official section labels such as **Currencies**, **Health Regenerated**, **Damage Blocked**, **Counts**, **Miscellaneous**, **Records**, **Enemies Hit By**, **Killed With Effect Active**, and **Enemies Destroyed By**.

- The app separates **hit attribution**, **kill attribution**, and **effect-window kills**. That is very important for TBI.

- The label **Other** in Battle Report should be treated as `DestroyedByOther`, while **Other Coin Bonuses** is a separate economy field.

- The app schema includes internal support for `IsTournament` and `DissonanceType`, but pasted reports may not expose them clearly.


## Field family counts

| Family | Fields |
|---|---:|
| Currencies / Rewards | 26 |
| Damage Output | 21 |
| Survival / Damage Blocked / Regen | 17 |
| Enemies Destroyed By / Effect Active | 17 |
| Enemies Hit By | 14 |
| Records / Utility / Counts | 14 |
| Enemy Counts / Kills Breakdown | 14 |
| Run Header / Identity | 9 |
| Guardian | 9 |
| Bots | 1 |

## Official/observed Battle Report section labels

- Currencies
- Health Regenerated
- Damage Blocked
- Counts
- Miscellaneous
- Records
- Enemies Hit By
- Killed With Effect Active
- Enemies Destroyed By

## Most useful finds for TBI

### The app has a much wider BattleHistoryEntry schema than the current sample reports show.
TBI should accept optional fields without failing and report unknown/new fields in Debug.

### The app separates Enemies Hit By, Enemies Destroyed By, and Killed With Effect Active.
TBI should not treat hits, kill source, and effect-window kills as the same thing.

### Other is present as DestroyedByOther and Other Coin Bonuses is a separate currency field.
TBI should split Other Kills from Other Coin Bonuses.

### Battle history stores IsTournament and DissonanceType internally.
TBI can add report tags for tournament/dissonance instead of relying on pasted marker text.

### Newer enemy subtype totals exist: Saboteurs, Commanders, Overcharges.
TBI parser/enemy catalogue should support these now, even if older reports do not include them.

### Guardian report fields exist for damage, summons, stolen/fetched coins, catches, gems, medals, shards, and module drops.
Systems/Command Deck can later evaluate Guardian value and loot contribution.

## Suggested TBI parser changes

1. Add a canonical report-field dictionary generated from `battleReportFields.csv`.
2. Add aliases so official labels, lowerCamel keys, and title-case keys all map to the same canonical field.
3. Add a Debug Panel check for unknown pasted report fields.
4. Keep three separate analysis buckets: **Enemies Hit By**, **Enemies Destroyed By**, and **Killed With Effect Active**.
5. Add a source-confidence label: `Game-file observed` for schema fields, `Game-file label` where an official localisation label exists.

## Field catalogue

### Bots

| Property | Label | Note |
|---|---|---|
| `ThunderBotStuns` | Thunder Bot Stuns |  |

### Currencies / Rewards

| Property | Label | Note |
|---|---|---|
| `CoinsEarned` | Coins Earned | Useful for economy attribution and Compare family totals. |
| `CashEarned` | Cash Earned | Useful for economy attribution and Compare family totals. |
| `InterestEarned` | Interest Earned | Useful for economy attribution and Compare family totals. |
| `GemsThisRound` | Gems This Round |  |
| `GemBlocksTapped` | Gem Blocks Tapped |  |
| `AdGemsThisRound` | Ad Gems |  |
| `CellsEarned` | Cells Earned | Useful for economy attribution and Compare family totals. |
| `RerollShardsEarned` | Reroll Shards Earned | Useful for economy attribution and Compare family totals. |
| `MostCoinsFromWaveSkip` | Most Coins From Wave Skip | Useful for economy attribution and Compare family totals. |
| `MostCellsFromWaveSkip` | Most Cells From Wave Skip |  |
| `MostCoinsFromGoldenCombo` | Most Coins From Golden Combo | Useful for economy attribution and Compare family totals. |
| `CoinsFromDeathWave` | Coins From Death Wave | Useful for economy attribution and Compare family totals. |
| `CoinsFromGoldenTower` | Coins From Golden Tower | Useful for economy attribution and Compare family totals. |
| `CoinsFromGoldenTowerPlus` | Coins From Golden Tower Plus | Useful for economy attribution and Compare family totals. |
| `CashFromGoldenTower` | Cash From Golden Tower |  |
| `CoinsFromBlackHole` | Coins From Black Hole | Useful for economy attribution and Compare family totals. |
| `CoinsFromSpotlight` | Coins From Spotlight | Useful for economy attribution and Compare family totals. |
| `CoinsFromOrbs` | Coins From Orbs | Useful for economy attribution and Compare family totals. |
| `CoinsFromCoinUpgrade` | Coins From Coin Bonus Upgrade | Useful for economy attribution and Compare family totals. |
| `CoinsFromCoinBonuses` | Other Coin Bonuses | Separate economy misc bucket; label as Other Coin Bonuses. |
| `CoinsFromCritCoin` | Coins From Critical Coin | Useful for economy attribution and Compare family totals. |
| `GoldenBotCoinsEarned` | Golden Bot Coins Earned | Useful for economy attribution and Compare family totals. |
| `GuardianCoinsStolen` | Guardian Coins Stolen | Useful for Guardian-era report support and future Command Deck/Systems analysis. |
| `GuardianCoinsFetched` | Guardian Coins Fetched | Useful for Guardian-era report support and future Command Deck/Systems analysis. |
| `GuardianGems` | Guardian Gems | Useful for Guardian-era report support and future Command Deck/Systems analysis. |
| `GuardianRerollShards` | Guardian Reroll Shards | Useful for Guardian-era report support and future Command Deck/Systems analysis. |

### Damage Output

| Property | Label | Note |
|---|---|---|
| `DamageGainFromBerserk` | Damage Gain From Berserk |  |
| `DamageDealt` | Damage Dealt |  |
| `ProjectilesDamage` | Projectiles Damage |  |
| `ProjectilesCount` | Projectiles Count |  |
| `ThornDamage` | Thorn Damage |  |
| `OrbDamage` | Orb Damage |  |
| `ElectronsDamage` | Electrons Damage |  |
| `LandMineDamage` | Land Mine Damage |  |
| `LandMinesSpawned` | Land Mines Spawned |  |
| `RendArmorDamage` | Rend Armor Damage |  |
| `DeathRayDamage` | Death Ray Damage |  |
| `SmartMissileDamage` | Smart Missile Damage |  |
| `InnerLandMineDamage` | Inner Land Mine Damage |  |
| `ChainLightningDamage` | Chain Lightning Damage |  |
| `DeathWaveDamage` | Death Wave Damage |  |
| `TaggedByDeathwave` | Enemies Tagged By Death Wave |  |
| `SwampDamage` | Swamp Damage |  |
| `BlackHoleDamage` | Black Hole Damage |  |
| `OrbHits` | Orb Hits |  |
| `FlameBotDamage` | Flame Bot Damage |  |
| `GuardianDamage` | Guardian Damage | Useful for Guardian-era report support and future Command Deck/Systems analysis. |

### Enemies Destroyed By / Effect Active

| Property | Label | Note |
|---|---|---|
| `DestroyedInSpotlight` | Destroyed In Spotlight | Useful for effect-window kills; separate from direct kill source. |
| `DestroyedInGoldenTower` | Destroyed In Golden Tower | Useful for effect-window kills; separate from direct kill source. |
| `DestroyedInAmplifyBot` | Destroyed In Amplify Bot | Useful for effect-window kills; separate from direct kill source. |
| `DestroyedInGoldenBot` | Destroyed In Golden Bot | Useful for effect-window kills; separate from direct kill source. |
| `DestroyedByOrbs` | Destroyed By Orbs | Useful for kill-credit diagnostics: what actually finished enemies. |
| `DestroyedByThorns` | Destroyed By Thorns | Useful for kill-credit diagnostics: what actually finished enemies. |
| `DestroyedByDeathRay` | Destroyed By Death Ray | Useful for kill-credit diagnostics: what actually finished enemies. |
| `DestroyedByLandMine` | Destroyed By Land Mine | Useful for kill-credit diagnostics: what actually finished enemies. |
| `DestroyedByProjectiles` | Destroyed By Projectiles | Useful for kill-credit diagnostics: what actually finished enemies. |
| `DestroyedByChainLightning` | Destroyed By Chain Lightning | Useful for kill-credit diagnostics: what actually finished enemies. |
| `DestroyedBySmartMissiles` | Destroyed By Smart Missiles | Useful for kill-credit diagnostics: what actually finished enemies. |
| `DestroyedByInnerLandMines` | Destroyed By Inner Land Mines | Useful for kill-credit diagnostics: what actually finished enemies. |
| `DestroyedByPoisonSwamp` | Destroyed By Poison Swamp | Useful for kill-credit diagnostics: what actually finished enemies. |
| `DestroyedByBlackHole` | Destroyed By Black Hole | Useful for kill-credit diagnostics: what actually finished enemies. |
| `DestroyedByFlameBot` | Destroyed By Flame Bot | Useful for kill-credit diagnostics: what actually finished enemies. |
| `DestroyedByDeathPenalty` | Destroyed By Death Penalty | Useful for kill-credit diagnostics: what actually finished enemies. |
| `DestroyedByOther` | Other | Treat as uncategorised kill-source bucket; do not merge with Other Coin Bonuses. |

### Enemies Hit By

| Property | Label | Note |
|---|---|---|
| `EnemiesHitByProjectilesThisRound` | Enemies Hit By Projectiles | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitByThornsThisRound` | Enemies Hit By Thorns | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitByDeathRayThisRound` | Enemies Hit By Death Ray | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitByChainLightningThisRound` | Enemies Hit By Chain Lightning | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitBySmartMissilesThisRound` | Enemies Hit By Smart Missiles | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitByInnerLandMinesThisRound` | Enemies Hit By Inner Land Mines | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitByPoisonSwampThisRound` | Enemies Hit By Poison Swamp | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitByBlackHoleThisRound` | Enemies Hit By Black Hole | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitByChronoFieldThisRound` | Enemies Hit By Chrono Field | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitByLandMineThisRound` | Enemies Hit By Land Mine | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitByThunderBotThisRound` | Enemies Hit By Thunder Bot | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitByFlameBotThisRound` | Enemies Hit By Flame Bot | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitByAttackChipThisRound` | Enemies Hit By Attack Chip | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |
| `EnemiesHitByOrbitalAugmentThisRound` | Enemies Hit By Orbital Augment | Useful for effect coverage diagnostics: what touched enemies, not necessarily what killed them. |

### Enemy Counts / Kills Breakdown

| Property | Label | Note |
|---|---|---|
| `TotalEnemies` | Total Enemies |  |
| `TotalBasic` | Total Basic |  |
| `TotalFast` | Total Fast |  |
| `TotalTank` | Total Tank |  |
| `TotalRanged` | Total Ranged |  |
| `TotalBoss` | Total Boss |  |
| `TotalProtector` | Total Protector |  |
| `TotalElites` | Total Elites |  |
| `TotalVampires` | Total Vampires |  |
| `TotalRays` | Total Rays |  |
| `TotalScatters` | Total Scatters |  |
| `TotalSaboteurs` | Total Saboteurs | Newer elite/enemy subtypes; add parser support before users paste reports containing them. |
| `TotalCommanders` | Total Commanders | Newer elite/enemy subtypes; add parser support before users paste reports containing them. |
| `TotalOvercharges` | Total Overcharges | Newer elite/enemy subtypes; add parser support before users paste reports containing them. |

### Guardian

| Property | Label | Note |
|---|---|---|
| `GuardianSummoned` | Guardian Summoned | Useful for Guardian-era report support and future Command Deck/Systems analysis. |
| `GuardianCatches` | Guardian Catches | Useful for Guardian-era report support and future Command Deck/Systems analysis. |
| `GuardianMedals` | Guardian Medals | Useful for Guardian-era report support and future Command Deck/Systems analysis. |
| `GuardianCannonShards` | Guardian Cannon Shards | Useful for Guardian-era report support and future Command Deck/Systems analysis. |
| `GuardianArmorShards` | Guardian Armor Shards | Useful for Guardian-era report support and future Command Deck/Systems analysis. |
| `GuardianGeneratorShards` | Guardian Generator Shards | Useful for Guardian-era report support and future Command Deck/Systems analysis. |
| `GuardianCoreShards` | Guardian Core Shards | Useful for Guardian-era report support and future Command Deck/Systems analysis. |
| `GuardianCommonModules` | Guardian Common Modules | Useful for Guardian-era report support and future Command Deck/Systems analysis. |
| `GuardianRareModules` | Guardian Rare Modules | Useful for Guardian-era report support and future Command Deck/Systems analysis. |

### Records / Utility / Counts

| Property | Label | Note |
|---|---|---|
| `WavesSkipped` | Waves Skipped |  |
| `NukesUsed` | Nukes Used |  |
| `SecondWindsUsed` | Second Winds Used |  |
| `DemonModesUsed` | Demon Modes Used |  |
| `LargestWaveSkip` | Largest Wave Skip |  |
| `HighestCPM` | Highest Coins / Minute |  |
| `LargestSmartMissileStack` | Largest Smart Missile Stack |  |
| `LargestGoldenCombo` | Largest Golden Combo |  |
| `LargestILMCharge` | Largest Inner Landmine Charge |  |
| `FreeAttackUpgrades` | Free Attack Upgrades |  |
| `FreeDefenseUpgrades` | Free Defense Upgrades |  |
| `FreeUtilityUpgrades` | Free Utility Upgrades |  |
| `AttackLevelSkips` | Attack Level Skips |  |
| `HealthLevelSkips` | Health Level Skips |  |

### Run Header / Identity

| Property | Label | Note |
|---|---|---|
| `SelectedTower` | Selected Tower |  |
| `BattleDate` | Battle Date |  |
| `GameTime` | Game Time |  |
| `RealTime` | Real Time |  |
| `IsTournament` | Is Tournament | Internal battle history supports tournament flag; pasted reports may not show it, so TBI still needs manual tournament tagging. |
| `Tier` | Tier |  |
| `Wave` | Wave |  |
| `KilledBy` | Killed By |  |
| `DissonanceType` | Dissonance Type | Useful for future Dissonance run support and report filtering. |

### Survival / Damage Blocked / Regen

| Property | Label | Note |
|---|---|---|
| `DamageTaken` | Damage Taken |  |
| `DamageTakenWall` | Damage Taken Wall |  |
| `DamageTakenWhileBerserked` | Damage Taken While Berserked |  |
| `DeathDefy` | Death Defy | Useful for survival diagnosis and why a run held/folded. |
| `Lifesteal` | Lifesteal | Useful for survival diagnosis and why a run held/folded. |
| `TowerHealthRegen` | Tower Health Regen | Useful for survival diagnosis and why a run held/folded. |
| `WallHealthRegen` | Wall Health Regen | Useful for survival diagnosis and why a run held/folded. |
| `DefensePercentBlocked` | Defense Percent Blocked | Useful for survival diagnosis and why a run held/folded. |
| `DefenseAbsoluteBlocked` | Defense Absolute Blocked | Useful for survival diagnosis and why a run held/folded. |
| `ChronoFieldBlocked` | Chrono Field Blocked | Useful for survival diagnosis and why a run held/folded. |
| `ChainThunderBlocked` | Chain Thunder Blocked | Useful for survival diagnosis and why a run held/folded. |
| `FlameBotBlocked` | Flame Bot Blocked | Useful for survival diagnosis and why a run held/folded. |
| `PrimordialCollapseBlocked` | Primordial Collapse Blocked | Useful for survival diagnosis and why a run held/folded. |
| `MagicOrbBlocked` | Magic Orb Blocked | Useful for survival diagnosis and why a run held/folded. |
| `EnergyShieldHitsAbsorbed` | Hits Absorbed By Energy Shield |  |
| `HealthFromDeathWaveThisRound` | HP From Death Wave |  |
| `RecoveryPackages` | Recovery Packages |  |
