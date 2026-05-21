"use strict";

/**
 * COLOUR SCALE ENGINE
 * Central heatmap, badge and severity logic.
 */

export const SEVERITY_ORDER = Object.freeze({
    bad: -1,
    neutral: 0,
    good: 1,
    warn: 2,
    info: 3
});

export function getSeverityClass(value, threshold = 0) {
    const num = Number(value);

    if (!Number.isFinite(num)) return "neutral";
    if (num > threshold) return "good";
    if (num < -threshold) return "bad";
    return "neutral";
}

export function getInverseSeverityClass(value, threshold = 0) {
    const cls = getSeverityClass(value, threshold);
    if (cls === "good") return "bad";
    if (cls === "bad") return "good";
    return cls;
}

export function getHeatIntensity(value, max = 100) {
    const num = Math.abs(Number(value) || 0);
    const safeMax = Math.max(Math.abs(Number(max) || 1), 1);

    if (!Number.isFinite(num)) return 0;
    return clamp(num / safeMax, 0, 1);
}

export function getHeatStyle(value, max = 100, options = {}) {
    const severity = options.inverse
        ? getInverseSeverityClass(value, options.threshold ?? 0)
        : getSeverityClass(value, options.threshold ?? 0);

    const intensity = getHeatIntensity(value, max);

    return {
        severity,
        tone: severity,
        intensity,
        opacity: 0.08 + intensity * 0.42,
        style: `--heat-opacity:${(0.08 + intensity * 0.42).toFixed(3)};--heat-intensity:${intensity.toFixed(3)};`
    };
}

export function getSectionScore(values = {}) {
    const diffs = getFiniteDiffs(values);
    if (!diffs.length) return 0;
    return diffs.reduce((sum, value) => sum + value, 0) / diffs.length;
}

export function getSectionMagnitude(values = {}) {
    const diffs = getFiniteDiffs(values).map(Math.abs);
    if (!diffs.length) return 0;
    return diffs.reduce((sum, value) => sum + value, 0) / diffs.length;
}

export function getSectionMaxMagnitude(values = {}) {
    const diffs = getFiniteDiffs(values).map(Math.abs);
    return diffs.length ? Math.max(...diffs) : 0;
}

export function getDeltaClass(value, threshold = 0) {
    return getSeverityClass(value, threshold);
}

export function getToneClass(value, threshold = 0) {
    return getSeverityClass(value, threshold);
}

export function heatCSSVariables(value, max = 100) {
    const heat = getHeatStyle(value, max);
    return heat.style;
}

function getFiniteDiffs(values = {}) {
    return Object.values(values || {})
        .map(item => Number(item?.diff ?? item ?? 0))
        .filter(Number.isFinite);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export default {
    getSeverityClass,
    getInverseSeverityClass,
    getHeatIntensity,
    getHeatStyle,
    getSectionScore,
    getSectionMagnitude,
    getSectionMaxMagnitude,
    getDeltaClass,
    getToneClass,
    heatCSSVariables
};
