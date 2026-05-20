"use strict";

/**
 * INSIGHT ENGINE (V10 HIERARCHICAL)
 * Works with compare.core / stats / sections structure
 */

export function insightEngine(current, previous, diff, trend = {}) {

    if (!current || !diff) return [];

    const insights = [];

    const core = diff.core || {};
    const stats = diff.stats || {};

    const coinsDiff = core.coins?.diff ?? 0;
    const waveDiff = core.wave?.diff ?? 0;
    const efficiencyDiff = stats.efficiency?.diff ?? 0;

    // -----------------------------
    // SHORT TERM ECONOMY
    // -----------------------------
    if (coinsDiff > 0) {

        insights.push({
            severity: "good",
            title: "Economy Surge",
            message: "Coin output is improving in the short term."
        });

    } else if (coinsDiff < 0) {

        insights.push({
            severity: "bad",
            title: "Economy Drop",
            message: "Coin output has decreased since last run."
        });
    }

    // -----------------------------
    // PROGRESSION SIGNAL
    // -----------------------------
    if (waveDiff > 150) {

        insights.push({
            severity: "good",
            title: "Wave Breakthrough",
            message: "Large progression jump detected."
        });

    } else if (waveDiff < -100) {

        insights.push({
            severity: "bad",
            title: "Progression Drop",
            message: "Significant reduction in wave progression."
        });
    }

    // -----------------------------
    // EFFICIENCY SIGNAL
    // -----------------------------
    if (efficiencyDiff > 0.15) {

        insights.push({
            severity: "good",
            title: "Efficiency Spike",
            message: "Resource output efficiency improved."
        });

    } else if (efficiencyDiff < -0.15) {

        insights.push({
            severity: "bad",
            title: "Efficiency Loss",
            message: "You are getting less output per run."
        });
    }

    // -----------------------------
    // LONG TERM BASELINE (TREND)
    // -----------------------------
    if (trend?.avgCoins && current?.core?.coins != null) {

        const deviation =
            (current.core.coins - trend.avgCoins) /
            (trend.avgCoins || 1);

        if (deviation > 0.25) {

            insights.push({
                severity: "good",
                title: "Above Long-Term Average",
                message: "This run outperforms your historical baseline."
            });

        } else if (deviation < -0.25) {

            insights.push({
                severity: "bad",
                title: "Below Baseline",
                message: "Performance is below your long-term average."
            });
        }
    }

    // -----------------------------
    // MILESTONE DETECTION
    // -----------------------------
    if (trend?.maxWave && current?.core?.wave >= trend.maxWave) {

        insights.push({
            severity: "good",
            title: "New Peak Potential",
            message: "You are matching or exceeding previous best wave."
        });
    }

    return insights;
}
