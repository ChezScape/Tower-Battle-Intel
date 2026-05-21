"use strict";

/**
 * CORE UPDATE PIPELINE
 * Single lower-level path for parsing, computing and refreshing analysis.
 */

import {
    parser,
    compare,
    analyser,
    aiCoach
} from "../pipeline/index.js";

import {
    compute
} from "./compute.js";

import {
    getState,
    setState
} from "./state.js";

import {
    pushHistory,
    pushHistoryMany
} from "./history.js";

import {
    buildTrend
} from "./trend.js";

import {
    detectAnomalies
} from "../diagnostics/anomalyEngine.js";

import {
    pipelineInspector
} from "../diagnostics/pipelineInspector.js";

import {
    splitBattleReports,
    fingerprintReport
} from "../utils/reportSplitter.js";

import {
    saveStorage
} from "../storage/localStore.js";

export function update(rawText, slot = "history") {
    const text = String(rawText || "").trim();

    if (!text) {
        return null;
    }

    const reports = splitBattleReports(text).slice(0, 50);

    if (!reports.length) {
        return null;
    }

    const parsedRuns = reports
        .map((reportText, index) => buildRunFromReport(reportText, index))
        .filter(Boolean);

    if (!parsedRuns.length) {
        return null;
    }

    const targetSlot = normaliseSlot(slot);
    const computedRuns = parsedRuns.map(item => item.computed);

    if (targetSlot === "history") {
        pushHistoryMany(computedRuns);
        setState({ currentRun: computedRuns.at(-1) || null });

        return refreshAnalysis({
            rawInput: text,
            reportCount: reports.length,
            usedReportCount: computedRuns.length,
            targetSlot,
            reason: "save_report_to_history",
            parsed: parsedRuns[0]?.parsed || null,
            computed: parsedRuns[0]?.computed || null
        });
    }

    if (targetSlot === "runA" && computedRuns.length >= 2) {
        setState({
            runA: computedRuns[0],
            runB: computedRuns[1],
            currentRun: computedRuns[1]
        });
        pushHistory(computedRuns[0]);
        pushHistory(computedRuns[1]);
    } else {
        setState({
            [targetSlot]: computedRuns[0],
            currentRun: computedRuns[0]
        });
        pushHistory(computedRuns[0]);
    }

    return refreshAnalysis({
        rawInput: text,
        reportCount: reports.length,
        usedReportCount: computedRuns.length,
        targetSlot,
        reason: "update_slot",
        parsed: parsedRuns[0]?.parsed || null,
        computed: parsedRuns[0]?.computed || null
    });
}

export function saveReportToHistory(rawText) {
    return update(rawText, "history");
}

export function refreshAnalysis(context = {}) {
    const state = getState();
    const history = Array.isArray(state.history) ? state.history : [];
    const trend = buildTrend(history);

    let compareData = null;
    let insights = [];
    let ai = [];

    if (state.runA && state.runB) {
        compareData = compare(state.runA, state.runB);
        insights = analyser(state.runB, state.runA, compareData);
        ai = aiCoach(
            state.runB,
            state.runA,
            compareData,
            insights,
            trend,
            {
                history,
                buildStyle: state.ui?.buildStyle || "unknown"
            }
        );
    }

    const current = state.runB || state.currentRun || state.runA || null;
    const previous = state.runA && state.runB ? state.runA : null;

    const anomalies = detectAnomalies({
        current,
        previous,
        compareData,
        trend,
        history
    });

    const inspection = pipelineInspector({
        rawInput: context.rawInput || "",
        reportCount: context.reportCount || 0,
        usedReportCount: context.usedReportCount || 0,
        targetSlot: context.targetSlot || null,
        reason: context.reason || "refresh_analysis",
        parsed: context.parsed || null,
        computed: context.computed || null,
        compareData,
        insights,
        ai,
        anomalies,
        trend,
        buildStyle: state.ui?.buildStyle || "unknown",
        historyCount: history.length
    });

    setState({
        compareData,
        insights,
        ai,
        trend,
        anomalies,
        inspection
    });

    const finalState = getState();
    saveStorage(finalState);
    return finalState;
}

function buildRunFromReport(reportText, index = 0) {
    const parsed = parser(reportText);
    const computed = compute(parsed);

    if (!computed || !computed.core) {
        return null;
    }

    computed.meta = {
        ...(computed.meta || {}),
        reportId: computed.meta?.reportId || fingerprintReport(reportText),
        sourceIndex: index,
        source: "battle_report",
        app: "Tower Battle Intel"
    };

    computed.raw = {
        ...(computed.raw || {}),
        reportText
    };

    return { parsed, computed };
}

function normaliseSlot(slot = "history") {
    const value = String(slot || "history").trim().toLowerCase().replace(/[\s-]+/g, "_");

    if (["history", "save", "report", "save_report"].includes(value)) return "history";
    if (["a", "runa", "run_a"].includes(value)) return "runA";
    if (["b", "runb", "run_b"].includes(value)) return "runB";
    return "history";
}
