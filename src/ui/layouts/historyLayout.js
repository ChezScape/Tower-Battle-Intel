"use strict";

/**
 * HISTORY LAYOUT
 * Battle History Trace panel.
 *
 * Phase 2 upgrade:
 * - search / sort / build / tag filters
 * - archive / restore support
 * - history import / export controls
 * - keeps Phase 1 summary, badges, stats modal, and delete modal
 */

import {
    formatNumber,
    escapeHTML,
    escapeAttr
} from "../utils/format.js";

import {
    buildHistoryStats
} from "../../history/historyStats.js";

import {
    buildHistoryCard
} from "../components/historyCard.js";

import {
    buildConfirmModal
} from "../components/confirmModal.js";

import {
    buildHistoryStatsMount
} from "./historyStatsModal.js";

import {
    buildHistoryEditMount
} from "./historyEditModal.js";

import {
    HISTORY_SORT_OPTIONS,
    HISTORY_BUILD_OPTIONS,
    normaliseHistoryFilters,
    getHistoryTags,
    getVisibleHistoryEntries
} from "../../history/historyFilters.js";

/* --------------------------------------------------
   BUILD HISTORY
-------------------------------------------------- */

export function buildHistory(state = {}) {

    const history =
        Array.isArray(state.history)
            ? state.history
            : [];

    const filters =
        normaliseHistoryFilters(state.ui?.historyFilters);

    const tags =
        getHistoryTags(history);

    const visibleEntries =
        getVisibleHistoryEntries(
            history,
            filters,
            buildHistoryStats(history.filter(run => !run?.meta?.archived))
        );

    const visibleHistory =
        visibleEntries.map(entry => entry.run);

    const activeHistory =
        history.filter(run => !run?.meta?.archived);

    const summary =
        buildHistoryStats(visibleHistory.length ? visibleHistory : activeHistory);

    const archiveCount =
        history.filter(run => run?.meta?.archived).length;

    return `
        <section class="wa-panel history-panel">

            <div class="history-panel-header">

                <div>

                    <div class="wa-title">
                        Battle History Trace
                    </div>

                    <div class="wa-sub">
                        Choose A as the baseline, then choose B as the run to compare against it. Deltas show B - A.
                    </div>

                </div>

                <section class="history-tools-bar" aria-label="History tools">
                    <div class="history-tools-title">
                        <span>History Tools</span>
                        <em>Swap, import, export, delete</em>
                    </div>

                    <div class="history-panel-actions">

                        <button
                            type="button"
                            data-ui-action="history-swap-slots" data-swap-history-slots="true"
                            ${state.runA || state.runB ? "" : "disabled"}
                        >
                            Swap A/B
                        </button>

                        <button
                            type="button"
                            data-ui-action="history-clear-selection" data-clear-history-selection="true"
                            ${state.runA || state.runB ? "" : "disabled"}
                        >
                            Clear A/B
                        </button>

                        <button
                            type="button"
                            data-ui-action="export-history" data-export-history="true"
                            ${history.length ? "" : "disabled"}
                        >
                            Export History
                        </button>

                        <label
                            class="history-action-button history-native-import-control"
                            for="historyImportInput"
                            data-native-history-import-control="true"
                            title="Choose a Tower Battle Intel history JSON file"
                        >
                            <span>Import History</span>
                            <input
                                id="historyImportInput"
                                class="history-native-import-input"
                                type="file"
                                accept="application/json,.json"
                                data-history-import-input="true"
                                data-import-history-input="true"
                                data-history-visible-import-input="true"
                                aria-label="Import Battle History JSON"
                            >
                        </label>

                        <button
                            type="button"
                            class="danger-soft"
                            data-ui-action="delete-last-history" data-delete-last-history="true"
                            ${history.length ? "" : "disabled"}
                        >
                            Delete Last Run
                        </button>

                        <button
                            type="button"
                            class="danger"
                            data-ui-action="delete-all-history" data-delete-all-history="true"
                            ${history.length ? "" : "disabled"}
                        >
                            Delete All History
                        </button>

                    </div>
                </section>

            </div>

            ${buildHistoryFilters({
                filters,
                tags,
                history,
                visibleCount: visibleEntries.length,
                archiveCount
            })}

            <details
                class="history-collapsible history-summary-drawer"
                data-history-drawer="summary"
                ${historyDrawerOpenAttribute("summary", true)}
            >
                <summary>
                    <span>History Summary</span>
                    <em>${escapeHTML(visibleEntries.length)} visible · ${escapeHTML(history.length)} saved</em>
                </summary>

                ${buildHistorySummary(summary, {
                    historyCount: history.length,
                    visibleCount: visibleEntries.length,
                    archiveCount
                })}
            </details>

            ${
                visibleEntries.length
                    ? buildHistoryList({
                        entries: visibleEntries,
                        visibleHistory,
                        summary,
                        runA: state.runA,
                        runB: state.runB
                    })
                    : buildEmptyHistory(history.length, filters)
            }

            ${buildConfirmModal()}
            ${buildHistoryStatsMount()}
            ${buildHistoryEditMount()}

        </section>
    `;
}

/* --------------------------------------------------
   OLD COMPATIBILITY ALIAS
-------------------------------------------------- */

export const History = buildHistory;
export default buildHistory;

/* --------------------------------------------------
   HISTORY FILTERS
-------------------------------------------------- */

function buildHistoryFilters({
    filters = {},
    tags = [],
    history = [],
    visibleCount = 0,
    archiveCount = 0
} = {}) {

    const tagOptions = [
        { value: "all", label: "All Tags" },
        ...tags.map(tag => ({
            value: tag,
            label: `#${tag}`
        }))
    ];

    const sortLabel =
        getOptionLabel(HISTORY_SORT_OPTIONS, filters.sort, "Newest");

    const buildLabel =
        getOptionLabel(HISTORY_BUILD_OPTIONS, filters.build, "All Builds");

    const tagLabel =
        getOptionLabel(tagOptions, filters.tag, "All Tags");

    const filterOpen =
        historyDrawerOpenAttribute("filter", true);

    return `
        <details
            class="history-collapsible history-filter-panel history-filter-drawer"
            data-history-drawer="filter"
            ${filterOpen}
        >

            <summary>
                <span>Filter Console</span>
                <em>${escapeHTML(sortLabel)} · ${escapeHTML(buildLabel)} · ${escapeHTML(tagLabel)}</em>
            </summary>

            <div class="history-filter-body">

                <div class="history-filter-search-row">

                    <label class="history-search-wrap">
                        <span>Search</span>
                        <input
                            type="search"
                            class="history-search"
                            data-history-filter-query="true"
                            value="${escapeAttr(filters.query || "")}"
                            placeholder="Date, wave, killed by, tag..."
                        >
                    </label>

                </div>

                <div class="history-choice-groups history-dropdown-groups">

                    ${buildChoiceSelect({
                        title: "Sort",
                        filter: "sort",
                        current: filters.sort,
                        options: HISTORY_SORT_OPTIONS
                    })}

                    ${buildChoiceSelect({
                        title: "Build",
                        filter: "build",
                        current: filters.build,
                        options: HISTORY_BUILD_OPTIONS
                    })}

                    ${buildChoiceSelect({
                        title: "Tag",
                        filter: "tag",
                        current: filters.tag,
                        options: tagOptions
                    })}

                </div>

                <div class="history-filter-row compact">

                    <button
                        type="button"
                        class="history-toggle-button ${filters.showArchived ? "active" : ""}"
                        data-history-filter-value="showArchived"
                        data-history-filter-kind="showArchived"
                        data-history-filter-option="${filters.showArchived ? "false" : "true"}"
                        aria-pressed="${filters.showArchived ? "true" : "false"}"
                    >
                        <span class="history-toggle-box">${filters.showArchived ? "✓" : ""}</span>
                        <span>Show archived</span>
                    </button>

                    <button
                        type="button"
                        data-history-filter-reset="true"
                        ${hasActiveFilters(filters) ? "" : "disabled"}
                    >
                        Reset Filters
                    </button>

                    <div class="history-filter-count">
                        Showing ${escapeHTML(visibleCount)} of ${escapeHTML(history.length)} runs
                        ${archiveCount ? `· ${escapeHTML(archiveCount)} archived` : ""}
                    </div>

                </div>

            </div>

        </details>
    `;
}

function buildChoiceSelect({
    title = "",
    filter = "",
    current = "",
    options = []
} = {}) {

    const safeFilter =
        String(filter || "choice");

    const controlAttr =
        filter === "sort"
            ? "data-history-filter-sort=\"true\""
            : filter === "build"
                ? "data-history-filter-build=\"true\""
                : "data-history-filter-tag=\"true\"";

    return `
        <label class="history-native-select-group history-choice-group history-select-group">
            <span class="history-choice-title">
                ${escapeHTML(title)}
            </span>

            <select
                class="history-choice-select"
                ${controlAttr}
                data-history-filter-kind="${escapeAttr(safeFilter)}"
                aria-label="${escapeAttr(title)} filter"
            >
                ${options.map(option => `
                    <option
                        value="${escapeAttr(option.value)}"
                        ${String(option.value) === String(current) ? "selected" : ""}
                    >
                        ${escapeHTML(option.label)}
                    </option>
                `).join("")}
            </select>
        </label>
    `;
}

function historyDrawerOpenAttribute(name = "", defaultOpen = true) {

    if (typeof window === "undefined" || !window.sessionStorage) {
        return defaultOpen ? "open" : "";
    }

    try {
        const key = `tbi.history.drawer.${String(name || "drawer")}`;
        const stored = window.sessionStorage.getItem(key);

        if (stored === "open") {
            return "open";
        }

        if (stored === "closed") {
            return "";
        }
    } catch {
        // sessionStorage may be unavailable in some privacy modes.
    }

    return defaultOpen ? "open" : "";
}

function getOptionLabel(options = [], value = "", fallback = "") {

    const match =
        options.find(option => String(option.value) === String(value));

    return match?.label || fallback || String(value || "");
}

function hasActiveFilters(filters = {}) {

    return Boolean(
        filters.query ||
        filters.sort !== "newest" ||
        filters.build !== "all" ||
        filters.tag !== "all" ||
        filters.showArchived
    );
}

/* --------------------------------------------------
   HISTORY SUMMARY
-------------------------------------------------- */

function buildHistorySummary(summary = {}, counts = {}) {

    return `
        <div class="history-summary-grid">

            ${summaryTile(
                "Saved Runs",
                counts.historyCount || summary.count || 0,
                `${counts.visibleCount ?? summary.count ?? 0} visible`
            )}

            ${summaryTile(
                "Archived",
                counts.archiveCount || 0,
                "Hidden unless shown"
            )}

            ${summaryTile(
                "Best Wave",
                summary.bestWave
                    ? summary.bestWave.value
                    : "-",
                summary.bestWave
                    ? `Visible Run ${summary.bestWave.index + 1}`
                    : "No runs"
            )}

            ${summaryTile(
                "Best Coins",
                summary.bestCoins
                    ? formatNumber(summary.bestCoins.value)
                    : "-",
                summary.bestCoins
                    ? `Visible Run ${summary.bestCoins.index + 1}`
                    : "No runs"
            )}

            ${summaryTile(
                "Best Cells",
                summary.bestCells
                    ? formatNumber(summary.bestCells.value)
                    : "-",
                summary.bestCells
                    ? `Visible Run ${summary.bestCells.index + 1}`
                    : "No runs"
            )}

            ${summaryTile(
                "Avg Wave",
                summary.averageWave
                    ? Math.round(summary.averageWave)
                    : "-",
                "Visible average"
            )}

        </div>
    `;
}

function summaryTile(label = "", value = "", sub = "") {

    return `
        <div class="history-summary-tile">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
            <em>${escapeHTML(sub)}</em>
        </div>
    `;
}

/* --------------------------------------------------
   HISTORY LIST
-------------------------------------------------- */

function buildHistoryList({
    entries = [],
    visibleHistory = [],
    summary = {},
    runA = null,
    runB = null
} = {}) {

    return `
        <div class="wa-timeline history-timeline">

            ${entries.map(entry =>
                buildHistoryCard({
                    run: entry.run,
                    index: entry.originalIndex,
                    displayIndex: entry.originalIndex,
                    badgeIndex: entry.visibleIndex,
                    visibleHistory,
                    summary,
                    runA,
                    runB
                })
            ).join("")}

        </div>
    `;
}

/* --------------------------------------------------
   EMPTY HISTORY
-------------------------------------------------- */

function buildEmptyHistory(historyCount = 0, filters = {}) {

    if (historyCount) {
        return `
            <div class="wa-sub history-empty-filtered">
                No saved battle reports match the current filters.
                ${hasActiveFilters(filters) ? "Try Reset Filters or Show archived." : ""}
            </div>
        `;
    }

    return `
        <div class="wa-sub">
            No saved battle reports yet. Paste a report above and press Save Report.
        </div>
    `;
}