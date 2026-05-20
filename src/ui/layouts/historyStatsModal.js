"use strict";

/**
 * HISTORY STATS MODAL
 * Phase 3 full run viewer for a saved History Trace entry.
 *
 * Includes:
 * - overview cards
 * - A/B quick load actions
 * - compact comparison against loaded A/B
 * - searchable section stats
 * - raw JSON view
 * - copy/download hooks
 */

import {
    formatNumber,
    formatTime,
    formatLabel,
    formatDelta,
    formatPercent,
    escapeHTML,
    escapeAttr
} from "../utils/format.js";

import {
    buildRunQualityScore,
    buildPreviousDelta,
    buildHistoryStats
} from "../../history/historyStats.js";

import {
    sameHistoryRun
} from "../../core/history.js";

/* --------------------------------------------------
   BUILD MODAL
-------------------------------------------------- */

export function buildHistoryStatsModal(input = null, legacyIndex = 0) {

    const options =
        normaliseModalInput(input, legacyIndex);

    const {
        run,
        index,
        displayIndex,
        history,
        visibleHistory,
        runA,
        runB
    } = options;

    if (!run) {
        return "";
    }

    const core =
        run?.core || {};

    const stats =
        run?.stats || {};

    const sections =
        run?.sections || {};

    const summary =
        buildHistoryStats(
            Array.isArray(visibleHistory) && visibleHistory.length
                ? visibleHistory
                : Array.isArray(history)
                    ? history.filter(item => !item?.meta?.archived)
                    : [run]
        );

    const qualityScore =
        buildRunQualityScore(run, summary);

    const previousDelta =
        buildPreviousDelta(
            Array.isArray(visibleHistory) && visibleHistory.length
                ? visibleHistory
                : Array.isArray(history)
                    ? history
                    : [run],
            Math.max(0, Number(displayIndex || 0))
        );

    const archived =
        Boolean(run?.meta?.archived);

    const isA =
        runA && sameHistoryRun(run, runA);

    const isB =
        runB && sameHistoryRun(run, runB);

    const sectionEntries =
        Object.entries(sections)
            .filter(([, values]) => values && typeof values === "object");

    return `
        <div
            class="history-stats-modal active"
            id="historyStatsModal"
            aria-hidden="false"
            role="dialog"
            aria-modal="true"
            aria-label="History run full stats"
            data-history-stats-index="${escapeAttr(index)}"
        >

            <div class="history-stats-card phase3">

                <div class="history-stats-header">

                    <div class="history-stats-heading">
                        <div class="history-stats-kicker">
                            History Run ${escapeHTML(displayIndex + 1)}
                            ${archived ? " · Archived" : ""}
                        </div>

                        <div class="history-stats-title">
                            ${escapeHTML(core.battleDate || "Unknown date")}
                        </div>

                        <div class="history-stats-subtitle">
                            Tier ${escapeHTML(core.tier ?? "-")}
                            · Wave ${escapeHTML(core.wave ?? "-")}
                            · Killed By ${escapeHTML(core.killedBy || "-")}
                        </div>
                    </div>

                    <button
                        type="button"
                        class="history-stats-close"
                        data-history-stats-close="true"
                        aria-label="Close full stats"
                    >
                        Close
                    </button>

                </div>

                <div class="history-stats-toolbar">

                    <div class="history-stats-tabs" role="tablist" aria-label="Stats sections">
                        ${tabButton("overview", "Overview", true)}
                        ${tabButton("sections", "Sections", false)}
                        ${tabButton("raw", "Raw JSON", false)}
                    </div>

                    <div class="history-stats-actions">
                        <button
                            type="button"
                            data-history-modal-slot="runA"
                            data-history-modal-index="${escapeAttr(index)}"
                            ${archived ? "disabled" : ""}
                            class="${isA ? "active" : ""}"
                        >
                            Set A
                        </button>

                        <button
                            type="button"
                            data-history-modal-slot="runB"
                            data-history-modal-index="${escapeAttr(index)}"
                            ${archived ? "disabled" : ""}
                            class="${isB ? "active" : ""}"
                        >
                            Set B
                        </button>

                        <button
                            type="button"
                            data-history-stats-copy="true"
                        >
                            Copy JSON
                        </button>

                        <button
                            type="button"
                            data-history-stats-download="true"
                        >
                            Download JSON
                        </button>
                    </div>

                </div>

                <div class="history-stats-body">

                    <div
                        class="history-stats-view active"
                        data-history-stats-view="overview"
                    >
                        ${buildOverview({
                            run,
                            core,
                            stats,
                            qualityScore,
                            previousDelta,
                            runA,
                            runB
                        })}
                    </div>

                    <div
                        class="history-stats-view"
                        data-history-stats-view="sections"
                    >
                        <section class="history-stats-section section-search-section">
                            <div class="history-stats-section-title">
                                Section Search
                            </div>

                            <input
                                type="search"
                                class="history-stats-search"
                                data-history-stats-section-search="true"
                                placeholder="Search sections or stats..."
                                aria-label="Search full stats"
                            >
                        </section>

                        <div class="history-stats-empty" data-history-stats-no-results="true" hidden>
                            No matching section stats.
                        </div>

                        ${sectionEntries.length
                            ? sectionEntries.map(([sectionName, values]) =>
                                buildSection(sectionName, values)
                            ).join("")
                            : `<div class="history-stats-empty">No section stats available.</div>`
                        }
                    </div>

                    <div
                        class="history-stats-view"
                        data-history-stats-view="raw"
                    >
                        <section class="history-stats-section">
                            <div class="history-stats-section-title">
                                Raw Run JSON
                            </div>

                            <pre class="history-stats-json" data-history-stats-json="true">${escapeHTML(JSON.stringify(run, null, 2))}</pre>
                        </section>
                    </div>

                </div>

            </div>

        </div>
    `;
}

function normaliseModalInput(input = null, legacyIndex = 0) {

    if (
        input &&
        typeof input === "object" &&
        Object.prototype.hasOwnProperty.call(input, "run")
    ) {
        return {
            run: input.run || null,
            index: Number.isInteger(input.index) ? input.index : Number(legacyIndex || 0),
            displayIndex: Number.isInteger(input.displayIndex) ? input.displayIndex : Number(input.index || legacyIndex || 0),
            history: Array.isArray(input.history) ? input.history : [],
            visibleHistory: Array.isArray(input.visibleHistory) ? input.visibleHistory : [],
            runA: input.runA || null,
            runB: input.runB || null
        };
    }

    return {
        run: input || null,
        index: Number(legacyIndex || 0),
        displayIndex: Number(legacyIndex || 0),
        history: [],
        visibleHistory: [],
        runA: null,
        runB: null
    };
}

/* --------------------------------------------------
   OVERVIEW
-------------------------------------------------- */

function buildOverview({
    run = null,
    core = {},
    stats = {},
    qualityScore = 0,
    previousDelta = null,
    runA = null,
    runB = null
} = {}) {

    const buildStyle =
        run?.meta?.buildStyle || "unknown";

    const tags =
        Array.isArray(run?.meta?.tags)
            ? run.meta.tags.filter(Boolean)
            : [];

    const notes =
        String(run?.meta?.notes || "").trim();

    return `
        <section class="history-stats-section">
            <div class="history-stats-section-title">
                Quick Read
            </div>

            <div class="history-stats-grid phase3-overview-grid">
                ${statTile("Quality", `${qualityScore} / 100`, scoreClass(qualityScore))}
                ${statTile("Wave", formatNumber(core.wave ?? 0, 0))}
                ${statTile("Coins", formatNumber(core.coins ?? 0))}
                ${statTile("Cells", formatNumber(core.cells ?? 0))}
                ${statTile("Coins / Hour", formatNumber(stats.coinsPerHour ?? core.coinsPerHour ?? 0))}
                ${statTile("Cells / Hour", formatNumber(stats.cellsPerHour ?? core.cellsPerHour ?? 0))}
                ${statTile("Coins / Wave", formatNumber(stats.coinsPerWave ?? 0))}
                ${statTile("Cells / Wave", formatNumber(stats.cellsPerWave ?? 0))}
                ${statTile("Efficiency", formatNumber(stats.efficiency ?? 0))}
                ${statTile("Time", formatTime(core.time ?? 0))}
                ${statTile("Build", formatLabel(buildStyle))}
                ${statTile("Report ID", run?.meta?.reportId || "-")}
            </div>
        </section>

        ${buildNotesSection(notes)}
        ${buildTagSection(tags)}
        ${buildPreviousDeltaSection(previousDelta)}
        ${buildCompareSection("Against Current A", run, runA)}
        ${buildCompareSection("Against Current B", run, runB)}
    `;
}

function buildNotesSection(notes = "") {

    const value =
        String(notes || "").trim();

    if (!value) {
        return "";
    }

    return `
        <section class="history-stats-section compact">
            <div class="history-stats-section-title">
                Notes
            </div>

            <div class="history-stats-note">
                ${escapeHTML(value)}
            </div>
        </section>
    `;
}

function buildTagSection(tags = []) {

    if (!tags.length) {
        return "";
    }

    return `
        <section class="history-stats-section compact">
            <div class="history-stats-section-title">
                Tags
            </div>

            <div class="history-stats-tags">
                ${tags.map(tag => `
                    <span>#${escapeHTML(tag)}</span>
                `).join("")}
            </div>
        </section>
    `;
}

function buildPreviousDeltaSection(delta = null) {

    if (!delta) {
        return `
            <section class="history-stats-section compact muted-section">
                <div class="history-stats-section-title">
                    Previous Run Delta
                </div>
                <div class="history-stats-empty">No previous visible run to compare.</div>
            </section>
        `;
    }

    return `
        <section class="history-stats-section compact">
            <div class="history-stats-section-title">
                Previous Run Delta
            </div>

            <div class="history-stats-mini-grid">
                ${deltaTile("Wave", delta.wave, { precision: 0, compact: false })}
                ${deltaTile("Coins", delta.coins)}
                ${deltaTile("Cells", delta.cells)}
                ${deltaTile("CPH", delta.coinsPerHour)}
                ${deltaTile("Cells/h", delta.cellsPerHour)}
            </div>
        </section>
    `;
}

function buildCompareSection(title = "Compare", run = null, against = null) {

    if (!run || !against) {
        return "";
    }

    if (sameHistoryRun(run, against)) {
        return `
            <section class="history-stats-section compact muted-section">
                <div class="history-stats-section-title">
                    ${escapeHTML(title)}
                </div>
                <div class="history-stats-empty">This is the same loaded run.</div>
            </section>
        `;
    }

    const deltas = [
        ["Wave", numberDiff(against?.core?.wave, run?.core?.wave), { precision: 0, compact: false }],
        ["Coins", numberDiff(against?.core?.coins, run?.core?.coins), {}],
        ["Cells", numberDiff(against?.core?.cells, run?.core?.cells), {}],
        ["CPH", numberDiff(getCPH(against), getCPH(run)), {}],
        ["Cells/h", numberDiff(getCellsH(against), getCellsH(run)), {}]
    ];

    return `
        <section class="history-stats-section compact">
            <div class="history-stats-section-title">
                ${escapeHTML(title)}
            </div>

            <div class="history-stats-mini-grid">
                ${deltas.map(([label, value, options]) =>
                    deltaTile(label, value, options)
                ).join("")}
            </div>
        </section>
    `;
}

/* --------------------------------------------------
   SECTION TABLES
-------------------------------------------------- */

function buildSection(sectionName = "section", values = {}) {

    const entries =
        Object.entries(values || {});

    if (!entries.length) {
        return "";
    }

    const searchText =
        [
            sectionName,
            formatLabel(sectionName),
            ...entries.flatMap(([key, value]) => [
                key,
                formatLabel(key),
                formatStatValue(value)
            ])
        ].join(" ").toLowerCase();

    return `
        <section
            class="history-stats-section searchable-section"
            data-history-stats-section="true"
            data-section-name="${escapeAttr(sectionName)}"
            data-section-search="${escapeAttr(searchText)}"
        >
            <div class="history-stats-section-title">
                <span class="history-stats-section-name">
                    ${escapeHTML(formatLabel(sectionName))}
                </span>

                <span class="history-stats-section-count">
                    ${escapeHTML(entries.length)} stats
                </span>

                <span class="history-stats-match-pill" data-history-stats-match-pill="true" hidden>
                    Matched
                </span>
            </div>

            <div class="history-stats-table">
                ${entries.map(([key, value]) => {
                    const rowSearch = [
                        key,
                        formatLabel(key),
                        formatStatValue(value)
                    ].join(" ").toLowerCase();

                    return `
                        <div
                            class="history-stats-row"
                            data-history-stats-row="true"
                            data-history-stats-row-search="${escapeAttr(rowSearch)}"
                        >
                            <span>${escapeHTML(formatLabel(key))}</span>
                            <strong>${escapeHTML(formatStatValue(value))}</strong>
                        </div>
                    `;
                }).join("")}
            </div>
        </section>
    `;
}

/* --------------------------------------------------
   SMALL HTML HELPERS
-------------------------------------------------- */

function tabButton(view = "overview", label = "Overview", active = false) {

    return `
        <button
            type="button"
            class="history-stats-tab ${active ? "active" : ""}"
            data-history-stats-tab="${escapeAttr(view)}"
            aria-pressed="${active ? "true" : "false"}"
        >
            ${escapeHTML(label)}
        </button>
    `;
}

function statTile(label = "", value = "", extraClass = "") {

    return `
        <div class="history-stats-tile ${escapeAttr(extraClass)}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
        </div>
    `;
}

function deltaTile(label = "", value = 0, options = {}) {

    const number =
        Number(value || 0);

    const direction =
        number > 0
            ? "good"
            : number < 0
                ? "bad"
                : "neutral";

    return `
        <div class="history-stats-delta ${direction}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(formatDelta(number, options))}</strong>
        </div>
    `;
}

function scoreClass(score = 0) {

    const value =
        Number(score || 0);

    if (value >= 90) return "score-good";
    if (value >= 70) return "score-ok";
    return "score-bad";
}

function formatStatValue(value = "") {

    if (typeof value === "number") {
        return formatNumber(value);
    }

    if (value == null || value === "") {
        return "-";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    return String(value);
}

function numberDiff(a = 0, b = 0) {

    const first =
        Number(a || 0);

    const second =
        Number(b || 0);

    if (!Number.isFinite(first) || !Number.isFinite(second)) {
        return 0;
    }

    return second - first;
}

function getCPH(run = null) {
    return run?.stats?.coinsPerHour ?? run?.core?.coinsPerHour ?? 0;
}

function getCellsH(run = null) {
    return run?.stats?.cellsPerHour ?? run?.core?.cellsPerHour ?? 0;
}

/* --------------------------------------------------
   MOUNT
-------------------------------------------------- */

export function buildHistoryStatsMount() {
    return `
        <div id="historyStatsModalMount"></div>
    `;
}

/* --------------------------------------------------
   FUTURE-SAFE IMPORT KEEPALIVE
-------------------------------------------------- */

void formatPercent;
