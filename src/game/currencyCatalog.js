"use strict";

/**
 * CURRENCY CATALOG
 * Meaning layer for currencies and reward drops.
 */

export const CURRENCY_CATALOG = Object.freeze({

    coins_earned: {
        label: "Coins",
        meaning: "Main upgrade economy from the run.",
        category: "economy"
    },

    cash_earned: {
        label: "Cash",
        meaning: "Temporary in-run cash economy.",
        category: "cash"
    },

    cells_earned: {
        label: "Elite Cells",
        meaning: "Lab boost fuel gained from elite enemies.",
        category: "cells"
    },

    gems: {
        label: "Gems",
        meaning: "Premium currency gained during the run.",
        category: "premium"
    },

    ad_gems: {
        label: "Ad Gems",
        meaning: "Gems from ad rewards.",
        category: "premium"
    },

    medals: {
        label: "Medals",
        meaning: "Event currency if present in report.",
        category: "event"
    },

    reroll_shards_earned: {
        label: "Reroll Shards",
        meaning: "Used for module sub-stat rerolls.",
        category: "modules"
    },

    cannon_shards: {
        label: "Cannon Shards",
        meaning: "Module shard reward for cannon module progression.",
        category: "modules"
    },

    armor_shards: {
        label: "Armor Shards",
        meaning: "Module shard reward for armor module progression.",
        category: "modules"
    },

    generator_shards: {
        label: "Generator Shards",
        meaning: "Module shard reward for generator module progression.",
        category: "modules"
    },

    core_shards: {
        label: "Core Shards",
        meaning: "Module shard reward for core module progression.",
        category: "modules"
    },

    common_modules: {
        label: "Common Modules",
        meaning: "Common module drops.",
        category: "modules"
    },

    rare_modules: {
        label: "Rare Modules",
        meaning: "Rare module drops.",
        category: "modules"
    }
});

export function getCurrencyInfo(key = "") {

    const normalised =
        normaliseCurrencyKey(key);

    return CURRENCY_CATALOG[normalised] || {
        label: formatCurrencyLabel(key),
        meaning: "Currency or reward type not registered yet.",
        category: "unknown"
    };
}

export function normaliseCurrencyKey(value = "") {

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\$/g, "")
        .replace(/[%:/()]/g, "")
        .replace(/\s+/g, "_")
        .replace(/__+/g, "_")
        .replace(/^_+|_+$/g, "");
}

export function formatCurrencyLabel(value = "") {

    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}
