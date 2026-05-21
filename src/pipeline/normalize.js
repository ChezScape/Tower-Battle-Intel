"use strict";

/**
 * PIPELINE NORMALIZE v4.10d
 * Shared parser/compare normalisation layer.
 */

import {
    normaliseReportKey,
    normaliseReportSection,
    resolveBattleReportAlias,
    formatReportLabel
} from "../game/battleReportAliases.js";

import {
    parseNumber
} from "../utils/math.js";

import {
    parseTimeToSeconds
} from "../utils/timeEngine.js";

export function normalizeKey(key = "") {
    return resolveBattleReportAlias(key);
}

export function normaliseKey(key = "") {
    return normalizeKey(key);
}

export function normalizeSection(section = "") {
    return normaliseReportSection(section);
}

export function normaliseSection(section = "") {
    return normalizeSection(section);
}

export function normalizeValue(value = "") {
    if (value == null) {
        return "";
    }

    return String(value)
        .replace(/\u00a0/g, " ")
        .trim();
}

export function normalizeLine(line = "") {
    return String(line || "")
        .replace(/\r/g, "")
        .replace(/\u00a0/g, " ")
        .trim();
}

export function normaliseLine(line = "") {
    return normalizeLine(line);
}

export function normalizeLabel(value = "") {
    return formatReportLabel(value);
}

export function valueToNumber(value, fallback = 0) {
    const text = normalizeValue(value);

    if (!text) {
        return fallback;
    }

    const time = parseTimeToSeconds(text);
    if (time > 0 && /\d\s*(?:d|h|m|s)\b|^\d{1,3}:\d{2}(?::\d{2})?$/i.test(text)) {
        return time;
    }

    return parseNumber(text, fallback);
}

export function normalizeRecord(record = {}) {
    return Object.entries(record || {}).reduce((out, [key, value]) => {
        out[normalizeKey(key)] = normalizeValue(value);
        return out;
    }, {});
}

export default {
    normalizeKey,
    normaliseKey,
    normalizeSection,
    normaliseSection,
    normalizeValue,
    normalizeLine,
    normaliseLine,
    normalizeLabel,
    valueToNumber,
    normalizeRecord
};
