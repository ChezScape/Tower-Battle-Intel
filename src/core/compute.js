"use strict";

/**
 * COMPUTE ENGINE
 * Finalises parsed battle report data into a stable run object.
 *
 * Important:
 * - keeps full sections alive
 * - prevents NaN pollution
 * - computes safe derived stats
 * - preserves raw/parser data for diagnostics
 */

import {
    parseNumber,
    safeDiv
} from "../utils/math.js";

/* --------------------------------------------------
   MAIN COMPUTE
-------------------------------------------------- */

export function compute(parsed) {

    if (!parsed || typeof parsed !== "object") {
        return empty();
    }

    const coreInput =
        parsed.core || {};

    const statsInput =
        parsed.stats || {};

    const sections =
        parsed.sections || {};

    const flat =
        parsed.flat || {};

    const meta =
        parsed.meta || {};

    /* --------------------------------------------------
       CORE
    -------------------------------------------------- */

    const wave =
        parseNumber(coreInput.wave);

    const tier =
        parseNumber(coreInput.tier);

    const coins =
        parseNumber(coreInput.coins);

    const cells =
        parseNumber(coreInput.cells);

    const time =
        parseNumber(coreInput.time);

    const killedBy =
        coreInput.killedBy ||
        coreInput.killed_by ||
        flat.killed_by ||
        "";

    const battleDate =
        coreInput.battleDate ||
        coreInput.battle_date ||
        flat.battle_date ||
        "";

    /* --------------------------------------------------
       HOURS
    -------------------------------------------------- */

    const hours =
        time > 0
            ? time / 3600
            : 0;

    /* --------------------------------------------------
       RAW / IMPORTED STATS
    -------------------------------------------------- */

    const rawCoinsPerHour =
        parseNumber(statsInput.coinsPerHour);

    const rawCellsPerHour =
        parseNumber(statsInput.cellsPerHour);

    const rawCoinsPerWave =
        parseNumber(statsInput.coinsPerWave);

    const rawCellsPerWave =
        parseNumber(statsInput.cellsPerWave);

    /* --------------------------------------------------
       DERIVED STATS
    -------------------------------------------------- */

    const coinsPerHour =
        rawCoinsPerHour > 0
            ? rawCoinsPerHour
            : safeDiv(coins, hours);

    const cellsPerHour =
        rawCellsPerHour > 0
            ? rawCellsPerHour
            : safeDiv(cells, hours);

    const coinsPerWave =
        rawCoinsPerWave > 0
            ? rawCoinsPerWave
            : safeDiv(coins, wave);

    const cellsPerWave =
        rawCellsPerWave > 0
            ? rawCellsPerWave
            : safeDiv(cells, wave);

    const efficiency =
        buildEfficiency({
            coinsPerHour,
            cellsPerHour,
            coinsPerWave,
            cellsPerWave,
            wave
        });

    /* --------------------------------------------------
       FINAL RUN OBJECT
    -------------------------------------------------- */

    return {

        core: {
            wave,
            tier,
            coins,
            cells,
            time,
            killedBy,
            battleDate
        },

        stats: {
            coinsPerHour,
            cellsPerHour,
            coinsPerWave,
            cellsPerWave,
            efficiency
        },

        // CRITICAL: this is what compare.js needs
        sections,

        // useful for debug/search/future UI
        flat,

        meta: {
            confidence:
                clamp(
                    parseNumber(meta.confidence) || 100,
                    0,
                    100
                )
        },

        raw: {
            parsed
        }
    };
}

/* --------------------------------------------------
   EFFICIENCY MODEL
-------------------------------------------------- */

function buildEfficiency({
    coinsPerHour = 0,
    cellsPerHour = 0,
    coinsPerWave = 0,
    cellsPerWave = 0,
    wave = 0
} = {}) {

    const economyScore =
        safeDiv(coinsPerHour, 1e12);

    const cellScore =
        safeDiv(cellsPerHour, 1e3);

    const waveScore =
        safeDiv(wave, 1000);

    const perWaveScore =
        safeDiv(coinsPerWave, 1e9) +
        safeDiv(cellsPerWave, 100);

    return (
        economyScore * 0.45 +
        cellScore * 0.25 +
        waveScore * 0.20 +
        perWaveScore * 0.10
    );
}

/* --------------------------------------------------
   EMPTY FALLBACK
-------------------------------------------------- */

function empty() {

    return {

        core: {
            wave: 0,
            tier: 0,
            coins: 0,
            cells: 0,
            time: 0,
            killedBy: "",
            battleDate: ""
        },

        stats: {
            coinsPerHour: 0,
            cellsPerHour: 0,
            coinsPerWave: 0,
            cellsPerWave: 0,
            efficiency: 0
        },

        sections: {},

        flat: {},

        meta: {
            confidence: 0
        },

        raw: null
    };
}

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}