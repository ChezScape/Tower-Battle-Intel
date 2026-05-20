"use strict";

/**
 * HISTORY CARD
 * Renders one Battle History Trace row/card.
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

    const core =
        run?.core || {};

    const stats =
        run?.stats || {};

    const isA =
        run && runA
            ? sameHistoryRun(run, runA)
            : false;

    const isB =
        run && runB
            ? sameHistoryRun(run, runB)
            : false;

    const archived =
        Boolean(run?.meta?.archived);

    const battleDate =
        core.battleDate ||
        core.date ||
        "Unknown date";

    const wave =
        core.wave ?? "-";

    const coins =
        core.coins ?? 0;

    const cells =
        core.cells ?? 0;

    const time =
        core.time ?? 0;

    const killedBy =
        core.killedBy ||
        "-";

    const buildStyle =
        formatBuildStyle(run?.meta?.buildStyle || "unknown");

    const tags =
        Array.isArray(run?.meta?.tags)
            ? run.meta.tags.filter(Boolean)
            : [];

    const notes =
        String(run?.meta?.notes || "").trim();

    const qualityScore =
        buildRunQualityScore(run, summary);

    const previousDelta =
        buildPreviousDelta(visibleHistory, badgeIndex);

    const badges =
        buildHistoryBadges({
            run,
            index: badgeIndex,
            summary,
            runA,
            runB
        });

    const activeClass =
        isA || isB
            ? "active"
            : "";

    const archiveButton =
        archived
            ? restoreButton(index, displayIndex)
            : archiveButtonHTML(index, displayIndex);

    return `
        <div class="wa-history-row history-card-row ${escapeAttr(activeClass)} ${archived ? "archived" : ""}">

            <div class="wa-timeline-item history-card ${escapeAttr(activeClass)} ${archived ? "archived" : ""}">

                <div class="wa-dot"></div>

                <div class="wa-timeline-content history-card-content">

                    <div class="history-card-topline">

                        <div>
                            <div class="wa-time">
                                Run ${escapeHTML(displayIndex + 1)}
                            </div>

                            <div class="wa-date">
                                ${escapeHTML(battleDate)}
                            </div>
                        </div>

                        <div class="history-card-score">
                            ${escapeHTML(qualityScore)} / 100
                        </div>

                    </div>

                    ${buildBadgeHTML(badges)}

                    <div class="wa-stats history-main-stats">
                        Wave ${escapeHTML(wave)}
                        · Coins ${escapeHTML(formatNumber(coins))}
                        · Cells ${escapeHTML(formatNumber(cells))}
                    </div>

                    <div class="history-card-action-zone">

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

                        <details class="history-run-menu">
                            <summary>Tools</summary>

                            <div class="history-actions history-card-actions">

                                <button
                                    type="button"
                                    class="icon-btn stats"
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
                                    data-delete-history-index="${escapeAttr(index)}"
                                    aria-label="Delete Run ${escapeAttr(displayIndex + 1)}"
                                    title="Delete this run"
                                >
                                    Del
                                </button>

                            </div>
                        </details>

                    </div>

                    <details class="history-run-details">
                        <summary>More Intel</summary>

                        <div class="wa-muted history-secondary-stats">
                            Time ${escapeHTML(formatTime(time))}
                            · Killed By ${escapeHTML(killedBy)}
                            · Build ${escapeHTML(buildStyle)}
                            · CPH ${escapeHTML(formatNumber(stats.coinsPerHour ?? core.coinsPerHour ?? 0))}
                            · Cells/h ${escapeHTML(formatNumber(stats.cellsPerHour ?? core.cellsPerHour ?? 0))}
                        </div>

                        ${buildNotesLine(notes)}

                        ${buildTagLine(tags)}

                        ${buildPreviousDeltaHTML(previousDelta)}
                    </details>

                </div>

            </div>

        </div>
    `;
}

/* --------------------------------------------------
   ACTION BUTTONS
-------------------------------------------------- */

function archiveButtonHTML(index = 0, displayIndex = 0) {

    return `
        <button
            type="button"
            class="icon-btn archive"
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

    const value =
        String(notes || "").trim();

    if (!value) {
        return "";
    }

    const preview =
        value.length > 140
            ? `${value.slice(0, 140)}...`
            : value;

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
            ${tags.slice(0, 5).map(tag => `
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
            <span>Prev:</span>
            <strong class="${deltaClass(delta.wave)}">Wave ${escapeHTML(formatDelta(delta.wave, { compact: false, precision: 0 }))}</strong>
            <strong class="${deltaClass(delta.coins)}">Coins ${escapeHTML(formatDelta(delta.coins, { compact: true }))}</strong>
            <strong class="${deltaClass(delta.cells)}">Cells ${escapeHTML(formatDelta(delta.cells, { compact: true }))}</strong>
        </div>
    `;
}

function deltaClass(value = 0) {

    const num =
        Number(value || 0);

    if (!Number.isFinite(num) || num === 0) {
        return "flat";
    }

    return num > 0
        ? "good"
        : "bad";
}

function formatBuildStyle(value = "unknown") {

    return String(value || "unknown")
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}