"use strict";

/**
 * PIPELINE INSPECTOR
 * Collects diagnostic telemetry
 * PURE DATA ENGINE
 */

export function pipelineInspector({
    rawInput = "",
    parsed = null,
    computed = null,
    compareData = null,
    insights = [],
    ai = [],
    anomalies = [],
    trend = []
} = {}) {

    const now = new Date();

    return {

        timestamp: now.toISOString(),

        input: {
            length: rawInput.length,
            lines: rawInput.split("\n").length
        },

        parser: {
            success: !!parsed,
            sections:
                Object.keys(
                    parsed?.sections || {}
                ).length,

            wave:
                parsed?.core?.wave ?? 0,

            coins:
                parsed?.core?.coins ?? 0
        },

        compute: {
            success: !!computed,
            metrics:
                computed?.metrics || {}
        },

        compare: {
            enabled: !!compareData,

            sections:
                Object.keys(
                    compareData?.sections || {}
                ).length
        },

        intelligence: {
            insights: insights.length,
            ai: ai.length,
            anomalies: anomalies.length,
            trendSignals: trend.length
        },

        memory: {
            heapEstimate:
                estimateSize({
                    parsed,
                    computed,
                    compareData
                })
        }
    };
}

/* --------------------------------------------------
   MEMORY ESTIMATE
-------------------------------------------------- */

function estimateSize(obj) {

    try {

        return JSON.stringify(obj).length;

    } catch {

        return 0;
    }
}