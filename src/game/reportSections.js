"use strict";

/**
 * REPORT SECTION CATALOG
 * Defines known Battle Report sections.
 */

export const REPORT_SECTIONS = Object.freeze({

    core: {
        label: "Core",
        meaning: "Main run identity and headline performance metrics."
    },

    records: {
        label: "Records",
        meaning: "One-off run records and peak moments."
    },

    damage: {
        label: "Damage",
        meaning: "Damage sources and total damage output."
    },

    damage_taken: {
        label: "Damage Taken",
        meaning: "Incoming damage pressure against tower and wall."
    },

    bonus_health_gained: {
        label: "Bonus Health Gained",
        meaning: "Bonus health gained during the run."
    },

    health_regenerated: {
        label: "Health Regenerated",
        meaning: "Health recovered through lifesteal, tower regen, and wall regen."
    },

    damage_blocked: {
        label: "Damage Blocked",
        meaning: "Defensive mitigation and blocked damage sources."
    },

    utility: {
        label: "Utility",
        meaning: "Upgrade skips, packages, and run utility mechanics."
    },

    counts: {
        label: "Counts",
        meaning: "Run event counts such as wave skips, death defy, nuke, and demon mode."
    },

    enemies_hit_by: {
        label: "Enemies Hit By",
        meaning: "How many enemies were hit by each weapon or effect."
    },

    killed_with_effect_active: {
        label: "Killed With Effect Active",
        meaning: "Kills while major effects or ultimate weapons were active."
    },

    total_enemies: {
        label: "Total Enemies",
        meaning: "Enemy composition and pressure profile."
    },

    coins: {
        label: "Coins",
        meaning: "Coin economy breakdown by source."
    },

    cash: {
        label: "Cash",
        meaning: "Cash earned and cash economy breakdown."
    },

    currencies: {
        label: "Currencies",
        meaning: "Cells, gems, medals, shards, and module drops."
    },

    enemies_destroyed_by: {
        label: "Enemies Destroyed By",
        meaning: "Kill attribution by damage source."
    }
});

export const SECTION_ORDER = Object.freeze([
    "core",
    "records",
    "damage",
    "damage_taken",
    "bonus_health_gained",
    "health_regenerated",
    "damage_blocked",
    "utility",
    "counts",
    "enemies_hit_by",
    "killed_with_effect_active",
    "total_enemies",
    "coins",
    "cash",
    "currencies",
    "enemies_destroyed_by"
]);

export function getSectionInfo(sectionKey = "") {

    const key =
        normaliseSectionKey(sectionKey);

    return REPORT_SECTIONS[key] || {
        label: formatSectionLabel(sectionKey),
        meaning: "No section meaning registered yet."
    };
}

export function normaliseSectionKey(value = "") {

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[%:/()]/g, "")
        .replace(/\s+/g, "_")
        .replace(/__+/g, "_")
        .replace(/^_+|_+$/g, "");
}

export function formatSectionLabel(value = "") {

    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}
