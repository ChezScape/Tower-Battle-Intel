"use strict";

/**
 * BATTLE REPORT PARSER v4.10d
 * Uses the shared report splitter, section engine, aliases and schema brain.
 */

import {
    getFirstBattleReport,
    countBattleReports,
    fingerprintReport,
    normaliseLineEndings
} from "../utils/reportSplitter.js";

import {
    buildSections,
    splitSectionLine
} from "../utils/sectionEngine.js";

import {
    parseNumber,
    safeDiv
} from "../utils/math.js";

import {
    buildTimeModel
} from "../utils/timeEngine.js";

import {
    normaliseReportKey
} from "../game/battleReportAliases.js";

import {
    validateReportAgainstSchema,
    findUnknownReportFields
} from "../game/reportSchema.js";

import {
    scanUnknownReportMetrics
} from "../game/unknownMetricLogger.js";

import {
    validateAndRepair
} from "./schemaEngine.js";

export function parser(rawText) {
    const raw = String(rawText || "");

    if (!raw.trim()) {
        return validateAndRepair({
            meta: {
                parserVersion: "battle-report-parser-v4.10d",
                confidence: 0,
                error: "empty_input"
            }
        });
    }

    const reportText = getFirstBattleReport(raw);
    const lines = normaliseLineEndings(reportText)
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    const sections = buildSections(lines);
    const flat = buildFlatMap(lines);
    const timeModel = buildTimeModel({
        realTime: flat.real_time,
        gameTime: flat.game_time,
        fallback: flat.time
    });

    const wave = parseNumber(flat.wave);
    const coins = parseNumber(flat.coins_earned ?? flat.coins);
    const cells = parseNumber(flat.cells_earned ?? flat.cells);

    const core = {
        battleDate: flat.battle_date || "",
        game_time: flat.game_time || "",
        real_time: flat.real_time || "",
        tier: parseNumber(flat.tier),
        wave,
        killedBy: flat.killed_by || "",
        coins,
        cells,
        time: timeModel.selectedSeconds
    };

    const hours = core.time > 0 ? core.time / 3600 : 0;
    const stats = {
        coinsPerHour: positiveOr(flat.coins_per_hour, safeDiv(coins, hours)),
        cellsPerHour: positiveOr(flat.cells_per_hour, safeDiv(cells, hours)),
        coinsPerWave: positiveOr(flat.coins_per_wave, safeDiv(coins, wave)),
        cellsPerWave: safeDiv(cells, wave),
        efficiency: 0
    };

    const reportSchema = validateReportAgainstSchema(sections);
    const unknownReportFields = findUnknownReportFields(sections);
    const unknownMetricScan = scanUnknownReportMetrics({ sections });

    const parsed = {
        core,
        stats,
        sections,
        flat,
        meta: {
            parserVersion: "battle-report-parser-v4.10d",
            confidence: estimateConfidence({ core, sections, flat, reportSchema }),
            reportId: fingerprintReport(reportText),
            reportCount: countBattleReports(raw),
            lineCount: lines.length,
            reportSchema,
            unknownReportFields,
            unknownMetricScan,
            timeModel
        },
        raw: {
            originalText: raw,
            reportText,
            lines,
            sections,
            flat
        }
    };

    return validateAndRepair(parsed);
}

function buildFlatMap(lines = []) {
    const flat = {};

    for (const line of lines) {
        const pair = splitSectionLine(line);

        if (!pair) {
            continue;
        }

        const key = normaliseReportKey(pair.key);
        if (!key) {
            continue;
        }

        flat[key] = String(pair.value ?? "").trim();
    }

    return flat;
}

function positiveOr(value, fallback = 0) {
    const parsed = parseNumber(value);
    return parsed > 0 ? parsed : fallback;
}

function estimateConfidence({ core = {}, sections = {}, flat = {}, reportSchema = {} } = {}) {
    let score = 100;

    if (!core.wave) score -= 18;
    if (!core.tier) score -= 8;
    if (!core.coins) score -= 8;
    if (!core.cells) score -= 6;
    if (!core.killedBy) score -= 5;
    if (!core.time) score -= 5;
    if (!Object.keys(sections || {}).length) score -= 24;
    if (!Object.keys(flat || {}).length) score -= 14;

    const missing = Array.isArray(reportSchema.missingSections) ? reportSchema.missingSections.length : 0;
    score -= Math.min(12, missing * 2);

    return Math.max(0, Math.min(100, score));
}

export default parser;
