"use strict";

/**
 * ANALYSER v4.10d
 * Converts compare output into concise insight cards.
 */

import {
    formatDelta,
    formatPercent,
    formatNumber
} from "../utils/format.js";

export function analyser(current = null, previous = null, compareData = null) {
    if (!current || !compareData) {
        return [insight("info", "Waiting For Comparison", "Load two reports to generate comparison insights.")];
    }

    const out = [];
    const core = compareData.core || {};
    const stats = compareData.stats || {};
    const summary = compareData.summary || {};

    const wave = core.wave?.diff || 0;
    const coinsRate = stats.coinsPerHour?.diff || 0;
    const cellsRate = stats.cellsPerHour?.diff || 0;

    if (wave > 0) out.push(insight("good", "Wave Progression Improved", `Run B reached ${formatDelta(wave, { compact: true })} waves compared with A.`));
    if (wave < 0) out.push(insight("bad", "Wave Progression Dropped", `Run B lost ${formatDelta(wave, { compact: true })} waves compared with A.`));

    if (coinsRate > 0) out.push(insight("good", "Coin Rate Improved", `Coins/hour improved by ${formatNumber(coinsRate)}.`));
    if (coinsRate < 0) out.push(insight("bad", "Coin Rate Dropped", `Coins/hour changed by ${formatNumber(coinsRate)}.`));

    if (cellsRate > 0) out.push(insight("good", "Cell Rate Improved", `Cells/hour improved by ${formatNumber(cellsRate)}.`));
    if (cellsRate < 0) out.push(insight("bad", "Cell Rate Dropped", `Cells/hour changed by ${formatNumber(cellsRate)}.`));

    if (summary.farmingVerdict?.verdict) {
        out.push(insight(
            summary.farmingVerdict.verdict === "better_farm" ? "good" : summary.farmingVerdict.verdict === "worse_farm" ? "bad" : "neutral",
            summary.farmingVerdict.title || "Farming Verdict",
            summary.farmingVerdict.note || "Review economy and survival trade-offs."
        ));
    }

    for (const item of (summary.topGains || []).slice(0, 3)) {
        out.push(insight("good", `Top Gain: ${item.label}`, `${item.label} improved by ${formatDelta(item.diff, { compact: true })} (${formatPercent(item.pct || 0)}).`));
    }

    for (const item of (summary.topLosses || []).slice(0, 3)) {
        out.push(insight("bad", `Top Loss: ${item.label}`, `${item.label} dropped by ${formatDelta(item.diff, { compact: true })} (${formatPercent(item.pct || 0)}).`));
    }

    const killedA = previous?.core?.killedBy || "";
    const killedB = current?.core?.killedBy || "";
    if (killedA && killedB && killedA !== killedB) {
        out.push(insight("neutral", "Death Cause Changed", `Run A died to ${killedA}; Run B died to ${killedB}. Treat this as a pressure change, not just a score change.`));
    }

    return dedupe(out).slice(0, 12);
}

function insight(severity, title, message, extra = {}) {
    return {
        type: "analysis",
        severity,
        level: severity,
        title,
        message,
        ...extra
    };
}

function dedupe(items = []) {
    const seen = new Set();
    return items.filter(item => {
        const key = `${item.severity}:${item.title}:${item.message}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export const analyse = analyser;
export default analyser;
