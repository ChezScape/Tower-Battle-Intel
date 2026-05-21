"use strict";

/**
 * PIPELINE INSPECTOR
 * Central diagnostic snapshot and trace collector.
 *
 * This file is intentionally data-only. It does not touch the DOM and it does
 * not perform UI actions. The UI/debug panel can safely read the returned
 * object without causing extra pipeline work.
 */

const PIPELINE_INSPECTOR_VERSION = "pipeline-inspector-v4.9x";
const MAX_TRACE_ENTRIES = 300;
const traceLog = [];

export function pipelineInspector(context = {}) {
    const parsed = context.parsed || null;
    const computed = context.computed || null;
    const compareData = context.compareData || null;
    const history = Array.isArray(context.history) ? context.history : [];

    const snapshot = {
        ok: Boolean(parsed || computed || compareData),
        version: PIPELINE_INSPECTOR_VERSION,
        at: new Date().toISOString(),
        reason: normaliseText(context.reason || "unknown"),
        targetSlot: context.targetSlot || null,

        input: inspectInput(context.rawInput),
        reports: inspectReports(context),
        parser: inspectParsed(parsed),
        compute: inspectRun(computed),
        compare: inspectCompare(compareData),
        intelligence: inspectIntelligence(context),
        history: inspectHistory(history, context),
        ui: inspectUI(context),
        trace: inspectTrace(),
        size: estimateSize(context),
        warnings: []
    };

    snapshot.warnings = buildInspectorWarnings(snapshot);

    capturePipelineTrace("pipeline/inspection", {
        reason: snapshot.reason,
        targetSlot: snapshot.targetSlot,
        parserOk: snapshot.parser.success,
        computeOk: snapshot.compute.success,
        compareOk: snapshot.compare.enabled,
        warningCount: snapshot.warnings.length
    });

    return snapshot;
}

export function capturePipelineTrace(stage = "unknown", data = {}, meta = {}) {
    const entry = {
        stage: normaliseText(stage || "unknown"),
        at: new Date().toISOString(),
        data: safeClone(data),
        meta: safeClone(meta)
    };

    traceLog.push(entry);

    while (traceLog.length > MAX_TRACE_ENTRIES) {
        traceLog.shift();
    }

    return entry;
}

export function getPipelineTraceLog({ limit = MAX_TRACE_ENTRIES } = {}) {
    const safeLimit = Math.max(0, Number(limit) || MAX_TRACE_ENTRIES);
    return traceLog.slice(Math.max(0, traceLog.length - safeLimit));
}

export function clearPipelineTraceLog() {
    traceLog.length = 0;
    return [];
}

export function getPipelineInspectorVersion() {
    return PIPELINE_INSPECTOR_VERSION;
}

function inspectInput(rawInput = "") {
    const text = String(rawInput || "");
    return {
        hasInput: text.trim().length > 0,
        length: text.length,
        lines: text ? text.split(/\r?\n/).length : 0,
        looksLikeBattleReport: /Battle\s+Report/i.test(text),
        reportHeaderCount: (text.match(/Battle\s+Report/gi) || []).length
    };
}

function inspectReports(context = {}) {
    return {
        reportCount: Number(context.reportCount || 0),
        usedReportCount: Number(context.usedReportCount || 0),
        skippedReportCount: Math.max(
            0,
            Number(context.reportCount || 0) - Number(context.usedReportCount || 0)
        )
    };
}

function inspectParsed(parsed = null) {
    if (!parsed) {
        return {
            success: false,
            sectionCount: 0,
            flatCount: 0,
            confidence: 0,
            core: null,
            unknownFieldCount: 0,
            schema: null
        };
    }

    return {
        success: true,
        sectionCount: Object.keys(parsed.sections || {}).length,
        flatCount: Object.keys(parsed.flat || {}).length,
        confidence: Number(parsed.meta?.confidence ?? 0),
        core: {
            battleDate: parsed.core?.battleDate || "",
            tier: Number(parsed.core?.tier || 0),
            wave: Number(parsed.core?.wave || 0),
            killedBy: parsed.core?.killedBy || "",
            coins: Number(parsed.core?.coins || 0),
            cells: Number(parsed.core?.cells || 0)
        },
        unknownFieldCount: getUnknownFieldCount(parsed),
        schema: parsed.meta?.schema || null
    };
}

function inspectRun(run = null) {
    if (!run) {
        return {
            success: false,
            sectionCount: 0,
            core: null,
            stats: null,
            reportId: null
        };
    }

    return {
        success: true,
        sectionCount: Object.keys(run.sections || {}).length,
        core: {
            tier: Number(run.core?.tier || 0),
            wave: Number(run.core?.wave || 0),
            killedBy: run.core?.killedBy || "",
            coins: Number(run.core?.coins || 0),
            cells: Number(run.core?.cells || 0)
        },
        stats: {
            coinsPerHour: Number(run.stats?.coinsPerHour || 0),
            cellsPerHour: Number(run.stats?.cellsPerHour || 0),
            realTimeSeconds: Number(run.stats?.realTimeSeconds || 0),
            gameTimeSeconds: Number(run.stats?.gameTimeSeconds || 0)
        },
        reportId: run.meta?.reportId || null
    };
}

function inspectCompare(compareData = null) {
    if (!compareData) {
        return {
            enabled: false,
            sectionCount: 0,
            itemCount: 0,
            summary: null,
            betterFor: null
        };
    }

    return {
        enabled: true,
        sectionCount: Object.keys(compareData.sections || {}).length,
        itemCount: Array.isArray(compareData.items) ? compareData.items.length : 0,
        summary: compareData.summary || null,
        betterFor: compareData.betterFor || null,
        unknownFieldCount: Number(compareData.unknownFieldCount || 0)
    };
}

function inspectIntelligence(context = {}) {
    return {
        insights: Array.isArray(context.insights) ? context.insights.length : 0,
        ai: Array.isArray(context.ai) ? context.ai.length : 0,
        anomalies: Array.isArray(context.anomalies) ? context.anomalies.length : 0,
        trendSignals: Array.isArray(context.trend)
            ? context.trend.length
            : Number(context.trend?.count || 0)
    };
}

function inspectHistory(history = [], context = {}) {
    return {
        count: history.length,
        contextCount: Number(context.historyCount || history.length || 0),
        archivedCount: history.filter(run => run?.archived).length,
        latestReportId: history[0]?.meta?.reportId || history[0]?.id || null
    };
}

function inspectUI(context = {}) {
    return {
        buildStyle: context.buildStyle || "unknown",
        activeView: context.activeView || null,
        selectedSection: context.selectedSection || null
    };
}

function inspectTrace() {
    return {
        count: traceLog.length,
        latest: traceLog[traceLog.length - 1] || null
    };
}

function buildInspectorWarnings(snapshot = {}) {
    const warnings = [];

    if (snapshot.input?.hasInput && !snapshot.input?.looksLikeBattleReport) {
        warnings.push("Input text does not look like a Battle Report.");
    }

    if (snapshot.reports?.reportCount > snapshot.reports?.usedReportCount) {
        warnings.push("Some pasted reports were skipped by the safety limit or parser.");
    }

    if (snapshot.parser?.success && snapshot.parser?.sectionCount < 8) {
        warnings.push("Parsed report has fewer sections than expected.");
    }

    if (snapshot.parser?.unknownFieldCount > 0) {
        warnings.push(`${snapshot.parser.unknownFieldCount} unknown report fields detected.`);
    }

    if (snapshot.compare?.enabled && snapshot.compare?.sectionCount === 0) {
        warnings.push("Compare is enabled but has no section deltas.");
    }

    return warnings;
}

function getUnknownFieldCount(parsed = {}) {
    const value = parsed.meta?.unknownReportFields;

    if (typeof value === "number") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.length;
    }

    if (value && typeof value === "object") {
        return Number(value.count || Object.keys(value).length || 0);
    }

    return 0;
}

function estimateSize(obj) {
    try {
        return JSON.stringify(obj).length;
    } catch {
        return 0;
    }
}

function safeClone(value) {
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return {
            unserialisable: true,
            type: typeof value
        };
    }
}

function normaliseText(value = "") {
    return String(value || "").trim() || "unknown";
}

export default {
    pipelineInspector,
    capturePipelineTrace,
    getPipelineTraceLog,
    clearPipelineTraceLog,
    getPipelineInspectorVersion
};
