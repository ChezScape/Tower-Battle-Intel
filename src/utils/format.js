"use strict";

/**
 * SHARED FORMAT ENGINE v4.10b
 * Shared by non-UI modules plus older UI compatibility imports.
 */

import {
    formatTowerNumber,
    formatTowerDelta
} from "../game/numberNotation.js";

import {
    safeNumber
} from "./math.js";

export function formatNumber(value, precision = 2) {
    return formatTowerNumber(value, precision);
}

export function formatCompactNumber(value, precision = 2) {
    return formatNumber(value, precision);
}

export function formatDelta(value, options = {}) {
    const {
        precision = 2,
        signed = true,
        compact = false
    } = options;

    const num = safeNumber(value);

    if (!signed) {
        return formatTowerNumber(Math.abs(num), precision);
    }

    return compact
        ? formatTowerDelta(num, precision)
        : formatTowerDelta(num, precision);
}

export function formatPercent(value, precision = 1, { signed = true } = {}) {
    if (value == null) {
        return "from near zero";
    }

    const num = Number(value);

    if (!Number.isFinite(num)) {
        return "0%";
    }

    const sign = signed && num > 0 ? "+" : "";
    return `${sign}${trimFixed(num, precision)}%`;
}

export function formatPercentDelta(value, precision = 1) {
    return formatPercent(value, precision, { signed: true });
}

export function formatTime(seconds = 0) {
    let total = Math.floor(safeNumber(seconds));

    if (!Number.isFinite(total) || total <= 0) {
        return "0s";
    }

    const d = Math.floor(total / 86400);
    total %= 86400;
    const h = Math.floor(total / 3600);
    total %= 3600;
    const m = Math.floor(total / 60);
    const s = total % 60;

    const out = [];
    if (d) out.push(`${d}d`);
    if (h) out.push(`${h}h`);
    if (m) out.push(`${m}m`);
    if (s || !out.length) out.push(`${s}s`);

    return out.join(" ");
}

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

export function safeText(value, fallback = "-") {
    if (value == null || value === "") {
        return fallback;
    }

    return String(value);
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

export function truncateText(value = "", maxLength = 80) {
    const text = safeText(value, "");
    const max = Math.max(0, Number(maxLength) || 0);

    return text.length > max
        ? `${text.slice(0, Math.max(0, max - 1))}…`
        : text;
}

function trimFixed(value, precision = 1) {
    const num = Number(value || 0);

    if (!Number.isFinite(num)) {
        return "0";
    }

    return num
        .toFixed(Math.max(0, precision))
        .replace(/\.?0+$/, "");
}

export default {
    formatNumber,
    formatCompactNumber,
    formatDelta,
    formatPercent,
    formatPercentDelta,
    formatTime,
    formatLabel,
    safeText,
    escapeHTML,
    escapeAttr,
    truncateText
};
