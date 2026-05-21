"use strict";

import {
    formatNumber,
    formatTime,
    formatLabel,
    escapeHTML,
    escapeAttr
} from "../utils/format.js";

import {
    formatDelta,
    formatPercentDelta
} from "../utils/deltaFormat.js";

import {
    getMetricInfo,
    getMetricPriorityInfo
} from "../../game/index.js";

export {
    formatNumber,
    formatTime,
    formatLabel,
    escapeHTML,
    escapeAttr,
    formatDelta,
    formatPercentDelta
};

export function normaliseViewState(state = {}) {
    const compare = state.compareData || {};

    return {
        runA: state.runA || null,
        runB: state.runB || null,
        history: Array.isArray(state.history) ? state.history : [],
        insights: Array.isArray(state.insights) ? state.insights : [],
        ai: Array.isArray(state.ai) ? state.ai : [],
        anomalies: Array.isArray(state.anomalies) ? state.anomalies : [],
        trend: state.trend || {},
        compare,
        core: compare.core || {},
        stats: compare.stats || {},
        sections: compare.sections || {},
        summary: compare.summary || {},
        ui: state.ui || {}
    };
}

export function sectionRows(section) {
    if (!section || typeof section !== "object") {
        return [];
    }

    return Object.entries(section)
        .filter(([, data]) => data && typeof data === "object" && data.numeric !== false)
        .sort((a, b) => {
            const pa = priorityWeight(a[0]);
            const pb = priorityWeight(b[0]);

            if (pa !== pb) {
                return pb - pa;
            }

            return Math.abs(Number(b[1]?.diff || 0)) - Math.abs(Number(a[1]?.diff || 0));
        })
        .map(([key, data]) => ({ key, data }));
}

export function sectionTotal(section) {
    return sectionRows(section)
        .reduce((sum, row) => sum + Number(row.data?.diff || 0), 0);
}

export function mergeSections(sections = {}, keys = []) {
    return keys.reduce((merged, key) => ({
        ...merged,
        ...(sections?.[key] || {})
    }), {});
}

export function firstExisting(section = {}, keys = []) {
    for (const key of keys) {
        if (section?.[key]) {
            return section[key];
        }
    }

    return sectionRows(section)[0]?.data || null;
}

export function toneFromDiffData(data = {}) {
    const role = getMetricInfo(data?.key || "")?.compareRole;

    if (role === "lower_is_better") {
        const diff = Number(data?.diff || 0);
        if (diff > 0) return "bad";
        if (diff < 0) return "good";
        return "neutral";
    }

    if (role === "neutral_signal") {
        return "neutral";
    }

    const outcome = String(data?.outcome || "").toLowerCase();

    if (["good", "positive", "better"].includes(outcome)) return "good";
    if (["bad", "negative", "worse"].includes(outcome)) return "bad";

    const diff = Number(data?.diff || 0);
    if (diff > 0) return "good";
    if (diff < 0) return "bad";
    return "neutral";
}

export function toneFromGeneric(item = {}) {
    const level = String(item.level || item.tone || item.type || item.outcome || "").toLowerCase();

    if (["good", "positive", "success", "pass"].includes(level)) return "good";
    if (["bad", "negative", "danger", "warning", "warn", "fail"].includes(level)) return "bad";
    return "neutral";
}

export function metricRow(row) {
    const data = { ...(row.data || {}), key: row.key };
    const tone = toneFromDiffData(data);
    const info = getMetricInfo(row.key);

    return `
        <div class="tbi-metric-row ${escapeAttr(tone)}" title="${escapeAttr(info.meaning || "")}">
            <span>${escapeHTML(info.label || formatLabel(row.key))}</span>
            <span>${escapeHTML(formatNumber(data.a || 0))}</span>
            <span>${escapeHTML(formatNumber(data.b || 0))}</span>
            <strong>${escapeHTML(formatDelta(data.diff || 0, { compact: true }))}</strong>
        </div>
    `;
}

export function buildMetricRows(section, { limit = 8, showHeader = false } = {}) {
    const rows = sectionRows(section).slice(0, limit);

    if (!rows.length) {
        return `<p class="tbi-muted">No comparison data yet.</p>`;
    }

    return `
        <div class="tbi-metric-table">
            ${showHeader ? `
                <div class="tbi-metric-row header">
                    <span>Metric</span><span>A</span><span>B</span><span>B - A</span>
                </div>
            ` : ""}
            ${rows.map(metricRow).join("")}
        </div>
    `;
}

export function miniStat(label, value, tone = "neutral") {
    return `
        <div class="tbi-mini-stat ${escapeAttr(tone)}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
        </div>
    `;
}

export function compactPercent(value) {
    return formatPercentDelta(value == null ? 0 : value);
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function priorityWeight(key = "") {
    const priority = getMetricPriorityInfo(key)?.level || "normal";
    if (priority === "primary") return 3;
    if (priority === "secondary") return 2;
    if (priority === "detail") return 1;
    return 0;
}
