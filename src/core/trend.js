"use strict";

/**
 * CORE TREND ENGINE
 * Safe local-history trend summary.
 */

import {
    safeDiv,
    percentChange
} from "../utils/math.js";

export function buildTrend(history = [], options = {}) {
    const windowSize = Number(options.windowSize || 50);
    const runs = Array.isArray(history)
        ? history.filter(Boolean).slice(-windowSize)
        : [];

    if (!runs.length) {
        return emptyTrend(windowSize);
    }

    const waves = runs.map(run => number(run?.core?.wave));
    const coins = runs.map(run => number(run?.core?.coins));
    const cells = runs.map(run => number(run?.core?.cells));
    const cph = runs.map(run => number(run?.stats?.coinsPerHour));
    const cellsHour = runs.map(run => number(run?.stats?.cellsPerHour));

    const previous = runs.length > 1 ? runs[runs.length - 2] : null;
    const latest = runs.at(-1) || null;

    return {
        windowSize,
        count: runs.length,
        latest,
        previous,
        averages: {
            wave: avg(waves),
            coins: avg(coins),
            cells: avg(cells),
            coinsPerHour: avg(cph),
            cellsPerHour: avg(cellsHour)
        },
        best: {
            wave: max(waves),
            coins: max(coins),
            cells: max(cells),
            coinsPerHour: max(cph),
            cellsPerHour: max(cellsHour)
        },
        changes: buildChange(previous, latest),
        signals: buildSignals(runs)
    };
}

function buildChange(previous = null, latest = null) {
    if (!previous || !latest) {
        return {
            wave: 0,
            coins: 0,
            cells: 0,
            coinsPerHour: 0,
            cellsPerHour: 0
        };
    }

    return {
        wave: number(latest.core?.wave) - number(previous.core?.wave),
        coins: number(latest.core?.coins) - number(previous.core?.coins),
        cells: number(latest.core?.cells) - number(previous.core?.cells),
        coinsPerHour: number(latest.stats?.coinsPerHour) - number(previous.stats?.coinsPerHour),
        cellsPerHour: number(latest.stats?.cellsPerHour) - number(previous.stats?.cellsPerHour),
        wavePct: percentChange(previous.core?.wave, latest.core?.wave),
        coinsPct: percentChange(previous.core?.coins, latest.core?.coins),
        cellsPct: percentChange(previous.core?.cells, latest.core?.cells)
    };
}

function buildSignals(runs = []) {
    const latest = runs.at(-1) || null;
    const previous = runs.length > 1 ? runs.at(-2) : null;

    if (!latest || !previous) {
        return [];
    }

    const signals = [];
    const waveDiff = number(latest.core?.wave) - number(previous.core?.wave);
    const coinsHourDiff = number(latest.stats?.coinsPerHour) - number(previous.stats?.coinsPerHour);
    const cellsHourDiff = number(latest.stats?.cellsPerHour) - number(previous.stats?.cellsPerHour);

    if (coinsHourDiff > 0 && waveDiff < 0) {
        signals.push({ type: "mixed", label: "Economy improved while wave dropped" });
    }

    if (cellsHourDiff > 0) {
        signals.push({ type: "good", label: "Cell farming speed improved" });
    }

    if (waveDiff > 0) {
        signals.push({ type: "good", label: "Progression wave improved" });
    }

    return signals;
}

function emptyTrend(windowSize = 50) {
    return {
        windowSize,
        count: 0,
        latest: null,
        previous: null,
        averages: {},
        best: {},
        changes: {},
        signals: []
    };
}

function number(value = 0) {
    const n = Number(value || 0);
    return Number.isFinite(n) ? n : 0;
}

function avg(values = []) {
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function max(values = []) {
    return values.length ? Math.max(...values) : 0;
}

function min(values = []) {
    return values.length ? Math.min(...values) : 0;
}
