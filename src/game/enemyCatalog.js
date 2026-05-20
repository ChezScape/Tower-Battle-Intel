"use strict";

/**
 * ENEMY CATALOG
 * Game-aware enemy meaning layer for death cause, pressure and report interpretation.
 *
 * Sources are registered in sourceRegistry.js. This file stores a conservative
 * local snapshot, not live patch data.
 */

import {
    getSourceById
} from "./sourceRegistry.js";

const TYPE_RANK = Object.freeze({
    boss: 5,
    elite: 4,
    fleet: 3,
    special: 2,
    normal: 1,
    summoned: 1,
    unknown: 0
});

export const ENEMY_CATALOG = Object.freeze({

    basic: enemy({
        label: "Basic",
        type: "normal",
        aliases: ["basic enemy", "basics"],
        meaning: "Standard normal enemy pressure. Usually a baseline kill-flow signal.",
        behavior: "No special behaviour registered in the tool snapshot.",
        pressure: ["baseline", "kill-flow"],
        checks: [
            "If Basic ends the run, check general damage scaling and normal enemy control.",
            "Compare total enemies, orbs, projectiles and damage dealt."
        ],
        sources: ["wiki_enemies", "wiki_tier_specific_guide"]
    }),

    fast: enemy({
        label: "Fast",
        type: "normal",
        aliases: ["fast enemy", "fasts"],
        meaning: "Fast normal enemy pressure. It can expose timing, knockback and kill-speed weaknesses.",
        behavior: "Moves faster than the baseline normal enemy family.",
        pressure: ["speed", "control", "knockback"],
        checks: [
            "Check whether wave improved while control metrics dropped.",
            "Look at orbs, projectiles, enemy hit sources and total enemies."
        ],
        sources: ["wiki_enemies", "wiki_tier_specific_guide"]
    }),

    range: enemy({
        label: "Ranged",
        type: "normal",
        aliases: ["ranged", "range enemy", "ranged enemy"],
        meaning: "Ranged pressure. It can punish builds that clear slowly or allow enemies to act before being controlled.",
        behavior: "Normal enemy family with ranged pressure.",
        pressure: ["range", "control", "survival"],
        checks: [
            "Check damage taken and whether defensive sustain fell.",
            "Compare enemy hit sources and ranged-related kill pressure across runs."
        ],
        sources: ["wiki_enemies", "wiki_tier_specific_guide"]
    }),

    ranged: enemy({
        label: "Ranged",
        type: "normal",
        aliases: ["range", "range enemy", "ranged enemy"],
        meaning: "Ranged pressure. It can punish weaker control, target timing or defensive layers.",
        behavior: "Normal enemy family with ranged pressure.",
        pressure: ["range", "control", "survival"],
        checks: [
            "Check damage taken, health regen, wall pressure and kill-source distribution.",
            "Compare whether the run died earlier despite better economy."
        ],
        sources: ["wiki_enemies", "wiki_tier_specific_guide"]
    }),

    tank: enemy({
        label: "Tank",
        type: "normal",
        aliases: ["tank enemy", "tanks"],
        meaning: "High-health normal enemy pressure. It can point to damage scaling or late-wave kill speed issues.",
        behavior: "Normal enemy family with higher durability.",
        pressure: ["health", "damage", "late-wave"],
        checks: [
            "Check damage dealt, critical factors, projectiles and UW damage contribution.",
            "If wave fell while damage rose, control/survival may be the real issue."
        ],
        sources: ["wiki_enemies", "wiki_tier_specific_guide"]
    }),

    protector: enemy({
        label: "Protector",
        type: "special",
        aliases: ["protectors", "protector enemy"],
        meaning: "Protector pressure can disrupt kill flow and reduce effective clear speed.",
        behavior: "Has special spawn handling and an on-screen limit in the wiki snapshot.",
        pressure: ["disruption", "kill-flow", "damage"],
        checks: [
            "Compare enemies destroyed by source and total enemies.",
            "Check if damage-source distribution shifted away from reliable clear tools."
        ],
        sources: ["wiki_enemies"]
    }),

    boss: enemy({
        label: "Boss",
        type: "boss",
        aliases: ["boss enemy", "bosses"],
        meaning: "Boss pressure. Boss waves are a major survival gate and should be judged separately from normal enemies.",
        behavior: "The wiki snapshot states bosses appear on boss waves and have separate susceptibility rules.",
        pressure: ["boss", "survival", "thorns", "boss-control"],
        checks: [
            "Compare damage taken, thorns, Plasma Cannon / Energy Net style indicators if present.",
            "Do not judge boss failures the same as normal enemy kill-flow failures."
        ],
        sources: ["wiki_enemies", "wiki_tier_specific_guide"]
    }),

    vampire: enemy({
        label: "Vampire",
        type: "elite",
        aliases: ["vamp", "vamps", "vampire enemy"],
        meaning: "Elite pressure. Vampire deaths are a serious sustain and elite-handling signal.",
        behavior: "Community guide snapshot describes Vampire as affecting sustain while attacking.",
        pressure: ["elite", "cells", "sustain", "regen", "lifesteal"],
        checks: [
            "Check health regenerated, lifesteal, wall regen and recovery-package movement.",
            "Check cells/hour as well as coins/hour; elite pressure can be tied to cell farming."
        ],
        sources: ["wiki_enemies", "wiki_tier_specific_guide"]
    }),

    ray: enemy({
        label: "Ray",
        type: "elite",
        aliases: ["ray enemy", "rays"],
        meaning: "Elite pressure. Ray deaths often suggest elite damage/control timing needs attention.",
        behavior: "Community guide snapshot describes Ray as ranged elite pressure.",
        pressure: ["elite", "cells", "range", "control", "damage-timing"],
        checks: [
            "Check if damage/control can handle elites before they become dangerous.",
            "Compare enemy hit sources, damage dealt and late-run damage taken."
        ],
        sources: ["wiki_enemies", "wiki_tier_specific_guide"]
    }),

    scatter: enemy({
        label: "Scatter",
        type: "elite",
        aliases: ["scatter enemy", "scatters"],
        meaning: "Elite pressure. Scatter deaths point to split/cleanup pressure and late-run survival strain.",
        behavior: "Community guide snapshot says Scatter can split into children after being killed.",
        pressure: ["elite", "cells", "split", "cleanup", "survival"],
        checks: [
            "Check kill-source distribution and whether cleanup tools carried enough of the run.",
            "Compare total enemies, enemies destroyed by source, damage taken and cells/hour."
        ],
        sources: ["wiki_enemies", "wiki_tier_specific_guide"]
    }),

    saboteur: enemy({
        label: "Saboteur",
        type: "fleet",
        aliases: ["saboteurs"],
        meaning: "Fleet-style pressure if present in report. Treat cautiously unless the report clearly names it.",
        behavior: "Fleet enemy details are more patch-sensitive; use as a labelled pressure signal only.",
        pressure: ["fleet", "late-tier", "special"],
        checks: [
            "Flag as high-tier special pressure.",
            "Use local history before making build advice."
        ],
        sources: ["community_game_subreddit"]
    }),

    commander: enemy({
        label: "Commander",
        type: "fleet",
        aliases: ["commanders"],
        meaning: "Fleet-style pressure if present in report. Treat cautiously unless the report clearly names it.",
        behavior: "Fleet enemy details are more patch-sensitive; use as a labelled pressure signal only.",
        pressure: ["fleet", "late-tier", "special"],
        checks: [
            "Flag as high-tier special pressure.",
            "Compare runs at the same tier before judging it."
        ],
        sources: ["community_game_subreddit"]
    }),

    overcharge: enemy({
        label: "Overcharge",
        type: "fleet",
        aliases: ["overcharged"],
        meaning: "Fleet-style pressure if present in report. Treat cautiously unless the report clearly names it.",
        behavior: "Fleet enemy details are more patch-sensitive; use as a labelled pressure signal only.",
        pressure: ["fleet", "late-tier", "special"],
        checks: [
            "Flag as high-tier special pressure.",
            "Check whether a new tier or condition caused the change."
        ],
        sources: ["community_game_subreddit"]
    }),

    summoned_enemies: enemy({
        label: "Summoned Enemies",
        type: "summoned",
        aliases: ["summoned", "summons"],
        meaning: "Additional spawned enemies. Useful as a pressure signal when present in report sections.",
        behavior: "Report-derived category, not a core enemy family in this snapshot.",
        pressure: ["spawned", "cleanup"],
        checks: [
            "Check cleanup and area damage sources.",
            "Compare total enemy counts and kill source distribution."
        ],
        sources: ["local_history"]
    })
});

export const ENEMY_TYPE_ORDER = Object.freeze([
    "boss",
    "elite",
    "fleet",
    "special",
    "normal",
    "summoned",
    "unknown"
]);

const ENEMY_ALIAS_INDEX = buildAliasIndex(ENEMY_CATALOG);

export function getEnemyInfo(enemyName = "") {

    const key = normaliseEnemyKey(enemyName);
    const canonical = ENEMY_ALIAS_INDEX[key] || key;

    return ENEMY_CATALOG[canonical] || enemy({
        key,
        label: formatEnemyLabel(enemyName),
        type: "unknown",
        meaning: "Enemy type not registered yet. Treat this as unknown report pressure.",
        behavior: "No local behaviour note registered.",
        pressure: ["unknown"],
        checks: [
            "Check the raw report and compare with local history.",
            "Do not make strong build advice from an unknown enemy label."
        ],
        sources: ["local_history"]
    });
}

export function isEliteEnemy(enemyName = "") {
    return getEnemyInfo(enemyName).type === "elite";
}

export function isBossEnemy(enemyName = "") {
    return getEnemyInfo(enemyName).type === "boss";
}

export function getEnemySeverity(enemyName = "") {

    const type = getEnemyInfo(enemyName).type;

    if (type === "boss" || type === "elite") {
        return "warn";
    }

    if (type === "fleet" || type === "special") {
        return "info";
    }

    if (type === "unknown") {
        return "neutral";
    }

    return "neutral";
}

export function buildEnemyPressureSummary(enemyNames = []) {

    const counts = {};

    for (const rawName of enemyNames || []) {
        if (!rawName) {
            continue;
        }

        const info = getEnemyInfo(rawName);
        counts[info.type] = (counts[info.type] || 0) + 1;
    }

    const dominantType = Object.keys(counts)
        .sort((a, b) => (TYPE_RANK[b] || 0) - (TYPE_RANK[a] || 0))[0] || "unknown";

    return {
        counts,
        dominantType,
        label: formatEnemyTypeLabel(dominantType),
        severity: dominantType === "elite" || dominantType === "boss" ? "warn" : "neutral"
    };
}

export function enemyActionChecklist(enemyName = "") {
    return getEnemyInfo(enemyName).checks || [];
}

export function enemySourceNotes(enemyName = "") {

    const info = getEnemyInfo(enemyName);

    return (info.sources || [])
        .map(getSourceById)
        .filter(Boolean)
        .map(source => `${source.name}: ${source.confidence}`);
}

export function normaliseEnemyKey(value = "") {

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[()/%:$]/g, "")
        .replace(/\s+/g, "_")
        .replace(/__+/g, "_")
        .replace(/^_+|_+$/g, "");
}

export function formatEnemyLabel(value = "") {

    return String(value || "Unknown")
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

function formatEnemyTypeLabel(value = "") {
    return formatEnemyLabel(value || "unknown");
}

function enemy(config = {}) {

    return Object.freeze({
        key: config.key || normaliseEnemyKey(config.label || "unknown"),
        label: config.label || "Unknown",
        type: config.type || "unknown",
        aliases: Object.freeze(config.aliases || []),
        meaning: config.meaning || "No meaning registered.",
        behavior: config.behavior || "No behaviour note registered.",
        pressure: Object.freeze(config.pressure || []),
        checks: Object.freeze(config.checks || []),
        sources: Object.freeze(config.sources || ["local_history"])
    });
}

function buildAliasIndex(catalog = {}) {

    const index = {};

    for (const [key, info] of Object.entries(catalog)) {
        index[normaliseEnemyKey(key)] = key;
        index[normaliseEnemyKey(info.label)] = key;

        for (const alias of info.aliases || []) {
            index[normaliseEnemyKey(alias)] = key;
        }
    }

    return Object.freeze(index);
}
