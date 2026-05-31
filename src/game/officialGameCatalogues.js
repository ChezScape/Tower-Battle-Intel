"use strict";

/**
 * OFFICIAL GAME BRAIN CATALOGUES v4.11z31
 * Source: v28.1.0 official catalogue foundation plus v28.2.0 uploaded XAPK static recheck.
 * Safe purpose: official vocabulary, parser aliases, Game Brain explanations, Systems glossary, Debug health.
 * Not safe purpose: hidden formulas, exact scaling maths, live server values, or automated gameplay.
 */

const CATALOGUES = Object.freeze({
    "enemyCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Enemy Catalogue",
            "catalogueKey": "enemyCatalogue",
            "entryCount": 13,
            "purpose": "Enemy names, death-cause meaning, History/Command Deck threat tags."
        },
        "entries": [
            {
                "key": "basic",
                "label": "Basic",
                "family": "Enemy / Common",
                "meaning": "Standard/common enemy pressure.",
                "tags": [
                    "common",
                    "baseline"
                ],
                "aliases": [
                    "Killed by: Basic",
                    "Total Basic"
                ],
                "battleReportLinks": [
                    "KilledBy",
                    "TotalBasic"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "death diagnosis",
                    "history filter"
                ],
                "notes": []
            },
            {
                "key": "fast",
                "label": "Fast",
                "family": "Enemy / Common",
                "meaning": "Faster common enemy; useful for speed/control pressure analysis.",
                "tags": [
                    "common",
                    "speed"
                ],
                "aliases": [
                    "Killed by: Fast",
                    "Total Fast"
                ],
                "battleReportLinks": [
                    "KilledBy",
                    "TotalFast"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "death diagnosis",
                    "control warning"
                ],
                "notes": [
                    "Observed description says Fast is 2x faster than Basic and worth 2 base coins."
                ]
            },
            {
                "key": "tank",
                "label": "Tank",
                "family": "Enemy / Common",
                "meaning": "High-health common enemy; useful for damage-scaling pressure analysis.",
                "tags": [
                    "common",
                    "health"
                ],
                "aliases": [
                    "Killed by: Tank",
                    "Total Tank"
                ],
                "battleReportLinks": [
                    "KilledBy",
                    "TotalTank"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "damage warning"
                ],
                "notes": [
                    "Observed description says Tank has 50% speed and 5x health of Basic, worth 4 base coins."
                ]
            },
            {
                "key": "ranged",
                "label": "Ranged",
                "family": "Enemy / Common",
                "meaning": "Ranged enemy pressure; relevant to range/survival/control failures.",
                "tags": [
                    "common",
                    "range"
                ],
                "aliases": [
                    "Killed by: Ranged",
                    "Total Ranged"
                ],
                "battleReportLinks": [
                    "KilledBy",
                    "TotalRanged"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "death diagnosis"
                ],
                "notes": []
            },
            {
                "key": "boss",
                "label": "Boss",
                "family": "Enemy / Boss",
                "meaning": "Boss pressure and boss-wave survival; also connected to module/reroll shard rewards.",
                "tags": [
                    "boss",
                    "survival"
                ],
                "aliases": [
                    "Killed by: Boss",
                    "Total Boss"
                ],
                "battleReportLinks": [
                    "KilledBy",
                    "TotalBoss"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "death diagnosis",
                    "module reward context"
                ],
                "notes": []
            },
            {
                "key": "protector",
                "label": "Protector",
                "family": "Enemy / Special",
                "meaning": "Protector/shield pressure can interfere with knockback, shockwave and Black Hole damage.",
                "tags": [
                    "special",
                    "shield",
                    "immunity"
                ],
                "aliases": [
                    "Protector",
                    "Total Protectors"
                ],
                "battleReportLinks": [
                    "TotalProtector"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "command deck warning",
                    "systems glossary"
                ],
                "notes": [
                    "Observed battle condition text: Protector shields can give immunity to knockback, shockwave and Black Hole damage."
                ]
            },
            {
                "key": "vampire",
                "label": "Vampire",
                "family": "Enemy / Elite",
                "meaning": "Elite sustain pressure; useful for regen/sustain shutdown and cell-farming context.",
                "tags": [
                    "elite",
                    "drain",
                    "sustain"
                ],
                "aliases": [
                    "Vampires",
                    "Total Vampires"
                ],
                "battleReportLinks": [
                    "TotalVampires"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "death diagnosis",
                    "elite pressure"
                ],
                "notes": [
                    "Observed Ultimate clue: Vampire drains faster."
                ]
            },
            {
                "key": "ray",
                "label": "Ray",
                "family": "Enemy / Elite",
                "meaning": "Elite burst/beam pressure; useful for death-cause diagnosis and elite scaling.",
                "tags": [
                    "elite",
                    "burst"
                ],
                "aliases": [
                    "Rays",
                    "Total Rays"
                ],
                "battleReportLinks": [
                    "TotalRays"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "death diagnosis",
                    "elite pressure"
                ],
                "notes": [
                    "Observed Ultimate clue: Ray shoots twice / faster."
                ]
            },
            {
                "key": "scatter",
                "label": "Scatter",
                "family": "Enemy / Elite",
                "meaning": "Elite split/children pressure; useful for crowd and damage scaling diagnosis.",
                "tags": [
                    "elite",
                    "split"
                ],
                "aliases": [
                    "Scatters",
                    "Total Scatters"
                ],
                "battleReportLinks": [
                    "TotalScatters"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "death diagnosis",
                    "elite pressure"
                ],
                "notes": [
                    "Observed Ultimate clue: Scatter splits once more; children can have more health."
                ]
            },
            {
                "key": "saboteur",
                "label": "Saboteur",
                "family": "Enemy / Fleet",
                "meaning": "Fleet-style enemy observed in Battle Report schema; keep supported even if older reports do not show it.",
                "tags": [
                    "fleet",
                    "future-report"
                ],
                "aliases": [
                    "Saboteur",
                    "Total Saboteurs"
                ],
                "battleReportLinks": [
                    "TotalSaboteurs"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "parser readiness",
                    "future report support"
                ],
                "notes": []
            },
            {
                "key": "commander",
                "label": "Commander",
                "family": "Enemy / Fleet",
                "meaning": "Fleet-style enemy observed in Battle Report schema; keep supported for future reports.",
                "tags": [
                    "fleet",
                    "future-report"
                ],
                "aliases": [
                    "Commander",
                    "Total Commanders"
                ],
                "battleReportLinks": [
                    "TotalCommanders"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "parser readiness",
                    "future report support"
                ],
                "notes": []
            },
            {
                "key": "overcharge",
                "label": "Overcharge",
                "family": "Enemy / Fleet",
                "meaning": "Fleet-style enemy observed in Battle Report schema; keep supported for future reports.",
                "tags": [
                    "fleet",
                    "future-report"
                ],
                "aliases": [
                    "Overcharge",
                    "Total Overcharges"
                ],
                "battleReportLinks": [
                    "TotalOvercharges"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "parser readiness",
                    "future report support"
                ],
                "notes": []
            },
            {
                "key": "summoned_enemies",
                "label": "Summoned Enemies",
                "family": "Enemy / Summoned",
                "meaning": "Additional/summoned enemy context for Battle Report counts.",
                "tags": [
                    "summoned",
                    "count"
                ],
                "aliases": [
                    "Summoned Enemies"
                ],
                "battleReportLinks": [
                    "SummonedEnemies"
                ],
                "sourceConfidence": "game-file-observed",
                "tbiUses": [
                    "history grouping"
                ],
                "notes": []
            }
        ],
        "battleReportRule": "Keep Hit By, Destroyed By, and Killed With Effect Active as separate meanings."
    },
    "ultimateWeaponCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Ultimate Weapon Catalogue",
            "catalogueKey": "ultimateWeaponCatalogue",
            "entryCount": 10,
            "purpose": "Ultimate Weapon/effect vocabulary and report-source links."
        },
        "entries": [
            {
                "key": "golden_tower",
                "label": "Golden Tower",
                "family": "Ultimate Weapon / Economy",
                "meaning": "Major economy source; useful for coin-source explanations.",
                "tags": [
                    "uw",
                    "economy"
                ],
                "aliases": [
                    "GT",
                    "Coins From Golden Tower"
                ],
                "battleReportLinks": [
                    "CoinsFromGoldenTower"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "compare economy source",
                    "systems glossary"
                ],
                "notes": []
            },
            {
                "key": "black_hole",
                "label": "Black Hole",
                "family": "Ultimate Weapon / Control + Economy",
                "meaning": "Enemy control and economy-linked source; do not assume hit equals kill.",
                "tags": [
                    "uw",
                    "control",
                    "economy"
                ],
                "aliases": [
                    "BH",
                    "Coins From Black Hole",
                    "Enemies Hit By Black Hole"
                ],
                "battleReportLinks": [
                    "CoinsFromBlackHole",
                    "HitByBlackHole",
                    "DestroyedByBlackHole"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "compare source split",
                    "command deck"
                ],
                "notes": []
            },
            {
                "key": "death_wave",
                "label": "Death Wave",
                "family": "Ultimate Weapon / Damage + Economy + Cells",
                "meaning": "Effect Wave/Death Wave links to damage taken, bonus coins, and bonus cells depending on setup.",
                "tags": [
                    "uw",
                    "damage",
                    "economy",
                    "cells"
                ],
                "aliases": [
                    "DW",
                    "Coins From Death Wave",
                    "Cells From Death Wave"
                ],
                "battleReportLinks": [
                    "CoinsFromDeathWave",
                    "CellsFromDeathWave",
                    "HitByDeathWave"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "economy source",
                    "cell source",
                    "damage explanation"
                ],
                "notes": []
            },
            {
                "key": "spotlight",
                "label": "Spotlight",
                "family": "Ultimate Weapon / Damage + Economy",
                "meaning": "Damage/economy multiplier source.",
                "tags": [
                    "uw",
                    "damage",
                    "economy"
                ],
                "aliases": [
                    "SL",
                    "Coins From Spotlight"
                ],
                "battleReportLinks": [
                    "CoinsFromSpotlight",
                    "KilledWithSpotlightActive"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "compare economy source"
                ],
                "notes": []
            },
            {
                "key": "smart_missiles",
                "label": "Smart Missiles",
                "family": "Ultimate Weapon / Damage",
                "meaning": "Damage-focused missile source.",
                "tags": [
                    "uw",
                    "damage",
                    "burst"
                ],
                "aliases": [
                    "SM",
                    "Smart Missiles"
                ],
                "battleReportLinks": [
                    "DestroyedBySmartMissiles"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "damage source glossary"
                ],
                "notes": []
            },
            {
                "key": "chain_lightning",
                "label": "Chain Lightning",
                "family": "Ultimate Weapon / Damage + Shock",
                "meaning": "Chained-hit damage and Shock status source; useful for shock/damage taken explanations.",
                "tags": [
                    "uw",
                    "damage",
                    "shock"
                ],
                "aliases": [
                    "CL",
                    "Shock"
                ],
                "battleReportLinks": [
                    "HitByChainLightning"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "systems glossary",
                    "command deck"
                ],
                "notes": []
            },
            {
                "key": "chrono_field",
                "label": "Chrono Field",
                "family": "Ultimate Weapon / Control + Survival",
                "meaning": "Control/slow and damage-reduction context.",
                "tags": [
                    "uw",
                    "control",
                    "survival"
                ],
                "aliases": [
                    "CF",
                    "Chrono Field"
                ],
                "battleReportLinks": [
                    "KilledWithChronoFieldActive"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "survival explanation"
                ],
                "notes": []
            },
            {
                "key": "inner_land_mines",
                "label": "Inner Land Mines",
                "family": "Ultimate Weapon / Damage + Control",
                "meaning": "Mine-based damage/control source.",
                "tags": [
                    "uw",
                    "damage",
                    "control"
                ],
                "aliases": [
                    "ILM",
                    "Inner Land Mines"
                ],
                "battleReportLinks": [
                    "DestroyedByInnerLandMines"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "damage source glossary"
                ],
                "notes": []
            },
            {
                "key": "poison_swamp",
                "label": "Poison Swamp",
                "family": "Ultimate Weapon / Damage + Control",
                "meaning": "Poison/control source; can appear in destroyed/effect-active contexts.",
                "tags": [
                    "uw",
                    "damage",
                    "control"
                ],
                "aliases": [
                    "PS",
                    "Poison Swamp"
                ],
                "battleReportLinks": [
                    "DestroyedByPoisonSwamp",
                    "KilledWithPoisonSwampActive"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "damage source glossary"
                ],
                "notes": []
            },
            {
                "key": "synchronicity",
                "label": "Synchronicity",
                "family": "Ultimate Weapon / Research clue",
                "meaning": "Observed UW-related term; keep as glossary/search alias until exact mechanic is needed.",
                "tags": [
                    "uw",
                    "research",
                    "observed"
                ],
                "aliases": [
                    "Synchronicity"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-observed",
                "tbiUses": [
                    "search alias"
                ],
                "notes": []
            }
        ]
    },
    "cardCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Card Catalogue",
            "catalogueKey": "cardCatalogue",
            "entryCount": 13,
            "purpose": "Cards and card-context terms useful for Systems, History and Command Deck."
        },
        "entries": [
            {
                "key": "attack_speed",
                "label": "Attack Speed",
                "family": "Card / Attack",
                "meaning": "Attack speed card/stat context.",
                "tags": [
                    "card",
                    "attack"
                ],
                "aliases": [
                    "Attack Speed"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "systems glossary"
                ],
                "notes": []
            },
            {
                "key": "damage",
                "label": "Damage",
                "family": "Card / Attack",
                "meaning": "Damage card/stat context.",
                "tags": [
                    "card",
                    "attack"
                ],
                "aliases": [
                    "Damage"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "systems glossary"
                ],
                "notes": []
            },
            {
                "key": "health",
                "label": "Health",
                "family": "Card / Defense",
                "meaning": "Health card/stat context.",
                "tags": [
                    "card",
                    "defense"
                ],
                "aliases": [
                    "Health"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "systems glossary"
                ],
                "notes": []
            },
            {
                "key": "health_regen",
                "label": "Health Regen",
                "family": "Card / Defense",
                "meaning": "Health regeneration card/stat context.",
                "tags": [
                    "card",
                    "defense",
                    "regen"
                ],
                "aliases": [
                    "Health Regen"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "systems glossary"
                ],
                "notes": []
            },
            {
                "key": "slow_aura",
                "label": "Slow Aura",
                "family": "Card / Control",
                "meaning": "Slow/control card context.",
                "tags": [
                    "card",
                    "control"
                ],
                "aliases": [
                    "Slow Aura"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "command deck"
                ],
                "notes": []
            },
            {
                "key": "enemy_balance",
                "label": "Enemy Balance",
                "family": "Card / Economy + Density",
                "meaning": "Run-density/economy card context.",
                "tags": [
                    "card",
                    "economy",
                    "enemy-density"
                ],
                "aliases": [
                    "Enemy Balance"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "history run context"
                ],
                "notes": []
            },
            {
                "key": "wave_skip",
                "label": "Wave Skip",
                "family": "Card / Utility",
                "meaning": "Wave skip utility; separates speed/progression from raw strength.",
                "tags": [
                    "card",
                    "utility",
                    "wave"
                ],
                "aliases": [
                    "Wave Skip"
                ],
                "battleReportLinks": [
                    "WavesSkipped",
                    "LargestWaveSkip"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "history milestone context"
                ],
                "notes": []
            },
            {
                "key": "wave_accelerator",
                "label": "Wave Accelerator",
                "family": "Card / Utility",
                "meaning": "Wave acceleration utility; useful for real-time farming explanations.",
                "tags": [
                    "card",
                    "utility",
                    "speed"
                ],
                "aliases": [
                    "Wave Accelerator"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "compare rate context"
                ],
                "notes": []
            },
            {
                "key": "intro_sprint",
                "label": "Intro Sprint",
                "family": "Card / Utility",
                "meaning": "Opening wave acceleration / resume-battle context.",
                "tags": [
                    "card",
                    "utility",
                    "opening"
                ],
                "aliases": [
                    "Intro Sprint"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "history context"
                ],
                "notes": []
            },
            {
                "key": "death_ray",
                "label": "Death Ray",
                "family": "Card / Kill Source",
                "meaning": "Instant-kill card source, separate from Ultimate Weapons.",
                "tags": [
                    "card",
                    "kill-source"
                ],
                "aliases": [
                    "Death Ray",
                    "Double Death Ray"
                ],
                "battleReportLinks": [
                    "DestroyedByDeathRay"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "kills breakdown"
                ],
                "notes": []
            },
            {
                "key": "demon_mode",
                "label": "Demon Mode",
                "family": "Card / Survival",
                "meaning": "Emergency survival / active ability context.",
                "tags": [
                    "card",
                    "survival"
                ],
                "aliases": [
                    "Demon Mode"
                ],
                "battleReportLinks": [
                    "DemonMode"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "survival context"
                ],
                "notes": []
            },
            {
                "key": "nuke",
                "label": "Nuke",
                "family": "Card / Utility",
                "meaning": "Nuke activation utility / report count.",
                "tags": [
                    "card",
                    "utility"
                ],
                "aliases": [
                    "Nuke"
                ],
                "battleReportLinks": [
                    "Nuke"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "misc context"
                ],
                "notes": []
            },
            {
                "key": "energy_net",
                "label": "Energy Net",
                "family": "Card / Boss Control",
                "meaning": "Boss immobilisation/control context.",
                "tags": [
                    "card",
                    "boss",
                    "control"
                ],
                "aliases": [
                    "Energy Net"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "boss survival explanation"
                ],
                "notes": []
            }
        ]
    },
    "cardMasteryCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Card Mastery Catalogue",
            "catalogueKey": "cardMasteryCatalogue",
            "entryCount": 8,
            "purpose": "Observed card mastery names and research prerequisite clues."
        },
        "entries": [
            {
                "key": "attack_speed_plus",
                "label": "Attack Speed+",
                "family": "Card Mastery",
                "meaning": "Observed mastery research prerequisite.",
                "tags": [
                    "mastery",
                    "attack"
                ],
                "aliases": [
                    "Attack Speed+ card mastery"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "systems glossary"
                ],
                "notes": []
            },
            {
                "key": "health_regen_plus",
                "label": "Health Regen+",
                "family": "Card Mastery",
                "meaning": "Observed mastery research prerequisite.",
                "tags": [
                    "mastery",
                    "defense"
                ],
                "aliases": [
                    "Health Regen+ card mastery"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "systems glossary"
                ],
                "notes": []
            },
            {
                "key": "slow_aura_plus",
                "label": "Slow Aura+",
                "family": "Card Mastery",
                "meaning": "Observed mastery research prerequisite.",
                "tags": [
                    "mastery",
                    "control"
                ],
                "aliases": [
                    "Slow Aura+ card mastery"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "systems glossary"
                ],
                "notes": []
            },
            {
                "key": "double_crit_coin",
                "label": "Double Crit Coin",
                "family": "Card Mastery",
                "meaning": "Observed mastery research prerequisite.",
                "tags": [
                    "mastery",
                    "economy"
                ],
                "aliases": [
                    "Double Crit Coin Mastery"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "economy glossary"
                ],
                "notes": []
            },
            {
                "key": "double_wave_skip",
                "label": "Double Wave Skip",
                "family": "Card Mastery",
                "meaning": "Observed mastery research prerequisite.",
                "tags": [
                    "mastery",
                    "wave"
                ],
                "aliases": [
                    "Double Wave Skip Mastery"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "wave context"
                ],
                "notes": []
            },
            {
                "key": "energy_converter",
                "label": "Energy Converter",
                "family": "Card Mastery",
                "meaning": "Observed mastery research prerequisite.",
                "tags": [
                    "mastery",
                    "utility"
                ],
                "aliases": [
                    "Energy Converter Mastery"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "systems glossary"
                ],
                "notes": []
            },
            {
                "key": "death_ray_mastery",
                "label": "Death Ray Mastery",
                "family": "Card Mastery",
                "meaning": "Observed mastery/research related to Death Ray.",
                "tags": [
                    "mastery",
                    "kill-source"
                ],
                "aliases": [
                    "Death Ray Mastery",
                    "Enhanced Ray"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "kills glossary"
                ],
                "notes": []
            },
            {
                "key": "coin_ray",
                "label": "Coin Ray",
                "family": "Card Mastery",
                "meaning": "Observed mastery/research related to coin ray.",
                "tags": [
                    "mastery",
                    "economy"
                ],
                "aliases": [
                    "Coin Ray Mastery"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "economy glossary"
                ],
                "notes": []
            }
        ]
    },
    "workshopCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Workshop Catalogue",
            "catalogueKey": "workshopCatalogue",
            "entryCount": 30,
            "purpose": "Workshop upgrade labels and build-family grouping for Systems/Command Deck."
        },
        "entries": [
            {
                "key": "damage",
                "label": "Damage",
                "family": "Workshop / Attack",
                "meaning": "Core damage scaling upgrade.",
                "tags": [
                    "workshop",
                    "attack"
                ],
                "aliases": [
                    "Damage"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "attack_speed",
                "label": "Attack Speed",
                "family": "Workshop / Attack",
                "meaning": "Core fire-rate scaling upgrade.",
                "tags": [
                    "workshop",
                    "attack"
                ],
                "aliases": [
                    "Attack Speed"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "critical_chance",
                "label": "Critical Chance",
                "family": "Workshop / Attack",
                "meaning": "Critical hit chance context.",
                "tags": [
                    "workshop",
                    "attack",
                    "crit"
                ],
                "aliases": [
                    "Critical Chance"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "critical_factor",
                "label": "Critical Factor",
                "family": "Workshop / Attack",
                "meaning": "Critical damage factor context.",
                "tags": [
                    "workshop",
                    "attack",
                    "crit"
                ],
                "aliases": [
                    "Critical Factor"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "range",
                "label": "Range",
                "family": "Workshop / Attack",
                "meaning": "Tower range context; can alter build behaviour.",
                "tags": [
                    "workshop",
                    "attack",
                    "range"
                ],
                "aliases": [
                    "Range"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "damage_per_meter",
                "label": "Damage / Meter",
                "family": "Workshop / Attack",
                "meaning": "Range-based damage scaling context.",
                "tags": [
                    "workshop",
                    "attack",
                    "range"
                ],
                "aliases": [
                    "Damage/Meter",
                    "Damage per Meter"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "super_crit",
                "label": "Super Crit",
                "family": "Workshop / Attack",
                "meaning": "Higher-tier critical damage context.",
                "tags": [
                    "workshop",
                    "attack",
                    "crit"
                ],
                "aliases": [
                    "Super Crit"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "health",
                "label": "Health",
                "family": "Workshop / Defense",
                "meaning": "Core EHP/survival scaling upgrade.",
                "tags": [
                    "workshop",
                    "defense"
                ],
                "aliases": [
                    "Health"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "health_regen",
                "label": "Health Regen",
                "family": "Workshop / Defense",
                "meaning": "Regeneration/sustain scaling; vulnerable to Vampire-style pressure.",
                "tags": [
                    "workshop",
                    "defense",
                    "regen"
                ],
                "aliases": [
                    "Health Regen"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "defense_percent",
                "label": "Defense %",
                "family": "Workshop / Defense",
                "meaning": "Damage reduction context.",
                "tags": [
                    "workshop",
                    "defense"
                ],
                "aliases": [
                    "Defense %",
                    "Defense Percent"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "defense_absolute",
                "label": "Defense Absolute",
                "family": "Workshop / Defense",
                "meaning": "Flat damage reduction context.",
                "tags": [
                    "workshop",
                    "defense"
                ],
                "aliases": [
                    "Defense Absolute"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "thorn_damage",
                "label": "Thorn Damage",
                "family": "Workshop / Defense",
                "meaning": "Thorns kill/return-damage context.",
                "tags": [
                    "workshop",
                    "defense",
                    "thorns"
                ],
                "aliases": [
                    "Thorn Damage",
                    "Thorns"
                ],
                "battleReportLinks": [
                    "DestroyedByThorns"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "lifesteal",
                "label": "Lifesteal",
                "family": "Workshop / Defense",
                "meaning": "Damage-to-healing sustain context.",
                "tags": [
                    "workshop",
                    "defense",
                    "sustain"
                ],
                "aliases": [
                    "Lifesteal"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "knockback",
                "label": "Knockback",
                "family": "Workshop / Control",
                "meaning": "Crowd-control pushback context.",
                "tags": [
                    "workshop",
                    "control"
                ],
                "aliases": [
                    "Knockback"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "orbs",
                "label": "Orbs",
                "family": "Workshop / Control + Kills",
                "meaning": "Orb kill/control source.",
                "tags": [
                    "workshop",
                    "control",
                    "kill-source"
                ],
                "aliases": [
                    "Orbs",
                    "Extra Orbs"
                ],
                "battleReportLinks": [
                    "DestroyedByOrbs"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "orb_speed",
                "label": "Orb Speed",
                "family": "Workshop / Control",
                "meaning": "Orb speed context.",
                "tags": [
                    "workshop",
                    "control"
                ],
                "aliases": [
                    "Orb Speed"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "shockwave",
                "label": "Shockwave",
                "family": "Workshop / Control",
                "meaning": "Shockwave hit/debuff context.",
                "tags": [
                    "workshop",
                    "control"
                ],
                "aliases": [
                    "Shockwave"
                ],
                "battleReportLinks": [
                    "HitByShockwave"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "land_mine",
                "label": "Land Mine",
                "family": "Workshop / Damage",
                "meaning": "Land Mine kill/damage source.",
                "tags": [
                    "workshop",
                    "damage",
                    "kill-source"
                ],
                "aliases": [
                    "Land Mine",
                    "Land Mines"
                ],
                "battleReportLinks": [
                    "DestroyedByLandMine"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "cash_bonus",
                "label": "Cash Bonus",
                "family": "Workshop / Economy",
                "meaning": "In-run cash income multiplier context.",
                "tags": [
                    "workshop",
                    "economy",
                    "cash"
                ],
                "aliases": [
                    "Cash Bonus"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "cash_per_wave",
                "label": "Cash / Wave",
                "family": "Workshop / Economy",
                "meaning": "Wave-based in-run cash context.",
                "tags": [
                    "workshop",
                    "economy",
                    "cash"
                ],
                "aliases": [
                    "Cash/Wave",
                    "Cash Per Wave"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "coins_per_kill",
                "label": "Coins / Kill",
                "family": "Workshop / Economy",
                "meaning": "Coins per enemy kill context.",
                "tags": [
                    "workshop",
                    "economy",
                    "coins"
                ],
                "aliases": [
                    "Coins/Kill",
                    "Coins Per Kill"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "coins_per_wave",
                "label": "Coins / Wave",
                "family": "Workshop / Economy",
                "meaning": "Wave-based coin context.",
                "tags": [
                    "workshop",
                    "economy",
                    "coins"
                ],
                "aliases": [
                    "Coins/Wave",
                    "Coins Per Wave"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "free_attack_upgrade",
                "label": "Free Attack Upgrade",
                "family": "Workshop / Utility",
                "meaning": "Free upgrade chance at wave end.",
                "tags": [
                    "workshop",
                    "utility",
                    "free-upgrade"
                ],
                "aliases": [
                    "Free Attack Upgrade"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "free_defense_upgrade",
                "label": "Free Defense Upgrade",
                "family": "Workshop / Utility",
                "meaning": "Free defense upgrade chance at wave end.",
                "tags": [
                    "workshop",
                    "utility",
                    "free-upgrade"
                ],
                "aliases": [
                    "Free Defense Upgrade"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "free_utility_upgrade",
                "label": "Free Utility Upgrade",
                "family": "Workshop / Utility",
                "meaning": "Free utility upgrade chance at wave end.",
                "tags": [
                    "workshop",
                    "utility",
                    "free-upgrade"
                ],
                "aliases": [
                    "Free Utility Upgrade"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "interest",
                "label": "Interest",
                "family": "Workshop / Utility",
                "meaning": "Observed workshop prerequisite for research.",
                "tags": [
                    "workshop",
                    "utility",
                    "cash"
                ],
                "aliases": [
                    "Interest"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "recovery_packages",
                "label": "Recovery Packages",
                "family": "Workshop / Survival",
                "meaning": "Recovery package spawn/sustain context.",
                "tags": [
                    "workshop",
                    "survival",
                    "recovery"
                ],
                "aliases": [
                    "Recovery Packages"
                ],
                "battleReportLinks": [
                    "RecoveryPackages"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "enemy_attack_level_skip",
                "label": "Enemy Attack Level Skip",
                "family": "Workshop / Scaling Defense",
                "meaning": "EALS context; skips enemy attack scaling levels.",
                "tags": [
                    "workshop",
                    "scaling",
                    "survival"
                ],
                "aliases": [
                    "Enemy Attack Levels Skipped",
                    "EALS"
                ],
                "battleReportLinks": [
                    "EnemyAttackLevelsSkipped"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "enemy_health_level_skip",
                "label": "Enemy Health Level Skip",
                "family": "Workshop / Scaling Damage",
                "meaning": "EHLS context; skips enemy health scaling levels.",
                "tags": [
                    "workshop",
                    "scaling",
                    "damage"
                ],
                "aliases": [
                    "Enemy Health Levels Skipped",
                    "EHLS"
                ],
                "battleReportLinks": [
                    "EnemyHealthLevelsSkipped"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "wall",
                "label": "Wall",
                "family": "Workshop / Survival",
                "meaning": "Wall/EHP build context and wall damage reporting.",
                "tags": [
                    "workshop",
                    "survival",
                    "wall"
                ],
                "aliases": [
                    "Wall",
                    "Damage Taken Wall"
                ],
                "battleReportLinks": [
                    "DamageTakenWall"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            }
        ],
        "families": [
            "Attack",
            "Defense",
            "Utility",
            "Economy",
            "Control",
            "Survival",
            "Scaling"
        ]
    },
    "labResearchCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Lab Research Catalogue",
            "catalogueKey": "labResearchCatalogue",
            "entryCount": 12,
            "purpose": "Research names, prerequisites and family tags; no cost/time formulas."
        },
        "entries": [
            {
                "key": "lab_speed",
                "label": "Lab Speed",
                "family": "Labs / Core",
                "meaning": "Research speed context and future planner category.",
                "tags": [
                    "lab",
                    "core"
                ],
                "aliases": [
                    "Lab Speed"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "game_speed",
                "label": "Game Speed",
                "family": "Labs / Core",
                "meaning": "Game speed/run time context.",
                "tags": [
                    "lab",
                    "core",
                    "speed"
                ],
                "aliases": [
                    "Game Speed"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "attack_speed",
                "label": "Attack Speed Research",
                "family": "Labs / Attack",
                "meaning": "Attack speed research context.",
                "tags": [
                    "lab",
                    "attack"
                ],
                "aliases": [
                    "Attack Speed"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "damage",
                "label": "Damage Research",
                "family": "Labs / Attack",
                "meaning": "Damage research context.",
                "tags": [
                    "lab",
                    "attack"
                ],
                "aliases": [
                    "Damage"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "health",
                "label": "Health Research",
                "family": "Labs / Defense",
                "meaning": "Health research context.",
                "tags": [
                    "lab",
                    "defense"
                ],
                "aliases": [
                    "Health"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "health_regen",
                "label": "Health Regen Research",
                "family": "Labs / Defense",
                "meaning": "Health regen research context.",
                "tags": [
                    "lab",
                    "defense",
                    "regen"
                ],
                "aliases": [
                    "Health Regen"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "coins_per_kill",
                "label": "Coins/Kill Research",
                "family": "Labs / Economy",
                "meaning": "Coins per kill research context.",
                "tags": [
                    "lab",
                    "economy"
                ],
                "aliases": [
                    "Coins/Kill"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "black_hole_research",
                "label": "Black Hole Research",
                "family": "Labs / Ultimate Weapon",
                "meaning": "UW research gated by Black Hole.",
                "tags": [
                    "lab",
                    "uw",
                    "black-hole"
                ],
                "aliases": [
                    "You need the Black Hole Ultimate Weapon to research this"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "spotlight_research",
                "label": "Spotlight Research",
                "family": "Labs / Ultimate Weapon",
                "meaning": "UW research gated by Spotlight.",
                "tags": [
                    "lab",
                    "uw",
                    "spotlight"
                ],
                "aliases": [
                    "You need the Spotlight Ultimate Weapon to research this"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "death_wave_research",
                "label": "Death Wave Research",
                "family": "Labs / Ultimate Weapon",
                "meaning": "UW research gated by Death Wave.",
                "tags": [
                    "lab",
                    "uw",
                    "death-wave"
                ],
                "aliases": [
                    "You need the Death Wave Ultimate Weapon to research this"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "enemy_reduction_labs",
                "label": "Enemy Reduction Labs",
                "family": "Labs / Enemy",
                "meaning": "Observed labs reduce Ray/Vampire/Scatter attack/health at all waves.",
                "tags": [
                    "lab",
                    "enemy",
                    "elite"
                ],
                "aliases": [
                    "Ray Enemy Attack",
                    "Vampire Enemy Health",
                    "Scatter Enemy Attack"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "card_mastery_research",
                "label": "Card Mastery Research",
                "family": "Labs / Card Mastery",
                "meaning": "Observed card mastery prerequisite texts.",
                "tags": [
                    "lab",
                    "card-mastery"
                ],
                "aliases": [
                    "You need the ... card mastery to research this"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            }
        ]
    },
    "tournamentHeatCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Tournament / Heat Catalogue",
            "catalogueKey": "tournamentHeatCatalogue",
            "entryCount": 22,
            "purpose": "Tournament, Heat, league, and battle-condition vocabulary."
        },
        "entries": [
            {
                "key": "orb_resistance",
                "label": "Orb Resistance",
                "family": "Tournament / Heat Condition",
                "meaning": "Orbs deal enemy-health damage instead of instantly destroying enemies.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Orb Resistance"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "death_ray_resistance",
                "label": "Death Ray Resistance",
                "family": "Tournament / Heat Condition",
                "meaning": "Death Ray deals enemy-health damage instead of instantly destroying enemies.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Death Ray Resistance"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "knockback_resistance",
                "label": "Knockback Resistance",
                "family": "Tournament / Heat Condition",
                "meaning": "Knockback force is reduced.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Knockback Resistance"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "enemy_speed",
                "label": "Enemy Speed",
                "family": "Tournament / Heat Condition",
                "meaning": "Enemies move faster.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Enemy Speed"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "armored_enemies",
                "label": "Armored Enemies",
                "family": "Tournament / Heat Condition",
                "meaning": "Enemy armor/reduction pressure is active.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Armored Enemies"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "enemy_attack_speed",
                "label": "Enemy Attack Speed",
                "family": "Tournament / Heat Condition",
                "meaning": "Enemies attack faster.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Enemy Attack Speed"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "more_enemies",
                "label": "More Enemies",
                "family": "Tournament / Heat Condition",
                "meaning": "Extra enemies spawn.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "More Enemies"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "one_enemy_type",
                "label": "One Enemy Type",
                "family": "Tournament / Heat Condition",
                "meaning": "Only one enemy type spawns besides bosses.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "One Enemy Type"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "thorns_resistance",
                "label": "Thorns Resistance",
                "family": "Tournament / Heat Condition",
                "meaning": "Thorns deal reduced normal damage.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Thorns Resistance"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "plasma_cannon_resistance",
                "label": "Plasma Cannon Resistance",
                "family": "Tournament / Heat Condition",
                "meaning": "Plasma Cannon deals reduced normal damage.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Plasma Cannon Resistance"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "wave_jumps",
                "label": "Wave Jumps",
                "family": "Tournament / Heat Condition",
                "meaning": "Waves increase by more than 1.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Wave Jumps"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "more_bosses",
                "label": "More Bosses",
                "family": "Tournament / Heat Condition",
                "meaning": "Bosses spawn more often.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "More Bosses"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "enemy_level_skip",
                "label": "Enemy Level Skip",
                "family": "Tournament / Heat Condition",
                "meaning": "Enemy health/attack level skip chances are reduced.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Enemy Level Skip"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "protectors_ultimate",
                "label": "Protector's Ultimate",
                "family": "Tournament / Heat Condition",
                "meaning": "Protector shields can add immunity to knockback, shockwave and Black Hole damage.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Protector's Ultimate"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "elite_ultimate",
                "label": "Elite's Ultimate",
                "family": "Tournament / Heat Condition",
                "meaning": "Ray, Scatter and Vampire get stronger elite behaviour.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Elite's Ultimate"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "tanks_ultimate",
                "label": "Tank's Ultimate",
                "family": "Tournament / Heat Condition",
                "meaning": "Tanks can behave like bosses and stop moving inside tower range.",
                "tags": [
                    "tournament",
                    "heat",
                    "condition"
                ],
                "aliases": [
                    "Tank's Ultimate"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "tournament tagging",
                    "command deck warning"
                ],
                "notes": []
            },
            {
                "key": "copper",
                "label": "Copper",
                "family": "Tournament / League",
                "meaning": "Observed tournament league vocabulary; practical scaling should remain source-labelled.",
                "tags": [
                    "tournament",
                    "league"
                ],
                "aliases": [
                    "Copper"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "manual tournament tagging"
                ],
                "notes": []
            },
            {
                "key": "silver",
                "label": "Silver",
                "family": "Tournament / League",
                "meaning": "Observed tournament league vocabulary; practical scaling should remain source-labelled.",
                "tags": [
                    "tournament",
                    "league"
                ],
                "aliases": [
                    "Silver"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "manual tournament tagging"
                ],
                "notes": []
            },
            {
                "key": "gold",
                "label": "Gold",
                "family": "Tournament / League",
                "meaning": "Observed tournament league vocabulary; practical scaling should remain source-labelled.",
                "tags": [
                    "tournament",
                    "league"
                ],
                "aliases": [
                    "Gold"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "manual tournament tagging"
                ],
                "notes": []
            },
            {
                "key": "platinum",
                "label": "Platinum",
                "family": "Tournament / League",
                "meaning": "Observed tournament league vocabulary; practical scaling should remain source-labelled.",
                "tags": [
                    "tournament",
                    "league"
                ],
                "aliases": [
                    "Platinum"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "manual tournament tagging"
                ],
                "notes": []
            },
            {
                "key": "champion",
                "label": "Champion",
                "family": "Tournament / League",
                "meaning": "Observed tournament league vocabulary; practical scaling should remain source-labelled.",
                "tags": [
                    "tournament",
                    "league"
                ],
                "aliases": [
                    "Champion"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "manual tournament tagging"
                ],
                "notes": []
            },
            {
                "key": "legend",
                "label": "Legend",
                "family": "Tournament / League",
                "meaning": "Observed tournament league vocabulary; practical scaling should remain source-labelled.",
                "tags": [
                    "tournament",
                    "league"
                ],
                "aliases": [
                    "Legend"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [
                    "manual tournament tagging"
                ],
                "notes": []
            }
        ],
        "heatIncreaseWaves": [
            20,
            40,
            60,
            80,
            100,
            150,
            200,
            250,
            300,
            350,
            400,
            450,
            500,
            600,
            700,
            800,
            900,
            1000
        ],
        "rule": "Use manual/report context for tournament tagging; do not rely on user-added markers such as Tournament--."
    },
    "guardianCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Guardian Catalogue",
            "catalogueKey": "guardianCatalogue",
            "entryCount": 5,
            "purpose": "Guardian effects and Battle Report reward/damage fields."
        },
        "entries": [
            {
                "key": "tower_guardian",
                "label": "Tower Guardian",
                "family": "Guardian / System",
                "meaning": "Guardian system observed in app strings and Battle Report fields.",
                "tags": [
                    "guardian"
                ],
                "aliases": [
                    "Tower Guardian"
                ],
                "battleReportLinks": [
                    "GuardianDamage",
                    "GuardianSummoned"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "systems glossary",
                    "history section"
                ],
                "notes": []
            },
            {
                "key": "bounty",
                "label": "Bounty",
                "family": "Guardian / Economy",
                "meaning": "Guardian can place a Bounty on a nearby non-common enemy, granting bonus coins on kill.",
                "tags": [
                    "guardian",
                    "economy"
                ],
                "aliases": [
                    "Bounty",
                    "Bounty Coins"
                ],
                "battleReportLinks": [
                    "GuardianCoinsStolen",
                    "GuardianCoinsFetched"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "economy explanation"
                ],
                "notes": []
            },
            {
                "key": "missing_health_attack",
                "label": "Missing Health Attack",
                "family": "Guardian / Damage",
                "meaning": "Guardian attacks enemies with the most missing health and deals a percentage of lost health as damage.",
                "tags": [
                    "guardian",
                    "damage"
                ],
                "aliases": [
                    "Guardian Damage"
                ],
                "battleReportLinks": [
                    "GuardianDamage"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "damage explanation"
                ],
                "notes": []
            },
            {
                "key": "ally_conversion",
                "label": "Ally Conversion",
                "family": "Guardian / Recovery",
                "meaning": "Guardian can convert enemies into allies or recovery-package style healing sources.",
                "tags": [
                    "guardian",
                    "recovery"
                ],
                "aliases": [
                    "Guardian Catches",
                    "Ally Recovery Package"
                ],
                "battleReportLinks": [
                    "GuardianCatches"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [
                    "survival explanation"
                ],
                "notes": []
            },
            {
                "key": "guardian_loot",
                "label": "Guardian Loot",
                "family": "Guardian / Loot",
                "meaning": "Guardian report fields include gems, medals, reroll shards, module shards and module drops.",
                "tags": [
                    "guardian",
                    "loot",
                    "modules"
                ],
                "aliases": [
                    "Guardian Gems",
                    "Guardian Medals",
                    "Guardian Reroll Shards"
                ],
                "battleReportLinks": [
                    "GuardianGems",
                    "GuardianMedals",
                    "GuardianRerollShards",
                    "GuardianCannonShards",
                    "GuardianArmorShards",
                    "GuardianGeneratorShards",
                    "GuardianCoreShards",
                    "GuardianCommonModules",
                    "GuardianRareModules"
                ],
                "sourceConfidence": "game-file-observed",
                "tbiUses": [
                    "history grouping",
                    "compare loot context"
                ],
                "notes": []
            }
        ]
    },
    "moduleCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Module Catalogue",
            "catalogueKey": "moduleCatalogue",
            "entryCount": 11,
            "purpose": "Module types, rarity/resource vocabulary, and useful effect aliases."
        },
        "entries": [
            {
                "key": "cannon",
                "label": "Cannon",
                "family": "Module / Type",
                "meaning": "Attack-focused module family.",
                "tags": [
                    "module",
                    "type",
                    "attack"
                ],
                "aliases": [
                    "Cannon Module",
                    "Cannon Shards"
                ],
                "battleReportLinks": [
                    "CannonShards",
                    "GuardianCannonShards"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "armor",
                "label": "Armor",
                "family": "Module / Type",
                "meaning": "Defense-focused module family.",
                "tags": [
                    "module",
                    "type",
                    "defense"
                ],
                "aliases": [
                    "Armor Module",
                    "Armor Shards"
                ],
                "battleReportLinks": [
                    "ArmorShards",
                    "GuardianArmorShards"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "generator",
                "label": "Generator",
                "family": "Module / Type",
                "meaning": "Utility/economy module family.",
                "tags": [
                    "module",
                    "type",
                    "utility"
                ],
                "aliases": [
                    "Generator Module",
                    "Generator Shards"
                ],
                "battleReportLinks": [
                    "GeneratorShards",
                    "GuardianGeneratorShards"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "core",
                "label": "Core",
                "family": "Module / Type",
                "meaning": "Ultimate Weapon module family.",
                "tags": [
                    "module",
                    "type",
                    "uw"
                ],
                "aliases": [
                    "Core Module",
                    "Core Shards"
                ],
                "battleReportLinks": [
                    "CoreShards",
                    "GuardianCoreShards"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "reroll_shards",
                "label": "Reroll Shards",
                "family": "Module / Resource",
                "meaning": "Reroll resource for module sub-stats.",
                "tags": [
                    "module",
                    "resource"
                ],
                "aliases": [
                    "Reroll Shards"
                ],
                "battleReportLinks": [
                    "RerollShardsEarned",
                    "GuardianRerollShards"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "shatter",
                "label": "Shatter",
                "family": "Module / Action",
                "meaning": "Module shatter/auto-shatter vocabulary.",
                "tags": [
                    "module",
                    "action"
                ],
                "aliases": [
                    "Shatter",
                    "Auto Shatter"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "merge",
                "label": "Merge",
                "family": "Module / Action",
                "meaning": "Module merge/rarity progression vocabulary.",
                "tags": [
                    "module",
                    "action"
                ],
                "aliases": [
                    "Merge"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "substats",
                "label": "Substats",
                "family": "Module / Stats",
                "meaning": "Module sub-stat/reroll context.",
                "tags": [
                    "module",
                    "substat"
                ],
                "aliases": [
                    "Substats",
                    "Effects"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "death_penalty",
                "label": "Death Penalty",
                "family": "Module / Effect",
                "meaning": "Observed module/effect source in killed-with-effect-active or destroyed-by contexts.",
                "tags": [
                    "module",
                    "effect",
                    "kill-source"
                ],
                "aliases": [
                    "Death Penalty"
                ],
                "battleReportLinks": [
                    "KilledWithDeathPenaltyActive",
                    "DestroyedByDeathPenalty"
                ],
                "sourceConfidence": "game-file-observed",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "negative_mass_projector",
                "label": "Negative Mass Projector",
                "family": "Module / Effect",
                "meaning": "Observed advanced module/effect vocabulary.",
                "tags": [
                    "module",
                    "effect",
                    "defense"
                ],
                "aliases": [
                    "Negative Mass Projector"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-observed",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "orbital_augment",
                "label": "Orbital Augment",
                "family": "Module / Effect",
                "meaning": "Observed module/effect source linked to enemy hit counts.",
                "tags": [
                    "module",
                    "effect",
                    "orbs"
                ],
                "aliases": [
                    "Orbital Augment"
                ],
                "battleReportLinks": [
                    "HitByOrbitalAugment"
                ],
                "sourceConfidence": "game-file-observed",
                "tbiUses": [],
                "notes": []
            }
        ],
        "rarityVocabulary": [
            "Common",
            "Rare",
            "Epic",
            "Legendary",
            "Mythic",
            "Ancestral"
        ]
    },
    "botCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Bot Catalogue",
            "catalogueKey": "botCatalogue",
            "entryCount": 5,
            "purpose": "Bot names and Battle Report/economy/damage context."
        },
        "entries": [
            {
                "key": "golden_bot",
                "label": "Golden Bot",
                "family": "Bot / Economy",
                "meaning": "Economy bot/source vocabulary.",
                "tags": [
                    "bot",
                    "economy"
                ],
                "aliases": [
                    "Golden Bot"
                ],
                "battleReportLinks": [
                    "CoinsFromGoldenBot"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "flame_bot",
                "label": "Flame Bot",
                "family": "Bot / Damage",
                "meaning": "Damage bot/source vocabulary.",
                "tags": [
                    "bot",
                    "damage"
                ],
                "aliases": [
                    "Flame Bot"
                ],
                "battleReportLinks": [
                    "DestroyedByFlameBot"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "amplify_bot",
                "label": "Amplify Bot",
                "family": "Bot / Damage Amp",
                "meaning": "Amplification bot/effect-active vocabulary.",
                "tags": [
                    "bot",
                    "damage"
                ],
                "aliases": [
                    "Amplify Bot"
                ],
                "battleReportLinks": [
                    "KilledWithAmplifyBotActive"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "thunder_bot",
                "label": "Thunder Bot",
                "family": "Bot / Control",
                "meaning": "Thunder/stun/control bot vocabulary.",
                "tags": [
                    "bot",
                    "control"
                ],
                "aliases": [
                    "Thunder Bot",
                    "Chain Thunder"
                ],
                "battleReportLinks": [
                    "HitByThunderBot"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "event_respec",
                "label": "Bot Event Respec",
                "family": "Bot / Event",
                "meaning": "Observed text says bots can be redistributed at most once per event.",
                "tags": [
                    "bot",
                    "event"
                ],
                "aliases": [
                    "bot respec"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            }
        ]
    },
    "perkCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Perk Catalogue",
            "catalogueKey": "perkCatalogue",
            "entryCount": 6,
            "purpose": "Perk/trade-off vocabulary useful for manual run context."
        },
        "entries": [
            {
                "key": "perks",
                "label": "Perks",
                "family": "Perk / System",
                "meaning": "Perk system vocabulary for run context.",
                "tags": [
                    "perk"
                ],
                "aliases": [
                    "Perks"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "tradeoff_perks",
                "label": "Trade-off Perks",
                "family": "Perk / Trade-off",
                "meaning": "Trade-off perk vocabulary for explaining changed run behaviour.",
                "tags": [
                    "perk",
                    "trade-off"
                ],
                "aliases": [
                    "Trade-off Perks",
                    "Tradeoff Perks"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "cash_multiplier",
                "label": "Cash Multiplier",
                "family": "Perk / Economy",
                "meaning": "Cash multiplier context including wave bonus.",
                "tags": [
                    "perk",
                    "economy"
                ],
                "aliases": [
                    "Cash Multiplier"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "coin_bonus",
                "label": "Coin Bonus",
                "family": "Perk / Economy",
                "meaning": "Coin bonus context; separate from specific UW coin sources.",
                "tags": [
                    "perk",
                    "economy"
                ],
                "aliases": [
                    "Coin Bonus"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "damage_tradeoff",
                "label": "Damage Trade-off",
                "family": "Perk / Combat",
                "meaning": "Manual context for damage-altering trade-offs.",
                "tags": [
                    "perk",
                    "damage"
                ],
                "aliases": [
                    "Damage"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-observed",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "health_tradeoff",
                "label": "Health Trade-off",
                "family": "Perk / Survival",
                "meaning": "Manual context for health/survival-altering trade-offs.",
                "tags": [
                    "perk",
                    "survival"
                ],
                "aliases": [
                    "Health"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-observed",
                "tbiUses": [],
                "notes": []
            }
        ]
    },
    "resourceEconomyCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Resource / Economy Catalogue",
            "catalogueKey": "resourceEconomyCatalogue",
            "entryCount": 14,
            "purpose": "Resources, rates, and coin/cell source families for parser/Compare."
        },
        "entries": [
            {
                "key": "cash",
                "label": "Cash",
                "family": "Resource / In-run",
                "meaning": "In-run upgrade currency, separate from permanent coins.",
                "tags": [
                    "resource",
                    "cash"
                ],
                "aliases": [
                    "Cash"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "coins",
                "label": "Coins",
                "family": "Resource / Permanent Economy",
                "meaning": "Main permanent currency; report shows earned and per-hour rates.",
                "tags": [
                    "resource",
                    "coins"
                ],
                "aliases": [
                    "Coins Earned",
                    "Coins Per Hour"
                ],
                "battleReportLinks": [
                    "CoinsEarned",
                    "CoinsPerHour"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "cells",
                "label": "Cells",
                "family": "Resource / Elite Economy",
                "meaning": "Elite Cell income; report shows earned and per-hour rates.",
                "tags": [
                    "resource",
                    "cells"
                ],
                "aliases": [
                    "Cells Earned",
                    "Cells Per Hour"
                ],
                "battleReportLinks": [
                    "CellsEarned",
                    "CellsPerHour"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "gems",
                "label": "Gems",
                "family": "Resource / Premium",
                "meaning": "Gem resource and Guardian/event rewards.",
                "tags": [
                    "resource",
                    "gems"
                ],
                "aliases": [
                    "Gems"
                ],
                "battleReportLinks": [
                    "GuardianGems"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "stones",
                "label": "Stones / Power Stones",
                "family": "Resource / Ultimate Weapons",
                "meaning": "Ultimate Weapon unlock/upgrade resource vocabulary.",
                "tags": [
                    "resource",
                    "stones",
                    "uw"
                ],
                "aliases": [
                    "Power Stones",
                    "Stones"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "medals",
                "label": "Medals",
                "family": "Resource / Event",
                "meaning": "Event/Guardian medal resource.",
                "tags": [
                    "resource",
                    "medals",
                    "event"
                ],
                "aliases": [
                    "Medals"
                ],
                "battleReportLinks": [
                    "GuardianMedals"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "reroll_shards",
                "label": "Reroll Shards",
                "family": "Resource / Modules",
                "meaning": "Module reroll resource.",
                "tags": [
                    "resource",
                    "modules"
                ],
                "aliases": [
                    "Reroll Shards"
                ],
                "battleReportLinks": [
                    "RerollShardsEarned",
                    "GuardianRerollShards"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "module_shards",
                "label": "Module Shards",
                "family": "Resource / Modules",
                "meaning": "Cannon/Armor/Generator/Core shard families.",
                "tags": [
                    "resource",
                    "modules",
                    "shards"
                ],
                "aliases": [
                    "Cannon Shards",
                    "Armor Shards",
                    "Generator Shards",
                    "Core Shards"
                ],
                "battleReportLinks": [
                    "CannonShards",
                    "ArmorShards",
                    "GeneratorShards",
                    "CoreShards"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "golden_tower_coins",
                "label": "Golden Tower Coins",
                "family": "Economy Source / UW",
                "meaning": "Coins credited to Golden Tower.",
                "tags": [
                    "economy-source",
                    "uw"
                ],
                "aliases": [
                    "Coins From Golden Tower"
                ],
                "battleReportLinks": [
                    "CoinsFromGoldenTower"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "black_hole_coins",
                "label": "Black Hole Coins",
                "family": "Economy Source / UW",
                "meaning": "Coins credited to Black Hole.",
                "tags": [
                    "economy-source",
                    "uw"
                ],
                "aliases": [
                    "Coins From Black Hole"
                ],
                "battleReportLinks": [
                    "CoinsFromBlackHole"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "death_wave_coins",
                "label": "Death Wave Coins",
                "family": "Economy Source / UW",
                "meaning": "Coins credited to Death Wave/effect waves.",
                "tags": [
                    "economy-source",
                    "uw"
                ],
                "aliases": [
                    "Coins From Death Wave"
                ],
                "battleReportLinks": [
                    "CoinsFromDeathWave"
                ],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "spotlight_coins",
                "label": "Spotlight Coins",
                "family": "Economy Source / UW",
                "meaning": "Coins credited to Spotlight.",
                "tags": [
                    "economy-source",
                    "uw"
                ],
                "aliases": [
                    "Coins From Spotlight"
                ],
                "battleReportLinks": [
                    "CoinsFromSpotlight"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "coin_bot_coins",
                "label": "Bot Coins",
                "family": "Economy Source / Bot",
                "meaning": "Coin output from bot source.",
                "tags": [
                    "economy-source",
                    "bot"
                ],
                "aliases": [
                    "Coins From Golden Bot"
                ],
                "battleReportLinks": [
                    "CoinsFromGoldenBot"
                ],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "other_coin_bonuses",
                "label": "Other Coin Bonuses",
                "family": "Economy Source / Misc",
                "meaning": "Miscellaneous coin bonus bucket; keep separate from Other kills.",
                "tags": [
                    "economy-source",
                    "misc"
                ],
                "aliases": [
                    "Other Coin Bonuses"
                ],
                "battleReportLinks": [
                    "CoinsFromCoinBonuses"
                ],
                "sourceConfidence": "game-file-observed",
                "tbiUses": [
                    "parser explanation"
                ],
                "notes": [
                    "Do not confuse with DestroyedByOther."
                ]
            }
        ]
    },
    "v28UpdateMechanicCatalogue": {
            "manifest": {
                    "game": "The Tower - Idle Tower Defense",
                    "version": "28.2.0",
                    "package": "com.TechTreeGames.TheTower",
                    "sourceFile": "The Tower - Idle Tower Defense_28.2.0_APKPure.xapk",
                    "extractionType": "Static readable strings and embedded changelog text from uploaded v28.2.0 XAPK",
                    "generatedAt": "2026-05-27T20:20:00Z",
                    "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z52l_GameUpdateAudit_FullBuild",
                    "sourceConfidence": "game-file-confirmed-description",
                    "safePurpose": [
                            "official vocabulary",
                            "Game Brain explanations",
                            "Systems glossary",
                            "Compare/Coach context"
                    ],
                    "notSafePurpose": [
                            "hidden formulas",
                            "exact scaling maths",
                            "live server/tournament settings",
                            "automated gameplay/cheats"
                    ],
                    "catalogueName": "The Tower v28.2.0 Update Mechanics Catalogue",
                    "catalogueKey": "v28UpdateMechanicCatalogue",
                    "entryCount": 18,
                    "purpose": "Dissonance, Overheat, Bot+, Battle Report/stat category, and v28 mechanic wording."
            },
            "entries": [
                    {
                            "key": "dissonance",
                            "label": "Dissonance",
                            "family": "Dissonance / Tier modifier",
                            "meaning": "A v28 layer to Tier gameplay. A Dissonant Run disables one workshop tab and can provide a related tier-specific boost based on progress.",
                            "tags": [
                                    "dissonance",
                                    "tier",
                                    "modifier",
                                    "v28"
                            ],
                            "aliases": [
                                    "Dissonance",
                                    "Dissonant Run",
                                    "Dissonant Runs",
                                    "Dissonant Boosts"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Systems glossary",
                                    "Coach context",
                                    "Compare caution"
                            ],
                            "notes": [
                                    "28.2.0 APK still contains the Dissonance update text and Dissonance UI/class names."
                            ]
                    },
                    {
                            "key": "dissonant_echo_labs",
                            "label": "Dissonant Echo Labs",
                            "family": "Dissonance / Labs",
                            "meaning": "Four labs linked to Attack, Defense, Utility, and Ultimate Weapon that apply a percent of tier Dissonant Boost to the Tower.",
                            "tags": [
                                    "dissonance",
                                    "labs",
                                    "echo"
                            ],
                            "aliases": [
                                    "Dissonant Echo",
                                    "Dissonant Echo labs",
                                    "Dissonant Echo Labs"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Systems glossary",
                                    "Coach context"
                            ],
                            "notes": [
                                    "Patch text states Dissonant Echo labs unlock at Tier 17 Wave 60."
                            ]
                    },
                    {
                            "key": "overheat",
                            "label": "Overheat",
                            "family": "High-wave pressure / Heat",
                            "meaning": "A high-wave pressure system. Normal tiers use Enemy Skip Decay, while tournament Overheat can add extra decay/spawn conditions.",
                            "tags": [
                                    "overheat",
                                    "heat",
                                    "high wave",
                                    "tournament"
                            ],
                            "aliases": [
                                    "Overheat",
                                    "Heat button",
                                    "Enemy Skip Decay Overheat"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Coach warning",
                                    "Compare context",
                                    "Systems glossary"
                            ],
                            "notes": [
                                    "Patch text says the panel appears after clearing Wave 4500 on any Tier."
                            ]
                    },
                    {
                            "key": "overheat_damage_decay",
                            "label": "Damage Decay",
                            "family": "Tournament Overheat Condition",
                            "meaning": "Tournament Overheat condition: Tower Damage is reduced every 10 waves.",
                            "tags": [
                                    "overheat",
                                    "tournament",
                                    "damage"
                            ],
                            "aliases": [
                                    "Damage Decay"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Coach warning",
                                    "Tournament context"
                            ],
                            "notes": []
                    },
                    {
                            "key": "overheat_health_decay",
                            "label": "Health Decay",
                            "family": "Tournament Overheat Condition",
                            "meaning": "Tournament Overheat condition: Tower Health is reduced every 10 waves.",
                            "tags": [
                                    "overheat",
                                    "tournament",
                                    "health"
                            ],
                            "aliases": [
                                    "Health Decay"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Coach warning",
                                    "Tournament context"
                            ],
                            "notes": []
                    },
                    {
                            "key": "overheat_more_fleets",
                            "label": "More Fleets",
                            "family": "Tournament Overheat Condition",
                            "meaning": "Tournament Overheat condition: an additional Fleet spawns every 100 waves.",
                            "tags": [
                                    "overheat",
                                    "tournament",
                                    "fleet"
                            ],
                            "aliases": [
                                    "More Fleets"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Coach warning",
                                    "Tournament context"
                            ],
                            "notes": []
                    },
                    {
                            "key": "overheat_more_elites",
                            "label": "More Elites",
                            "family": "Tournament Overheat Condition",
                            "meaning": "Tournament Overheat condition: an additional Elite spawns every 5 waves.",
                            "tags": [
                                    "overheat",
                                    "tournament",
                                    "elite"
                            ],
                            "aliases": [
                                    "More Elites"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Coach warning",
                                    "Tournament context",
                                    "cell/survival context"
                            ],
                            "notes": []
                    },
                    {
                            "key": "bot_bot",
                            "label": "Bot Bot",
                            "family": "Bots",
                            "meaning": "v28 bot that increases the effects of other bot effects within its radius.",
                            "tags": [
                                    "bot",
                                    "bot plus",
                                    "range"
                            ],
                            "aliases": [
                                    "Bot Bot"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Systems glossary",
                                    "Coach context"
                            ],
                            "notes": [
                                    "Patch text lists Range, Cooldown, % Increase, and Duration as Bot Bot stats."
                            ]
                    },
                    {
                            "key": "bot_plus",
                            "label": "Bot+",
                            "family": "Bots / Upgrade Layer",
                            "meaning": "Bot upgrade feature available when all Bots are unlocked. Each bot has a specialized ability unlocked with stones and upgraded with medals.",
                            "tags": [
                                    "bot",
                                    "bot plus",
                                    "medals",
                                    "stones"
                            ],
                            "aliases": [
                                    "Bot+",
                                    "Bot Plus",
                                    "Bot+ abilities"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Systems glossary",
                                    "Coach context"
                            ],
                            "notes": []
                    },
                    {
                            "key": "wildfire",
                            "label": "Wildfire",
                            "family": "Bot+ Ability",
                            "meaning": "Enemies hit by Flame Bot become Enflamed in addition to Burned, receiving extra damage.",
                            "tags": [
                                    "bot plus",
                                    "flame bot",
                                    "damage amplification"
                            ],
                            "aliases": [
                                    "Wildfire",
                                    "Flame Bot+"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Systems glossary",
                                    "Coach context"
                            ],
                            "notes": []
                    },
                    {
                            "key": "titan_shock",
                            "label": "Titan Shock",
                            "family": "Bot+ Ability",
                            "meaning": "Enemies struck by Thunder Bot have decreased attack speed; value scales with enemy mass digits according to patch text.",
                            "tags": [
                                    "bot plus",
                                    "thunder bot",
                                    "enemy attack speed"
                            ],
                            "aliases": [
                                    "Titan Shock",
                                    "Thunder Bot+"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Systems glossary",
                                    "Coach context"
                            ],
                            "notes": [
                                    "No hidden formula claims are made; the description only follows readable patch text."
                            ]
                    },
                    {
                            "key": "bonus_cells",
                            "label": "Bonus Cells",
                            "family": "Bot+ Ability",
                            "meaning": "Elites killed in Golden Bot range grant more Cells.",
                            "tags": [
                                    "bot plus",
                                    "golden bot",
                                    "cells",
                                    "elite"
                            ],
                            "aliases": [
                                    "Bonus Cells",
                                    "Golden Bot+"
                            ],
                            "battleReportLinks": [
                                    "CellsEarned",
                                    "CellsPerHour"
                            ],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "cell farming context",
                                    "Coach context"
                            ],
                            "notes": []
                    },
                    {
                            "key": "echoing_shot",
                            "label": "Echoing Shot",
                            "family": "Bot+ Ability",
                            "meaning": "Tower bullets within range count as more bullets; Ultimate Weapon projectiles are also boosted at a reduced rate according to patch text.",
                            "tags": [
                                    "bot plus",
                                    "amplify bot",
                                    "projectiles"
                            ],
                            "aliases": [
                                    "Echoing Shot",
                                    "Amplify Bot+"
                            ],
                            "battleReportLinks": [
                                    "ProjectilesCount",
                                    "EnemiesHitByProjectiles"
                            ],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "damage/utility context",
                                    "Coach context"
                            ],
                            "notes": []
                    },
                    {
                            "key": "maximum_power",
                            "label": "Maximum Power",
                            "family": "Bot+ Ability",
                            "meaning": "Boosts Bot+ abilities of other bots.",
                            "tags": [
                                    "bot plus",
                                    "bot bot"
                            ],
                            "aliases": [
                                    "Maximum Power",
                                    "Bot Bot+"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Systems glossary",
                                    "Coach context"
                            ],
                            "notes": []
                    },
                    {
                            "key": "synchronicity",
                            "label": "Synchronicity",
                            "family": "Bots / Pathing",
                            "meaning": "Stone upgrade unlocked after all five Bot+ abilities that allows bots to be assigned synchronized pathing slots.",
                            "tags": [
                                    "bot plus",
                                    "pathing",
                                    "stones"
                            ],
                            "aliases": [
                                    "Synchronicity"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Systems glossary"
                            ],
                            "notes": []
                    },
                    {
                            "key": "battle_report_v28_simplification",
                            "label": "Battle Report v28 simplification",
                            "family": "Battle Report / Stat Categories",
                            "meaning": "The v28 patch text says Battle Report was simplified around time, coins, coins/hour, cells, and cells/hour while adding fun record stats and recategorising stats.",
                            "tags": [
                                    "battle report",
                                    "stats",
                                    "categories"
                            ],
                            "aliases": [
                                    "Simplified the Battle Report",
                                    "Added new stats and stat categories",
                                    "Largest Wave Skip",
                                    "Largest Golden Combo"
                            ],
                            "battleReportLinks": [
                                    "GameTime",
                                    "RealTime",
                                    "CoinsEarned",
                                    "CoinsPerHour",
                                    "CellsEarned",
                                    "CellsPerHour",
                                    "LargestWaveSkip"
                            ],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Compare foundation",
                                    "History search",
                                    "Game Brain Verification"
                            ],
                            "notes": [
                                    "The v28.2.0 static pass found all 142 current BattleHistoryEntry property names still present."
                            ]
                    },
                    {
                            "key": "golden_tower_vfx_toggle",
                            "label": "Golden Tower VFX toggle",
                            "family": "Toggles / Ultimate Weapon UI",
                            "meaning": "Patch text says a Golden Tower VFX toggle was added to the Toggles menu.",
                            "tags": [
                                    "golden tower",
                                    "toggles",
                                    "ui"
                            ],
                            "aliases": [
                                    "Golden Tower VFX toggle"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Systems glossary"
                            ],
                            "notes": []
                    },
                    {
                            "key": "event_relic_store_rotation",
                            "label": "Event Store Relic Section",
                            "family": "Events / Relics",
                            "meaning": "Patch text says the Event Store relic section rotates older free/premium event relics, with Rare and Epic relic costs stated in gems.",
                            "tags": [
                                    "event store",
                                    "relics"
                            ],
                            "aliases": [
                                    "Relic section",
                                    "Rare relics",
                                    "Epic relics"
                            ],
                            "battleReportLinks": [],
                            "sourceConfidence": "game-file-confirmed-description",
                            "tbiUses": [
                                    "Systems glossary"
                            ],
                            "notes": []
                    }
            ]
    },
    "missionsEventsRelicsCatalogue": {
        "manifest": {
            "game": "The Tower - Idle Tower Defense",
            "version": "28.1.0",
            "package": "com.TechTreeGames.TheTower",
            "sourceFile": "The Tower - Idle Tower Defense_28.1.0_APKPure.xapk",
            "extractionType": "Static readable strings + Unity/IL2CPP metadata names only",
            "generatedAt": "2026-05-25T20:10:00Z",
            "recommendedTbiBuild": "Tower-Battle-Intel_v4.11z31_GameBrainOfficialCatalogues_FullBuild",
            "sourceConfidence": "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
            "safePurpose": [
                "official vocabulary",
                "parser/search aliases",
                "Game Brain explanations",
                "History grouping",
                "Systems glossary",
                "Command Deck wording",
                "Debug catalogue health"
            ],
            "notSafePurpose": [
                "hidden formulas",
                "exact scaling maths",
                "live server/tournament settings",
                "automated gameplay/cheats"
            ],
            "catalogueName": "The Tower v28.1.0 Missions / Events / Relics Catalogue",
            "catalogueKey": "missionsEventsRelicsCatalogue",
            "entryCount": 5,
            "purpose": "Goal-tracker vocabulary for later; not wired into UI yet."
        },
        "entries": [
            {
                "key": "missions",
                "label": "Missions",
                "family": "Missions / Goals",
                "meaning": "Mission objective vocabulary.",
                "tags": [
                    "missions"
                ],
                "aliases": [
                    "Missions"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "events",
                "label": "Events",
                "family": "Events / Medals",
                "meaning": "Event vocabulary and medal earning context.",
                "tags": [
                    "events",
                    "medals"
                ],
                "aliases": [
                    "Event",
                    "Earn medals during the event"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "relics",
                "label": "Relics",
                "family": "Relics / Permanent Bonuses",
                "meaning": "Relic reward/permanent bonus vocabulary.",
                "tags": [
                    "relics"
                ],
                "aliases": [
                    "Relics"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "milestone_rewards",
                "label": "Milestone Rewards",
                "family": "Milestones / Rewards",
                "meaning": "Milestone reward context tied to Tier/Wave progression.",
                "tags": [
                    "milestones",
                    "rewards"
                ],
                "aliases": [
                    "Milestones",
                    "Wave Milestones"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-label",
                "tbiUses": [],
                "notes": []
            },
            {
                "key": "no_card_mission",
                "label": "No-card Mission",
                "family": "Missions / Challenge",
                "meaning": "Observed mission text includes reaching a wave on max tier without any card equipped.",
                "tags": [
                    "missions",
                    "cards"
                ],
                "aliases": [
                    "without any card equipped"
                ],
                "battleReportLinks": [],
                "sourceConfidence": "game-file-confirmed-description",
                "tbiUses": [],
                "notes": []
            }
        ]
    }
});

function normalise(value = "") {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/__+/g, "_");
}

function allCatalogues() {
    return Object.entries(CATALOGUES).map(([key, data]) => ({
        key,
        name: data.manifest.catalogueName,
        entryCount: data.entries?.length || 0,
        purpose: data.manifest.purpose,
        sourceConfidence: data.manifest.sourceConfidence
    }));
}

function getOfficialCatalogue(key = "") {
    const normal = normalise(key);
    return CATALOGUES[key] || CATALOGUES[normal] || null;
}

function getCatalogueEntries(key = "") {
    const catalogue = getOfficialCatalogue(key);
    return catalogue?.entries ? catalogue.entries.map(entry => ({ ...entry })) : [];
}

function lookupOfficialGameTerm(term = "", options = {}) {
    const query = normalise(term);
    const catalogueFilter = normalise(options.catalogue || "");

    if (!query) {
        return [];
    }

    const matches = [];

    for (const [catalogueKey, catalogue] of Object.entries(CATALOGUES)) {
        if (catalogueFilter && normalise(catalogueKey) !== catalogueFilter && normalise(catalogue.manifest.catalogueKey) !== catalogueFilter) {
            continue;
        }

        for (const entry of catalogue.entries || []) {
            const haystack = [
                entry.key,
                entry.label,
                entry.family,
                entry.meaning,
                ...(entry.aliases || []),
                ...(entry.tags || []),
                ...(entry.battleReportLinks || [])
            ].map(normalise);

            const exact = haystack.some(value => value === query);
            const partial = haystack.some(value => value.includes(query) || query.includes(value));

            if (exact || partial) {
                matches.push({
                    catalogueKey,
                    catalogueName: catalogue.manifest.catalogueName,
                    matchScore: exact ? 2 : 1,
                    ...entry
                });
            }
        }
    }

    return matches.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

function explainOfficialGameTerm(term = "") {
    const matches = lookupOfficialGameTerm(term);

    if (!matches.length) {
        return {
            ok: false,
            input: term,
            message: "No v28.2-audit-aware official catalogue match found.",
            warning: "This does not mean the term is invalid; it may not be in the z28 curated layer yet."
        };
    }

    const primary = matches[0];

    return {
        ok: true,
        input: term,
        matchCount: matches.length,
        primary,
        related: matches.slice(1, 8),
        warning: "Catalogue entries explain wording/grouping only. They do not prove hidden formula values."
    };
}

function getCataloguesForTbiArea(area = "") {
    const query = normalise(area);
    if (!query) return allCatalogues();

    return allCatalogues().filter(cat => {
        const full = getOfficialCatalogue(cat.key);
        const text = normalise([cat.key, cat.name, cat.purpose, ...(full?.entries || []).flatMap(e => e.tbiUses || [])].join(" "));
        return text.includes(query);
    });
}

function auditOfficialCatalogues() {
    const list = allCatalogues();
    const totalEntries = list.reduce((sum, item) => sum + item.entryCount, 0);
    const required = [
        "enemyCatalogue", "ultimateWeaponCatalogue", "cardCatalogue", "workshopCatalogue",
        "labResearchCatalogue", "tournamentHeatCatalogue", "guardianCatalogue", "moduleCatalogue",
        "botCatalogue", "perkCatalogue", "resourceEconomyCatalogue"
    ];
    const missing = required.filter(key => !CATALOGUES[key]);

    return {
        ok: missing.length === 0 && totalEntries >= 100,
        gameVersion: "28.2.0 static recheck",
        build: "v4.11z52l",
        catalogueCount: list.length,
        totalEntries,
        missing,
        list,
        sourceConfidence: "mixed: game-file-confirmed-label / game-file-observed / tbi-curated-linkage",
        warning: "Use for official wording, aliases, groupings and explanations only; not exact formulas."
    };
}

const api = Object.freeze({
    catalogues: CATALOGUES,
    status: auditOfficialCatalogues,
    list: allCatalogues,
    get: getOfficialCatalogue,
    entries: getCatalogueEntries,
    lookup: lookupOfficialGameTerm,
    explain: explainOfficialGameTerm,
    forArea: getCataloguesForTbiArea
});

if (typeof window !== "undefined") {
    window.TowerBattleIntelOfficialCatalogues = api;
}

export {
    CATALOGUES as OfficialGameBrainCatalogues,
    normalise as normaliseOfficialCatalogueTerm,
    allCatalogues,
    getOfficialCatalogue,
    getCatalogueEntries,
    lookupOfficialGameTerm,
    explainOfficialGameTerm,
    getCataloguesForTbiArea,
    auditOfficialCatalogues
};

export default api;
