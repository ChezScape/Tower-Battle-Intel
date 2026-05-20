"use strict";

/**
 * SECTION ENGINE
 *
 * Builds section data from The Tower battle reports.
 *
 * Supports:
 * - Tab-separated reports
 * - 2+ space separated reports
 * - Single-space copied reports
 */

const SECTION_HEADERS = new Set([
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

export function buildSections(lines = []) {

    const sections = {};

    let currentSection =
        "core";

    sections[currentSection] =
        {};

    for (const line of lines) {

        const trimmed =
            String(line || "").trim();

        if (!trimmed) {
            continue;
        }

        if (trimmed === "Battle Report") {
            continue;
        }

        if (SECTION_HEADERS.has(trimmed)) {

            currentSection =
                normaliseSectionName(trimmed);

            if (!sections[currentSection]) {
                sections[currentSection] = {};
            }

            continue;
        }

        const pair =
            splitSectionLine(trimmed);

        if (!pair) {
            continue;
        }

        const key =
            normaliseKey(pair.key);

        sections[currentSection][key] =
            pair.value;
    }

    return sections;
}

/* --------------------------------------------------
   SECTION LINE SPLITTER
-------------------------------------------------- */

function splitSectionLine(line = "") {

    const clean =
        String(line || "").trim();

    if (!clean) {
        return null;
    }

    /*
       Best case:
       Official reports often use tabs.
    */
    let parts =
        clean.split(/\t+/);

    if (parts.length >= 2) {
        return {
            key:
                parts[0].trim(),

            value:
                parts
                    .slice(1)
                    .join(" ")
                    .trim()
        };
    }

    /*
       Second case:
       Some copied reports keep 2+ spaces.
    */
    parts =
        clean.split(/\s{2,}/);

    if (parts.length >= 2) {
        return {
            key:
                parts[0].trim(),

            value:
                parts
                    .slice(1)
                    .join(" ")
                    .trim()
        };
    }

    /*
       Fallback:
       Some reports lose tabs completely:
       "Damage Dealt 37.17aa"
       "Coins Earned 542.11T"
       "Enemy Attack Levels Skipped 5095"
    */
    const labels =
        getKnownSectionLabels();

    for (const label of labels) {

        const prefix =
            `${label} `;

        if (clean.startsWith(prefix)) {

            const value =
                clean
                    .slice(prefix.length)
                    .trim();

            if (!value) {
                return null;
            }

            return {
                key:
                    label,

                value
            };
        }
    }

    return null;
}

/* --------------------------------------------------
   KNOWN LABELS
-------------------------------------------------- */

function getKnownSectionLabels() {

    return [
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
        "Summoned Enemies",
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
        "Cash",
        "Gems",
        "Medals",
        "Nuke",
        "Other"
    ].sort((a, b) => b.length - a.length);
}

/* --------------------------------------------------
   NORMALISE
-------------------------------------------------- */

function normaliseSectionName(value = "") {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/%/g, "percent")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function normaliseKey(value = "") {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/%/g, "percent")
        .replace(/\//g, " ")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}