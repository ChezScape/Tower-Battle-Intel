# The Tower v28.1.0 — Project-wide useful data map for Tower Battle Intel

This report is from a static, read-only scan of the uploaded XAPK/APK readable strings and IL2CPP metadata strings. It is designed to answer: what else is useful for TBI beyond Battle Reports and wave milestones?

## Safety / confidence note

- Good for: official names, labels, descriptions, schema clues, categories, glossary wording, parser aliases, debug health checks.

- Not safe for: exact hidden formulas, live server tournament settings, account/player data, anti-cheat internals, or anything requiring bypassing protections.


Total categorized useful string/metadata hits: **21627**.

## Recommended next build order

| Priority | Data area | Why it matters | Hits | Confidence |
|---:|---|---|---:|---|
| 1 | Enemy catalogue, death causes, and threat explanations | Command Deck death diagnosis, History killed-by filters, Systems enemy glossary | 2888 | High for names/descriptions; Medium for threat tags; Low for exact scaling. |
| 2 | Ultimate Weapons and upgrade families | Economy source explanations, Command Deck strategy tags, Compare UW contribution rows | 455 | High for names/descriptions; Medium for linking stats; Low for exact cooldown/quantity values. |
| 3 | Cards, card effects, and card masteries | History cards/no-cards context, Command Deck advice, Systems cards glossary | 419 | High for names/descriptions; Medium for strategic interpretation. |
| 4 | Workshop upgrades and enhancements | Systems glossary, Command Deck build weakness hints, History search aliases | 1384 | High for labels/descriptions; Low for exact upgrade cost formulas unless extracted later. |
| 5 | Labs / research catalogue | Systems research glossary, Command Deck upgrade suggestions, Debug catalogue health | 512 | High for category names and labels; Low for full formula/cost tables. |
| 6 | Tournament, Heat, leagues, battle conditions | Tournament manual tag support, Heat warning overlay, league difficulty notes | 441 | High for condition names/descriptions and heat breakpoints; Medium/Low for current live rotations. |
| 7 | Guardian and loot/shard tracking | New History/Compare Guardian section, resource tracking, Command Deck “is Guardian helping?” verdict | 255 | High for report fields; Medium for coaching meaning. |
| 8 | Modules, rarities, substats, merge/shatter/reroll | Systems modules glossary, Guardian/module loot tracking, Command Deck upgrade notes | 4973 | Medium-High for names/resources; Low for full unique effect tables without deeper extraction. |
| 9 | Bots and bot upgrades | Systems bot glossary, Compare bot economy/combat rows, Command Deck bot advice | 274 | High for names/labels; Medium for exact effect interpretation. |
| 10 | Perks and trade-off perks | Run context flags, History annotation, Command Deck explanation of weird run changes | 95 | High for text; Medium/Low for actual run state unless user records it. |
| 11 | Resources and economy sources | Economy breakdown cards, Compare economy lead reasons, History resource filters | 1373 | High for labels; Medium for causal interpretation. |
| 12 | Missions, events, relics, medals | Systems event glossary, future goal tracker, manual notes beside reports | 4658 | High for labels; Low for live event state. |
| 13 | Internal names useful for diagnostics only | Debug Panel health checks, internal audit naming, finding missing data wires | 627 | Medium. Useful for diagnostics, not player-facing wording. |
| 14 | Official UI strings and aliases | Parser aliases, search synonyms, tooltip wording | 2190 | High for wording; not gameplay logic. |
| 15 | Battle Report schema / parser dictionary | Parser aliases, Save Report feedback, duplicate checks | 65 | High for labels/schema names; Medium for exact meaning of fallback buckets such as Other. |
| 16 | Waves, tiers, milestones, and run bands | Game Brain next checkpoint, History milestone badges, Compare run-band context | 1018 | High for concept/labels; Medium for checkpoint logic; Low for hidden formula values. |

## Category details

### 1. Enemy catalogue, death causes, and threat explanations

**Useful for:** Command Deck death diagnosis, History killed-by filters, Systems enemy glossary, Compare enemy pressure profile, Game Brain threat tags.

**Recommendation:** Add enemyCatalogue v28.1.0 with official descriptions and TBI threat tags.

**Confidence:** High for names/descriptions; Medium for threat tags; Low for exact scaling.

**Hit count:** 2888 | Source split: {'assets': 490, 'metadata': 1779, 'libil2cpp': 619}

**Examples found:**

- `Boss-Leben - {0} %, Bossgeschwindigkeit jedoch + {1} %` (assets:3992)
- `Los escudos de los protectores otorgan inmunidad al da` (assets:16368)
- `Posibilidad de que el Rayo en Cadena aplique Descarga.` (assets:35420)
- `2x faster than basic enemies. Worth 2 coins as base value` (assets:948)
- `di {0} che distrugge i nemici a contatto (eccetto i boss)` (assets:2280)
- `Fires an Energy Net at the Boss, Immobilizing it for=` (assets:2311)
- `On Basic Enemy Crit Kill: Base 1 coin drop at a chance of` (assets:2341)
- `Nach einer Bosswelle spawnt garantiert ein Erholungspaket` (assets:6059)
- `All cards are locked while a boss or Fleet enemy is alive` (assets:12196)
- `Increase the number of reroll shards that bosses drop` (assets:14169)

### 2. Ultimate Weapons and upgrade families

**Useful for:** Economy source explanations, Command Deck strategy tags, Compare UW contribution rows, Systems UW glossary.

**Recommendation:** Add ultimateWeaponCatalogue with effects and linked Battle Report fields.

**Confidence:** High for names/descriptions; Medium for linking stats; Low for exact cooldown/quantity values.

**Hit count:** 455 | Source split: {'assets': 199, 'metadata': 256}

**Examples found:**

- `Ultimate weapons are permanent additions to your tower.` (assets:1702)
- `You need the Spotlight Ultimate Weapon to research this` (assets:7584)
- `Extra coins bonus applied to enemies hit by Death Wave` (assets:4762)
- `Effect Wave Hits amplify Death Wave Damage (additive).` (assets:20858)
- `Chain Lightning Hit: Chance to Shock (Increase Damage)` (assets:35402)
- `Increase the damage reduction effect of Chrono Field>` (assets:4629)
- `How high the chance of Chain Lightning to apply Shock` (assets:4723)
- `You need the Death Wave Ultimate Weapon to research thisH` (assets:7542)
- `You need the Black Hole Ultimate Weapon to research thisD` (assets:7578)
- `During Chrono Field: Reduces Damage (After Abs Def).?` (assets:35690)

### 3. Cards, card effects, and card masteries

**Useful for:** History cards/no-cards context, Command Deck advice, Systems cards glossary, Compare explaining changed run style.

**Recommendation:** Add cardCatalogue + masteryCatalogue; useful before advanced coaching.

**Confidence:** High for names/descriptions; Medium for strategic interpretation.

**Hit count:** 419 | Source split: {'assets': 292, 'metadata': 127}

**Examples found:**

- `You need the Double Crit Coin Mastery to research this` (assets:18590)
- `You need the Double Wave Skip Mastery to research this` (assets:18607)
- `You need the Energy Converter Mastery to research this` (assets:18720)
- `Increases the Wave Accelerator spawn rate acceleration` (assets:20150)
- `Demon Mode will activate when its cooldown is complete` (assets:22335)
- `dent soustrait 5 vagues, 50 si Intro Sprint est actif.` (assets:35278)
- `buy, upgrade and switch cards to evolve your strategy` (assets:3498)
- `All cards are locked while a boss or Fleet enemy is alive` (assets:12196)
- `You need the Attack Speed+ card mastery to research this`` (assets:18377)
- `You need the Health Regen+ card mastery to research thish` (assets:18407)

### 4. Workshop upgrades and enhancements

**Useful for:** Systems glossary, Command Deck build weakness hints, History search aliases, Compare family grouping, future build planner.

**Recommendation:** Build a workshopCatalogue with official labels/descriptions and families Attack/Defense/Utility/Economy.

**Confidence:** High for labels/descriptions; Low for exact upgrade cost formulas unless extracted later.

**Hit count:** 1384 | Source split: {'assets': 533, 'metadata': 851}

**Examples found:**

- `You need the Interest workshop upgrade to research this` (assets:7628)
- `glicht, die Distanz von Extra-Orbs zum Turm anzupassen` (assets:4825)
- `Increase recovery package chance of spawning each wave` (assets:7835)
- `On Shockwave Hit: Enemies take {0} more Damage for 7s.` (assets:13215)
- `Effect Wave Hits amplify Death Wave Damage (additive).` (assets:20858)
- `Chain Lightning Hit: Chance to Shock (Increase Damage)` (assets:35402)
- `Geschwindigkeit der Orbs, die deinen Turm verteidigen` (assets:640)
- `On Wave End: Chance to grant a Free Defense Upgrade.O` (assets:702)
- `On Wave End: Chance to grant a Free Utility Upgrade.O` (assets:712)
- `Land Mines deal {0}x Tower Damage (Scales with all Crit).` (assets:910)

### 5. Labs / research catalogue

**Useful for:** Systems research glossary, Command Deck upgrade suggestions, Debug catalogue health, future priority planner.

**Recommendation:** Add labResearchCatalogue with category/source labels; do not estimate lab costs yet.

**Confidence:** High for category names and labels; Low for full formula/cost tables.

**Hit count:** 512 | Source split: {'assets': 182, 'metadata': 330}

**Examples found:**

- `You need the Spotlight Ultimate Weapon to research this` (assets:7584)
- `You need the Interest workshop upgrade to research this` (assets:7628)
- `You need the Double Crit Coin Mastery to research this` (assets:18590)
- `You need the Double Wave Skip Mastery to research this` (assets:18607)
- `You need the Energy Converter Mastery to research this` (assets:18720)
- `Research new upgrades to unlock new parts of the game` (assets:3131)
- `Have a total lab research time of {0} (rushed labs count)` (assets:6563)
- `You need the Death Wave Ultimate Weapon to research thisH` (assets:7542)
- `You need the Land Mines Ultimate Weapon to research this@` (assets:7555)
- `You need the Black Hole Ultimate Weapon to research thisD` (assets:7578)

### 6. Tournament, Heat, leagues, battle conditions

**Useful for:** Tournament manual tag support, Heat warning overlay, league difficulty notes, Compare tournament vs farming separation, Command Deck risk notes.

**Recommendation:** Add heat/league catalogue, but keep live tournament settings source-labelled unless pasted by user or confirmed.

**Confidence:** High for condition names/descriptions and heat breakpoints; Medium/Low for current live rotations.

**Hit count:** 441 | Source split: {'assets': 191, 'metadata': 247, 'libil2cpp': 3}

**Examples found:**

- `Create a Field for {0}s that reduces Enemy Speed by {1}%.` (assets:815)
- `Platziere dich im Champion-Turnier unter den Top {0}0` (assets:10428)
- `Kills im Goldenen Turm bringen +1 Combo. Am Ende: Gew` (assets:11134)
- `Modules that start with Rare rarity can reach Legendary+F` (assets:13721)
- `Elites killed in Golden Bot range grant {0}x more Cells.U` (assets:34014)
- `You need the Golden Tower Ultimate Weapon to research this` (assets:7561)
- `Du brauchst den Goldenen Bot, um dies zu erforschen` (assets:7654)
- `Increases card mastery enemy attack speed reduction` (assets:19913)
- `Turn Tower Golden for {0}s. Grants {1}x Cash & Coins on Kill.` (assets:859)
- `Sync Death Wave, Golden Tower, & Black Hole. Cooldown = {0}s.` (assets:35663)

### 7. Guardian and loot/shard tracking

**Useful for:** New History/Compare Guardian section, resource tracking, Command Deck “is Guardian helping?” verdict, Debug parser checks.

**Recommendation:** Add guardianCatalogue and a Guardian report section. This is very useful because current TBI likely under-explains it.

**Confidence:** High for report fields; Medium for coaching meaning.

**Hit count:** 255 | Source split: {'assets': 36, 'metadata': 219}

**Examples found:**

- `Tower guardian increases the speed of the wave timerC` (assets:24728)
- `Tower guardian scares nearby enemies, causing them to flee` (assets:24714)
- `You may respec Guardian a maximum of once per week` (assets:27808)
- `Cannot respec Guardian while a round is active` (assets:27997)
- `Tower Guardian attacks nearby enemies. Deals % of Missing Health.` (assets:24691)
- `Guardian chips are locked during battle` (assets:26148)
- `Tower guardian attempts to catch enemy projectiles before they hit the towerd` (assets:24680)
- `Tower Guardian retrieves hidden loot (Coins, Gems, Medals, Shards, Modules).r` (assets:26922)
- `All Guardian upgrades will be reset, and you will receive back all Bits spent` (assets:27786)
- `Tower Guardian places a Bounty on a nearby non-Common Enemy. Grants Bonus Coins on Kill.` (assets:28560)

### 8. Modules, rarities, substats, merge/shatter/reroll

**Useful for:** Systems modules glossary, Guardian/module loot tracking, Command Deck upgrade notes, Debug schema grouping.

**Recommendation:** Add moduleCatalogue and moduleResourceCatalogue; keep effects descriptive first.

**Confidence:** Medium-High for names/resources; Low for full unique effect tables without deeper extraction.

**Hit count:** 4973 | Source split: {'assets': 546, 'metadata': 4307, 'libil2cpp': 120}

**Examples found:**

- `Modules that start with Epic rarity can reach Ancestral` (assets:13738)
- `Ban specific armor effects when rerolling armor modules` (assets:22901)
- `bloquer l'emplacement de module d'assistance du canon)` (assets:29395)
- `bloquer l'emplacement de module d'assistance de l'armure` (assets:29407)
- `bloquer l'emplacement de module d'assistance du noyau(` (assets:29432)
- `You need the Rend Armor workshop upgrade to research this` (assets:12525)
- `You can purchase modules with Module Tickets or GemsL` (assets:13617)
- `Modules that start with Rare rarity can reach Legendary+F` (assets:13721)
- `Increase the number of reroll shards that bosses drop` (assets:14169)
- `Modules used as fodder will be converted into shards!` (assets:15287)

### 9. Bots and bot upgrades

**Useful for:** Systems bot glossary, Compare bot economy/combat rows, Command Deck bot advice, History search aliases.

**Recommendation:** Add botCatalogue with known bot names/effects and Battle Report fields.

**Confidence:** High for names/labels; Medium for exact effect interpretation.

**Hit count:** 274 | Source split: {'assets': 200, 'metadata': 69, 'libil2cpp': 5}

**Examples found:**

- `Vous avez besoin du Bot Bot pour faire cette recherche.` (assets:34618)
- `Du kannst Bots maximal einmal pro Event neu verteilen.` (assets:18155)
- `gema(s) de descuento en las reespecificaciones de bots.0` (assets:26044)
- `Potencia los efectos de otros bots dentro de su alcance.` (assets:33723)
- `dulos), medallas (bots) y piedras (armas definitivas).` (assets:36210)
- `Elites killed in Golden Bot range grant {0}x more Cells.U` (assets:34014)
- `Potencia las capacidades Bot+ de los otros bots x{0}.` (assets:34068)
- `Aumenta os efeitos de outros bots dentro do alcance.` (assets:33725)
- `Bots selecionados seguem o mesmo caminho durante o jogo. N` (assets:34358)
- `nnen die Bots pro Event unbegrenzt oft neu zuweisen.` (assets:35096)

### 10. Perks and trade-off perks

**Useful for:** Run context flags, History annotation, Command Deck explanation of weird run changes, future manual tags.

**Recommendation:** Add perkGlossary and optional manual run tags; pasted Battle Reports may not include active perk state.

**Confidence:** High for text; Medium/Low for actual run state unless user records it.

**Hit count:** 95 | Source split: {'assets': 51, 'metadata': 44}

**Examples found:**

- `Select a trade off perk to be available from the beginning` (assets:4037)
- `Ban some perks to never show up as a choice for a new perk` (assets:4912)
- `You need the Auto Pick Perks lab unlocked to research this` (assets:18110)
- `x{0} cash per wave, but enemy kills don't give cash` (assets:3954)
- `tower health regen x{0}, but tower max health -{1}%` (assets:3968)
- `hle einen Trade-off-Vorteil, der von Anfang an verf` (assets:4042)
- `On Kill / Mark: Increases Tower Max Health (Max 12.5x Base)._` (assets:35579)
- `Select a perk to always be an option at the first perk choice.` (assets:4027)
- `Orbs will be able to hit bosses by a percentage of boss health` (assets:6045)
- `Enemies speed -{0}%, but enemies damage x{1}/` (assets:3935)

### 11. Resources and economy sources

**Useful for:** Economy breakdown cards, Compare economy lead reasons, History resource filters, Command Deck farming advice.

**Recommendation:** Add resourceGlossary and economySourceMap linking Battle Report fields to source systems.

**Confidence:** High for labels; Medium for causal interpretation.

**Hit count:** 1373 | Source split: {'assets': 430, 'metadata': 937, 'libil2cpp': 6}

**Examples found:**

- `You need the Spotlight Ultimate Weapon to research this` (assets:7584)
- `Get {0} free tickets to start bumping your tower power!` (assets:17036)
- `Cash Multiplier for all sources (Includes Wave Bonus).` (assets:660)
- `Extra coins bonus applied to enemies hit by Death Wave` (assets:4762)
- `Hol dir {0} kostenlose Tickets, um deine Turmkraft zu st` (assets:17041)
- `Effect Wave Hits amplify Death Wave Damage (additive).` (assets:20858)
- `Stuck on Tier {0} - Wave {1}? Spend Coins on upgrades!` (assets:33425)
- `2x faster than basic enemies. Worth 2 coins as base value` (assets:948)
- `Earn x2 gems for completing offerwall offers throughH` (assets:5414)
- `You need the Death Wave Ultimate Weapon to research thisH` (assets:7542)

### 12. Missions, events, relics, medals

**Useful for:** Systems event glossary, future goal tracker, manual notes beside reports, source labels.

**Recommendation:** Useful later, not first priority for Battle Report intelligence.

**Confidence:** High for labels; Low for live event state.

**Hit count:** 4658 | Source split: {'assets': 558, 'metadata': 4032, 'libil2cpp': 68}

**Examples found:**

- `Gana {0} medallas durante el evento Regreso del plasma.` (assets:10753)
- `Guadagna {0} medaglie durante l'evento Sabbie del tempo` (assets:11344)
- `Guadagna {0} medaglie durante l'evento Mare blu intenso` (assets:14368)
- `Guadagna {0} medaglie durante l'evento Tempesta di neve` (assets:22492)
- `rmino do evento, mas os itens marcados como "Limitado" n` (assets:6293)
- `Guadagna {0} medaglie durante l'evento Epidemia virale` (assets:10718)
- `Gana {0} medallas durante el evento Arenas del tiempo.` (assets:11349)
- `Du kannst Bots maximal einmal pro Event neu verteilen.` (assets:18155)
- `Guadagna {0} medaglie durante l'evento Notte miagolosa` (assets:23382)
- `Ganhe {0} medalhas durante o evento Caverna de Cristal` (assets:31159)

### 13. Internal names useful for diagnostics only

**Useful for:** Debug Panel health checks, internal audit naming, finding missing data wires.

**Recommendation:** Use internally only; do not expose ugly dev names in normal UI.

**Confidence:** Medium. Useful for diagnostics, not player-facing wording.

**Hit count:** 627 | Source split: {'assets': 8, 'metadata': 573, 'libil2cpp': 46}

**Examples found:**

- `Quanti danni extra subiranno i nemici quando hanno lo status Shock` (assets:4737)
- `nde, die starke Statusverbesserungen gew` (assets:36171)
- `How much extra damage enemies will take when they have the Shock status` (assets:4734)
- `Quantidade de dano extra aplicado aos inimigos quando tiverem o status de ChoqueB` (assets:4744)
- `Alle Karten sind im Status` (assets:23780)
- `-Status erleiden` (assets:4740)
- `ZDeprecated. Use DebugGeography.Other instead.` (metadata:110628)
- `This logging utility has been deprecated. Use UnityEngine.Debug.Log` (metadata:103003)
- `NDebug/Run ScheduleNotifications Preview` (metadata:101188)
- `Id = {Id}, Status = {Status}, Method = {DebuggerDisplayMethodDescription}` (metadata:101252)

### 14. Official UI strings and aliases

**Useful for:** Parser aliases, search synonyms, tooltip wording, less guessy UI labels.

**Recommendation:** Use as a parser/search dictionary, not as strategy data.

**Confidence:** High for wording; not gameplay logic.

**Hit count:** 2190 | Source split: {'assets': 359, 'metadata': 1802, 'libil2cpp': 29}

**Examples found:**

- `Are you sure you want to purchase this menu background?` (assets:24897)
- `This product isn't available to purchase at the moment.` (assets:28765)
- `Riprendere il round precedente sottrae 5 ondate, 50 se` (assets:35279)
- `Research new upgrades to unlock new parts of the game` (assets:3131)
- `Card now available to show up when buying a new card[` (assets:8497)
- `All cards are locked while a boss or Fleet enemy is alive` (assets:12196)
- `Unlock a toggle to automatically shatter rare modules` (assets:22542)
- `This action is not permitted while a round is in progress` (assets:22687)
- `All cards are locked while in the Resume Battle state` (assets:23776)
- `Reduces the effect of active battle conditions by {0}` (assets:25367)

### 15. Battle Report schema / parser dictionary

**Useful for:** Parser aliases, Save Report feedback, duplicate checks, History grouping, Compare datasheet rows, unknown-field warnings.

**Recommendation:** Already started in z26. Next: wire field explanations into Save Report feedback and Debug Panel.

**Confidence:** High for labels/schema names; Medium for exact meaning of fallback buckets such as Other.

**Hit count:** 65 | Source split: {'assets': 40, 'metadata': 25}

**Examples found:**

- `Extra coins bonus applied to enemies hit by Death Wave` (assets:4762)
- `On Hit: Amplifies Death Wave Damage taken (Max +50x/Wave).` (assets:35630)
- `On Projectile Hit: Chance to permanently increase Damage taken.` (assets:8650)
- `Bonus Damage taken per Rend stack (Max {0}x).` (assets:8664)
- `Cells earned from destroying elite enemies` (assets:15180)
- `Adds a coin bonus to enemies hit by orbs and unlocks Coin Orb research` (assets:19126)
- `Extra coins bonus applied to enemies hit by Effect Waves or Death Wave` (assets:20775)
- `Enemies hit by orbs drop bonus coins>` (assets:19628)
- `Bonus Damage taken by Shocked Enemies` (assets:35423)
- `Heals Tower for a % of Damage dealt.` (assets:606)

### 16. Waves, tiers, milestones, and run bands

**Useful for:** Game Brain next checkpoint, History milestone badges, Compare run-band context, Command Deck progression advice, Debug tier/wave validator.

**Recommendation:** Already started in z27. Next: show milestone context in Dashboard/History after saving a report.

**Confidence:** High for concept/labels; Medium for checkpoint logic; Low for hidden formula values.

**Hit count:** 1018 | Source split: {'assets': 247, 'metadata': 770, 'libil2cpp': 1}

**Examples found:**

- `Cash Multiplier for all sources (Includes Wave Bonus).` (assets:660)
- `Extra coins bonus applied to enemies hit by Death Wave` (assets:4762)
- `Increase recovery package chance of spawning each wave` (assets:7835)
- `On Shockwave Hit: Enemies take {0} more Damage for 7s.` (assets:13215)
- `You need the Double Wave Skip Mastery to research this` (assets:18607)
- `Increases the Wave Accelerator spawn rate acceleration` (assets:20150)
- `Effect Wave Hits amplify Death Wave Damage (additive).` (assets:20858)
- `Es existiert bereits ein Konto mit der Spieler-ID {0}.` (assets:25453)
- `Stuck on Tier {0} - Wave {1}? Spend Coins on upgrades!` (assets:33425)
- `On Wave End: Chance to grant a Free Defense Upgrade.O` (assets:702)

## Best practical interpretation

The most valuable next additions are not more graphs yet. The best foundation is a set of official catalogues that teach TBI the game vocabulary: enemies, ultimate weapons, cards/masteries, workshop/labs, heat/tournament, guardian, modules, bots, perks, and economy resources. Then Compare and Command Deck can use those catalogues to explain reports instead of only displaying stats.
