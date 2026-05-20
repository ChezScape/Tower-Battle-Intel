"use strict";

/**
 * INTERPRETATION RULES
 * Game-aware advice layer.
 *
 * This file does not replace compare/analyser/aiCoach.
 * It gives those systems smarter game context.
 */

import {
    getMetricInfo,
    getMetricCompareProfile,
    normaliseMetricKey
} from "./metricCatalog.js";

import {
    getEnemyInfo,
    getEnemySeverity,
    isEliteEnemy,
    enemyActionChecklist
} from "./enemyCatalog.js";

import {
    getSectionInfo
} from "./reportSections.js";

import {
    getKnowledgeSnapshotLabel,
    getSourceWarning
} from "./sourceRegistry.js";

/* --------------------------------------------------
   BUILD STYLES
-------------------------------------------------- */

export const BUILD_STYLES = Object.freeze({

    unknown: {
        label: "Unknown",
        meaning: "No build style selected. Advice should stay cautious and history-based."
    },

    health_ehp: {
        label: "Health / EHP",
        meaning: "Survival-focused build using health, defense, recovery, wall, and sustain."
    },

    blender: {
        label: "Blender",
        meaning: "Orb/control focused style where enemy clear flow matters heavily."
    },

    devo: {
        label: "Devo",
        meaning: "Devolution-style setup focused around controlled enemy handling and economy timing."
    },

    orb_devo: {
        label: "Orb Devo",
        meaning: "Devo variant with strong orb-based clearing."
    },

    glass_cannon: {
        label: "Glass Cannon",
        meaning: "Damage-first style. Survival drops may be expected if damage scaling is the priority."
    },

    hybrid: {
        label: "Hybrid",
        meaning: "Mixed damage and survival approach."
    }
});

export function getBuildStyleInfo(style = "unknown") {

    return BUILD_STYLES[style] || BUILD_STYLES.unknown;
}

/* --------------------------------------------------
   METRIC MEANING
-------------------------------------------------- */

export function explainMetric(metricKey = "") {

    return getMetricInfo(metricKey);
}

/* --------------------------------------------------
   DELTA INTERPRETATION
-------------------------------------------------- */

export function interpretMetricDelta(metricKey, diff = 0, pct = 0, buildStyle = "unknown") {

    const metric =
        getMetricInfo(metricKey);

    const profile =
        getMetricCompareProfile(metricKey);

    const num =
        Number(diff || 0);

    const direction =
        num > 0
            ? "up"
            : num < 0
            ? "down"
            : "flat";

    const build =
        getBuildStyleInfo(buildStyle);

    let severity = "neutral";
    let message = `${metric.label}: no meaningful change.`;

    if (direction === "up") {
        severity =
            profile.role === "lower_is_better"
                ? "bad"
                : profile.role === "neutral_signal"
                    ? "neutral"
                    : "good";

        message =
            profile.role === "lower_is_better"
                ? `${metric.label} increased, which may be unwanted for this metric.`
                : profile.role === "neutral_signal"
                    ? `${metric.label} increased. Treat this as context rather than an automatic win.`
                    : `${metric.label} improved.`;
    }

    if (direction === "down") {
        severity =
            profile.role === "higher_is_better"
                ? "bad"
                : profile.role === "lower_is_better"
                    ? "good"
                    : "neutral";

        message =
            profile.role === "higher_is_better"
                ? `${metric.label} dropped.`
                : profile.role === "lower_is_better"
                    ? `${metric.label} reduced, which may be good.`
                    : `${metric.label} changed downward. Treat this as context rather than an automatic loss.`;
    }

    return {
        metric: normaliseMetricKey(metricKey),
        label: metric.label,
        meaning: metric.meaning,
        category: profile.category || metric.category,
        direction,
        severity,
        diff: num,
        pct: Number(pct || 0),
        buildStyle,
        buildStyleLabel: build.label,
        message,
        sourceNote: getSourceWarning({ short: true })
    };
}

/* --------------------------------------------------
   DEATH CAUSE INTELLIGENCE
-------------------------------------------------- */

export function interpretDeathCause(killedBy = "", buildStyle = "unknown") {

    if (!killedBy) {

        return {
            title: "Death Cause Unknown",
            severity: "neutral",
            message: "No killed-by value was found in the report."
        };
    }

    const enemy =
        getEnemyInfo(killedBy);

    const elite =
        isEliteEnemy(killedBy);

    const checklist =
        enemyActionChecklist(killedBy);

    let severity =
        getEnemySeverity(killedBy);

    let message =
        `${enemy.label} ended the run. ${enemy.meaning}`;

    if (enemy.behavior) {
        message += ` Behaviour note: ${enemy.behavior}`;
    }

    if (elite) {
        message += " Elite pressure also connects to cells, late-run survival and whether your clear tools still work when enemies ignore some instant-clear effects.";
    }

    if (checklist.length) {
        message += ` First checks: ${checklist.slice(0, 2).join(" ")}`;
    }

    if (buildStyle === "health_ehp" && elite) {
        message += " For Health / EHP, check sustain, recovery packages, wall pressure, and elite handling.";
    }

    if (buildStyle === "glass_cannon" && elite) {
        message += " For Glass Cannon, this may point to damage/control timing rather than raw health.";
    }

    return {
        title: `Killed By ${enemy.label}`,
        severity,
        enemy,
        message,
        checklist,
        sourceNote: getSourceWarning({ short: true })
    };
}


/* --------------------------------------------------
   RUN TRADEOFF INTELLIGENCE
-------------------------------------------------- */

export function interpretRunTradeoff(compareData = {}) {

    const core = compareData?.core || {};
    const stats = compareData?.stats || {};

    const waveDiff = Number(core?.wave?.diff || 0);
    const coinsDiff = firstNumber([
        stats?.coinsPerHour?.diff,
        stats?.coins_per_hour?.diff,
        core?.coins?.diff,
        core?.coins_earned?.diff
    ]);
    const cellsDiff = firstNumber([
        stats?.cellsPerHour?.diff,
        stats?.cells_per_hour?.diff,
        core?.cells?.diff,
        core?.cells_earned?.diff
    ]);

    let title = "Run Tradeoff";
    let severity = "neutral";
    let message = "The run does not show a strong economy/progression split yet.";

    if (coinsDiff > 0 && waveDiff < 0) {
        severity = "warn";
        message = "Farming improved but progression fell. Treat B as a possible faster farm, not automatically a stronger survival setup.";
    } else if (coinsDiff < 0 && waveDiff > 0) {
        severity = "info";
        message = "Progression improved but coin farming fell. B may be better for pushing waves, while A may still farm better.";
    } else if (coinsDiff > 0 && waveDiff > 0) {
        severity = "good";
        message = "B improved both farming and wave progression. This is the cleanest type of improvement.";
    } else if (coinsDiff < 0 && waveDiff < 0) {
        severity = "bad";
        message = "B lost both farming and wave progression. Check build changes, killed-by pressure and run conditions.";
    }

    if (cellsDiff > 0 && severity !== "bad") {
        message += " Cells/hour or cells also improved, so elite-cell farming may still be moving in the right direction.";
    }

    return {
        title,
        severity,
        message,
        waveDiff,
        coinsDiff,
        cellsDiff,
        knowledge: getKnowledgeSnapshotLabel()
    };
}

export function interpretSubsystemSection(sectionName = "") {

    const key = normaliseMetricKey(sectionName);

    const sectionNotes = {
        core: "Core run output: tier, wave, coins, cells and run duration.",
        records: "Record-style output. Useful as context, but not always direct run strength.",
        damage: "Offensive output. Stronger damage helps only if survival/control can still keep up.",
        damage_taken: "Survival pressure. Lower damage taken is usually better unless a wall/EHP build intentionally absorbs more.",
        bonus_health_gained: "Health bonus growth. Useful for EHP and Death Wave style context when present.",
        health_regenerated: "Sustain layer. Watch this especially when Vampire or sustain pressure is involved.",
        damage_blocked: "Defense/blocking layer. Important for Health/EHP and mitigation-style builds.",
        utility: "Utility control and run-flow layer, including skips or other support metrics.",
        counts: "Count-based progress layer. Useful for waves skipped, enemies and run pacing.",
        enemies_hit_by: "Shows which tools are touching enemies. Good for spotting damage-source shifts.",
        killed_with_effect_active: "Shows effect uptime usefulness, often tied to UW or control effects.",
        total_enemies: "Enemy volume and spawn pressure context.",
        coins: "Coin source split. Treat as signals, not perfectly additive totals, because multipliers can overlap.",
        cash: "In-run cash economy signal.",
        currencies: "Currencies gained. Useful for cells, gems, shards or other reward traces when present.",
        enemies_destroyed_by: "Kill-source distribution. One of the best places to see what actually carried the run."
    };

    const registered =
        getSectionInfo(key);

    return {
        section: key,
        title: registered?.label || (sectionNotes[key] ? formatSectionLabel(key) : formatSectionLabel(sectionName)),
        message: sectionNotes[key] || registered?.meaning || "Subsystem detail from the battle report. Use it with top gains/losses and killed-by context.",
        warning: getSourceWarning({ short: true })
    };
}

function firstNumber(values = []) {

    for (const value of values) {
        const num = Number(value);
        if (Number.isFinite(num) && num !== 0) {
            return num;
        }
    }

    return 0;
}

function formatSectionLabel(value = "") {
    return String(value || "Subsystem")
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

/* --------------------------------------------------
   FARMING TIER ADVICE
   Uses user's own history only.
-------------------------------------------------- */

export function getFarmingTierAdvice(history = []) {

    const runs =
        Array.isArray(history)
            ? history.filter(Boolean)
            : [];

    if (!runs.length) {

        return {
            ready: false,
            message: "Not enough history for farming tier advice yet.",
            byTier: {},
            bestCoinFarm: null,
            bestCellFarm: null,
            bestBalancedFarm: null
        };
    }

    const byTier =
        groupRunsByTier(runs);

    const tierSummaries =
        Object.entries(byTier)
            .map(([tier, tierRuns]) =>
                summariseTier(Number(tier), tierRuns)
            )
            .filter(item => item.runCount > 0);

    const bestCoinFarm =
        bestBy(tierSummaries, "avgCoinsPerHour");

    const bestCellFarm =
        bestBy(tierSummaries, "avgCellsPerHour");

    const bestBalancedFarm =
        bestBalanced(tierSummaries);

    return {
        ready: tierSummaries.length > 0,
        warning: getSourceWarning(),
        byTier: Object.fromEntries(
            tierSummaries.map(item => [
                item.tier,
                item
            ])
        ),
        bestCoinFarm,
        bestCellFarm,
        bestBalancedFarm,
        message: buildFarmingMessage({
            bestCoinFarm,
            bestCellFarm,
            bestBalancedFarm
        })
    };
}

/* --------------------------------------------------
   FARMING HELPERS
-------------------------------------------------- */

function groupRunsByTier(runs = []) {

    const out = {};

    for (const run of runs) {

        const tier =
            Number(run?.core?.tier || 0);

        if (!tier) {
            continue;
        }

        if (!out[tier]) {
            out[tier] = [];
        }

        out[tier].push(run);
    }

    return out;
}

function summariseTier(tier, runs = []) {

    const runCount =
        runs.length;

    const avgWave =
        average(runs.map(run => run?.core?.wave));

    const avgRunTime =
        average(runs.map(run => run?.core?.time));

    const avgCoinsPerHour =
        average(runs.map(run =>
            run?.stats?.coinsPerHour ||
            run?.stats?.coins_per_hour
        ));

    const avgCellsPerHour =
        average(runs.map(run =>
            run?.stats?.cellsPerHour ||
            run?.stats?.cells_per_hour
        ));

    const avgCoins =
        average(runs.map(run => run?.core?.coins));

    const avgCells =
        average(runs.map(run => run?.core?.cells));

    return {
        tier,
        runCount,
        avgWave,
        avgRunTime,
        avgCoins,
        avgCells,
        avgCoinsPerHour,
        avgCellsPerHour
    };
}

function bestBy(items = [], key = "") {

    const valid =
        items.filter(item =>
            Number.isFinite(Number(item[key])) &&
            Number(item[key]) > 0
        );

    if (!valid.length) {
        return null;
    }

    return valid.reduce((best, item) =>
        Number(item[key]) > Number(best[key])
            ? item
            : best
    );
}

function bestBalanced(items = []) {

    if (!items.length) {
        return null;
    }

    const maxCoins =
        Math.max(
            ...items.map(item => Number(item.avgCoinsPerHour || 0)),
            0
        );

    const maxCells =
        Math.max(
            ...items.map(item => Number(item.avgCellsPerHour || 0)),
            0
        );

    const scored =
        items.map(item => {

            const coinScore =
                maxCoins
                    ? Number(item.avgCoinsPerHour || 0) / maxCoins
                    : 0;

            const cellScore =
                maxCells
                    ? Number(item.avgCellsPerHour || 0) / maxCells
                    : 0;

            return {
                ...item,
                balancedScore:
                    (coinScore + cellScore) / 2
            };
        });

    return scored.reduce((best, item) =>
        item.balancedScore > best.balancedScore
            ? item
            : best
    );
}

function average(values = []) {

    const nums =
        values
            .map(Number)
            .filter(Number.isFinite);

    if (!nums.length) {
        return 0;
    }

    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function buildFarmingMessage({
    bestCoinFarm,
    bestCellFarm,
    bestBalancedFarm
}) {

    const parts = [];

    if (bestCoinFarm) {
        parts.push(`Best coin farm: Tier ${bestCoinFarm.tier}`);
    }

    if (bestCellFarm) {
        parts.push(`Best cell farm: Tier ${bestCellFarm.tier}`);
    }

    if (bestBalancedFarm) {
        parts.push(`Best balanced farm: Tier ${bestBalancedFarm.tier}`);
    }

    return parts.length
        ? parts.join(" | ")
        : "Not enough tier history yet.";
}
