"use strict";

/**
 * UPDATE PIPELINE
 * Main save/analysis pipeline for Tower Battle Intel.
 *
 * Modes:
 * - "A" / "runA"      → save report into Run A and history
 * - "B" / "runB"      → save report into Run B and history
 * - "history"         → save report into history only
 *
 * New preferred input flow:
 * Paste report → Save Report → history only
 * Pick A/B from Battle History Trace
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

/* --------------------------------------------------
   MAIN UPDATE PIPELINE
-------------------------------------------------- */

export function update(rawText, slot = "A") {

    if (
        !rawText ||
        typeof rawText !== "string" ||
        !rawText.trim()
    ) {
        return null;
    }

    const reports =
        splitBattleReports(rawText);

    if (!reports.length) {

        console.warn(
            "[Tower Battle Intel] No battle reports found in input."
        );

        return null;
    }

    const targetSlot =
        normaliseSlot(slot);

    const parsedRuns =
        reports
            .slice(0, 20)
            .map((reportText, index) =>
                buildRunFromReport(reportText, index)
            )
            .filter(Boolean);

    if (!parsedRuns.length) {

        console.warn(
            "[Tower Battle Intel] Report parsing failed."
        );

        return null;
    }

    /* --------------------------------------------------
       HISTORY-ONLY SAVE
       New preferred Save Report behaviour.
    -------------------------------------------------- */

    if (targetSlot === "history") {

    const runs =
        parsedRuns.map(item => item.computed);

    pushHistoryMany(runs);

    const latestRun =
        runs[runs.length - 1] || null;

    setState({
        currentRun:
            latestRun
    });

    return refreshAnalysis({
            rawInput:
                rawText,

            reportCount:
                reports.length,

            usedReportCount:
                parsedRuns.length,

            targetSlot:
                "history",

            reason:
                "save_report_to_history",

            parsed:
                parsedRuns[0]?.parsed || null,

            computed:
                parsedRuns[0]?.computed || null
        });
    }

    /* --------------------------------------------------
       LEGACY A/B SAVE
       Kept for compatibility.
    -------------------------------------------------- */

    if (
        targetSlot === "runA" &&
        parsedRuns.length >= 2
    ) {

        setState({
            runA:
                parsedRuns[0].computed,

            runB:
                parsedRuns[1].computed,

            currentRun:
                parsedRuns[1].computed
        });

        pushHistory(
            parsedRuns[0].computed
        );

        pushHistory(
            parsedRuns[1].computed
        );

    } else {

        setState({
            [targetSlot]:
                parsedRuns[0].computed,

            currentRun:
                parsedRuns[0].computed
        });

        pushHistory(
            parsedRuns[0].computed
        );
    }

    return refreshAnalysis({
        rawInput:
            rawText,

        reportCount:
            reports.length,

        usedReportCount:
            parsedRuns.length,

        targetSlot,

        reason:
            "legacy_slot_save",

        parsed:
            parsedRuns[0]?.parsed || null,

        computed:
            parsedRuns[0]?.computed || null
    });
}

/* --------------------------------------------------
   SAVE REPORT TO HISTORY
   Preferred input button helper.
-------------------------------------------------- */

export function saveReportToHistory(rawText) {

    return update(
        rawText,
        "history"
    );
}

/* --------------------------------------------------
   REFRESH ANALYSIS
-------------------------------------------------- */

export function refreshAnalysis(context = {}) {

    let state =
        getState();

    const trend =
        buildTrend(
            state.history || []
        );

    let compareData = null;
    let insights = [];
    let ai = [];

    if (
        state.runA &&
        state.runB
    ) {

        compareData =
            compare(
                state.runA,
                state.runB
            );

        insights =
            analyser(
                state.runB,
                state.runA,
                compareData
            );

        ai =
            aiCoach(
                state.runB,
                state.runA,
                compareData,
                insights,
                trend,
                {
                    history:
                        state.history || [],

                    buildStyle:
                        state.ui?.buildStyle || "unknown"
                }
            );
    }

    const current =
        state.runB ||
        state.currentRun ||
        state.runA ||
        null;

    const previous =
        state.runA && state.runB
            ? state.runA
            : null;

    const anomalies =
        detectAnomalies({
            current,
            previous,
            compareData,
            trend,
            history:
                state.history || []
        });

    const inspection =
        pipelineInspector({
            rawInput:
                context.rawInput || "",

            reportCount:
                context.reportCount || 0,

            usedReportCount:
                context.usedReportCount || 0,

            targetSlot:
                context.targetSlot || null,

            reason:
                context.reason || null,

            parsed:
                context.parsed || null,

            computed:
                context.computed || null,

            compareData,

            insights,

            ai,

            anomalies,

            trend,

            buildStyle:
                state.ui?.buildStyle || "unknown",

            historyCount:
                Array.isArray(state.history)
                    ? state.history.length
                    : 0
        });

    setState({
        compareData,
        insights,
        ai,
        trend,
        anomalies,
        inspection
    });

    const finalState =
        getState();

    saveStorage(finalState);

    return finalState;
}

/* --------------------------------------------------
   BUILD RUN FROM ONE REPORT
-------------------------------------------------- */

function buildRunFromReport(reportText, index = 0) {

    if (
        !reportText ||
        typeof reportText !== "string" ||
        !reportText.trim()
    ) {
        return null;
    }

    const parsed =
        parser(reportText);

    const computed =
        compute(parsed);

    if (!computed) {

        console.warn(
            "[Tower Battle Intel] Compute returned no run."
        );

        return null;
    }

    const reportId =
        fingerprintReport(reportText);

    computed.meta = {
        ...(computed.meta || {}),

        reportId,

        sourceIndex:
            index,

        source:
            "battle_report",

        app:
            "Tower Battle Intel"
    };

    computed.raw = {
        ...(computed.raw || {}),

        reportText
    };

    return {
        parsed,
        computed
    };
}

/* --------------------------------------------------
   SLOT NORMALISER
-------------------------------------------------- */

function normaliseSlot(slot = "A") {

    const value =
        String(slot || "A")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/-/g, "_");

    if (
        value === "history" ||
        value === "save" ||
        value === "report" ||
        value === "save_report"
    ) {
        return "history";
    }

    if (
        value === "a" ||
        value === "runa" ||
        value === "run_a"
    ) {
        return "runA";
    }

    return "runB";
}
