"use strict";

import { normaliseReportKey, formatReportLabel } from "./battleReportAliases.js";
import { getReportMetricInfo } from "./reportSchema.js";
import { getCurrencyInfo } from "./currencyCatalog.js";
import { getModuleInfo } from "./moduleCatalog.js";
import { getUltimateWeaponInfo } from "./ultimateWeaponCatalog.js";

/**
 * METRIC CATALOG
 * Meaning system for Battle Report metrics.
 */

export const METRIC_CATALOG = Object.freeze({

    battle_date: {
        label: "Battle Date",
        meaning: "The date and time the run was recorded.",
        category: "core",
        higherIsBetter: null
    },

    tier: {
        label: "Tier",
        meaning: "The difficulty tier used for the run.",
        category: "core",
        higherIsBetter: "context"
    },

    wave: {
        label: "Wave",
        meaning: "The final wave reached before the run ended.",
        category: "progression",
        higherIsBetter: true
    },

    killed_by: {
        label: "Killed By",
        meaning: "The final pressure point or enemy type that ended the run.",
        category: "death",
        higherIsBetter: null
    },

    coins_earned: {
        label: "Coins Earned",
        meaning: "Total economy output from the run.",
        category: "economy",
        higherIsBetter: true
    },

    coins_per_hour: {
        label: "Coins Per Hour",
        meaning: "Real farming efficiency for coin gain.",
        category: "economy",
        higherIsBetter: true
    },

    cells_earned: {
        label: "Cells Earned",
        meaning: "Total Elite Cell income from the run.",
        category: "cells",
        higherIsBetter: true
    },

    cells_per_hour: {
        label: "Cells Per Hour",
        meaning: "Real farming efficiency for Elite Cell gain.",
        category: "cells",
        higherIsBetter: true
    },

    waves_skipped: {
        label: "Waves Skipped",
        meaning: "Wave skip contribution. More wave skips can improve run speed and farming flow.",
        category: "utility",
        higherIsBetter: true
    },

    enemy_attack_levels_skipped: {
        label: "Enemy Attack Levels Skipped",
        meaning: "EALS effectiveness. Helps reduce enemy damage pressure over the run.",
        category: "survival",
        higherIsBetter: true
    },

    enemy_health_levels_skipped: {
        label: "Enemy Health Levels Skipped",
        meaning: "EHLS effectiveness. Helps reduce enemy health scaling pressure over the run.",
        category: "damage",
        higherIsBetter: true
    },

    damage_dealt: {
        label: "Damage Dealt",
        meaning: "Total damage output across the run.",
        category: "damage",
        higherIsBetter: true
    },

    damage_taken_tower: {
        label: "Tower Damage Taken",
        meaning: "Damage received by the tower. Lower can indicate better survival control.",
        category: "survival",
        higherIsBetter: false
    },

    damage_taken_wall: {
        label: "Wall Damage Taken",
        meaning: "Damage received by the wall. Useful for wall or EHP-style builds.",
        category: "survival",
        higherIsBetter: "context"
    },

    recovery_packages: {
        label: "Recovery Packages",
        meaning: "Number of recovery packages collected. Important for health and EHP sustain.",
        category: "survival",
        higherIsBetter: true
    },

    death_defy: {
        label: "Death Defy",
        meaning: "Times Death Defy prevented death. Shows emergency survival reliance.",
        category: "survival",
        higherIsBetter: "context"
    },

    nuke: {
        label: "Nuke",
        meaning: "Number of Nuke activations during the run.",
        category: "utility",
        higherIsBetter: "context"
    },

    demon_mode: {
        label: "Demon Mode",
        meaning: "Number of Demon Mode activations during the run.",
        category: "survival",
        higherIsBetter: "context"
    },

    golden_tower: {
        label: "Golden Tower",
        meaning: "Golden Tower contribution to economy or kills depending on section.",
        category: "ultimate_weapon",
        higherIsBetter: true
    },

    black_hole: {
        label: "Black Hole",
        meaning: "Black Hole contribution. Often relevant to coin generation and enemy control.",
        category: "ultimate_weapon",
        higherIsBetter: true
    },

    death_wave: {
        label: "Death Wave",
        meaning: "Death Wave contribution. Can affect damage, coins, cells, and health bonuses depending on build.",
        category: "ultimate_weapon",
        higherIsBetter: true
    },

    spotlight: {
        label: "Spotlight",
        meaning: "Spotlight contribution. Often tied to damage and coin multipliers.",
        category: "ultimate_weapon",
        higherIsBetter: true
    },

    smart_missiles: {
        label: "Smart Missiles",
        meaning: "Smart Missiles contribution to damage or enemy hits.",
        category: "ultimate_weapon",
        higherIsBetter: true
    },

    chain_lightning: {
        label: "Chain Lightning",
        meaning: "Chain Lightning contribution to damage or enemy hits.",
        category: "ultimate_weapon",
        higherIsBetter: true
    },

    reroll_shards_earned: {
        label: "Reroll Shards Earned",
        meaning: "Module reroll shard income from the run.",
        category: "modules",
        higherIsBetter: true
    },

    common_modules: {
        label: "Common Modules",
        meaning: "Common module drops from the run.",
        category: "modules",
        higherIsBetter: true
    },

    rare_modules: {
        label: "Rare Modules",
        meaning: "Rare module drops from the run.",
        category: "modules",
        higherIsBetter: true
    }
});

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */


export function getMetricInfo(key = "", sectionKey = "") {

    const normalised = normaliseMetricKey(key);

    if (METRIC_CATALOG[normalised]) {
        return METRIC_CATALOG[normalised];
    }

    const schemaInfo = getReportMetricInfo(normalised, sectionKey);

    if (schemaInfo) {
        return {
            label: schemaInfo.label,
            meaning: schemaInfo.meaning,
            category: schemaInfo.category,
            higherIsBetter: schemaInfo.higherIsBetter,
            importance: schemaInfo.importance || 1,
            sourceIds: schemaInfo.sourceIds || ["local_battle_report_samples"]
        };
    }

    const external = getExternalMetricInfo(normalised);

    if (external) {
        return external;
    }

    return {
        label: formatMetricLabel(key),
        meaning: "No detailed meaning registered yet.",
        category: "unknown",
        higherIsBetter: null,
        importance: 0.5,
        sourceIds: ["local_history"]
    };
}


export function hasMetricInfo(key = "", sectionKey = "") {

    const normalised = normaliseMetricKey(key);

    return Boolean(
        METRIC_CATALOG[normalised] ||
        getReportMetricInfo(normalised, sectionKey) ||
        getExternalMetricInfo(normalised)
    );
}


export function normaliseMetricKey(value = "") {
    return normaliseReportKey(value);
}


function getExternalMetricInfo(normalised = "") {

    const currency = getCurrencyInfo(normalised);
    if (currency && currency.category !== "unknown") {
        return {
            label: currency.label,
            meaning: currency.meaning,
            category: currency.category,
            higherIsBetter: true,
            importance: 1.2,
            sourceIds: currency.sourceIds || []
        };
    }

    const module = getModuleInfo(normalised);
    if (module && module.category !== "unknown") {
        return {
            label: module.label,
            meaning: module.meaning,
            category: module.category,
            higherIsBetter: true,
            importance: 1.1,
            sourceIds: module.sourceIds || []
        };
    }

    const effect = getUltimateWeaponInfo(normalised);
    if (effect && effect.type !== "unknown_effect") {
        return {
            label: effect.label,
            meaning: effect.meaning,
            category: effect.categories?.[0] || effect.type || "effect",
            higherIsBetter: true,
            importance: 1.25,
            sourceIds: effect.sourceIds || []
        };
    }

    return null;
}

export function formatMetricLabel(value = "") {
    return formatReportLabel(value);
}
