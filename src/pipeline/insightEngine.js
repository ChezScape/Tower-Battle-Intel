"use strict";

/**
 * INSIGHT ENGINE v4.10d
 * Additional trend-aware insight layer.
 */

import {
    analyser
} from "./analyser.js";

import {
    formatNumber,
    formatDelta
} from "../utils/format.js";

export function insightEngine(current = null, previous = null, diff = null, trend = {}) {
    const base = analyser(current, previous, diff);
    const out = [...base];

    if (!current) {
        return out;
    }

    const historyCount = Number(trend?.count || trend?.historyCount || 0);
    if (historyCount >= 3) {
        out.push({
            type: "trend",
            severity: "info",
            title: "History Trend Available",
            message: `${historyCount} saved runs are available for trend context.`
        });
    }

    const bestWave = trend?.bestWave?.value || trend?.bestWave || 0;
    if (bestWave && current.core?.wave >= bestWave) {
        out.push({
            type: "trend",
            severity: "good",
            title: "Best Wave Pressure",
            message: `Current run is at or above the recorded best wave (${formatNumber(bestWave)}).`
        });
    }

    const waveDiff = diff?.core?.wave?.diff || 0;
    const coinRateDiff = diff?.stats?.coinsPerHour?.diff || 0;
    if (waveDiff < 0 && coinRateDiff > 0) {
        out.push({
            type: "tradeoff",
            severity: "neutral",
            title: "Farm Versus Progression Split",
            message: `Coins/hour rose by ${formatDelta(coinRateDiff, { compact: true })}, but wave fell by ${formatDelta(waveDiff, { compact: true })}.`
        });
    }

    return dedupe(out).slice(0, 14);
}

function dedupe(items = []) {
    const seen = new Set();
    return items.filter(item => {
        const key = `${item.type}:${item.title}:${item.message}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export default insightEngine;
