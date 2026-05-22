"use strict";

/**
 * UI FORMAT ENGINE
 * One safe formatting layer for dashboard, history, modals and debug output.
 */

import {
    formatTowerNumber,
    formatTowerDelta
} from "../../game/numberNotation.js";

export function formatNumber(value, precision = 2) {
    return formatTowerNumber(toFiniteNumber(value), precision);
}

export const format = formatNumber;

export function formatDelta(value, options = {}) {

    const {
        precision = 2,
        signed = true,
        compact = true,
        zero = "0"
    } = options;

    const num = toFiniteNumber(value, null);

    if (num == null) {
        return zero;
    }

    if (compact) {
        return signed
            ? formatTowerDelta(num, precision)
            : formatTowerNumber(num, precision);
    }

    const output =
        precision <= 0
            ? String(Math.round(num))
            : trimFixed(num, precision);

    if (signed && num > 0) {
        return `+${output}`;
    }

    return output;
}

export function formatPercent(value, precision = 1) {

    if (value == null) {
        return "from near zero";
    }

    const num = toFiniteNumber(value, null);

    if (num == null) {
        return "0%";
    }

    const sign = num > 0 ? "+" : "";
    return `${sign}${trimFixed(num, precision)}%`;
}

export function formatRatio(value, precision = 2) {
    const num = toFiniteNumber(value, null);
    return num == null ? "0" : trimFixed(num, precision);
}

export function formatTime(seconds = 0) {

    let total = Math.floor(toFiniteNumber(seconds, 0));

    if (total <= 0) {
        return "0s";
    }

    const days = Math.floor(total / 86400);
    total %= 86400;

    const hours = Math.floor(total / 3600);
    total %= 3600;

    const minutes = Math.floor(total / 60);
    const secs = total % 60;

    const out = [];

    if (days) out.push(`${days}d`);
    if (hours) out.push(`${hours}h`);
    if (minutes) out.push(`${minutes}m`);
    if (secs || !out.length) out.push(`${secs}s`);

    return out.join(" ");
}

export function formatDateTime(value = "") {
    if (!value) return "Unknown date";

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
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

export function formatBuildStyle(value = "unknown") {
    const key = String(value || "unknown").trim().toLowerCase();

    const labels = {
        unknown: "Unknown",
        health_ehp: "Health / EHP",
        blender: "Blender",
        devo: "Devo",
        orb_devo: "Orb Devo",
        glass_cannon: "Glass Cannon",
        hybrid: "Hybrid"
    };

    return labels[key] || formatLabel(key);
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
    return escapeHTML(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function toFiniteNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

function trimFixed(value, precision = 2) {
    const num = toFiniteNumber(value, 0);

    if (precision <= 0) {
        return String(Math.round(num));
    }

    return num
        .toFixed(precision)
        .replace(/\.?0+$/, "");
}

export default {
    formatNumber,
    format,
    formatDelta,
    formatPercent,
    formatRatio,
    formatTime,
    formatDateTime,
    formatLabel,
    formatBuildStyle,
    safeText,
    escapeHTML,
    escapeAttr,
    toFiniteNumber
};
