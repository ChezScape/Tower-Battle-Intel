"use strict";

/**
 * CORE COMPUTE ENGINE
 * Turns validated parser output into a stable run object.
 */

import {
    parseNumber,
    safeDiv,
    clamp
} from "../utils/math.js";

export function compute(parsed) {
    if (!parsed || typeof parsed !== "object") {
        return createEmptyRun(0);
    }

    const coreInput = parsed.core || {};
    const statsInput = parsed.stats || {};
    const sections = parsed.sections || {};
    const flat = parsed.flat || {};
    const meta = parsed.meta || {};

    const wave = parseNumber(coreInput.wave ?? flat.wave);
    const tier = parseNumber(coreInput.tier ?? flat.tier);
    const coins = parseNumber(coreInput.coins ?? flat.coins_earned ?? flat.coins);
    const cells = parseNumber(coreInput.cells ?? flat.cells_earned ?? flat.cells);
    const time = parseNumber(coreInput.time ?? flat.real_time ?? flat.game_time ?? flat.time);

    const hours = time > 0 ? time / 3600 : 0;

    const coinsPerHour = positiveOr(
        statsInput.coinsPerHour ?? statsInput.coins_per_hour ?? flat.coins_per_hour,
        safeDiv(coins, hours)
    );

    const cellsPerHour = positiveOr(
        statsInput.cellsPerHour ?? statsInput.cells_per_hour ?? flat.cells_per_hour,
        safeDiv(cells, hours)
    );

    const coinsPerWave = positiveOr(
        statsInput.coinsPerWave ?? statsInput.coins_per_wave ?? flat.coins_per_wave,
        safeDiv(coins, wave)
    );

    const cellsPerWave = positiveOr(
        statsInput.cellsPerWave ?? statsInput.cells_per_wave ?? flat.cells_per_wave,
        safeDiv(cells, wave)
    );

    return {
        core: {
            wave,
            tier,
            coins,
            cells,
            time,
            killedBy: coreInput.killedBy || coreInput.killed_by || flat.killed_by || "",
            battleDate: coreInput.battleDate || coreInput.battle_date || flat.battle_date || ""
        },

        stats: {
            coinsPerHour,
            cellsPerHour,
            coinsPerWave,
            cellsPerWave,
            efficiency: buildEfficiency({
                coinsPerHour,
                cellsPerHour,
                coinsPerWave,
                cellsPerWave,
                wave
            })
        },

        sections,
        flat,

        meta: {
            ...meta,
            confidence: clamp(parseNumber(meta.confidence) || 0, 0, 100)
        },

        raw: {
            parsed
        }
    };
}

export function createEmptyRun(confidence = 0) {
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
        meta: { confidence },
        raw: null
    };
}

function buildEfficiency({ coinsPerHour = 0, cellsPerHour = 0, coinsPerWave = 0, cellsPerWave = 0, wave = 0 } = {}) {
    return (
        safeDiv(coinsPerHour, 1e12) * 0.45 +
        safeDiv(cellsPerHour, 1000) * 0.25 +
        safeDiv(wave, 1000) * 0.20 +
        (safeDiv(coinsPerWave, 1e9) + safeDiv(cellsPerWave, 100)) * 0.10
    );
}

function positiveOr(value, fallback = 0) {
    const parsed = parseNumber(value);
    return parsed > 0 ? parsed : fallback;
}
