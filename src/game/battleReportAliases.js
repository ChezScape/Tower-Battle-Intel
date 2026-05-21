"use strict";

/**
 * BATTLE REPORT ALIASES
 * Shared normalisation for parser, section engine, schema and metric brain.
 */

export const REPORT_SECTION_HEADERS = Object.freeze([
    "Records",
    "Damage",
    "Damage Taken",
    "Bonus Health Gained",
    "Health Regenerated",
    "Damage Blocked",
    "Utility",
    "Counts",
    "Enemies Hit By",
    "Killed With Effect Active",
    "Total Enemies",
    "Coins",
    "Cash",
    "Currencies",
    "Enemies Destroyed By"
]);

export const BATTLE_REPORT_LABELS = Object.freeze([
    "Highest Coins / Minute",
    "Most Coins From Golden Combo",
    "Most Coins From Wave Skip",
    "Most Cells From Wave Skip",
    "Largest Inner Landmine Charge",
    "Largest Smart Missile Stack",
    "Enemy Attack Levels Skipped",
    "Enemy Health Levels Skipped",
    "Hits Absorbed By Energy Shield",
    "Negative Mass Projector",
    "Free Defense Upgrade",
    "Free Utility Upgrade",
    "Free Attack Upgrade",
    "Reroll Shards Earned",
    "Reroll Shards Fetched",
    "Gem Blocks Tapped",
    "Defense Absolute",
    "Recovery Packages",
    "Projectiles Count",
    "Land Mines Spawned",
    "Thunder Bot Stuns",
    "Other Coin Bonuses",
    "Killed With Effect Active",
    "Enemies Destroyed By",
    "Summoned Enemies",
    "Coins Per Hour",
    "Cells Per Hour",
    "Coins Earned",
    "Cells Earned",
    "Coins / Kill",
    "Coins / Wave",
    "Coins Fetched",
    "Bounty Coins",
    "Cash Earned",
    "Interest earned",
    "Battle Date",
    "Game Time",
    "Real Time",
    "Killed By",
    "Damage Dealt",
    "Rend Armor",
    "Death Ray",
    "Land Mines",
    "Chain Lightning",
    "Smart Missiles",
    "Inner Land Mines",
    "Poison Swamp",
    "Death Wave",
    "Black Hole",
    "Flame Bot",
    "Attack Chip",
    "From Death Wave",
    "Tower Health Regen",
    "Wall Health Regen",
    "Defense %",
    "Chrono Field",
    "Chain Thunder",
    "Primordial Collapse",
    "Largest Wave Skip",
    "Death Defy",
    "Second Wind",
    "Demon Mode",
    "Enemies Hit By",
    "Golden Tower",
    "Golden Combo",
    "Amplify Bot",
    "Golden Bot",
    "Death Penalty",
    "Total Enemies",
    "Critical Coin",
    "Wave Skip",
    "Ad Gems",
    "Fetch Gems",
    "Cannon Shards",
    "Armor Shards",
    "Generator Shards",
    "Core Shards",
    "Common Modules",
    "Rare Modules",
    "Projectiles",
    "Lifesteal",
    "Electrons",
    "Thorns",
    "Orbs",
    "Tower",
    "Wall",
    "Basic",
    "Fast",
    "Tank",
    "Ranged",
    "Boss",
    "Protector",
    "Vampires",
    "Rays",
    "Scatters",
    "Saboteur",
    "Commander",
    "Overcharge",
    "Tier",
    "Wave",
    "Cash",
    "Gems",
    "Medals",
    "Nuke",
    "Other"
].sort((a, b) => b.length - a.length));

export const REPORT_FIELD_ALIASES = Object.freeze({
    coins_per_kill: "coins_kill",
    coin_per_kill: "coins_kill",
    "coins_/_kill": "coins_kill",
    coins_kill: "coins_kill",

    coins_per_wave: "coins_wave",
    coin_per_wave: "coins_wave",
    "coins_/_wave": "coins_wave",
    coins_wave: "coins_wave",

    highest_coins_per_minute: "highest_coins_minute",
    "highest_coins_/_minute": "highest_coins_minute",
    highest_coins_minute: "highest_coins_minute",

    defense: "defense_percent",
    defense_percent: "defense_percent",
    defense_: "defense_percent",

    interest_earned: "interest_earned",
    interest_earned_: "interest_earned",

    inner_landmine_charge: "inner_landmine_charge",
    largest_inner_landmine_charge: "largest_inner_landmine_charge"
});

export function getKnownSectionHeaders() {
    return [...REPORT_SECTION_HEADERS];
}

export function getKnownBattleReportLabels() {
    return [...BATTLE_REPORT_LABELS];
}

export function normaliseReportSection(value = "") {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/%/g, "percent")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

export function normaliseReportKey(value = "") {
    const raw = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\$/g, "")
        .replace(/%/g, "percent")
        .replace(/\s*\/\s*/g, "_")
        .replace(/[:()]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/__+/g, "_")
        .replace(/^_+|_+$/g, "");

    return REPORT_FIELD_ALIASES[raw] || raw;
}

export function resolveBattleReportAlias(key = "") {
    return normaliseReportKey(key);
}

export function formatReportLabel(value = "") {
    return String(value || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase())
        .replace(/\bPercent\b/g, "%");
}
