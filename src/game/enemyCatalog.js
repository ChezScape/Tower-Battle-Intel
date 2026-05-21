"use strict";

/**
 * ENEMY CATALOG
 * Enemy meaning layer for death cause and enemy composition analysis.
 */

export const ENEMY_CATALOG = Object.freeze({

    basic: {
        label: "Basic",
        type: "normal",
        meaning: "Standard enemy pressure."
    },

    fast: {
        label: "Fast",
        type: "normal",
        meaning: "Fast enemy pressure. Can expose weaknesses in control and kill speed."
    },

    tank: {
        label: "Tank",
        type: "normal",
        meaning: "High-health enemy pressure. Can indicate damage scaling issues."
    },

    ranged: {
        label: "Ranged",
        type: "normal",
        meaning: "Ranged pressure. Can punish weaker defensive control."
    },

    boss: {
        label: "Boss",
        type: "boss",
        meaning: "Boss pressure. Important for module drops and survival checks."
    },

    protector: {
        label: "Protector",
        type: "special",
        meaning: "Protector pressure. Can disrupt kill flow and damage efficiency."
    },

    vampire: {
        label: "Vampire",
        type: "elite",
        meaning: "Elite enemy. Important for cell income and survival pressure."
    },

    ray: {
        label: "Ray",
        type: "elite",
        meaning: "Elite enemy. If it kills the run, flag as elite pressure issue."
    },

    scatter: {
        label: "Scatter",
        type: "elite",
        meaning: "Elite enemy. If it kills the run, flag as elite pressure issue."
    },

    saboteur: {
        label: "Saboteur",
        type: "fleet",
        meaning: "Fleet-style pressure if present in report."
    },

    commander: {
        label: "Commander",
        type: "fleet",
        meaning: "Fleet-style pressure if present in report."
    },

    overcharge: {
        label: "Overcharge",
        type: "fleet",
        meaning: "Fleet-style pressure if present in report."
    },

    summoned_enemies: {
        label: "Summoned Enemies",
        type: "summoned",
        meaning: "Additional enemies spawned during the run."
    }
});

export function getEnemyInfo(enemy = "") {

    const key =
        normaliseEnemyKey(enemy);

    return ENEMY_CATALOG[key] || {
        label: formatEnemyLabel(enemy),
        type: "unknown",
        meaning: "Enemy type not registered yet."
    };
}

export function isEliteEnemy(enemy = "") {

    return getEnemyInfo(enemy).type === "elite";
}

export function normaliseEnemyKey(value = "") {

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/__+/g, "_");
}

export function formatEnemyLabel(value = "") {

    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}
