"use strict";

/**
 * HIERARCHICAL BATTLE DIFF ENGINE
 *
 * Game-aware compare brain.
 *
 * Keeps the existing public structure:
 * - core
 * - stats
 * - sections
 * - summary
 * - meta
 *
 * Adds smarter summary output:
 * - topGains / topLosses
 * - farmingVerdict
 * - categoryScores
 * - sectionSummaries
 * - outcome per numeric field
 */

import {
    toNumber
} from "../utils/math.js";

import {
    isTowerNumberLike
} from "../game/numberNotation.js";

import {
    getMetricCompareRole,
    getMetricPriorityInfo,
    getMetricPriorityScore
} from "../game/metricPriorityRules.js";

import {
    getMetricInfo
} from "../game/metricCatalog.js";

/* --------------------------------------------------
   CONFIG
-------------------------------------------------- */

const META_KEYS = new Set([
    "app",
    "archive",
    "archived",
    "battle_date",
    "battledate",
    "build_style",
    "date",
    "death_cause",
    "game_time",
    "gametime",
    "id",
    "killed_by",
    "killedby",
    "notes",
    "real_time",
    "realtime",
    "report_id",
    "reportid",
    "saved_at",
    "savedat",
    "source",
    "tags",
    "time",
    "tier"
]);

const LOWER_IS_BETTER_KEYS = new Set([
    "damage_taken",
    "damage_taken_tower",
    "damage_taken_wall",
    "tower_damage_taken",
    "wall_damage_taken",
    "tower",
    "wall"
]);

const NEUTRAL_SIGNAL_KEYS = new Set([
    "ad_gems",
    "armor_shards",
    "cannon_shards",
    "common_modules",
    "core_shards",
    "demon_mode",
    "fetch_gems",
    "gem_blocks_tapped",
    "generator_shards",
    "gems",
    "hits_absorbed_by_energy_shield",
    "land_mines_spawned",
    "medals",
    "nuke",
    "projectiles_count",
    "rare_modules",
    "second_wind",
    "thunder_bot_stuns"
]);

const FARMING_RATE_KEYS = new Set([
    "cells_per_hour",
    "cellsperhour",
    "cells_per_wave",
    "cellsperwave",
    "coins_per_hour",
    "coinsperhour",
    "coins_per_wave",
    "coinsperwave",
    "efficiency"
]);

const IMPORTANT_COMPARE_KEYS = new Set([
    "cells",
    "cells_earned",
    "cells_per_hour",
    "cellsperhour",
    "coins",
    "coins_earned",
    "coins_per_hour",
    "coinsperhour",
    "damage_dealt",
    "damage_taken",
    "defense_absolute",
    "defense_percent",
    "efficiency",
    "total_enemies",
    "wave"
]);

/* --------------------------------------------------
   MAIN ENTRY
-------------------------------------------------- */

export function compare(A, B) {

    if (!A || !B) {
        return null;
    }

    const core =
        diffObject(A.core, B.core, {
            group: "core",
            category: "progression"
        });

    const stats =
        diffObject(A.stats, B.stats, {
            group: "stats",
            category: "farming"
        });

    const sections =
        diffSections(A.sections, B.sections);

    const summary =
        buildSummary({
            A,
            B,
            core,
            stats,
            sections
        });

    return {
        core,
        stats,
        sections,
        summary,

        meta: {
            confidence: 100,
            type: "v14_game_aware_diff",
            direction: "B - A",
            note:
                "Positive deltas usually mean B improved over A, except fields marked lower_is_better."
        }
    };
}

/* --------------------------------------------------
   SECTION DIFF
-------------------------------------------------- */

function diffSections(a = {}, b = {}) {

    const keys =
        new Set([
            ...Object.keys(a || {}),
            ...Object.keys(b || {})
        ]);

    const result = {};

    for (const section of keys) {

        result[section] =
            diffObject(
                a?.[section] || {},
                b?.[section] || {},
                {
                    group: "section",
                    section,
                    category: categoryForSection(section)
                }
            );
    }

    return result;
}

/* --------------------------------------------------
   OBJECT DIFF
-------------------------------------------------- */

function diffObject(a = {}, b = {}, context = {}) {

    const result = {};

    const keys =
        new Set([
            ...Object.keys(a || {}),
            ...Object.keys(b || {})
        ]);

    for (const key of keys) {

        const rawA =
            a?.[key];

        const rawB =
            b?.[key];

        if (
            isMetaKey(key) ||
            !isComparableNumber(rawA) ||
            !isComparableNumber(rawB)
        ) {

            result[key] = {
                a: rawA,
                b: rawB,
                changed: rawA !== rawB,
                numeric: false,
                type: "text",
                group: context.group || null,
                section: context.section || null,
                category: context.category || categoryForKey(key, context.section)
            };

            continue;
        }

        const valA =
            toNumber(rawA);

        const valB =
            toNumber(rawB);

        const diff =
            valB - valA;

        const pct =
            safePercentChange(valA, valB);

        const role =
            roleForKey(key, context.section);

        const direction =
            diff > 0
                ? "up"
                : diff < 0
                    ? "down"
                    : "flat";

        const outcome =
            outcomeForDiff(diff, role);

        result[key] = {
            a: valA,
            b: valB,
            diff,
            pct,
            changed: diff !== 0,
            numeric: true,
            type: "number",
            direction,
            outcome,
            role,
            group: context.group || null,
            section: context.section || null,
            category: context.category || categoryForKey(key, context.section),
            importance: importanceForKey(key, context.section),
            note: noteForKey(key, context.section)
        };
    }

    return result;
}

/* --------------------------------------------------
   SUMMARY
-------------------------------------------------- */

function buildSummary({ A, B, core, stats, sections }) {

    const flat =
        flatten(core, stats, sections)
            .filter(item => item.numeric === true);

    const scored =
        flat.map(item => ({
            ...item,
            score: scoreItem(item),
            label: labelForPath(item.path)
        }));

    const gains =
        scored
            .filter(item => item.outcome === "good" && item.changed)
            .sort((a, b) => b.score - a.score);

    const losses =
        scored
            .filter(item => item.outcome === "bad" && item.changed)
            .sort((a, b) => b.score - a.score);

    const neutralChanges =
        scored
            .filter(item => item.outcome === "neutral" && item.changed)
            .sort((a, b) => b.score - a.score);

    const categoryScores =
        buildCategoryScores(scored);

    const sectionSummaries =
        buildSectionSummaries(scored);

    const farmingVerdict =
        buildFarmingVerdict({
            A,
            B,
            core,
            stats,
            scored,
            categoryScores
        });

    return {
        strongestGain:
            gains[0] || pickBest(scored),

        weakestLoss:
            losses[0] || pickWorst(scored),

        biggestSwing:
            pickSwing(scored),

        efficiencyLeader:
            pickEfficiency(scored),

        topGains:
            gains.slice(0, 8),

        topLosses:
            losses.slice(0, 8),

        neutralChanges:
            neutralChanges.slice(0, 8),

        categoryScores,
        sectionSummaries,
        farmingVerdict,

        // Backward-compatible alias.
        // The health scan currently checks summary.farming.verdict.
        farming:
            farmingVerdict,

        compareDirection:
            "B - A",

        gameAwareNotes: [
            "Coins/hour and cells/hour are weighted higher than raw totals when judging farming.",
            "Coin-source rows can overlap through multipliers, so they are treated as signals rather than additive totals.",
            "Damage taken and survival-cost fields can be marked lower-is-better."
        ]
    };
}

/* --------------------------------------------------
   FLATTEN
-------------------------------------------------- */

function flatten(core, stats, sections) {

    const out = [];

    const pushGroup = (obj, prefix) => {

        for (const key in obj || {}) {

            const value =
                obj[key];

            if (
                value &&
                typeof value === "object" &&
                value.numeric === true &&
                "diff" in value
            ) {

                out.push({
                    path: `${prefix}.${key}`,
                    key,
                    ...value
                });
            }
        }
    };

    pushGroup(core, "core");
    pushGroup(stats, "stats");

    for (const section in sections || {}) {
        pushGroup(
            sections[section],
            `section.${section}`
        );
    }

    return out;
}

/* --------------------------------------------------
   SCORING
-------------------------------------------------- */

function scoreItem(item) {

    const diff =
        Math.abs(Number(item.diff || 0));

    const pct =
        item.pct == null
            ? 0
            : Math.abs(Number(item.pct || 0));

    const importance =
        Number(item.importance || 1);

    const scalePenalty =
        isLikelyRawTowerMagnitude(item)
            ? 0.35
            : 1;

    return (
        Math.log10(diff + 10) * 12 +
        Math.min(pct, 300)
    ) * importance * scalePenalty;
}

function isLikelyRawTowerMagnitude(item) {

    const key =
        normaliseKey(item.key);

    return !IMPORTANT_COMPARE_KEYS.has(key) &&
        Math.abs(Number(item.diff || 0)) >= 1e24;
}

/* --------------------------------------------------
   PICKERS
-------------------------------------------------- */

function pickBest(list = []) {

    return list.reduce(
        (best, item) =>
            item.diff > (best?.diff ?? -Infinity)
                ? item
                : best,
        null
    );
}

function pickWorst(list = []) {

    return list.reduce(
        (worst, item) =>
            item.diff < (worst?.diff ?? Infinity)
                ? item
                : worst,
        null
    );
}

function pickSwing(list = []) {

    return list.reduce(
        (swing, item) =>
            Math.abs(item.diff || 0) >
            Math.abs(swing?.diff || 0)
                ? item
                : swing,
        null
    );
}

function pickEfficiency(list = []) {

    return list
        .filter(item => {
            const path = String(item.path || "").toLowerCase();
            return path.includes("efficiency") ||
                path.includes("coinsperhour") ||
                path.includes("coins_per_hour") ||
                path.includes("cellsperhour") ||
                path.includes("cells_per_hour");
        })
        .reduce(
            (best, item) =>
                Number(item.pct ?? -Infinity) >
                Number(best?.pct ?? -Infinity)
                    ? item
                    : best,
            null
        );
}

/* --------------------------------------------------
   CATEGORY SUMMARY
-------------------------------------------------- */

function buildCategoryScores(items = []) {

    const categories = {};

    for (const item of items) {

        const category =
            item.category || "other";

        categories[category] =
            categories[category] || {
                category,
                good: 0,
                bad: 0,
                neutral: 0,
                net: 0,
                changed: 0,
                strongestGain: null,
                weakestLoss: null,
                verdict: "mixed"
            };

        const bucket =
            categories[category];

        if (item.changed) {
            bucket.changed += 1;
        }

        const impact =
            Number(item.score || 0);

        if (item.outcome === "good") {
            bucket.good += impact;
            bucket.net += impact;

            if (!bucket.strongestGain || impact > bucket.strongestGain.score) {
                bucket.strongestGain = item;
            }
        } else if (item.outcome === "bad") {
            bucket.bad += impact;
            bucket.net -= impact;

            if (!bucket.weakestLoss || impact > bucket.weakestLoss.score) {
                bucket.weakestLoss = item;
            }
        } else {
            bucket.neutral += impact;
        }
    }

    for (const bucket of Object.values(categories)) {
        bucket.verdict =
            bucket.net > 10
                ? "improved"
                : bucket.net < -10
                    ? "worse"
                    : "mixed";
    }

    return categories;
}

function buildSectionSummaries(items = []) {

    const sections = {};

    for (const item of items) {

        if (!item.section) {
            continue;
        }

        sections[item.section] =
            sections[item.section] || {
                section: item.section,
                label: labelForPath(`section.${item.section}`),
                good: 0,
                bad: 0,
                neutral: 0,
                net: 0,
                changed: 0,
                topGain: null,
                topLoss: null,
                verdict: "mixed"
            };

        const bucket =
            sections[item.section];

        if (item.changed) {
            bucket.changed += 1;
        }

        const impact =
            Number(item.score || 0);

        if (item.outcome === "good") {
            bucket.good += impact;
            bucket.net += impact;

            if (!bucket.topGain || impact > bucket.topGain.score) {
                bucket.topGain = item;
            }
        } else if (item.outcome === "bad") {
            bucket.bad += impact;
            bucket.net -= impact;

            if (!bucket.topLoss || impact > bucket.topLoss.score) {
                bucket.topLoss = item;
            }
        } else {
            bucket.neutral += impact;
        }
    }

    for (const bucket of Object.values(sections)) {
        bucket.verdict =
            bucket.net > 10
                ? "improved"
                : bucket.net < -10
                    ? "worse"
                    : "mixed";
    }

    return Object.values(sections)
        .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

/* --------------------------------------------------
   FARMING VERDICT
-------------------------------------------------- */

function buildFarmingVerdict({ core, stats, categoryScores }) {

    const farmingSignals = [
        scoreSignal("coinsPerHour", stats?.coinsPerHour || stats?.coins_per_hour, 3),
        scoreSignal("cellsPerHour", stats?.cellsPerHour || stats?.cells_per_hour, 3),
        scoreSignal("coinsPerWave", stats?.coinsPerWave || stats?.coins_per_wave, 2),
        scoreSignal("cellsPerWave", stats?.cellsPerWave || stats?.cells_per_wave, 2),
        scoreSignal("efficiency", stats?.efficiency, 2),
        scoreSignal("coins", core?.coins || core?.coins_earned, 1),
        scoreSignal("cells", core?.cells || core?.cells_earned, 1),
        scoreSignal("wave", core?.wave, 1)
    ].filter(Boolean);

    const score =
        farmingSignals.reduce(
            (total, signal) => total + signal.score,
            0
        );

    const economyNet =
        Number(categoryScores?.economy?.net || 0);

    const cellsNet =
        Number(categoryScores?.cells?.net || 0);

    const farmingNet =
        Number(categoryScores?.farming?.net || 0);

    const progressionNet =
        Number(categoryScores?.progression?.net || 0);

    const weightedNet =
        economyNet + cellsNet + farmingNet + progressionNet;

    let verdict =
        "mixed";

    if (score >= 3 || weightedNet > 25) {
        verdict = "better_farm";
    } else if (score <= -3 || weightedNet < -25) {
        verdict = "worse_farm";
    }

    const headline =
        verdict === "better_farm"
            ? "B looks like the better farming run."
            : verdict === "worse_farm"
                ? "A looks like the stronger farming baseline."
                : "Farming result is mixed.";

    return {
        verdict,
        headline,
        score,
        weightedNet,
        signals: farmingSignals,
        notes: [
            "Rate metrics are weighted above raw totals because different run lengths can distort raw coins/cells.",
            "Raw coin-source rows may overlap through multipliers and should not be summed directly."
        ]
    };
}

function scoreSignal(key, item, weight = 1) {

    if (!item || item.numeric === false || item.diff == null) {
        return null;
    }

    const diff =
        Number(item.diff || 0);

    if (!Number.isFinite(diff)) {
        return null;
    }

    if (diff === 0) {
        return {
            key,
            direction: "flat",
            score: 0,
            diff,
            pct: item.pct ?? null
        };
    }

    return {
        key,
        direction: diff > 0 ? "up" : "down",
        score: diff > 0 ? weight : -weight,
        diff,
        pct: item.pct ?? null
    };
}

/* --------------------------------------------------
   FIELD CLASSIFICATION
-------------------------------------------------- */

function roleForKey(key = "", section = "") {

    return getMetricCompareRole(key, section);
}

function outcomeForDiff(diff = 0, role = "higher_is_better") {

    const value =
        Number(diff || 0);

    if (!Number.isFinite(value) || value === 0) {
        return "neutral";
    }

    if (role === "neutral_signal") {
        return "neutral";
    }

    if (role === "lower_is_better") {
        return value < 0
            ? "good"
            : "bad";
    }

    return value > 0
        ? "good"
        : "bad";
}

function categoryForSection(section = "") {

    const value =
        normaliseKey(section);

    if (["coins", "cash", "records"].includes(value)) {
        return "economy";
    }

    if (["currencies"].includes(value)) {
        return "cells";
    }

    if (["damage", "enemies_hit_by", "enemies_destroyed_by", "killed_with_effect_active"].includes(value)) {
        return "damage";
    }

    if (["damage_taken", "health_regenerated", "bonus_health_gained", "damage_blocked"].includes(value)) {
        return "survivability";
    }

    if (["utility", "counts", "total_enemies"].includes(value)) {
        return "progression";
    }

    return "other";
}

function categoryForKey(key = "", section = "") {

    return getMetricPriorityInfo(key, section).category || categoryForSection(section);
}

function importanceForKey(key = "", section = "") {

    return getMetricPriorityScore(key, section);
}

function noteForKey(key = "", section = "") {

    const normalKey =
        normaliseKey(key);

    const normalSection =
        normaliseKey(section);

    if (FARMING_RATE_KEYS.has(normalKey)) {
        return "Rate metric; useful for comparing runs with different lengths.";
    }

    if (normalSection === "coins") {
        return "Coin source; useful as a signal, but coin sources can overlap through multipliers.";
    }

    if (normalSection === "damage_taken") {
        return "Lower is generally better for damage taken.";
    }

    return "";
}

/* --------------------------------------------------
   NUMERIC SAFETY
-------------------------------------------------- */

function isComparableNumber(value) {

    if (typeof value === "number") {
        return Number.isFinite(value);
    }

    if (typeof value !== "string") {
        return false;
    }

    const raw =
        value.trim();

    if (!raw) {
        return false;
    }

    return isTowerNumberLike(raw);
}

function safePercentChange(a, b) {

    const start =
        Number(a || 0);

    const end =
        Number(b || 0);

    if (
        !Number.isFinite(start) ||
        !Number.isFinite(end)
    ) {
        return 0;
    }

    const diff =
        end - start;

    if (diff === 0) {
        return 0;
    }

    const absStart =
        Math.abs(start);

    const absEnd =
        Math.abs(end);

    const nearZeroBaseline =
        absStart === 0 ||
        absStart < Math.max(absEnd * 0.000001, 1);

    if (nearZeroBaseline) {
        return null;
    }

    return (diff / absStart) * 100;
}

function isMetaKey(key = "") {

    const normalised =
        normaliseKey(key);

    return META_KEYS.has(normalised);
}

function normaliseKey(value = "") {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/-/g, "_")
        .replace(/[^a-z0-9_]/g, "");
}

function labelForPath(path = "") {

    return String(path || "")
        .replace(/^section\./, "")
        .replace(/\./g, " ")
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}
