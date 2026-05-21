"use strict";

/**
 * NORMALIZATION UTILITIES
 * Used by parser.js
 */

/* --------------------------------------------------
   KEY NORMALIZATION
-------------------------------------------------- */

export function normalizeKey(key = "") {

    return String(key)
        .trim()
        .toLowerCase()
        .replace(/\$/g, "")
        .replace(/%/g, "percent")
        .replace(/\s*\/\s*/g, "_")
        .replace(/[:()]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/__+/g, "_")
        .replace(/^_+|_+$/g, "");
}

/* --------------------------------------------------
   VALUE NORMALIZATION
-------------------------------------------------- */

export function normalizeValue(value = "") {

    if (value == null) {
        return "";
    }

    const str = String(value).trim();

    // numeric cleanup
    const cleaned = str.replace(/,/g, "");

    // preserve time strings
    if (
        /\d+\s*d/i.test(str) ||
        /\d+\s*h/i.test(str) ||
        /\d+\s*m/i.test(str) ||
        /\d+\s*s/i.test(str)
    ) {
        return str;
    }

    const num = Number(cleaned);

    return Number.isFinite(num)
        ? num
        : str;
}