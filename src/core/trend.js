"use strict";

/**
 * TREND ENGINE
 * Builds history intelligence from saved runs.
 *
 * Output is compatible with:
 * - aiCoach.js
 * - insightEngine.js
 * - pipelineInspector.js
 * - future summary UI
 */

import {
    parseNumber
} from "../utils/math.js";

/* --------------------------------------------------
   MAIN TREND BUILDER
-------------------------------------------------- */

export function buildTrend(history = [], options = {}) {

    const windowSize =
        options.windowSize || 50;

    const runs =
        Array.isArray(history)
            ? history.filter(Boolean).slice(-windowSize)
            : [];

    if (!runs.length) {
        return emptyTrend(windowSize);
    }

    const waves =
        runs.map(run => getCore(run, "wave"));

    const coins =
        runs.map(run => getCore(run, "coins"));

    const cells =
        runs.map(run => getCore(run, "cells"));

    const coinsPerHour =
        runs.map(run => getStat(run, "coinsPerHour"));

    const cellsPerHour =
        runs.map(run => getStat(run, "cellsPerHour"));

    const efficiency =
        runs.map(run => getStat(run, "efficiency"));

    const latest =
        runs.at(-1) || null;

    const previous =
        runs.length > 1
            ? runs.at(-2)
            : null;

    const change =
        buildChange(previous, latest);

    const signals =
        buildSignals({
            runs,
            waves,
            coins,
            cells,
            coinsPerHour,
            cellsPerHour,
            efficiency,
            change
        });

    return {

        count:
            runs.length,

        // compatibility with pipelineInspector.js
        length:
            signals.length,

        window:
            windowSize,

        latest: {
            wave:
                getCore(latest, "wave"),

            coins:
                getCore(latest, "coins"),

            cells:
                getCore(latest, "cells"),

            coinsPerHour:
                getStat(latest, "coinsPerHour"),

            cellsPerHour:
                getStat(latest, "cellsPerHour"),

            efficiency:
                getStat(latest, "efficiency")
        },

        previous: previous
            ? {
                wave:
                    getCore(previous, "wave"),

                coins:
                    getCore(previous, "coins"),

                cells:
                    getCore(previous, "cells"),

                coinsPerHour:
                    getStat(previous, "coinsPerHour"),

                cellsPerHour:
                    getStat(previous, "cellsPerHour"),

                efficiency:
                    getStat(previous, "efficiency")
            }
            : null,

        avgCoins:
            avg(coins),

        avgWave:
            avg(waves),

        avgCells:
            avg(cells),

        avgCoinsPerHour:
            avg(coinsPerHour),

        avgCellsPerHour:
            avg(cellsPerHour),

        avgEfficiency:
            avg(efficiency),

        maxWave:
            max(waves),

        minWave:
            min(waves),

        maxCoins:
            max(coins),

        maxCells:
            max(cells),

        change,

        momentum: {
            wave:
                momentum(waves),

            coins:
                momentum(coins),

            cells:
                momentum(cells),

            coinsPerHour:
                momentum(coinsPerHour),

            cellsPerHour:
                momentum(cellsPerHour)
        },

        volatility: {
            wave:
                stdDev(waves),

            coins:
                stdDev(coins),

            cells:
                stdDev(cells),

            coinsPerHour:
                stdDev(coinsPerHour),

            cellsPerHour:
                stdDev(cellsPerHour)
        },

        stabilityScore:
            stabilityScore(coins, waves),

        signals
    };
}

/* --------------------------------------------------
   SIGNALS
-------------------------------------------------- */

function buildSignals({
    runs,
    change,
    coins,
    waves,
    cells
}) {

    const signals = [];

    if (runs.length < 2) {

        signals.push({
            type: "trend",
            severity: "info",
            title: "Trend Warming Up",
            message: "Add more runs to improve trend accuracy."
        });

        return signals;
    }

    if (change.wave.diff > 0) {

        signals.push({
            type: "trend",
            severity: "good",
            title: "Wave Progression Up",
            message: `Wave increased by ${change.wave.diff}.`
        });

    } else if (change.wave.diff < 0) {

        signals.push({
            type: "trend",
            severity: "bad",
            title: "Wave Progression Down",
            message: `Wave decreased by ${Math.abs(change.wave.diff)}.`
        });
    }

    if (change.coins.pct > 15) {

        signals.push({
            type: "trend",
            severity: "good",
            title: "Coin Momentum",
            message: `Coins are up ${change.coins.pct.toFixed(1)}%.`
        });

    } else if (change.coins.pct < -15) {

        signals.push({
            type: "trend",
            severity: "bad",
            title: "Coin Regression",
            message: `Coins are down ${Math.abs(change.coins.pct).toFixed(1)}%.`
        });
    }

    if (momentum(coins) === "up" && momentum(waves) === "up") {

        signals.push({
            type: "trend",
            severity: "good",
            title: "Positive Momentum",
            message: "Economy and progression are moving upward together."
        });
    }

    if (momentum(coins) === "down" && momentum(waves) === "down") {

        signals.push({
            type: "trend",
            severity: "bad",
            title: "Negative Momentum",
            message: "Economy and progression are both declining."
        });
    }

    if (stdDev(cells) > avg(cells) * 0.25) {

        signals.push({
            type: "trend",
            severity: "neutral",
            title: "Cell Variance",
            message: "Cell output is fluctuating noticeably between runs."
        });
    }

    return signals;
}

/* --------------------------------------------------
   CHANGE MODEL
-------------------------------------------------- */

function buildChange(previous, latest) {

    if (!previous || !latest) {

        return {
            wave: zeroChange(),
            coins: zeroChange(),
            cells: zeroChange(),
            coinsPerHour: zeroChange(),
            cellsPerHour: zeroChange(),
            efficiency: zeroChange()
        };
    }

    return {
        wave:
            diffModel(
                getCore(previous, "wave"),
                getCore(latest, "wave")
            ),

        coins:
            diffModel(
                getCore(previous, "coins"),
                getCore(latest, "coins")
            ),

        cells:
            diffModel(
                getCore(previous, "cells"),
                getCore(latest, "cells")
            ),

        coinsPerHour:
            diffModel(
                getStat(previous, "coinsPerHour"),
                getStat(latest, "coinsPerHour")
            ),

        cellsPerHour:
            diffModel(
                getStat(previous, "cellsPerHour"),
                getStat(latest, "cellsPerHour")
            ),

        efficiency:
            diffModel(
                getStat(previous, "efficiency"),
                getStat(latest, "efficiency")
            )
    };
}

function diffModel(a, b) {

    const diff =
        b - a;

    return {
        a,
        b,
        diff,
        pct:
            percentChange(a, b),
        direction:
            diff > 0
                ? "up"
                : diff < 0
                ? "down"
                : "flat"
    };
}

function zeroChange() {

    return {
        a: 0,
        b: 0,
        diff: 0,
        pct: 0,
        direction: "flat"
    };
}

/* --------------------------------------------------
   DATA ACCESS
-------------------------------------------------- */

function getCore(run, key) {

    return parseNumber(
        run?.core?.[key]
    );
}

function getStat(run, key) {

    return parseNumber(
        run?.stats?.[key]
    );
}

/* --------------------------------------------------
   MATH HELPERS
-------------------------------------------------- */

function avg(values = []) {

    const clean =
        values.filter(Number.isFinite);

    if (!clean.length) {
        return 0;
    }

    return clean.reduce((a, b) => a + b, 0) / clean.length;
}

function max(values = []) {

    const clean =
        values.filter(Number.isFinite);

    return clean.length
        ? Math.max(...clean)
        : 0;
}

function min(values = []) {

    const clean =
        values.filter(Number.isFinite);

    return clean.length
        ? Math.min(...clean)
        : 0;
}

function stdDev(values = []) {

    const clean =
        values.filter(Number.isFinite);

    if (!clean.length) {
        return 0;
    }

    const mean =
        avg(clean);

    const variance =
        clean.reduce(
            (sum, value) =>
                sum + Math.pow(value - mean, 2),
            0
        ) / clean.length;

    return Math.sqrt(variance);
}

function percentChange(a, b) {

    if (!a) {
        return b ? 100 : 0;
    }

    return ((b - a) / Math.abs(a)) * 100;
}

function momentum(values = []) {

    const clean =
        values.filter(Number.isFinite);

    if (clean.length < 2) {
        return "flat";
    }

    const recent =
        clean.slice(-5);

    const first =
        recent[0] || 0;

    const last =
        recent.at(-1) || 0;

    const pct =
        percentChange(first, last);

    if (pct > 5) {
        return "up";
    }

    if (pct < -5) {
        return "down";
    }

    return "flat";
}

function stabilityScore(coins = [], waves = []) {

    if (!coins.length || !waves.length) {
        return 0;
    }

    const coinAvg =
        avg(coins);

    const waveAvg =
        avg(waves);

    const coinVol =
        coinAvg
            ? stdDev(coins) / Math.abs(coinAvg)
            : 0;

    const waveVol =
        waveAvg
            ? stdDev(waves) / Math.abs(waveAvg)
            : 0;

    const score =
        100 - Math.min((coinVol + waveVol) * 50, 100);

    return Math.max(0, score);
}

/* --------------------------------------------------
   EMPTY TREND
-------------------------------------------------- */

function emptyTrend(windowSize = 50) {

    return {
        count: 0,
        length: 0,
        window: windowSize,

        latest: null,
        previous: null,

        avgCoins: 0,
        avgWave: 0,
        avgCells: 0,
        avgCoinsPerHour: 0,
        avgCellsPerHour: 0,
        avgEfficiency: 0,

        maxWave: 0,
        minWave: 0,
        maxCoins: 0,
        maxCells: 0,

        change: {
            wave: zeroChange(),
            coins: zeroChange(),
            cells: zeroChange(),
            coinsPerHour: zeroChange(),
            cellsPerHour: zeroChange(),
            efficiency: zeroChange()
        },

        momentum: {
            wave: "flat",
            coins: "flat",
            cells: "flat",
            coinsPerHour: "flat",
            cellsPerHour: "flat"
        },

        volatility: {
            wave: 0,
            coins: 0,
            cells: 0,
            coinsPerHour: 0,
            cellsPerHour: 0
        },

        stabilityScore: 0,

        signals: []
    };
}