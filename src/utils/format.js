"use strict";

/**
 * SHARED FORMAT ENGINE
 * Used by core, pipeline, diagnostics, and utility helpers.
 */

import {
    formatTowerNumber,
    formatTowerDelta
} from "../game/numberNotation.js";

/* --------------------------------------------------
   NUMBER FORMAT
-------------------------------------------------- */

export function formatNumber(value, precision = 2) {
    return formatTowerNumber(value, precision);
}

/* --------------------------------------------------
   DELTA FORMAT
-------------------------------------------------- */

export function formatDelta(value, options = {}) {

    const {
        precision = 2,
        signed = true
    } = options;

    const num =
        Number(value || 0);

    if (!Number.isFinite(num)) {
        return "0";
    }

    if (!signed) {
        return formatTowerNumber(num, precision);
    }

    return formatTowerDelta(num, precision);
}

/* --------------------------------------------------
   PERCENT FORMAT
-------------------------------------------------- */

export function formatPercent(value, precision = 1) {

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
   TIME FORMAT
-------------------------------------------------- */

export function formatTime(seconds = 0) {

    let total =
        Math.floor(Number(seconds || 0));

    if (!Number.isFinite(total) || total <= 0) {
        return "0s";
    }

    const d =
        Math.floor(total / 86400);

    total %= 86400;

    const h =
        Math.floor(total / 3600);

    total %= 3600;

    const m =
        Math.floor(total / 60);

    const s =
        total % 60;

    const out = [];

    if (d) out.push(`${d}d`);
    if (h) out.push(`${h}h`);
    if (m) out.push(`${m}m`);
    if (s) out.push(`${s}s`);

    return out.join(" ");
}

/* --------------------------------------------------
   LABEL FORMAT
-------------------------------------------------- */

export function formatLabel(value = "") {

    return String(value || "")
        .replace(/^section\./i, "")
        .replace(/^core\./i, "")
        .replace(/^stats\./i, "")
        .replace(/\./g, " ")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, char => char.toUpperCase());
}

/* --------------------------------------------------
   SAFE TEXT
-------------------------------------------------- */

export function safeText(value, fallback = "-") {

    if (value == null || value === "") {
        return fallback;
    }

    return String(value);
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

export function escapeAttr(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

function trimFixed(value, precision = 1) {

    const num =
        Number(value || 0);

    if (!Number.isFinite(num)) {
        return "0";
    }

    return num
        .toFixed(precision)
        .replace(/\.?0+$/, "");
}

export default {
    formatNumber,
    formatDelta,
    formatPercent,
    formatTime,
    formatLabel,
    safeText,
    escapeHTML,
    escapeAttr
};