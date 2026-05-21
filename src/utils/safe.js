"use strict";

/**
 * SAFE UTILITY ENGINE v4.10b
 * Defensive helpers with no browser dependency.
 */

import {
    parseNumber
} from "./math.js";

export function safeGet(obj, path, fallback = null) {
    if (!obj || !path) {
        return fallback;
    }

    const keys = Array.isArray(path)
        ? path
        : String(path).split(".").filter(Boolean);

    let current = obj;

    for (const key of keys) {
        if (current == null || typeof current !== "object" || !(key in current)) {
            return fallback;
        }

        current = current[key];
    }

    return current ?? fallback;
}

export function safeSet(obj, path, value) {
    if (!obj || !path) {
        return obj;
    }

    const keys = Array.isArray(path)
        ? path
        : String(path).split(".").filter(Boolean);

    if (!keys.length) {
        return obj;
    }

    let current = obj;

    keys.slice(0, -1).forEach(key => {
        if (!current[key] || typeof current[key] !== "object") {
            current[key] = {};
        }

        current = current[key];
    });

    current[keys[keys.length - 1]] = value;
    return obj;
}

export function safeNumber(value, fallback = 0) {
    const num = parseNumber(value, NaN);
    return Number.isFinite(num) ? num : fallback;
}

export function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

export function safeObject(value) {
    return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
}

export function safeClone(value) {
    try {
        if (typeof structuredClone === "function") {
            return structuredClone(value);
        }

        return JSON.parse(JSON.stringify(value));
    } catch {
        return value;
    }
}

export function safeString(value, fallback = "") {
    if (value == null) {
        return fallback;
    }

    return String(value);
}

export function safeBool(value) {
    return Boolean(value);
}

export function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function escapeAttr(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function tryOrFallback(fn, fallback = null) {
    try {
        return typeof fn === "function" ? fn() : fallback;
    } catch {
        return fallback;
    }
}

export default {
    safeGet,
    safeSet,
    safeNumber,
    safeArray,
    safeObject,
    safeClone,
    safeString,
    safeBool,
    escapeHTML,
    escapeAttr,
    tryOrFallback
};
