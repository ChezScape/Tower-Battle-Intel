"use strict";

/**
 * OPTIMISER v4.10d
 * Conservative optimisation hints from compare summary.
 */

export function optimiser(A = null, B = null, compareData = null) {
    if (!A || !B || !compareData) {
        return [];
    }

    const out = [];
    const summary = compareData.summary || {};

    for (const loss of (summary.topLosses || []).slice(0, 5)) {
        out.push({
            type: "optimiser",
            severity: "bad",
            title: `Recover ${loss.label}`,
            message: `${loss.label} is one of the largest losses. Check the related subsystem before keeping this setup.`,
            metric: loss.key,
            section: loss.section
        });
    }

    const farm = summary.farming || summary.farmingVerdict;
    if (farm?.verdict === "better_farm") {
        out.push({
            type: "optimiser",
            severity: "good",
            title: "Preserve Farm Setup",
            message: "Run B has better farming signals. Keep notes on what changed so it can be repeated."
        });
    }

    if (farm?.verdict === "worse_farm") {
        out.push({
            type: "optimiser",
            severity: "bad",
            title: "Review Farm Trade-Off",
            message: "Run B has weaker farming signals. Compare economy sources, survival and run length."
        });
    }

    return out;
}

export default optimiser;
