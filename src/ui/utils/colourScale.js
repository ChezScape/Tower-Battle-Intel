"use strict";

/**
 * COLOUR SCALE ENGINE
 * Central heatmap severity + intensity logic
 */

/* --------------------------------------------------
   SEVERITY CLASS
-------------------------------------------------- */

export function getSeverityClass(value, threshold = 0) {

    const num = Number(value);

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
   HEAT INTENSITY
-------------------------------------------------- */

export function getHeatIntensity(value, max = 100) {

    const num =
        Math.abs(Number(value) || 0);

    const safeMax =
        Math.max(Number(max) || 1, 1);

    if (!Number.isFinite(num)) {
        return 0;
    }

    return clamp(num / safeMax, 0, 1);
}

/* --------------------------------------------------
   HEATMAP CSS STYLE DATA
-------------------------------------------------- */

export function getHeatStyle(value, max = 100) {

    const severity =
        getSeverityClass(value);

    const intensity =
        getHeatIntensity(value, max);

    return {
        severity,

        intensity,

        // used by CSS variable --heat-opacity
        opacity:
            0.08 + intensity * 0.42
    };
}

/* --------------------------------------------------
   SECTION SCORE
   Average diff across a whole section
-------------------------------------------------- */

export function getSectionScore(values = {}) {

    let total = 0;
    let count = 0;

    for (const item of Object.values(values || {})) {

        const diff =
            Number(item?.diff ?? 0);

        if (!Number.isFinite(diff)) {
            continue;
        }

        total += diff;
        count++;
    }

    return count
        ? total / count
        : 0;
}

/* --------------------------------------------------
   SECTION MAGNITUDE
   Useful for stronger/larger heatmap scaling
-------------------------------------------------- */

export function getSectionMagnitude(values = {}) {

    let total = 0;
    let count = 0;

    for (const item of Object.values(values || {})) {

        const diff =
            Math.abs(Number(item?.diff ?? 0));

        if (!Number.isFinite(diff)) {
            continue;
        }

        total += diff;
        count++;
    }

    return count
        ? total / count
        : 0;
}

/* --------------------------------------------------
   DRILLDOWN CLASS
-------------------------------------------------- */

export function getDeltaClass(value, threshold = 0) {

    return getSeverityClass(value, threshold);
}

/* --------------------------------------------------
   INTERNAL CLAMP
-------------------------------------------------- */

function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );
}