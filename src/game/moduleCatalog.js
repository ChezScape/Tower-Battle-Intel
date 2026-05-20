"use strict";

/**
 * MODULE CATALOG
 * Meaning layer for module-related report rewards.
 */

export const MODULE_CATALOG = Object.freeze({

    reroll_shards_earned: {
        label: "Reroll Shards Earned",
        meaning: "Reroll shard income from the run.",
        category: "reroll"
    },

    reroll_shards_fetched: {
        label: "Reroll Shards Fetched",
        meaning: "Reroll shards collected through fetch mechanics.",
        category: "reroll"
    },

    cannon_shards: {
        label: "Cannon Shards",
        meaning: "Shard reward for cannon module progression.",
        category: "shards"
    },

    armor_shards: {
        label: "Armor Shards",
        meaning: "Shard reward for armor module progression.",
        category: "shards"
    },

    generator_shards: {
        label: "Generator Shards",
        meaning: "Shard reward for generator module progression.",
        category: "shards"
    },

    core_shards: {
        label: "Core Shards",
        meaning: "Shard reward for core module progression.",
        category: "shards"
    },

    common_modules: {
        label: "Common Modules",
        meaning: "Common module drops.",
        category: "drops"
    },

    rare_modules: {
        label: "Rare Modules",
        meaning: "Rare module drops.",
        category: "drops"
    }
});

export function getModuleInfo(key = "") {

    const normalised =
        normaliseModuleKey(key);

    return MODULE_CATALOG[normalised] || {
        label: formatModuleLabel(key),
        meaning: "Module metric not registered yet.",
        category: "unknown"
    };
}

export function normaliseModuleKey(value = "") {

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[%:/()]/g, "")
        .replace(/\s+/g, "_")
        .replace(/__+/g, "_")
        .replace(/^_+|_+$/g, "");
}

export function formatModuleLabel(value = "") {

    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}
