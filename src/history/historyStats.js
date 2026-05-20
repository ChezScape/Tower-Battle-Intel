"use strict";

/**
 * HISTORY STATS
 * Small pure helpers for Battle History Trace summaries.
 */

/* --------------------------------------------------
   HISTORY SUMMARY
-------------------------------------------------- */

export function buildHistoryStats(history = []) {

    const runs =
        Array.isArray(history)
            ? history.filter(Boolean)
            : [];

    const count =
        runs.length;

    const bestWave =
        findBestRun(runs, run => run?.core?.wave);

    const bestCoins =
        findBestRun(runs, run => run?.core?.coins);

    const bestCells =
        findBestRun(runs, run => run?.core?.cells);

    const latest =
        count
            ? {
                index: count - 1,
                run: runs[count - 1]
            }
            : null;

    return {
        count,
        bestWave,
        bestCoins,
        bestCells,
        latest,
        averageWave:
            average(runs, run => run?.core?.wave),
        averageCoins:
            average(runs, run => run?.core?.coins),
        averageCells:
            average(runs, run => run?.core?.cells)
    };
}

/* --------------------------------------------------
   PREVIOUS RUN DELTA
-------------------------------------------------- */

export function buildPreviousDelta(history = [], index = 0) {

    const runs =
        Array.isArray(history)
            ? history
            : [];

    const current =
        runs[index];

    const previous =
        index > 0
            ? runs[index - 1]
            : null;

    if (!current || !previous) {
        return null;
    }

    return {
        wave:
            numberDiff(
                previous?.core?.wave,
                current?.core?.wave
            ),

        coins:
            numberDiff(
                previous?.core?.coins,
                current?.core?.coins
            ),

        cells:
            numberDiff(
                previous?.core?.cells,
                current?.core?.cells
            ),

        coinsPerHour:
            numberDiff(
                getCoinsPerHour(previous),
                getCoinsPerHour(current)
            ),

        cellsPerHour:
            numberDiff(
                getCellsPerHour(previous),
                getCellsPerHour(current)
            )
    };
}

/* --------------------------------------------------
   RUN QUALITY SCORE
-------------------------------------------------- */

export function buildRunQualityScore(run = null, summary = null) {

    if (!run) {
        return 0;
    }

    const stats =
        summary || buildHistoryStats([run]);

    const waveScore =
        ratioScore(
            run?.core?.wave,
            stats?.bestWave?.value
        );

    const coinsScore =
        ratioScore(
            run?.core?.coins,
            stats?.bestCoins?.value
        );

    const cellsScore =
        ratioScore(
            run?.core?.cells,
            stats?.bestCells?.value
        );

    const efficiency =
        Number(run?.stats?.efficiency || 0);

    const efficiencyScore =
        Number.isFinite(efficiency)
            ? Math.min(100, Math.max(0, efficiency * 7.5))
            : 0;

    const score =
        (waveScore * 0.28) +
        (coinsScore * 0.28) +
        (cellsScore * 0.24) +
        (efficiencyScore * 0.20);

    return Math.round(
        Math.min(100, Math.max(0, score))
    );
}

/* --------------------------------------------------
   BEST RUN HELPERS
-------------------------------------------------- */

function findBestRun(runs = [], picker = () => 0) {

    let best = null;

    runs.forEach((run, index) => {

        const value =
            Number(picker(run) || 0);

        if (!Number.isFinite(value)) {
            return;
        }

        if (!best || value > best.value) {
            best = {
                index,
                run,
                value
            };
        }
    });

    return best;
}

function average(runs = [], picker = () => 0) {

    const values =
        runs
            .map(run => Number(picker(run) || 0))
            .filter(Number.isFinite);

    if (!values.length) {
        return 0;
    }

    const total =
        values.reduce((sum, value) => sum + value, 0);

    return total / values.length;
}

function numberDiff(a = 0, b = 0) {

    const first =
        Number(a || 0);

    const second =
        Number(b || 0);

    if (
        !Number.isFinite(first) ||
        !Number.isFinite(second)
    ) {
        return null;
    }

    return second - first;
}

function ratioScore(value = 0, best = 0) {

    const current =
        Number(value || 0);

    const limit =
        Number(best || 0);

    if (
        !Number.isFinite(current) ||
        !Number.isFinite(limit) ||
        limit <= 0
    ) {
        return 0;
    }

    return Math.min(
        100,
        Math.max(0, (current / limit) * 100)
    );
}

function getCoinsPerHour(run = null) {
    return run?.stats?.coinsPerHour ?? run?.core?.coinsPerHour ?? 0;
}

function getCellsPerHour(run = null) {
    return run?.stats?.cellsPerHour ?? run?.core?.cellsPerHour ?? 0;
}
