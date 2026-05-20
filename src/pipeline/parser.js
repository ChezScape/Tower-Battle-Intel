"use strict";

/**
 * PARSER
 * Converts raw Battle Report text into structured pipeline data.
 *
 * Responsibilities:
 * - split raw report into lines
 * - protect against multiple pasted reports
 * - build section groups
 * - build flat key/value map
 * - extract core values
 * - extract imported stats
 * - preserve full battle sections
 *
 * Does NOT compute final metrics.
 * Does NOT compare runs.
 */

import {
    normalizeValue,
    normalizeKey
} from "./normalize.js";

import {
    validateAndRepair
} from "./schemaEngine.js";

import {
    buildSections
} from "../utils/sectionEngine.js";

import {
    parseNumber
} from "../utils/math.js";

/* --------------------------------------------------
   MAIN PARSER
-------------------------------------------------- */

export function parser(rawText) {

    if (!rawText || typeof rawText !== "string") {
        return validateAndRepair({});
    }

    /*
       Important:
       If the user accidentally pastes two Battle Reports,
       only use the first report.

       This prevents the second report overwriting values
       from the first one.
    */
    const reportText =
        extractFirstBattleReport(rawText);

    const lines =
        reportText
            .replace(/\r/g, "")
            .split("\n");

    const sections =
        buildSections(lines);

    const flat =
        buildFlatMap(lines);

    /* --------------------------------------------------
       CORE RAW STRUCTURE
    -------------------------------------------------- */

    const core = {

        battleDate:
            flat.battle_date || "",

        game_time:
            flat.game_time || "",

        real_time:
            flat.real_time || "",

        tier:
            parseNumber(flat.tier),

        wave:
            parseNumber(flat.wave),

        killedBy:
            flat.killed_by || "",

        coins:
            parseNumber(
                flat.coins_earned ??
                flat.coins
            ),

        cells:
            parseNumber(
                flat.cells_earned ??
                flat.cells
            ),

        time:
            flat.real_time ||
            flat.game_time ||
            flat.time ||
            ""
    };

    /* --------------------------------------------------
       IMPORTED STATS
    -------------------------------------------------- */

    const stats = {

        coinsPerHour:
            parseNumber(flat.coins_per_hour),

        cellsPerHour:
            parseNumber(flat.cells_per_hour),

        coinsPerWave:
            parseNumber(flat.coins_per_wave),

        cellsPerWave:
            safeDiv(
                parseNumber(flat.cells_earned),
                parseNumber(flat.wave)
            ),

        efficiency:
            0
    };

    /* --------------------------------------------------
       FINAL PARSED OBJECT
    -------------------------------------------------- */

    const parsed = {

        core,

        stats,

        sections,

        flat,

        meta: {
            confidence:
                estimateConfidence({
                    core,
                    sections,
                    flat
                })
        },

        raw: {
            originalText: rawText,
            reportText,
            lines,
            core,
            stats,
            sections,
            flat
        }
    };

    return validateAndRepair(parsed);
}

/* --------------------------------------------------
   MULTI REPORT SAFETY
-------------------------------------------------- */

function extractFirstBattleReport(rawText = "") {

    const text =
        String(rawText || "")
            .replace(/\r/g, "")
            .trim();

    if (!text) {
        return "";
    }

    const marker =
        "Battle Report";

    const firstIndex =
        text.indexOf(marker);

    if (firstIndex === -1) {
        return text;
    }

    const secondIndex =
        text.indexOf(
            marker,
            firstIndex + marker.length
        );

    if (secondIndex === -1) {
        return text
            .slice(firstIndex)
            .trim();
    }

    console.warn(
        "[Battle Analyser] Multiple battle reports detected. Using the first one only."
    );

    return text
        .slice(firstIndex, secondIndex)
        .trim();
}

/* --------------------------------------------------
   FLAT MAP BUILDER
-------------------------------------------------- */

function buildFlatMap(lines = []) {

    const flat = {};

    for (const rawLine of lines) {

        if (!rawLine || !rawLine.trim()) {
            continue;
        }

        const parts =
            splitKeyValue(rawLine);

        if (!parts) {
            continue;
        }

        const key =
            normalizeKey(parts.key);

        const value =
            normalizeValue(parts.value);

        if (!key) {
            continue;
        }

        flat[key] = value;
    }

    return flat;
}

/* --------------------------------------------------
   KEY / VALUE SPLITTER
-------------------------------------------------- */

function splitKeyValue(line = "") {

    const clean =
        String(line || "").trim();

    if (!clean) {
        return null;
    }

    /*
       Best case:
       Official exported reports usually use tabs.
    */
    let parts =
        clean.split(/\t+/);

    if (parts.length >= 2) {
        return {
            key:
                parts[0]?.trim(),

            value:
                parts
                    .slice(1)
                    .join(" ")
                    .trim()
        };
    }

    /*
       Second case:
       Some copies preserve spacing with 2+ spaces.
    */
    parts =
        clean.split(/\s{2,}/);

    if (parts.length >= 2) {
        return {
            key:
                parts[0]?.trim(),

            value:
                parts
                    .slice(1)
                    .join(" ")
                    .trim()
        };
    }

    /*
       Fallback:
       Some reports lose tabs and become:
       "Battle Date May 12, 2026 21:26"
       "Coins Earned 542.11T"
       "Killed By Fast"

       This matches known Battle Report labels from longest to shortest.
    */
    const labels =
        getKnownBattleReportLabels();

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

function getKnownBattleReportLabels() {

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
        "Killed With Effect Active",
        "Enemies Destroyed By",
        "Summoned Enemies",
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
        "Damage Taken",
        "Bonus Health Gained",
        "From Death Wave",
        "Health Regenerated",
        "Tower Health Regen",
        "Wall Health Regen",
        "Damage Blocked",
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
    ].sort((a, b) => b.length - a.length);
}

/* --------------------------------------------------
   CONFIDENCE ESTIMATION
-------------------------------------------------- */

function estimateConfidence({
    core = {},
    sections = {},
    flat = {}
} = {}) {

    let score = 100;

    if (!core.wave) {
        score -= 20;
    }

    if (!core.tier) {
        score -= 10;
    }

    if (!core.coins) {
        score -= 15;
    }

    if (!core.cells) {
        score -= 10;
    }

    if (!core.real_time && !core.game_time) {
        score -= 10;
    }

    if (!Object.keys(sections || {}).length) {
        score -= 20;
    }

    if (!Object.keys(flat || {}).length) {
        score -= 20;
    }

    return clamp(score, 0, 100);
}

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

function safeDiv(a, b) {

    const left =
        Number(a);

    const right =
        Number(b);

    if (
        !Number.isFinite(left) ||
        !Number.isFinite(right) ||
        right === 0
    ) {
        return 0;
    }

    return left / right;
}

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}
