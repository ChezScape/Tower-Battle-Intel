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
    normaliseMetricKey
} from "./metricCatalog.js";

import {
    getEnemyInfo,
    isEliteEnemy
} from "./enemyCatalog.js";

import {
    getSourceWarning
} from "./sourceRegistry.js";

import {
    BUILD_STYLE_PROFILES,
    getBuildStyleProfile
} from "./buildStyleProfiles.js";

/* --------------------------------------------------
   BUILD STYLES
-------------------------------------------------- */

export const BUILD_STYLES = BUILD_STYLE_PROFILES;

export function getBuildStyleInfo(style = "unknown") {

    return getBuildStyleProfile(style);
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
            metric.higherIsBetter === false
                ? "bad"
                : "good";

        message =
            metric.higherIsBetter === false
                ? `${metric.label} increased, which may be unwanted for this metric.`
                : `${metric.label} improved.`;
    }

    if (direction === "down") {
        severity =
            metric.higherIsBetter === true
                ? "bad"
                : metric.higherIsBetter === false
                ? "good"
                : "neutral";

        message =
            metric.higherIsBetter === true
                ? `${metric.label} dropped.`
                : metric.higherIsBetter === false
                ? `${metric.label} reduced, which may be good.`
                : `${metric.label} changed downward.`;
    }

    return {
        metric: normaliseMetricKey(metricKey),
        label: metric.label,
        meaning: metric.meaning,
        category: metric.category,
        direction,
        severity,
        diff: num,
        pct: Number(pct || 0),
        buildStyle,
        buildStyleLabel: build.label,
        message
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

    let severity =
        elite
            ? "warn"
            : "neutral";

    let message =
        `${enemy.label} ended the run. ${enemy.meaning}`;

    if (elite) {
        message += " This is worth tracking because elite pressure also connects to cell farming and late-run survival.";
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
        message
    };
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
