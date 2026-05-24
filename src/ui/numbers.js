"use strict";

/**
 * UI NUMBER HELPERS v4.11c
 * Thin compatibility wrapper around ui/utils/format.js.
 */

import {
    formatNumber,
    formatDelta,
    formatPercent,
    formatTime
} from "./utils/format.js";

export {
    formatNumber,
    formatDelta,
    formatPercent,
    formatTime
};

export function compact(value, precision = 2) {
    return formatNumber(value, precision);
}

export function delta(value, precision = 2) {
    return formatDelta(value, { precision, compact: true });
}

export function percent(value, precision = 1) {
    return formatPercent(value, precision);
}

export function time(value) {
    return formatTime(value);
}

export default {
    formatNumber,
    formatDelta,
    formatPercent,
    formatTime,
    compact,
    delta,
    percent,
    time
};
