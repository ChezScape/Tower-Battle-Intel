"use strict";

import {
    getCurrencyInfo
} from "./currencyCatalog.js";

import {
    getModuleInfo
} from "./moduleCatalog.js";

import {
    getUltimateWeaponInfo
} from "./ultimateWeaponCatalog.js";

/**
 * METRIC CATALOG
 * Local meaning system for Battle Report metrics.
 *
 * The compare engine uses this file as its game-aware dictionary:
 * - label
 * - category
 * - compare role
 * - importance weighting
 * - advice note
 */

function metric(config = {}) {

    return Object.freeze({
        label: config.label || formatMetricLabel(config.key || "unknown"),
        meaning: config.meaning || "No detailed meaning registered yet.",
        category: config.category || "unknown",
        higherIsBetter: config.higherIsBetter ?? null,
        compareRole: config.compareRole || roleFromHigherIsBetter(config.higherIsBetter),
        importance: Number(config.importance || 1),
        note: config.note || "",
        sourceIds: Object.freeze(config.sourceIds || ["local_history"]),
        aliases: Object.freeze(config.aliases || [])
    });
}

export const METRIC_CATALOG = Object.freeze({

    battle_date: metric({
        label: "Battle Date",
        meaning: "The date and time the run was recorded.",
        category: "core",
        higherIsBetter: null,
        compareRole: "neutral_signal",
        importance: 0.2
    }),

    tier: metric({
        label: "Tier",
        meaning: "Difficulty tier. Different tiers can change what a fair comparison means.",
        category: "core",
        higherIsBetter: "context",
        compareRole: "neutral_signal",
        importance: 1.2,
        note: "Tier changes are context, not automatically better or worse."
    }),

    wave: metric({
        label: "Wave",
        meaning: "The final wave reached before the run ended.",
        category: "progression",
        higherIsBetter: true,
        importance: 2.6,
        aliases: ["waves", "final_wave"]
    }),

    killed_by: metric({
        label: "Killed By",
        meaning: "The final pressure point or enemy type that ended the run.",
        category: "death",
        higherIsBetter: null,
        compareRole: "neutral_signal",
        importance: 1.8,
        aliases: ["killedby", "death_cause", "deathcause"]
    }),

    coins: metric({
        label: "Coins",
        meaning: "Total coin output from the run.",
        category: "economy",
        higherIsBetter: true,
        importance: 2.2,
        aliases: ["coins_earned", "coin", "cash_coins"],
        sourceIds: ["official_google_play", "local_history"]
    }),

    coins_earned: metric({
        label: "Coins Earned",
        meaning: "Total coin economy output from the run.",
        category: "economy",
        higherIsBetter: true,
        importance: 2.2,
        aliases: ["coins", "coin_earned"]
    }),

    coins_per_hour: metric({
        label: "Coins Per Hour",
        meaning: "Real coin farming speed. More useful than raw coins when run lengths differ.",
        category: "farming",
        higherIsBetter: true,
        importance: 3.2,
        aliases: ["coinsperhour", "coins_per_hr", "coinsperhr", "cph"],
        note: "Rate metric; useful for comparing runs with different lengths."
    }),

    coins_per_wave: metric({
        label: "Coins Per Wave",
        meaning: "Coin farming output normalised by wave progress.",
        category: "farming",
        higherIsBetter: true,
        importance: 2.7,
        aliases: ["coinsperwave", "cpw"],
        note: "Rate metric; helps separate farming quality from run length."
    }),

    cells: metric({
        label: "Cells",
        meaning: "Elite Cell income from the run.",
        category: "cells",
        higherIsBetter: true,
        importance: 2.4,
        aliases: ["cells_earned", "elite_cells", "elite_cells_earned"]
    }),

    cells_earned: metric({
        label: "Cells Earned",
        meaning: "Total Elite Cell income from the run.",
        category: "cells",
        higherIsBetter: true,
        importance: 2.4,
        aliases: ["cells", "elite_cells"]
    }),

    cells_per_hour: metric({
        label: "Cells Per Hour",
        meaning: "Real Elite Cell farming speed.",
        category: "cells",
        higherIsBetter: true,
        importance: 3.15,
        aliases: ["cellsperhour", "cells_per_hr", "cellsperhr", "cellph"],
        note: "Rate metric; important when elite pressure and run duration change."
    }),

    cells_per_wave: metric({
        label: "Cells Per Wave",
        meaning: "Cell output normalised by wave progress.",
        category: "cells",
        higherIsBetter: true,
        importance: 2.7,
        aliases: ["cellsperwave"]
    }),

    efficiency: metric({
        label: "Efficiency",
        meaning: "General farming efficiency signal calculated from report output.",
        category: "farming",
        higherIsBetter: true,
        importance: 2.7,
        aliases: ["farm_efficiency"]
    }),

    game_time: metric({
        label: "Game Time",
        meaning: "Reported run time. Context for comparing raw totals.",
        category: "core",
        higherIsBetter: "context",
        compareRole: "neutral_signal",
        importance: 1,
        aliases: ["time", "real_time", "run_time"]
    }),

    waves_skipped: metric({
        label: "Waves Skipped",
        meaning: "Wave skip contribution. More skips can improve farming flow and run speed.",
        category: "utility",
        higherIsBetter: true,
        importance: 1.8,
        aliases: ["wave_skips"]
    }),

    enemy_attack_levels_skipped: metric({
        label: "Enemy Attack Levels Skipped",
        meaning: "EALS effectiveness. Helps reduce enemy damage pressure over the run.",
        category: "survivability",
        higherIsBetter: true,
        importance: 2,
        aliases: ["eals"]
    }),

    enemy_health_levels_skipped: metric({
        label: "Enemy Health Levels Skipped",
        meaning: "EHLS effectiveness. Helps reduce enemy health scaling pressure over the run.",
        category: "damage",
        higherIsBetter: true,
        importance: 1.9,
        aliases: ["ehls"]
    }),

    total_enemies: metric({
        label: "Total Enemies",
        meaning: "Total enemy volume. Useful for pressure and spawn-flow context.",
        category: "progression",
        higherIsBetter: "context",
        compareRole: "neutral_signal",
        importance: 1.4,
        aliases: ["enemies", "enemy_count"]
    }),

    damage_dealt: metric({
        label: "Damage Dealt",
        meaning: "Total damage output across the run.",
        category: "damage",
        higherIsBetter: true,
        importance: 1.8,
        aliases: ["damage", "total_damage"]
    }),

    projectiles: metric({
        label: "Projectiles",
        meaning: "Projectile contribution or count depending on report section.",
        category: "damage",
        higherIsBetter: true,
        importance: 1.35,
        aliases: ["projectiles_count"]
    }),

    critical_factor: metric({
        label: "Critical Factor",
        meaning: "Critical damage multiplier signal.",
        category: "damage",
        higherIsBetter: true,
        importance: 1.3,
        aliases: ["crit_factor"]
    }),

    critical_chance: metric({
        label: "Critical Chance",
        meaning: "Critical hit chance signal.",
        category: "damage",
        higherIsBetter: true,
        importance: 1.25,
        aliases: ["crit_chance"]
    }),

    damage_taken: metric({
        label: "Damage Taken",
        meaning: "Total damage absorbed by defensive layers. Lower is usually safer, but context matters for wall/EHP builds.",
        category: "survivability",
        higherIsBetter: false,
        importance: 1.8,
        aliases: ["damage_received"],
        note: "Lower is generally better for damage taken."
    }),

    damage_taken_tower: metric({
        label: "Tower Damage Taken",
        meaning: "Damage received by the tower. Lower usually indicates better survival control.",
        category: "survivability",
        higherIsBetter: false,
        importance: 2,
        aliases: ["tower_damage_taken", "tower"]
    }),

    damage_taken_wall: metric({
        label: "Wall Damage Taken",
        meaning: "Damage received by the wall. Useful for wall or EHP-style builds.",
        category: "survivability",
        higherIsBetter: "context",
        compareRole: "neutral_signal",
        importance: 1.4,
        aliases: ["wall_damage_taken", "wall"]
    }),

    health_regen: metric({
        label: "Health Regen",
        meaning: "Health regeneration contribution or stat.",
        category: "survivability",
        higherIsBetter: true,
        importance: 1.5,
        aliases: ["tower_health_regen", "regen"]
    }),

    lifesteal: metric({
        label: "Lifesteal",
        meaning: "Sustain signal from lifesteal.",
        category: "survivability",
        higherIsBetter: true,
        importance: 1.45
    }),

    recovery_packages: metric({
        label: "Recovery Packages",
        meaning: "Recovery package contribution. Important for health and EHP sustain.",
        category: "survivability",
        higherIsBetter: true,
        importance: 1.4,
        aliases: ["packages"]
    }),

    defense_absolute: metric({
        label: "Defense Absolute",
        meaning: "Flat defense / blocked pressure signal.",
        category: "survivability",
        higherIsBetter: true,
        importance: 1.5,
        aliases: ["defense_abs", "abs_def"]
    }),

    defense_percent: metric({
        label: "Defense %",
        meaning: "Percentage defense signal.",
        category: "survivability",
        higherIsBetter: true,
        importance: 1.5,
        aliases: ["defense", "defense_%"]
    }),

    death_defy: metric({
        label: "Death Defy",
        meaning: "Times Death Defy prevented death. Shows emergency survival reliance.",
        category: "survivability",
        higherIsBetter: "context",
        compareRole: "neutral_signal",
        importance: 1.1
    }),

    nuke: metric({
        label: "Nuke",
        meaning: "Nuke activations during the run.",
        category: "utility",
        higherIsBetter: "context",
        compareRole: "neutral_signal",
        importance: 0.9
    }),

    demon_mode: metric({
        label: "Demon Mode",
        meaning: "Demon Mode activations during the run.",
        category: "survivability",
        higherIsBetter: "context",
        compareRole: "neutral_signal",
        importance: 0.9
    }),

    golden_tower: metric({
        label: "Golden Tower",
        meaning: "Golden Tower contribution to economy or kills depending on section.",
        category: "ultimate_weapon",
        higherIsBetter: true,
        importance: 1.8,
        sourceIds: ["official_google_play", "local_history"]
    }),

    black_hole: metric({
        label: "Black Hole",
        meaning: "Black Hole contribution. Often relevant to coin generation and enemy control.",
        category: "ultimate_weapon",
        higherIsBetter: true,
        importance: 1.7
    }),

    death_wave: metric({
        label: "Death Wave",
        meaning: "Death Wave contribution. Can affect damage, coins, cells and health bonuses depending on build.",
        category: "ultimate_weapon",
        higherIsBetter: true,
        importance: 1.55
    }),

    spotlight: metric({
        label: "Spotlight",
        meaning: "Spotlight contribution. Often tied to damage and coin multipliers.",
        category: "ultimate_weapon",
        higherIsBetter: true,
        importance: 1.6
    }),

    smart_missiles: metric({
        label: "Smart Missiles",
        meaning: "Smart Missiles contribution to damage or enemy hits.",
        category: "ultimate_weapon",
        higherIsBetter: true,
        importance: 1.45,
        aliases: ["sm"]
    }),

    chain_lightning: metric({
        label: "Chain Lightning",
        meaning: "Chain Lightning contribution to damage or enemy hits.",
        category: "ultimate_weapon",
        higherIsBetter: true,
        importance: 1.45,
        aliases: ["cl"]
    }),

    reroll_shards_earned: metric({
        label: "Reroll Shards Earned",
        meaning: "Module reroll shard income from the run.",
        category: "modules",
        higherIsBetter: true,
        importance: 1.2,
        aliases: ["reroll_shards"]
    }),

    common_modules: metric({
        label: "Common Modules",
        meaning: "Common module drops from the run.",
        category: "modules",
        higherIsBetter: "context",
        compareRole: "neutral_signal",
        importance: 0.8
    }),

    rare_modules: metric({
        label: "Rare Modules",
        meaning: "Rare module drops from the run.",
        category: "modules",
        higherIsBetter: true,
        importance: 1.2
    }),

    gems: metric({
        label: "Gems",
        meaning: "Gem income signal.",
        category: "currency",
        higherIsBetter: true,
        importance: 1.1
    }),

    medals: metric({
        label: "Medals",
        meaning: "Event medal income signal.",
        category: "currency",
        higherIsBetter: true,
        importance: 1.1
    })
});

const ALIAS_INDEX = buildAliasIndex(METRIC_CATALOG);

export function getMetricInfo(key = "") {

    const canonical = resolveMetricKey(key);

    if (METRIC_CATALOG[canonical]) {
        return METRIC_CATALOG[canonical];
    }

    const external =
        getExternalMetricInfo(canonical, key);

    if (external) {
        return metric(external);
    }

    return metric({
        key: canonical,
        label: formatMetricLabel(key),
        meaning: "No detailed meaning registered yet.",
        category: "unknown",
        higherIsBetter: null,
        compareRole: "higher_is_better",
        importance: 1,
        sourceIds: ["local_history"]
    });
}

export function hasMetricInfo(key = "") {
    return Boolean(METRIC_CATALOG[resolveMetricKey(key)]);
}

export function resolveMetricKey(value = "") {

    const normalised = normaliseMetricKey(value);

    return ALIAS_INDEX[normalised] || normalised;
}

export function getMetricCompareProfile(key = "") {

    const info = getMetricInfo(key);

    return {
        key: resolveMetricKey(key),
        label: info.label,
        category: info.category,
        role: info.compareRole || roleFromHigherIsBetter(info.higherIsBetter),
        importance: Number(info.importance || 1),
        note: info.note || info.meaning || "",
        higherIsBetter: info.higherIsBetter,
        sourceIds: info.sourceIds || []
    };
}

export function normaliseMetricKey(value = "") {

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[%:/()]/g, "")
        .replace(/\$/g, "")
        .replace(/[+]/g, "")
        .replace(/[\-]+/g, "_")
        .replace(/\s+/g, "_")
        .replace(/__+/g, "_")
        .replace(/^_+|_+$/g, "");
}

export function formatMetricLabel(value = "") {

    return String(value || "Unknown")
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}


function getExternalMetricInfo(canonical = "", original = "") {

    const currency = getCurrencyInfo(canonical);
    if (currency?.category && currency.category !== "unknown") {
        return {
            key: canonical,
            label: currency.label,
            meaning: currency.meaning,
            category: currency.category === "premium" || currency.category === "event" ? "currency" : currency.category,
            higherIsBetter: true,
            importance: currency.category === "cells" || currency.category === "economy" ? 2 : 1.2,
            sourceIds: ["local_history"]
        };
    }

    const moduleInfo = getModuleInfo(canonical);
    if (moduleInfo?.category && moduleInfo.category !== "unknown") {
        return {
            key: canonical,
            label: moduleInfo.label,
            meaning: moduleInfo.meaning,
            category: "modules",
            higherIsBetter: moduleInfo.category === "drops" ? "context" : true,
            compareRole: moduleInfo.category === "drops" ? "neutral_signal" : "higher_is_better",
            importance: moduleInfo.category === "reroll" ? 1.4 : 1,
            sourceIds: ["local_history"]
        };
    }

    const ultimate = getUltimateWeaponInfo(canonical);
    if (ultimate?.categories?.length) {
        return {
            key: canonical,
            label: ultimate.label,
            meaning: ultimate.meaning,
            category: ultimate.categories.includes("economy") ? "economy" : ultimate.categories.includes("survival") ? "survivability" : "damage",
            higherIsBetter: true,
            importance: ultimate.categories.includes("economy") ? 1.8 : 1.45,
            sourceIds: ["local_history", "patch_v28_1_reddit"]
        };
    }

    return null;
}

function roleFromHigherIsBetter(value) {

    if (value === false) {
        return "lower_is_better";
    }

    if (value === null || value === "context") {
        return "neutral_signal";
    }

    return "higher_is_better";
}

function buildAliasIndex(catalog = {}) {

    const index = {};

    for (const [key, info] of Object.entries(catalog)) {
        index[normaliseMetricKey(key)] = key;
        index[normaliseMetricKey(info.label)] = key;

        for (const alias of info.aliases || []) {
            index[normaliseMetricKey(alias)] = key;
        }
    }

    return Object.freeze(index);
}
