"use strict";

/**
 * DELTA FORMAT ENGINE
 * Shared display and severity helpers for all A/B comparisons.
 */

import {
    formatTowerDelta,
    formatTowerNumber
} from "../../game/numberNotation.js";

export function formatDelta(value, options = {}) {

    const {
        precision = 2,
        signed = true,
        compact = false,
        zero = "0"
    } = options;

    const num = Number(value);

    if (!Number.isFinite(num)) {
        return zero;
    }

    if (compact) {
        return signed
            ? formatTowerDelta(num, precision)
            : formatTowerNumber(num, precision);
    }

    const formatted =
        precision <= 0
            ? String(Math.round(num))
            : trimFixed(num, precision);

    return signed && num > 0
        ? `+${formatted}`
        : formatted;
}

export function formatPercentDelta(value, precision = 1) {

    if (value == null) {
        return "from near zero";
    }

    const num = Number(value);

    if (!Number.isFinite(num)) {
        return "0%";
    }

    const sign = num > 0 ? "+" : "";
    return `${sign}${trimFixed(num, precision)}%`;
}

export function buildDeltaDisplay(diffData = {}, options = {}) {

    const diff = Number(diffData?.diff ?? 0);
    const pct = diffData?.pct;

    return {
        raw: Number.isFinite(diff) ? diff : 0,
        formatted: formatDelta(diff, {
            compact: true,
            precision: options.precision ?? 2
        }),
        percent: formatPercentDelta(pct, options.percentPrecision ?? 1),
        severity: classifyDelta(diff, options.threshold ?? 0),
        tone: classifyDelta(diff, options.threshold ?? 0),
        direction: diff > 0 ? "up" : diff < 0 ? "down" : "flat"
    };
}

export function classifyDelta(value, threshold = 0) {
    const num = Number(value);

    if (!Number.isFinite(num)) return "neutral";
    if (num > threshold) return "good";
    if (num < -threshold) return "bad";
    return "neutral";
}

export function classifyDeltaForMetric(value, metric = {}) {
    const num = Number(value);

    if (!Number.isFinite(num)) return "neutral";

    const role = String(metric?.compareRole || "").toLowerCase();
    const higher = metric?.higherIsBetter;

    if (role === "neutral_signal" || higher === "context") {
        return "neutral";
    }

    if (higher === false) {
        return num < 0 ? "good" : num > 0 ? "bad" : "neutral";
    }

    return classifyDelta(num);
}

export function deltaSign(value = 0) {
    const num = Number(value);
    if (!Number.isFinite(num) || num === 0) return 0;
    return num > 0 ? 1 : -1;
}

function trimFixed(value, precision = 2) {
    const num = Number(value || 0);

    if (!Number.isFinite(num)) return "0";
    if (precision <= 0) return String(Math.round(num));

    return num
        .toFixed(precision)
        .replace(/\.?0+$/, "");
}

export default {
    formatDelta,
    formatPercentDelta,
    buildDeltaDisplay,
    classifyDelta,
    classifyDeltaForMetric,
    deltaSign
};
