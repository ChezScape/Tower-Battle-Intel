"use strict";

/**
 * HISTORY CARD
 * v4.9o: visible action rail + themed history row.
 */

import {
    formatNumber,
    formatTime,
    formatDelta,
    escapeHTML,
    escapeAttr
} from "../utils/format.js";

import {
    buildHistoryBadges
} from "../../history/historyBadges.js";

import {
    buildPreviousDelta,
    buildRunQualityScore
} from "../../history/historyStats.js";

import {
    sameHistoryRun
} from "../../core/history.js";

/* --------------------------------------------------
   BUILD CARD
-------------------------------------------------- */

export function buildHistoryCard({
    run = null,
    index = 0,
    displayIndex = 0,
    badgeIndex = 0,
    visibleHistory = [],
    summary = {},
    runA = null,
    runB = null
} = {}) {

    const core = run?.core || {};
    const stats = run?.stats || {};

    const isA = run && runA ? sameHistoryRun(run, runA) : false;
    const isB = run && runB ? sameHistoryRun(run, runB) : false;
    const archived = Boolean(run?.meta?.archived);

    const battleDate = core.battleDate || core.date || "Unknown date";
    const wave = core.wave ?? "-";
    const coins = core.coins ?? 0;
    const cells = core.cells ?? 0;
    const time = core.time ?? 0;
    const killedBy = core.killedBy || "-";
    const coinsPerHour = stats.coinsPerHour ?? core.coinsPerHour ?? 0;
    const cellsPerHour = stats.cellsPerHour ?? core.cellsPerHour ?? 0;
    const tier = core.tier ?? "-";

    const buildStyle = formatBuildStyle(run?.meta?.buildStyle || "unknown");
    const tags = Array.isArray(run?.meta?.tags) ? run.meta.tags.filter(Boolean) : [];
    const notes = String(run?.meta?.notes || "").trim();

    const qualityScore = buildRunQualityScore(run, summary);
    const previousDelta = buildPreviousDelta(visibleHistory, badgeIndex);
    const badges = buildHistoryBadges({ run, index: badgeIndex, summary, runA, runB });

    const activeClass = isA || isB ? "active" : "";
    const archiveButton = archived ? restoreButton(index, displayIndex) : archiveButtonHTML(index, displayIndex);

    return `
        <article class="history-entry-card ${escapeAttr(activeClass)} ${archived ? "archived" : ""}" data-history-card="true">

            <div class="history-entry-side-light" aria-hidden="true"></div>

            <header class="history-entry-header">
                <div class="history-entry-title-block">
                    <span class="history-entry-kicker">Run ${escapeHTML(displayIndex + 1)}</span>
                    <strong>${escapeHTML(battleDate)}</strong>
                    <em>Tier ${escapeHTML(tier)} · Build ${escapeHTML(buildStyle)}</em>
                </div>

                <div class="history-entry-score ${scoreClass(qualityScore)}">
                    <span>Score</span>
                    <strong>${escapeHTML(qualityScore)} / 100</strong>
                </div>
            </header>

            ${buildBadgeHTML(badges)}

            <div class="history-entry-metrics">
                ${metricTile("Wave", wave, "cyan")}
                ${metricTile("Killed By", killedBy, "danger")}
                ${metricTile("Coins", formatNumber(coins), "gold")}
                ${metricTile("Cells", formatNumber(cells), "green")}
                ${metricTile("Real Time", formatTime(time), "neutral")}
                ${metricTile("Coins / Hour", formatNumber(coinsPerHour), "gold")}
                ${metricTile("Cells / Hour", formatNumber(cellsPerHour), "green")}
            </div>

            <div class="history-entry-controls">

                <div class="history-slot-actions" aria-label="Comparison slots">
                    <span>Compare Slots</span>

                    <button
                        type="button"
                        class="icon-btn slot ${isA ? "active" : ""}"
                        data-history-index="${escapeAttr(index)}"
                        data-history-slot="runA"
                        ${archived ? "disabled" : ""}
                        aria-label="Load Run ${escapeAttr(displayIndex + 1)} into Baseline A"
                        title="Set as Baseline A"
                    >
                        A
                    </button>

                    <button
                        type="button"
                        class="icon-btn slot ${isB ? "active" : ""}"
                        data-history-index="${escapeAttr(index)}"
                        data-history-slot="runB"
                        ${archived ? "disabled" : ""}
                        aria-label="Load Run ${escapeAttr(displayIndex + 1)} into Compare B"
                        title="Set as Compare B"
                    >
                        B
                    </button>
                </div>

                <div class="history-actions history-card-actions" aria-label="Run tools">
                    <span>Run Tools</span>

                    <button
                        type="button"
                        class="icon-btn stats"
                        data-ui-action="open-history-stats"
                        data-history-stats-index="${escapeAttr(index)}"
                        data-history-display-index="${escapeAttr(displayIndex)}"
                        aria-label="View full stats for Run ${escapeAttr(displayIndex + 1)}"
                        title="View full stats"
                    >
                        Stats
                    </button>

                    <button
                        type="button"
                        class="icon-btn edit"
                        data-ui-action="open-history-edit"
                        data-history-edit-index="${escapeAttr(index)}"
                        data-history-display-index="${escapeAttr(displayIndex)}"
                        aria-label="Edit notes and tags for Run ${escapeAttr(displayIndex + 1)}"
                        title="Edit notes and tags"
                    >
                        Edit
                    </button>

                    ${archiveButton}

                    <button
                        type="button"
                        class="icon-btn danger"
                        data-ui-action="delete-history-run"
                        data-delete-history-index="${escapeAttr(index)}"
                        data-index="${escapeAttr(index)}"
                        data-history-display-index="${escapeAttr(displayIndex)}"
                        aria-label="Delete Run ${escapeAttr(displayIndex + 1)}"
                        title="Delete this run"
                    >
                        Del
                    </button>
                </div>
            </div>

            <details class="history-run-details history-more-intel">
                <summary>
                    <span>More Intel</span>
                    <em>time, killed by, notes, tags, previous delta</em>
                </summary>

                <div class="history-more-intel-grid">
                    ${metricTile("Killed By", killedBy, "danger")}
                    ${metricTile("Build", buildStyle, "cyan")}
                    ${metricTile("CPH", formatNumber(coinsPerHour), "gold")}
                    ${metricTile("Cells/h", formatNumber(cellsPerHour), "green")}
                </div>

                ${buildNotesLine(notes)}
                ${buildTagLine(tags)}
                ${buildPreviousDeltaHTML(previousDelta)}
            </details>

        </article>
    `;
}

/* --------------------------------------------------
   SMALL PARTS
-------------------------------------------------- */

function metricTile(label = "", value = "", tone = "neutral") {
    return `
        <div class="history-metric-tile ${escapeAttr(tone)}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
        </div>
    `;
}

function scoreClass(score = 0) {
    const value = Number(score || 0);

    if (value >= 90) return "score-good";
    if (value >= 70) return "score-ok";
    return "score-low";
}

/* --------------------------------------------------
   ACTION BUTTONS
-------------------------------------------------- */

function archiveButtonHTML(index = 0, displayIndex = 0) {

    return `
        <button
            type="button"
            class="icon-btn archive"
            data-ui-action="history-archive-run"
            data-archive-history-index="${escapeAttr(index)}"
            aria-label="Archive Run ${escapeAttr(displayIndex + 1)}"
            title="Archive this run"
        >
            Arc
        </button>
    `;
}

function restoreButton(index = 0, displayIndex = 0) {

    return `
        <button
            type="button"
            class="icon-btn restore"
            data-ui-action="history-restore-run"
            data-restore-history-index="${escapeAttr(index)}"
            aria-label="Restore Run ${escapeAttr(displayIndex + 1)}"
            title="Restore this run"
        >
            Restore
        </button>
    `;
}

/* --------------------------------------------------
   BADGES / TAGS
-------------------------------------------------- */

function buildBadgeHTML(badges = []) {

    if (!badges.length) {
        return "";
    }

    return `
        <div class="history-badges">
            ${badges.map(badge => `
                <span class="history-badge ${escapeAttr(badge.tone || "info")}">
                    ${escapeHTML(badge.label || "Badge")}
                </span>
            `).join("")}
        </div>
    `;
}

function buildNotesLine(notes = "") {

    const value = String(notes || "").trim();

    if (!value) {
        return "";
    }

    const preview = value.length > 180 ? `${value.slice(0, 180)}...` : value;

    return `
        <div class="history-notes-line history-note" data-history-note="true">
            <span>Note</span>
            ${escapeHTML(preview)}
        </div>
    `;
}

function buildTagLine(tags = []) {

    if (!tags.length) {
        return "";
    }

    return `
        <div class="history-tag-line">
            ${tags.slice(0, 8).map(tag => `
                <span>#${escapeHTML(tag)}</span>
            `).join("")}
        </div>
    `;
}

/* --------------------------------------------------
   PREVIOUS DELTA
-------------------------------------------------- */

function buildPreviousDeltaHTML(delta = null) {

    if (!delta) {
        return `
            <div class="history-prev-delta muted">
                First visible run in this trace.
            </div>
        `;
    }

    return `
        <div class="history-prev-delta">
            <span>Previous visible run:</span>
            <strong class="${deltaClass(delta.wave)}">Wave ${escapeHTML(formatDelta(delta.wave, { compact: false, precision: 0 }))}</strong>
            <strong class="${deltaClass(delta.coins)}">Coins ${escapeHTML(formatDelta(delta.coins, { compact: true }))}</strong>
            <strong class="${deltaClass(delta.cells)}">Cells ${escapeHTML(formatDelta(delta.cells, { compact: true }))}</strong>
        </div>
    `;
}

function deltaClass(value = 0) {

    const num = Number(value || 0);

    if (!Number.isFinite(num) || num === 0) {
        return "flat";
    }

    return num > 0 ? "good" : "bad";
}

function formatBuildStyle(value = "unknown") {

    return String(value || "unknown")
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}
