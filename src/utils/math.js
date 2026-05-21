"use strict";

/**
 * SHARED MATH ENGINE v4.10b
 *
 * One safe numeric layer for parser, compute, compare, trend and tests.
 * Keeps The Tower case-sensitive notation delegated to src/game/numberNotation.js.
 */

import {
    parseTowerNumber,
    formatTowerNumber,
    isTowerNumberLike
} from "../game/numberNotation.js";

/* --------------------------------------------------
   PARSING / COERCION
-------------------------------------------------- */

export function parseNumber(value, fallback = 0) {
    const parsed = parseTowerNumber(value);

    if (Number.isFinite(parsed)) {
        return parsed;
    }

    const raw = Number(value);
    return Number.isFinite(raw) ? raw : fallback;
}

export function toNumber(value, fallback = 0) {
    return parseNumber(value, fallback);
}

export function safeNumber(value, fallback = 0) {
    return parseNumber(value, fallback);
}

export function isNumber(value) {
    if (typeof value === "number") {
        return Number.isFinite(value);
    }

    return isTowerNumberLike(value) || Number.isFinite(Number(value));
}

export function toNumberArray(values = []) {
    if (!Array.isArray(values)) {
        return [];
    }

    return values
        .map(value => safeNumber(value, NaN))
        .filter(Number.isFinite);
}

/* --------------------------------------------------
   BASIC HELPERS
-------------------------------------------------- */

export function clamp(value, min = 0, max = 1) {
    const num = safeNumber(value);
    const low = safeNumber(min);
    const high = safeNumber(max);

    if (high < low) {
        return Math.max(high, Math.min(low, num));
    }

    return Math.max(low, Math.min(high, num));
}

export function sum(values = []) {
    return toNumberArray(values)
        .reduce((total, value) => total + value, 0);
}

export function avg(values = []) {
    const nums = toNumberArray(values);
    return nums.length ? sum(nums) / nums.length : 0;
}

export function min(values = []) {
    const nums = toNumberArray(values);
    return nums.length ? Math.min(...nums) : 0;
}

export function max(values = []) {
    const nums = toNumberArray(values);
    return nums.length ? Math.max(...nums) : 0;
}

export function median(values = []) {
    const nums = toNumberArray(values).sort((a, b) => a - b);

    if (!nums.length) {
        return 0;
    }

    const middle = Math.floor(nums.length / 2);

    return nums.length % 2
        ? nums[middle]
        : (nums[middle - 1] + nums[middle]) / 2;
}

export function safeDiv(a, b, fallback = 0) {
    const left = safeNumber(a);
    const right = safeNumber(b);

    if (!right) {
        return fallback;
    }

    const result = left / right;
    return Number.isFinite(result) ? result : fallback;
}

export function ratio(part, total, fallback = 0) {
    return safeDiv(part, total, fallback);
}

export function percent(part, total, fallback = 0) {
    return safeDiv(part, total, fallback) * 100;
}

export function normalise(value, minValue = 0, maxValue = 1) {
    const low = safeNumber(minValue);
    const high = safeNumber(maxValue);

    if (high === low) {
        return 0;
    }

    return clamp((safeNumber(value) - low) / (high - low), 0, 1);
}

export function normalize(value, minValue = 0, maxValue = 1) {
    return normalise(value, minValue, maxValue);
}

/* --------------------------------------------------
   DELTAS / PERCENT CHANGE
-------------------------------------------------- */

export function pctChange(a, b) {
    const start = safeNumber(a);
    const end = safeNumber(b);

    if (start === 0) {
        return end === 0 ? 0 : 100;
    }

    const result = ((end - start) / Math.abs(start)) * 100;
    return Number.isFinite(result) ? result : 0;
}

export function percentChange(a, b) {
    return pctChange(a, b);
}

export function diffNumbers(a, b) {
    const valA = safeNumber(a);
    const valB = safeNumber(b);
    const diff = valB - valA;

    return {
        a: valA,
        b: valB,
        diff,
        pct: pctChange(valA, valB),
        direction: getDirection(diff)
    };
}

export function getDirection(value) {
    const num = safeNumber(value);

    if (num > 0) return "up";
    if (num < 0) return "down";
    return "flat";
}

export function compareNumbers(a, b) {
    return diffNumbers(a, b);
}

/* --------------------------------------------------
   ROUNDING / VALIDATION
-------------------------------------------------- */

export function round(value, places = 2) {
    const factor = 10 ** Math.max(0, safeNumber(places, 0));
    return Math.round(safeNumber(value) * factor) / factor;
}

export function floor(value) {
    return Math.floor(safeNumber(value));
}

export function ceil(value) {
    return Math.ceil(safeNumber(value));
}

export function isPositive(value) {
    return safeNumber(value) > 0;
}

export function isNegative(value) {
    return safeNumber(value) < 0;
}

export function isZero(value) {
    return safeNumber(value) === 0;
}

/* --------------------------------------------------
   FORMAT
-------------------------------------------------- */

export function formatNumber(value, precision = 2) {
    return formatTowerNumber(value, precision);
}

export default {
    parseNumber,
    toNumber,
    safeNumber,
    isNumber,
    toNumberArray,
    clamp,
    sum,
    avg,
    min,
    max,
    median,
    safeDiv,
    ratio,
    percent,
    normalise,
    normalize,
    pctChange,
    percentChange,
    diffNumbers,
    compareNumbers,
    getDirection,
    round,
    floor,
    ceil,
    isPositive,
    isNegative,
    isZero,
    formatNumber
};
