"use strict";

/**
 * PIPELINE SCHEMA ENGINE v4.10d
 * Validates and repairs parser output while keeping parser evidence visible.
 */

import {
    parseNumber,
    safeDiv,
    clamp
} from "../utils/math.js";

import {
    buildTimeModel,
    resolveBattleTime
} from "../utils/timeEngine.js";

import {
    validateReportAgainstSchema,
    findUnknownReportFields
} from "../game/reportSchema.js";

import {
    scanUnknownReportMetrics
} from "../game/unknownMetricLogger.js";

export function validateAndRepair(input) {
    if (!input || typeof input !== "object") {
        return createEmpty();
    }

    const flat = safeObject(input.flat);
    const sections = safeObject(input.sections);
    const inputCore = safeObject(input.core);
    const inputStats = safeObject(input.stats);
    const inputMeta = safeObject(input.meta);

    const timeModel = buildTimeModel({
        realTime: inputCore.real_time ?? inputCore.realTime ?? flat.real_time,
        gameTime: inputCore.game_time ?? inputCore.gameTime ?? flat.game_time,
        fallback: inputCore.time ?? flat.time
    });

    const core = {
        battleDate: inputCore.battleDate ?? inputCore.battle_date ?? flat.battle_date ?? "",
        game_time: inputCore.game_time ?? inputCore.gameTime ?? flat.game_time ?? "",
        real_time: inputCore.real_time ?? inputCore.realTime ?? flat.real_time ?? "",
        tier: parseNumber(inputCore.tier ?? flat.tier),
        wave: parseNumber(inputCore.wave ?? flat.wave),
        killedBy: inputCore.killedBy ?? inputCore.killed_by ?? flat.killed_by ?? "",
        coins: parseNumber(inputCore.coins ?? flat.coins_earned ?? flat.coins),
        cells: parseNumber(inputCore.cells ?? flat.cells_earned ?? flat.cells),
        time: parseNumber(inputCore.time) || resolveBattleTime({
            realTime: inputCore.real_time ?? flat.real_time,
            gameTime: inputCore.game_time ?? flat.game_time,
            fallback: inputCore.time ?? flat.time
        })
    };

    const stats = {
        coinsPerHour: positiveOr(inputStats.coinsPerHour ?? inputStats.coins_per_hour ?? flat.coins_per_hour, 0),
        cellsPerHour: positiveOr(inputStats.cellsPerHour ?? inputStats.cells_per_hour ?? flat.cells_per_hour, 0),
        coinsPerWave: positiveOr(inputStats.coinsPerWave ?? inputStats.coins_per_wave ?? flat.coins_per_wave, safeDiv(core.coins, core.wave)),
        cellsPerWave: positiveOr(inputStats.cellsPerWave ?? inputStats.cells_per_wave ?? flat.cells_per_wave, safeDiv(core.cells, core.wave)),
        efficiency: parseNumber(inputStats.efficiency)
    };

    const reportSchema = inputMeta.reportSchema || validateReportAgainstSchema(sections);
    const unknownReportFields = Array.isArray(inputMeta.unknownReportFields)
        ? inputMeta.unknownReportFields
        : findUnknownReportFields(sections);
    const unknownMetricScan = inputMeta.unknownMetricScan || scanUnknownReportMetrics({ sections });

    const confidence = clamp(
        parseNumber(inputMeta.confidence, NaN),
        0,
        100
    );

    return {
        core,
        stats,
        sections,
        flat,
        meta: {
            ...inputMeta,
            confidence: Number.isFinite(confidence) ? confidence : estimateConfidence({ core, sections, flat, reportSchema }),
            reportSchema,
            unknownReportFields,
            unknownMetricScan,
            timeModel
        },
        raw: {
            ...(input.raw || {}),
            core,
            stats,
            sections,
            flat
        }
    };
}

export function createEmpty() {
    return {
        core: {
            battleDate: "",
            game_time: "",
            real_time: "",
            tier: 0,
            wave: 0,
            killedBy: "",
            coins: 0,
            cells: 0,
            time: 0
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
            confidence: 0,
            reportSchema: null,
            unknownReportFields: [],
            unknownMetricScan: { count: 0, unknown: [] }
        },
        raw: null
    };
}

function positiveOr(value, fallback = 0) {
    const parsed = parseNumber(value);
    return parsed > 0 ? parsed : fallback;
}

function safeObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function estimateConfidence({ core = {}, sections = {}, flat = {}, reportSchema = null } = {}) {
    let score = 100;

    if (!core.wave) score -= 18;
    if (!core.tier) score -= 8;
    if (!core.coins) score -= 8;
    if (!core.cells) score -= 6;
    if (!core.time) score -= 6;
    if (!core.battleDate) score -= 4;
    if (!Object.keys(sections || {}).length) score -= 24;
    if (!Object.keys(flat || {}).length) score -= 14;
    if (reportSchema && reportSchema.valid === false) score -= Math.min(18, (reportSchema.missingSections || []).length * 3);

    return clamp(score, 0, 100);
}
