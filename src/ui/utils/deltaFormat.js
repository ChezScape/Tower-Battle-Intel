"use strict";

/**
 * DELTA FORMAT ENGINE
 * Shared UI delta formatting + severity helpers.
 */

import {
    formatTowerDelta,
    formatTowerNumber
} from "../../game/numberNotation.js";

/* --------------------------------------------------
   MAIN FORMATTER
-------------------------------------------------- */

export function formatDelta(value, options = {}) {

    const {
        precision = 2,
        signed = true,
        compact = false
    } = options;

    const num =
        Number(value);

    if (!Number.isFinite(num)) {
        return "0";
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

    if (signed && num > 0) {
        return `+${formatted}`;
    }

    return formatted;
}

/* --------------------------------------------------
   PERCENT
-------------------------------------------------- */

export function formatPercentDelta(value, precision = 1) {

    if (value == null) {
        return "from near zero";
    }

    const num =
        Number(value);

    if (!Number.isFinite(num)) {
        return "0%";
    }

    const sign =
        num > 0
            ? "+"
            : "";

    return `${sign}${trimFixed(num, precision)}%`;
}

/* --------------------------------------------------
   DISPLAY OBJECT
-------------------------------------------------- */

export function buildDeltaDisplay(diffData = {}) {

    return {
        raw:
            diffData?.diff ?? 0,

        formatted:
            formatDelta(diffData?.diff, {
                compact: true
            }),

        percent:
            formatPercentDelta(diffData?.pct),

        severity:
            classifyDelta(diffData?.diff)
    };
}

/* --------------------------------------------------
   CLASSIFIER
-------------------------------------------------- */

export function classifyDelta(value, threshold = 0) {

    const num =
        Number(value);

    if (!Number.isFinite(num)) {
        return "neutral";
    }

    if (num > threshold) {
        return "good";
    }

    if (num < -threshold) {
        return "bad";
    }

    return "neutral";
}

/* --------------------------------------------------
   INTERNAL
-------------------------------------------------- */

function trimFixed(value, precision = 2) {

    const num =
        Number(value || 0);

    if (!Number.isFinite(num)) {
        return "0";
    }

    if (precision <= 0) {
        return String(Math.round(num));
    }

    return num
        .toFixed(precision)
        .replace(/\.?0+$/, "");
}

export default {
    formatDelta,
    formatPercentDelta,
    buildDeltaDisplay,
    classifyDelta
};