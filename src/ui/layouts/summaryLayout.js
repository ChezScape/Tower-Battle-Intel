"use strict";

/**
 * SUMMARY LAYOUT
 * Strategic diagnostics summary.
 */

import {
    formatNumber,
    formatLabel,
    escapeHTML
} from "../utils/format.js";

import {
    formatDelta,
    formatPercentDelta
} from "../utils/deltaFormat.js";

/* --------------------------------------------------
   BUILD SUMMARY
-------------------------------------------------- */

export function buildSummary({
    summary = {},
    core = {},
    stats = {},
    trend = {},
    anomalies = []
} = {}) {

    return `
        <section class="wa-panel">

            <div class="wa-title">
                System Diagnostics
            </div>

            <div class="wa-summary-grid">

                ${summaryBlock(
                    "Strongest Gain",
                    summary?.strongestGain
                )}

                ${summaryBlock(
                    "Biggest Loss",
                    summary?.weakestLoss
                )}

                ${summaryBlock(
                    "Biggest Swing",
                    summary?.biggestSwing
                )}

                ${trendBlock(trend)}

                ${coreBlock(core, stats)}

                ${anomalyBlock(anomalies)}

            </div>

            ${compareIntelligencePanel(summary)}

        </section>
    `;
}

/* --------------------------------------------------
   OLD COMPATIBILITY ALIAS
-------------------------------------------------- */

export function Summary(summary = {}) {
    return buildSummary({ summary });
}

/* --------------------------------------------------
   SUMMARY BLOCK
-------------------------------------------------- */

function summaryBlock(title, item) {

    if (
        !item ||
        item.numeric === false ||
        item.diff == null
    ) {

        return `
            <div class="wa-summary neutral">

                <div class="wa-subtitle">
                    ${escapeHTML(title)}
                </div>

                <div class="wa-path">
                    No data
                </div>

            </div>
        `;
    }

    const diff =
        Number(item.diff || 0);

    const cls =
        outcomeClass(item) || deltaClass(diff);

    return `
        <div class="wa-summary ${cls}">

            <div class="wa-subtitle">
                ${escapeHTML(title)}
            </div>

            <div class="wa-path">
                ${escapeHTML(formatLabel(item.path || "-"))}
            </div>

            <div class="wa-value">
                ${escapeHTML(formatDelta(diff, {
                    compact: true
                }))}
            </div>

            <div class="wa-muted">
                ${escapeHTML(formatPercentDelta(item.pct))}
            </div>

        </div>
    `;
}


/* --------------------------------------------------
   COMPARE INTELLIGENCE PANEL
-------------------------------------------------- */

function compareIntelligencePanel(summary = {}) {

    const farming =
        summary?.farming ||
        summary?.farmingVerdict ||
        null;

    const topGains =
        Array.isArray(summary?.topGains)
            ? summary.topGains
            : [];

    const topLosses =
        Array.isArray(summary?.topLosses)
            ? summary.topLosses
            : [];

    const categoryScores =
        summary?.categoryScores && typeof summary.categoryScores === "object"
            ? summary.categoryScores
            : {};

    if (
        !farming &&
        topGains.length === 0 &&
        topLosses.length === 0 &&
        Object.keys(categoryScores).length === 0
    ) {
        return "";
    }

    return `
        <div class="wa-intel-shell" data-compare-intel-grid="true">

            <div class="wa-intel-header">

                <div>
                    <div class="wa-title wa-title-small">
                        Compare Intelligence
                    </div>

                    <div class="wa-sub">
                        Game-aware readout from the smarter B - A compare brain.
                    </div>
                </div>

                ${farmingVerdictCard(farming)}

            </div>

            ${categoryScoreGrid(categoryScores)}

            <div class="wa-intel-lists">
                ${topList("Top Gains", topGains, "good", "data-compare-top-gains")}
                ${topList("Top Losses", topLosses, "bad", "data-compare-top-losses")}
            </div>

        </div>
    `;
}

function farmingVerdictCard(farming = null) {

    if (!farming) {
        return `
            <div class="wa-farming-verdict neutral" data-compare-farming-verdict="true">
                <div class="wa-mini-label">Farming Verdict</div>
                <div class="wa-mini-value">Waiting</div>
                <div class="wa-mini-note">No verdict yet</div>
            </div>
        `;
    }

    const verdict =
        String(farming.verdict || "mixed");

    const cls =
        verdict === "better_farm"
            ? "good"
            : verdict === "worse_farm"
                ? "bad"
                : "neutral";

    const label =
        verdict === "better_farm"
            ? "Better Farm"
            : verdict === "worse_farm"
                ? "Worse Farm"
                : "Mixed Farm";

    return `
        <div class="wa-farming-verdict ${cls}" data-compare-farming-verdict="true">
            <div class="wa-mini-label">Farming Verdict</div>
            <div class="wa-mini-value">${escapeHTML(label)}</div>
            <div class="wa-mini-note">${escapeHTML(farming.headline || "Rate-first farming judgement")}</div>
        </div>
    `;
}

function categoryScoreGrid(categoryScores = {}) {

    const preferred = [
        "farming",
        "economy",
        "cells",
        "progression",
        "damage",
        "survivability"
    ];

    const categories =
        preferred
            .map(key => categoryScores[key])
            .filter(Boolean);

    if (categories.length === 0) {
        return "";
    }

    return `
        <div class="wa-category-grid" data-compare-category-scores="true">
            ${categories.map(categoryCard).join("")}
        </div>
    `;
}

function categoryCard(category = {}) {

    const cls =
        category.verdict === "improved"
            ? "good"
            : category.verdict === "worse"
                ? "bad"
                : "neutral";

    return `
        <div class="wa-category-card ${cls}" data-compare-category-score="${escapeHTML(category.category || "other")}">
            <div class="wa-mini-label">${escapeHTML(formatLabel(category.category || "Other"))}</div>
            <div class="wa-mini-value">${escapeHTML(formatDelta(category.net || 0, { compact: true }))}</div>
            <div class="wa-mini-note">${escapeHTML(category.verdict || "mixed")} · ${Number(category.changed || 0)} change(s)</div>
        </div>
    `;
}

function topList(title, items = [], cls = "neutral", attr = "") {

    const rows =
        items.slice(0, 5);

    return `
        <div class="wa-top-list ${cls}" ${attr}="true">
            <div class="wa-top-list-title">${escapeHTML(title)}</div>
            ${rows.length
                ? rows.map(topListRow).join("")
                : `<div class="wa-top-list-empty">No major changes</div>`}
        </div>
    `;
}

function topListRow(item = {}) {

    const cls =
        outcomeClass(item) || deltaClass(item.diff || 0);

    return `
        <div class="wa-top-row ${cls}">
            <div class="wa-top-row-main">
                <span>${escapeHTML(item.label || formatLabel(item.path || item.key || "Unknown"))}</span>
                <strong>${escapeHTML(formatDelta(item.diff || 0, { compact: true }))}</strong>
            </div>
            <div class="wa-top-row-sub">
                ${escapeHTML(formatPercentDelta(item.pct))}
                ${item.note ? ` · ${escapeHTML(item.note)}` : ""}
            </div>
        </div>
    `;
}

/* --------------------------------------------------
   TREND BLOCK
-------------------------------------------------- */

function trendBlock(trend = {}) {

    if (!trend || !trend.count) {

        return `
            <div class="wa-summary neutral">

                <div class="wa-subtitle">
                    Trend
                </div>

                <div class="wa-path">
                    Not enough history yet
                </div>

            </div>
        `;
    }

    return `
        <div class="wa-summary neutral">

            <div class="wa-subtitle">
                Trend
            </div>

            <div class="wa-path">
                ${trend.count} saved run${trend.count === 1 ? "" : "s"}
            </div>

            <div class="wa-value">
                Avg Wave ${escapeHTML(formatNumber(trend.avgWave ?? 0, 0))}
            </div>

            <div class="wa-muted">
                Stability ${escapeHTML(formatNumber(trend.stabilityScore ?? 0, 0))}%
            </div>

        </div>
    `;
}

/* --------------------------------------------------
   CORE BLOCK
-------------------------------------------------- */

function coreBlock(core = {}, stats = {}) {

    const coinDiff =
        core?.coins?.diff ?? 0;

    const efficiencyDiff =
        stats?.efficiency?.diff ?? 0;

    const cls =
        deltaClass(coinDiff);

    return `
        <div class="wa-summary ${cls}">

            <div class="wa-subtitle">
                Core Delta
            </div>

            <div class="wa-path">
                Coins / Cells / Efficiency
            </div>

            <div class="wa-value">
                ${escapeHTML(formatDelta(coinDiff, {
                    compact: true
                }))}
            </div>

            <div class="wa-muted">
                Efficiency: ${escapeHTML(formatDelta(efficiencyDiff, {
                    compact: true
                }))}
            </div>

        </div>
    `;
}

/* --------------------------------------------------
   ANOMALY BLOCK
-------------------------------------------------- */

function anomalyBlock(anomalies = []) {

    const count =
        Array.isArray(anomalies)
            ? anomalies.length
            : 0;

    return `
        <div class="wa-summary ${count ? "bad" : "neutral"}">

            <div class="wa-subtitle">
                Anomalies
            </div>

            <div class="wa-path">
                ${count ? "Attention needed" : "No major anomalies"}
            </div>

            <div class="wa-value">
                ${count}
            </div>

        </div>
    `;
}

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

function outcomeClass(item = {}) {

    if (item.outcome === "good") {
        return "good";
    }

    if (item.outcome === "bad") {
        return "bad";
    }

    if (item.outcome === "neutral") {
        return "neutral";
    }

    return "";
}

function deltaClass(value) {

    const num =
        Number(value || 0);

    if (num > 0) {
        return "good";
    }

    if (num < 0) {
        return "bad";
    }

    return "neutral";
}