"use strict";

/**
 * SAFE UTILITY ENGINE
 * Defensive helpers used across the whole app.
 */

import {
    parseNumber
} from "./math.js";

/* --------------------------------------------------
   SAFE GET
-------------------------------------------------- */

export function safeGet(obj, path, fallback = null) {

    if (!obj || !path) {
        return fallback;
    }

    const keys =
        Array.isArray(path)
            ? path
            : String(path).split(".");

    let current = obj;

    for (const key of keys) {

        if (current == null) {
            return fallback;
        }

        current = current[key];
    }

    return current ?? fallback;
}

/* --------------------------------------------------
   SAFE NUMBER
-------------------------------------------------- */

export function safeNumber(value, fallback = 0) {

    const num = parseNumber(value);

    return Number.isFinite(num)
        ? num
        : fallback;
}

/* --------------------------------------------------
   SAFE ARRAY
-------------------------------------------------- */

export function safeArray(value) {

    return Array.isArray(value)
        ? value
        : [];
}

/* --------------------------------------------------
   SAFE OBJECT
-------------------------------------------------- */

export function safeObject(value) {

    return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
}

/* --------------------------------------------------
   SAFE CLONE
-------------------------------------------------- */

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

/* --------------------------------------------------
   SAFE STRING
-------------------------------------------------- */

export function safeString(value, fallback = "") {

    if (value == null) {
        return fallback;
    }

    return String(value);
}

/* --------------------------------------------------
   SAFE BOOLEAN
-------------------------------------------------- */

export function safeBool(value) {

    return Boolean(value);
}

/* --------------------------------------------------
   HTML ESCAPE
-------------------------------------------------- */

export function escapeHTML(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}