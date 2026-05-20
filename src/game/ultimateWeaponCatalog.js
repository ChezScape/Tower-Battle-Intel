"use strict";

/**
 * ULTIMATE WEAPON CATALOG
 * Meaning layer for major weapon/effect names found in reports.
 */

export const ULTIMATE_WEAPON_CATALOG = Object.freeze({

    golden_tower: {
        label: "Golden Tower",
        short: "GT",
        meaning: "Major economy ultimate weapon. Important for coins and cash output.",
        categories: ["economy"]
    },

    black_hole: {
        label: "Black Hole",
        short: "BH",
        meaning: "Enemy control and economy-linked ultimate weapon.",
        categories: ["economy", "control"]
    },

    death_wave: {
        label: "Death Wave",
        short: "DW",
        meaning: "Can contribute to damage, health bonus, coins, and cells depending on setup.",
        categories: ["damage", "health", "economy", "cells"]
    },

    spotlight: {
        label: "Spotlight",
        short: "SL",
        meaning: "Damage and economy multiplier effect.",
        categories: ["damage", "economy"]
    },

    smart_missiles: {
        label: "Smart Missiles",
        short: "SM",
        meaning: "Damage-focused ultimate weapon.",
        categories: ["damage"]
    },

    chain_lightning: {
        label: "Chain Lightning",
        short: "CL",
        meaning: "Damage-focused ultimate weapon with chain hit behaviour.",
        categories: ["damage"]
    },

    chrono_field: {
        label: "Chrono Field",
        short: "CF",
        meaning: "Control/slow effect that can support survivability.",
        categories: ["control", "survival"]
    },

    inner_land_mines: {
        label: "Inner Land Mines",
        short: "ILM",
        meaning: "Damage and control source depending on setup.",
        categories: ["damage", "control"]
    },

    poison_swamp: {
        label: "Poison Swamp",
        short: "PS",
        meaning: "Damage/control source depending on setup.",
        categories: ["damage", "control"]
    }
});

export function getUltimateWeaponInfo(key = "") {

    const normalised =
        normaliseUltimateWeaponKey(key);

    return ULTIMATE_WEAPON_CATALOG[normalised] || {
        label: formatUltimateWeaponLabel(key),
        short: "",
        meaning: "Ultimate weapon or major effect not registered yet.",
        categories: []
    };
}

export function normaliseUltimateWeaponKey(value = "") {

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[%:/()]/g, "")
        .replace(/\s+/g, "_")
        .replace(/__+/g, "_")
        .replace(/^_+|_+$/g, "");
}

export function formatUltimateWeaponLabel(value = "") {

    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}
