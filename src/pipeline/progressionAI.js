"use strict";

import { parseNumber } from "../utils/math.js";

/**
 * PROGRESSION AI (V9 REFACTORED)
 * - Pure function
 * - Uses injected history (no global coupling)
 * - Fully aligned with V11 compare engine
 */

/**
 * MAIN ENTRY
 * @param {Array} history - run history array
 * @param {Object} currentRun - latest computed run
 */
export function progressionAI(history = [], currentRun = null) {

    if (!currentRun || history.length < 2) {

        return [{
            type: "info",
            title: "Progression AI",
            message: "Not enough historical data for trend analysis",
            severity: "info"
        }];
    }

    // -----------------------------
    // BUILD SERIES
    // -----------------------------
    const coins = [];
    const waves = [];
    const cells = [];

    for (const run of history) {

        const core = run?.core || {};

        coins.push(parseNumber(core.coins));
        waves.push(parseNumber(core.wave));
        cells.push(parseNumber(core.cells));
    }

    const currentCoins = parseNumber(currentRun.core?.coins);
    const currentWave = parseNumber(currentRun.core?.wave);
    const currentCells = parseNumber(currentRun.core?.cells);

    const coinAvg = avg(coins);
    const waveAvg = avg(waves);
    const cellAvg = avg(cells);

    const output = [];

    // -----------------------------
    // COIN TREND
    // -----------------------------
    const coinChange = percent(currentCoins, coinAvg);

    output.push({
        type: "trend",
        title: "Coin Progression",
        message: formatTrend("coins", coinChange),
        severity: severity(coinChange)
    });

    // -----------------------------
    // WAVE TREND
    // -----------------------------
    const waveChange = percent(currentWave, waveAvg);

    output.push({
        type: "trend",
        title: "Wave Progression",
        message: formatTrend("waves", waveChange),
        severity: severity(waveChange)
    });

    // -----------------------------
    // CELLS TREND
    // -----------------------------
    const cellChange = percent(currentCells, cellAvg);

    output.push({
        type: "trend",
        title: "Cell Progression",
        message: formatTrend("cells", cellChange),
        severity: severity(cellChange)
    });

    // -----------------------------
    // SKILL INTERPRETATION
    // -----------------------------
    const strongUp =
        coinChange > 15 &&
        waveChange > 10;

    const strongDown =
        coinChange < -15 &&
        waveChange < -10;

    if (strongUp) {

        output.push({
            type: "skill",
            title: "Skill Growth Detected",
            message: "Your economy and endurance are improving together.",
            severity: "good"
        });

    } else if (strongDown) {

        output.push({
            type: "skill",
            title: "Performance Regression",
            message: "Multiple core systems are declining.",
            severity: "bad"
        });
    }

    return output;
}

/* ==================================================
   HELPERS
================================================== */

function avg(arr) {

    return arr.length
        ? arr.reduce((a, b) => a + b, 0) / arr.length
        : 0;
}

/**
 * percent change vs baseline
 */
function percent(current, baseline) {

    if (!baseline) return 0;

    return ((current - baseline) / baseline) * 100;
}

function severity(val) {

    if (val > 10) return "good";
    if (val < -10) return "bad";
    return "neutral";
}

function formatTrend(label, change) {

    if (change > 10) {
        return `${label} trending upward (+${change.toFixed(1)}%)`;
    }

    if (change < -10) {
        return `${label} trending downward (${change.toFixed(1)}%)`;
    }

    return `${label} is stable`;
}
