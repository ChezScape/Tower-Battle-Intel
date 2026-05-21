"use strict";

/**
 * HISTORY STATS
 * Pure summary, delta and score helpers for Battle History Trace.
 */

export function buildHistoryStats(history = []) {
    const runs = Array.isArray(history) ? history.filter(Boolean) : [];
    const count = runs.length;

    const bestWave = findBestRun(runs, run => run?.core?.wave);
    const bestCoins = findBestRun(runs, run => run?.core?.coins);
    const bestCells = findBestRun(runs, run => run?.core?.cells);
    const bestCoinsPerHour = findBestRun(runs, getCoinsPerHour);
    const bestCellsPerHour = findBestRun(runs, getCellsPerHour);
    const bestQuality = findBestRun(runs, run => buildRunQualityScore(run, {
        bestWave,
        bestCoins,
        bestCells,
        bestCoinsPerHour,
        bestCellsPerHour
    }));

    const latest = count ? { index: count - 1, run: runs[count - 1] } : null;

    return {
        count,
        latest,
        bestWave,
        bestCoins,
        bestCells,
        bestCoinsPerHour,
        bestCellsPerHour,
        bestQuality,
        averageWave: average(runs, run => run?.core?.wave),
        averageCoins: average(runs, run => run?.core?.coins),
        averageCells: average(runs, run => run?.core?.cells),
        averageCoinsPerHour: average(runs, getCoinsPerHour),
        averageCellsPerHour: average(runs, getCellsPerHour),
        archivedCount: runs.filter(run => run?.meta?.archived).length
    };
}

export function buildPreviousDelta(history = [], index = 0) {
    const runs = Array.isArray(history) ? history : [];
    const safeIndex = Number(index);

    if (!Number.isInteger(safeIndex) || safeIndex <= 0) return null;

    const current = runs[safeIndex];
    const previous = runs[safeIndex - 1];

    if (!current || !previous) return null;

    return {
        wave: numberDiff(previous?.core?.wave, current?.core?.wave),
        coins: numberDiff(previous?.core?.coins, current?.core?.coins),
        cells: numberDiff(previous?.core?.cells, current?.core?.cells),
        coinsPerHour: numberDiff(getCoinsPerHour(previous), getCoinsPerHour(current)),
        cellsPerHour: numberDiff(getCellsPerHour(previous), getCellsPerHour(current)),
        tier: numberDiff(previous?.core?.tier, current?.core?.tier)
    };
}

export function buildRunQualityScore(run = null, summary = null) {
    if (!run) return 0;

    const stats = summary || buildHistoryStats([run]);

    const waveScore = ratioScore(run?.core?.wave, stats?.bestWave?.value);
    const coinsScore = ratioScore(run?.core?.coins, stats?.bestCoins?.value);
    const cellsScore = ratioScore(run?.core?.cells, stats?.bestCells?.value);
    const cphScore = ratioScore(getCoinsPerHour(run), stats?.bestCoinsPerHour?.value);
    const cellsPHScore = ratioScore(getCellsPerHour(run), stats?.bestCellsPerHour?.value);

    const score =
        (waveScore * 0.26) +
        (coinsScore * 0.22) +
        (cellsScore * 0.18) +
        (cphScore * 0.17) +
        (cellsPHScore * 0.17);

    return Math.round(Math.min(100, Math.max(0, score)));
}

export function buildHistoryTrend(history = []) {
    const runs = Array.isArray(history) ? history.filter(Boolean) : [];

    if (runs.length < 2) {
        return {
            samples: runs.length,
            wave: 0,
            coins: 0,
            cells: 0,
            coinsPerHour: 0,
            cellsPerHour: 0
        };
    }

    const first = runs[0];
    const last = runs[runs.length - 1];

    return {
        samples: runs.length,
        wave: numberDiff(first?.core?.wave, last?.core?.wave),
        coins: numberDiff(first?.core?.coins, last?.core?.coins),
        cells: numberDiff(first?.core?.cells, last?.core?.cells),
        coinsPerHour: numberDiff(getCoinsPerHour(first), getCoinsPerHour(last)),
        cellsPerHour: numberDiff(getCellsPerHour(first), getCellsPerHour(last))
    };
}

function findBestRun(runs = [], picker = () => 0) {
    let best = null;

    runs.forEach((run, index) => {
        const value = numberValue(picker(run));
        if (!Number.isFinite(value)) return;

        if (!best || value > best.value) {
            best = { index, run, value };
        }
    });

    return best;
}

function average(runs = [], picker = () => 0) {
    const values = runs.map(run => numberValue(picker(run))).filter(Number.isFinite);
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function numberDiff(a = 0, b = 0) {
    const first = numberValue(a);
    const second = numberValue(b);

    if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
    return second - first;
}

function ratioScore(value = 0, best = 0) {
    const current = numberValue(value);
    const limit = numberValue(best);

    if (!Number.isFinite(current) || !Number.isFinite(limit) || limit <= 0) return 0;
    return Math.min(100, Math.max(0, (current / limit) * 100));
}

function getCoinsPerHour(run = null) {
    return run?.stats?.coinsPerHour ?? run?.core?.coinsPerHour ?? 0;
}

function getCellsPerHour(run = null) {
    return run?.stats?.cellsPerHour ?? run?.core?.cellsPerHour ?? 0;
}

function numberValue(value = 0) {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
}

export default {
    buildHistoryStats,
    buildPreviousDelta,
    buildRunQualityScore,
    buildHistoryTrend
};
