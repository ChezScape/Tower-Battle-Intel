"use strict";

/**
 * MATH UTILITIES
 * Shared numeric helpers for parser, compute, compare, trend, AI.
 *
 * Uses The Tower case-sensitive number notation:
 *
 * K = 1e3
 * M = 1e6
 * B = 1e9
 * T = 1e12
 * q = 1e15
 * Q = 1e18
 * s = 1e21
 * S = 1e24
 * O = 1e27
 * N = 1e30
 * D = 1e33
 *
 * Important:
 * q !== Q
 * s !== S
 */

import {
    parseTowerNumber,
    formatTowerNumber,
    isTowerNumberLike
} from "../game/numberNotation.js";

/* --------------------------------------------------
   BASIC HELPERS
-------------------------------------------------- */

export function clamp(value, min = 0, max = 1) {

    const num =
        safeNumber(value);

    return Math.max(
        min,
        Math.min(max, num)
    );
}

export function sum(values = []) {

    if (!Array.isArray(values)) {
        return 0;
    }

    return values.reduce(
        (total, value) =>
            total + safeNumber(value),
        0
    );
}

export function avg(values = []) {

    if (!Array.isArray(values) || !values.length) {
        return 0;
    }

    return sum(values) / values.length;
}

export function min(values = []) {

    const nums =
        toNumberArray(values);

    return nums.length
        ? Math.min(...nums)
        : 0;
}

export function max(values = []) {

    const nums =
        toNumberArray(values);

    return nums.length
        ? Math.max(...nums)
        : 0;
}

export function median(values = []) {

    const nums =
        toNumberArray(values)
            .sort((a, b) => a - b);

    if (!nums.length) {
        return 0;
    }

    const middle =
        Math.floor(nums.length / 2);

    if (nums.length % 2) {
        return nums[middle];
    }

    return (
        nums[middle - 1] +
        nums[middle]
    ) / 2;
}

export function safeDiv(a, b, fallback = 0) {

    const left =
        safeNumber(a);

    const right =
        safeNumber(b);

    if (right === 0) {
        return fallback;
    }

    const result =
        left / right;

    return Number.isFinite(result)
        ? result
        : fallback;
}

/* --------------------------------------------------
   NUMBER PARSING
-------------------------------------------------- */

export function parseNumber(value) {

    return parseTowerNumber(value);
}

export function toNumber(value) {

    return parseNumber(value);
}

export function safeNumber(value, fallback = 0) {

    const parsed =
        parseNumber(value);

    if (Number.isFinite(parsed)) {
        return parsed;
    }

    const raw =
        Number(value);

    return Number.isFinite(raw)
        ? raw
        : fallback;
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
   NUMBER FORMAT
-------------------------------------------------- */

export function formatNumber(value, precision = 2) {

    return formatTowerNumber(
        value,
        precision
    );
}

/* --------------------------------------------------
   PERCENT CHANGE
-------------------------------------------------- */

export function pctChange(a, b) {

    const start =
        parseNumber(a);

    const end =
        parseNumber(b);

    if (start === 0) {
        return end === 0
            ? 0
            : 100;
    }

    return ((end - start) / Math.abs(start)) * 100;
}

export function percentChange(a, b) {

    return pctChange(a, b);
}

/* --------------------------------------------------
   DIFF MODEL
-------------------------------------------------- */

export function diffNumbers(a, b) {

    const valA =
        parseNumber(a);

    const valB =
        parseNumber(b);

    const diff =
        valB - valA;

    const pct =
        pctChange(valA, valB);

    return {
        a: valA,
        b: valB,
        diff,
        pct,
        direction:
            diff > 0
                ? "up"
                : diff < 0
                ? "down"
                : "flat"
    };
}

export function getDirection(value) {

    const num =
        safeNumber(value);

    if (num > 0) {
        return "up";
    }

    if (num < 0) {
        return "down";
    }

    return "flat";
}

/* --------------------------------------------------
   NORMALISATION / RATIOS
-------------------------------------------------- */

export function normalise(value, minValue = 0, maxValue = 1) {

    const num =
        safeNumber(value);

    const minNum =
        safeNumber(minValue);

    const maxNum =
        safeNumber(maxValue);

    if (maxNum === minNum) {
        return 0;
    }

    return clamp(
        (num - minNum) / (maxNum - minNum),
        0,
        1
    );
}

export function ratio(part, total) {

    return safeDiv(part, total, 0);
}

export function percent(part, total) {

    return ratio(part, total) * 100;
}

/* --------------------------------------------------
   VALIDATION
-------------------------------------------------- */

export function isNumber(value) {

    if (typeof value === "number") {
        return Number.isFinite(value);
    }

    return isTowerNumberLike(value);
}

export function isPositive(value) {

    return parseNumber(value) > 0;
}

export function isZero(value) {

    return parseNumber(value) === 0;
}

/* --------------------------------------------------
   ROUNDING
-------------------------------------------------- */

export function round(value, places = 2) {

    const num =
        safeNumber(value);

    const factor =
        Math.pow(10, places);

    return Math.round(num * factor) / factor;
}

export function floor(value) {

    return Math.floor(
        safeNumber(value)
    );
}

export function ceil(value) {

    return Math.ceil(
        safeNumber(value)
    );
}
