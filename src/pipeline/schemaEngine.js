"use strict";

/**
 * SCHEMA ENGINE
 * Validates and repairs parsed battle report data.
 *
 * Time authority is delegated to:
 * src/utils/timeEngine.js
 */

import {
    resolveBattleTime
} from "../utils/timeEngine.js";

import {
    parseNumber
} from "../utils/math.js";

/* --------------------------------------------------
   MAIN VALIDATOR
-------------------------------------------------- */

export function validateAndRepair(input) {

    if (!input || typeof input !== "object") {
        return createEmpty();
    }

    const flat =
        input.flat || {};

    const inputCore =
        input.core || {};

    const inputStats =
        input.stats || {};

    const sections =
        input.sections || {};

    const meta =
        input.meta || {};

    /* --------------------------------------------------
       CORE
    -------------------------------------------------- */

    const core = {

        wave:
            parseNumber(
                inputCore.wave ??
                flat.wave
            ),

        tier:
            parseNumber(
                inputCore.tier ??
                flat.tier
            ),

        coins:
            parseNumber(
                inputCore.coins ??
                flat.coins_earned ??
                flat.coins
            ),

        cells:
            parseNumber(
                inputCore.cells ??
                flat.cells_earned ??
                flat.cells
            ),

        time:
            resolveBattleTime({
                realTime:
                    inputCore.real_time ??
                    inputCore.realTime ??
                    flat.real_time ??
                    "",

                gameTime:
                    inputCore.game_time ??
                    inputCore.gameTime ??
                    flat.game_time ??
                    "",

                fallback:
                    inputCore.time ??
                    flat.time ??
                    ""
            }),

        killedBy:
            inputCore.killedBy ??
            inputCore.killed_by ??
            flat.killed_by ??
            "",

        battleDate:
            inputCore.battleDate ??
            inputCore.battle_date ??
            flat.battle_date ??
            ""
    };

    /* --------------------------------------------------
       STATS
    -------------------------------------------------- */

    const stats = {

        coinsPerHour:
            parseNumber(
                inputStats.coinsPerHour ??
                flat.coins_per_hour
            ),

        cellsPerHour:
            parseNumber(
                inputStats.cellsPerHour ??
                flat.cells_per_hour
            ),

        coinsPerWave:
            parseNumber(
                inputStats.coinsPerWave
            ) || safeDiv(core.coins, core.wave),

        cellsPerWave:
            parseNumber(
                inputStats.cellsPerWave
            ) || safeDiv(core.cells, core.wave),

        efficiency:
            parseNumber(
                inputStats.efficiency
            )
    };

    /* --------------------------------------------------
       FINAL STRUCTURE
    -------------------------------------------------- */

    return {

        core,

        stats,

        sections,

        flat,

        meta: {
            ...meta,
            confidence:
                clamp(
                    parseNumber(meta.confidence) || 100,
                    0,
                    100
                )
        },

        raw: {
            ...input,
            core,
            stats,
            sections,
            flat
        }
    };
}

/* --------------------------------------------------
   EMPTY FALLBACK
-------------------------------------------------- */

function createEmpty() {

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

function safeDiv(a, b) {

    const left =
        Number(a);

    const right =
        Number(b);

    if (
        !Number.isFinite(left) ||
        !Number.isFinite(right) ||
        right === 0
    ) {
        return 0;
    }

    return left / right;
}

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}