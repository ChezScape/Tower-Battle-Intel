"use strict";

/**
 * PROGRESSION AI v4.10d
 * History trend readout with safe numbers.
 */

import {
    parseNumber,
    avg,
    percentChange
} from "../utils/math.js";

import {
    formatPercent,
    formatNumber
} from "../utils/format.js";

export function progressionAI(history = [], currentRun = null) {
    const runs = Array.isArray(history) ? history.filter(Boolean) : [];
    const current = currentRun || runs.at(-1) || null;

    if (!current || runs.length < 2) {
        return [message("info", "Progression AI", "Not enough historical data for trend analysis.")];
    }

    const previousRuns = runs.filter(run => run !== current).slice(-10);
    const baselines = previousRuns.length ? previousRuns : runs.slice(0, -1);

    const coinAvg = avg(baselines.map(run => run.core?.coins || 0));
    const waveAvg = avg(baselines.map(run => run.core?.wave || 0));
    const cellAvg = avg(baselines.map(run => run.core?.cells || 0));
    const cphAvg = avg(baselines.map(run => run.stats?.coinsPerHour || 0));
    const cellRateAvg = avg(baselines.map(run => run.stats?.cellsPerHour || 0));

    const signals = [
        trend("Coin Progression", current.core?.coins, coinAvg, "coins"),
        trend("Wave Progression", current.core?.wave, waveAvg, "waves"),
        trend("Cell Progression", current.core?.cells, cellAvg, "cells"),
        trend("Coin Rate Progression", current.stats?.coinsPerHour, cphAvg, "coins/hour"),
        trend("Cell Rate Progression", current.stats?.cellsPerHour, cellRateAvg, "cells/hour")
    ];

    const positives = signals.filter(item => item.severity === "good").length;
    const negatives = signals.filter(item => item.severity === "bad").length;

    if (positives >= 3) {
        signals.push(message("good", "Overall Progression Up", "Most major trend signals are above your recent average."));
    } else if (negatives >= 3) {
        signals.push(message("bad", "Overall Progression Down", "Most major trend signals are below your recent average."));
    } else {
        signals.push(message("neutral", "Mixed Progression", "Some trend signals improved while others weakened."));
    }

    return signals;
}

function trend(title, currentValue, baselineValue, label) {
    const current = parseNumber(currentValue);
    const baseline = parseNumber(baselineValue);
    const change = percentChange(baseline, current);
    const sev = change > 10 ? "good" : change < -10 ? "bad" : "neutral";
    return message(sev, title, `${label} is ${formatPercent(change)} versus recent average (${formatNumber(baseline)}).`, { change, current, baseline });
}

function message(severity, title, text, extra = {}) {
    return {
        type: "progression",
        severity,
        level: severity,
        title,
        message: text,
        ...extra
    };
}

export default progressionAI;
