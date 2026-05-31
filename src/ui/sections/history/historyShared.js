"use strict";

import {
    escapeHTML,
    escapeAttr,
    formatNumber,
    formatTime
} from "../sectionUtils.js";

import {
    HISTORY_SORT_OPTIONS,
    HISTORY_BUILD_OPTIONS,
    HISTORY_RUN_TYPE_OPTIONS,
    normaliseHistoryFilters,
    getHistoryTags,
    getVisibleHistoryEntries,
    getOptionLabel,
    buildHistoryEntrySearchText
} from "../../../history/historyFilters.js";

import {
    buildHistoryRunGameBrainSummary,
    buildHistoryGameBrainInsights
} from "../../../history/historyGameBrain.js";

import { normaliseRawArchive } from "../../../storage/rawReportArchiveStore.js";

export const HISTORY_VIEW_REBUILD_VERSION = "v4.11z52w47";
export const HISTORY_RAW_ARCHIVE_CONTROLS_VERSION = "v4.11z52w47";

export {
    escapeHTML,
    escapeAttr,
    formatNumber,
    formatTime,
    HISTORY_SORT_OPTIONS,
    HISTORY_BUILD_OPTIONS,
    HISTORY_RUN_TYPE_OPTIONS,
    normaliseHistoryFilters,
    getHistoryTags,
    getVisibleHistoryEntries,
    getOptionLabel,
    buildHistoryEntrySearchText,
    buildHistoryRunGameBrainSummary,
    buildHistoryGameBrainInsights
};

export function buildHistoryStateModel(state = {}) {
    const history = Array.isArray(state.history) ? state.history.filter(Boolean) : [];
    const filters = normaliseHistoryFilters(state.ui?.historyFilters || {});
    const summary = buildHistorySummary(history);
    const rawSummary = buildRawArchiveSummary(state.rawArchive || state.rawReportArchive || null, history);
    const visibleEntries = getVisibleHistoryEntries(history, filters, summary);
    const pagination = buildHistoryPagination(visibleEntries, filters);
    const pagedEntries = visibleEntries.slice(pagination.startIndex, pagination.endIndex);
    const insights = buildHistoryGameBrainInsights(history);
    const highlightedEntry = pickHighlightedEntry(state, pagedEntries, history, visibleEntries);

    return {
        state,
        history,
        filters,
        summary,
        rawSummary,
        visibleEntries,
        pagedEntries,
        pagination,
        insights,
        highlightedEntry,
        tags: getHistoryTags(history)
    };
}

export function buildHistorySummary(history = []) {
    const runs = Array.isArray(history) ? history.filter(Boolean) : [];
    const active = runs.filter(run => !run?.meta?.archived);
    const archived = runs.length - active.length;
    const latest = runs.length ? runs[runs.length - 1] : null;
    const bestWaveRun = maxBy(active, run => Number(run?.core?.wave || 0));
    const bestCoinsRun = maxBy(active, run => Number(run?.core?.coins || 0));
    const bestCellsRun = maxBy(active, run => Number(run?.core?.cells || 0));
    const bestCphRun = maxBy(active, run => Number(run?.stats?.coinsPerHour ?? run?.core?.coinsPerHour ?? 0));
    const bestCellsPhRun = maxBy(active, run => Number(run?.stats?.cellsPerHour ?? run?.core?.cellsPerHour ?? 0));

    return {
        totalRuns: runs.length,
        activeRuns: active.length,
        archivedRuns: archived,
        latest: latest ? {
            label: latest.core?.battleDate || latest.meta?.reportId || "Latest report",
            sub: formatTierWave(latest)
        } : null,
        bestWave: bestWaveRun ? {
            value: Number(bestWaveRun.core?.wave || 0),
            label: `Wave ${formatWaveNumber(bestWaveRun.core?.wave || 0)}`,
            sub: bestWaveRun.core?.battleDate || "Best saved wave"
        } : null,
        bestCoins: bestCoinsRun ? { value: Number(bestCoinsRun.core?.coins || 0) } : null,
        bestCells: bestCellsRun ? { value: Number(bestCellsRun.core?.cells || 0) } : null,
        bestCoinsPerHour: bestCphRun ? { value: Number(bestCphRun.stats?.coinsPerHour ?? bestCphRun.core?.coinsPerHour ?? 0) } : null,
        bestCellsPerHour: bestCellsPhRun ? { value: Number(bestCellsPhRun.stats?.cellsPerHour ?? bestCellsPhRun.core?.cellsPerHour ?? 0) } : null
    };
}

export function buildRawArchiveSummary(rawArchive = null, history = []) {
    const runs = Array.isArray(history) ? history.filter(Boolean) : [];
    const rawBackedRuns = getRawBackedHistoryCount(runs);

    const normalised = rawArchive
        ? normaliseRawArchive(rawArchive)
        : { reports: [], reportCount: 0, version: "raw archive" };

    const reports = Array.isArray(normalised?.reports) ? normalised.reports : [];
    const archived = reports.filter(report => report?.userMeta?.archived).length;
    const pinned = reports.filter(report => report?.userMeta?.pinned).length;
    const archiveCount = Number(normalised?.reportCount || reports.length || 0) || 0;
    const reportCount = Math.max(archiveCount, rawBackedRuns);

    return {
        reportCount,
        active: Math.max(0, reportCount - archived),
        archived,
        pinned,
        parsedCacheRuns: runs.length,
        rawBackedRuns,
        parsedOnlyRuns: Math.max(0, runs.length - rawBackedRuns),
        sourceCoverageLabel: runs.length ? `${rawBackedRuns} / ${runs.length}` : "0 / 0",
        sourceCoverageComplete: runs.length > 0 && rawBackedRuns >= runs.length,
        version: normalised?.version || rawArchive?.version || "raw archive"
    };
}

export function getRawBackedHistoryCount(history = []) {
    return (Array.isArray(history) ? history : []).filter(run => Boolean(
        run?.raw?.reportText
        || run?.rawText
        || run?.rawReportText
        || run?.reportText
        || run?.battleReportText
        || run?.meta?.rawText
        || run?.meta?.rawReportText
        || run?.meta?.reportText
        || run?.source?.rawText
        || run?.source?.reportText
    )).length;
}

export function buildHistoryPagination(visibleEntries = [], filters = {}) {
    const pageSize = 6;
    const total = Array.isArray(visibleEntries) ? visibleEntries.length : 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const requested = Number.parseInt(String(filters?.page || 1), 10);
    const currentPage = Math.min(totalPages, Math.max(1, Number.isFinite(requested) ? requested : 1));
    const startIndex = total ? (currentPage - 1) * pageSize : 0;
    const endIndex = Math.min(total, startIndex + pageSize);

    return {
        pageSize,
        total,
        totalPages,
        currentPage,
        startIndex,
        endIndex,
        hasPrevious: currentPage > 1,
        hasNext: currentPage < totalPages,
        label: total ? `Showing ${startIndex + 1}–${endIndex} of ${total}` : "Showing 0 of 0"
    };
}

export function pickHighlightedEntry(state = {}, pagedEntries = [], history = [], visibleEntries = []) {
    const filters = normaliseHistoryFilters(state.ui?.historyFilters || {});
    if (filters.selectedIndex != null) {
        const selected = visibleEntries.find(entry => Number(entry.originalIndex) === Number(filters.selectedIndex));
        if (selected) return selected;
    }

    const candidates = [state.runA, state.runB, state.currentRun].filter(Boolean);

    for (const candidate of candidates) {
        const matched = visibleEntries.find(entry => sameRun(entry.run, candidate));
        if (matched) return matched;
    }

    if (pagedEntries.length) return pagedEntries[0];
    if (visibleEntries.length) return visibleEntries[0];

    const lastIndex = Array.isArray(history) ? history.length - 1 : -1;
    return lastIndex >= 0 ? { run: history[lastIndex], originalIndex: lastIndex, visibleIndex: 0 } : null;
}

export function getRunViewModel(entry = {}, state = {}) {
    const run = entry.run || null;
    const core = run?.core || {};
    const stats = run?.stats || {};
    const meta = run?.meta || {};
    const gb = buildHistoryRunGameBrainSummary(run);
    const index = Number(entry.originalIndex ?? 0);
    const displayIndex = Number(entry.visibleIndex ?? index);
    const archived = Boolean(meta.archived);
    const isRunA = sameRun(run, state.runA);
    const isRunB = sameRun(run, state.runB) && !isRunA;
    const active = isRunA || isRunB;
    const tags = normaliseTags(meta.tags).slice(0, 5);
    const buildStyle = String(meta.buildStyle || meta.build || "unknown").trim().toLowerCase() || "unknown";
    const buildLabel = getOptionLabel(HISTORY_BUILD_OPTIONS, buildStyle, "Unknown");
    const rawSource = Boolean(meta.reportId || meta.fingerprint || run?.raw?.reportText || run?.rawText);
    const runType = normaliseRunTypeForHistory(meta.runType || run?.userMeta?.runType || "normal");
    const manualMarkers = normaliseManualMarkersForHistory(meta.manualMarkers || meta.markers || run?.userMeta?.manualMarkers || []);
    const searchText = buildHistoryEntrySearchText(run, index, { mode: "normal" });
    const deepSearchText = buildHistoryEntrySearchText(run, index, { mode: "deep" });

    return {
        run,
        core,
        stats,
        meta,
        gb,
        index,
        displayIndex,
        archived,
        isRunA,
        isRunB,
        active,
        tags,
        buildStyle,
        buildLabel,
        rawSource,
        runType,
        runTypeLabel: formatRunTypeLabel(runType),
        manualMarkers,
        title: core.battleDate || meta.reportId || `Saved run ${index + 1}`,
        tierWave: formatTierWave(run),
        killedBy: core.killedBy || "Unknown",
        reportId: meta.reportId || "",
        fingerprint: meta.fingerprint || "",
        searchText,
        deepSearchText
    };
}

export function normaliseRunTypeForHistory(value = "normal") {
    const text = String(value || "normal").trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (["tournament", "farming", "milestone", "event", "test"].includes(text)) return text;
    return "normal";
}

export function formatRunTypeLabel(value = "normal") {
    const type = normaliseRunTypeForHistory(value);
    const labels = {
        normal: "Normal",
        tournament: "Tournament",
        farming: "Farming",
        milestone: "Milestone",
        event: "Event",
        test: "Test"
    };
    return labels[type] || "Normal";
}

export function normaliseManualMarkersForHistory(values = []) {
    const list = Array.isArray(values) ? values : [values];
    return Array.from(new Set(list
        .map(value => String(value || "").trim().toLowerCase())
        .filter(Boolean)));
}

export function formatTierWave(run = null) {
    const core = run?.core || {};
    return `T${core.tier ?? "?"} / Wave ${formatWaveNumber(core.wave || 0)}`;
}

export function formatWaveNumber(value = 0) {
    const num = Number(value || 0);
    if (!Number.isFinite(num)) return "0";
    return String(Math.round(num));
}

export function shortReportId(reportId = "") {
    const value = String(reportId || "").trim();
    if (!value) return "No raw ID";
    if (value.length <= 22) return value;
    return `${value.slice(0, 10)}…${value.slice(-7)}`;
}

export function normaliseTags(tags = []) {
    const source = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
            ? tags.split(/[#,.\s]+/g)
            : [];

    const seen = new Set();
    return source
        .map(tag => String(tag || "").trim().toLowerCase().replace(/^#+/, ""))
        .map(tag => tag.replace(/\s+/g, "-"))
        .filter(Boolean)
        .filter(tag => {
            if (seen.has(tag)) return false;
            seen.add(tag);
            return true;
        });
}

export function tagOptions(tags = []) {
    return [
        { value: "all", label: "All Tags" },
        ...tags.map(tag => ({ value: tag, label: `#${tag}` }))
    ];
}

export function selectControl(label, dataAttr, value, options = []) {
    const attr = String(dataAttr || "").trim();
    return `
        <label class="tbi-history2-select-control">
            <span>${escapeHTML(label)}</span>
            <select ${escapeAttr(attr)}="true">
                ${options.map(option => `<option value="${escapeAttr(option.value)}" ${option.value === value ? "selected" : ""}>${escapeHTML(option.label)}</option>`).join("")}
            </select>
        </label>
    `;
}

export function metricTile(label, value, tone = "neutral") {
    return `
        <div class="tbi-history2-metric tone-${escapeAttr(tone)}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(String(value ?? "-"))}</strong>
        </div>
    `;
}

export function statusPill(label, value, tone = "info") {
    return `
        <span class="tbi-history2-pill tone-${escapeAttr(tone)}">
            <small>${escapeHTML(label)}</small>
            <b>${escapeHTML(String(value ?? "-"))}</b>
        </span>
    `;
}

export function actionButton(label, attrs = "", extraClass = "") {
    return `<button type="button" class="tbi-history2-btn ${escapeAttr(extraClass)}" ${attrs}>${escapeHTML(label)}</button>`;
}

export function sameRun(a = null, b = null) {
    if (!a || !b) return false;
    const idA = a?.meta?.reportId || a?.meta?.id || a?.id || "";
    const idB = b?.meta?.reportId || b?.meta?.id || b?.id || "";
    if (idA && idB && idA === idB) return true;

    const fpA = a?.meta?.fingerprint || a?.fingerprint || "";
    const fpB = b?.meta?.fingerprint || b?.fingerprint || "";
    if (fpA && fpB && fpA === fpB) return true;

    return Boolean(
        a?.core?.battleDate
        && b?.core?.battleDate
        && a.core.battleDate === b.core.battleDate
        && Number(a?.core?.wave || 0) === Number(b?.core?.wave || 0)
    );
}

export function countLabel(count = 0) {
    const value = Number(count || 0);
    if (!value) return "No saved pattern yet";
    return `${value} run${value === 1 ? "" : "s"}`;
}

export function maxBy(list = [], getValue = () => 0) {
    let best = null;
    let bestValue = -Infinity;
    for (const item of list) {
        const value = Number(getValue(item) || 0);
        if (Number.isFinite(value) && value > bestValue) {
            best = item;
            bestValue = value;
        }
    }
    return best;
}
