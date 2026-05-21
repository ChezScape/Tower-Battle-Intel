"use strict";

/**
 * HISTORY FILTERS
 * Pure filter/sort helpers for Battle History Trace.
 */

export const HISTORY_SORT_OPTIONS = Object.freeze([
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "wave_desc", label: "Highest Wave" },
    { value: "coins_desc", label: "Highest Coins" },
    { value: "cells_desc", label: "Highest Cells" },
    { value: "cph_desc", label: "Highest Coins/h" },
    { value: "cellsph_desc", label: "Highest Cells/h" },
    { value: "quality_desc", label: "Best Score" },
    { value: "tier_desc", label: "Highest Tier" }
]);

export const HISTORY_BUILD_OPTIONS = Object.freeze([
    { value: "all", label: "All Builds" },
    { value: "unknown", label: "Unknown" },
    { value: "health_ehp", label: "Health / EHP" },
    { value: "blender", label: "Blender" },
    { value: "devo", label: "Devo" },
    { value: "orb_devo", label: "Orb Devo" },
    { value: "glass_cannon", label: "Glass Cannon" },
    { value: "hybrid", label: "Hybrid" }
]);

export function normaliseHistoryFilters(filters = {}) {
    const safe = filters && typeof filters === "object" ? filters : {};

    return {
        query: String(safe.query || ""),
        sort: normaliseSort(safe.sort || "newest"),
        build: normaliseBuild(safe.build || "all"),
        tag: normaliseTagFilter(safe.tag || "all"),
        showArchived: Boolean(safe.showArchived)
    };
}

export function getHistoryTags(history = []) {
    const tags = new Set();

    getHistoryEntries(history).forEach(entry => {
        getRunTags(entry.run).forEach(tag => tags.add(tag));
    });

    return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

export function getHistoryEntries(history = []) {
    return Array.isArray(history)
        ? history.map((run, index) => ({ run, originalIndex: index })).filter(entry => Boolean(entry.run))
        : [];
}

export function getVisibleHistoryEntries(history = [], filters = {}, summary = null) {
    const safeFilters = normaliseHistoryFilters(filters);
    const query = safeFilters.query.trim().toLowerCase();

    const entries = getHistoryEntries(history)
        .filter(entry => {
            const run = entry.run;
            const archived = Boolean(run?.meta?.archived);

            if (!safeFilters.showArchived && archived) return false;
            if (safeFilters.build !== "all" && getRunBuildStyle(run) !== safeFilters.build) return false;
            if (safeFilters.tag !== "all" && !getRunTags(run).includes(safeFilters.tag)) return false;
            if (query && !historyEntryMatchesQuery(run, query, entry.originalIndex)) return false;

            return true;
        });

    return sortHistoryEntries(entries, safeFilters.sort, summary)
        .map((entry, position) => ({
            ...entry,
            visibleIndex: position
        }));
}

export function historyEntryMatchesQuery(run = null, query = "", index = 0) {
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) return true;

    const core = run?.core || {};
    const meta = run?.meta || {};
    const stats = run?.stats || {};
    const tags = getRunTags(run).join(" ");
    const sectionNames = Object.keys(run?.sections || {}).join(" ");

    const haystack = [
        `run ${Number(index) + 1}`,
        core.battleDate,
        core.tier,
        core.wave,
        core.coins,
        core.cells,
        core.killedBy,
        stats.coinsPerHour,
        stats.cellsPerHour,
        meta.reportId,
        meta.buildStyle,
        meta.build,
        meta.notes,
        tags,
        sectionNames
    ]
        .filter(value => value != null)
        .join(" ")
        .toLowerCase();

    return haystack.includes(needle);
}

export function getRunBuildStyle(run = null) {
    return normaliseBuild(run?.meta?.buildStyle || run?.meta?.build || "unknown", { allowAll: false });
}

export function getRunTags(run = null) {
    const source = Array.isArray(run?.meta?.tags)
        ? run.meta.tags
        : typeof run?.meta?.tags === "string"
            ? run.meta.tags.split(/[#,\s]+/g)
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

export function sortHistoryEntries(entries = [], sort = "newest", summary = null) {
    const safeSort = normaliseSort(sort);

    const scored = entries.map(entry => ({
        ...entry,
        score: summary && entry.run ? scoreRun(entry.run, summary) : 0
    }));

    return [...scored].sort((a, b) => {
        switch (safeSort) {
            case "oldest":
                return a.originalIndex - b.originalIndex;

            case "wave_desc":
                return numberValue(b.run?.core?.wave) - numberValue(a.run?.core?.wave);

            case "coins_desc":
                return numberValue(b.run?.core?.coins) - numberValue(a.run?.core?.coins);

            case "cells_desc":
                return numberValue(b.run?.core?.cells) - numberValue(a.run?.core?.cells);

            case "cph_desc":
                return getCoinsPerHour(b.run) - getCoinsPerHour(a.run);

            case "cellsph_desc":
                return getCellsPerHour(b.run) - getCellsPerHour(a.run);

            case "tier_desc":
                return numberValue(b.run?.core?.tier) - numberValue(a.run?.core?.tier);

            case "quality_desc":
                return b.score - a.score;

            case "newest":
            default:
                return b.originalIndex - a.originalIndex;
        }
    });
}

export function getOptionLabel(options = [], value = "", fallback = "") {
    return options.find(option => option.value === value)?.label || fallback || String(value || "");
}

function scoreRun(run = null, summary = null) {
    if (!run || !summary) return 0;

    const wave = ratio(run?.core?.wave, summary?.bestWave?.value);
    const coins = ratio(run?.core?.coins, summary?.bestCoins?.value);
    const cells = ratio(run?.core?.cells, summary?.bestCells?.value);
    const cph = ratio(getCoinsPerHour(run), summary?.bestCoinsPerHour?.value);
    const cellsph = ratio(getCellsPerHour(run), summary?.bestCellsPerHour?.value);

    return wave * 0.24 + coins * 0.22 + cells * 0.18 + cph * 0.18 + cellsph * 0.18;
}

function ratio(value = 0, best = 0) {
    const current = numberValue(value);
    const limit = numberValue(best);
    if (limit <= 0) return 0;
    return Math.min(100, Math.max(0, (current / limit) * 100));
}

function getCoinsPerHour(run = null) {
    return numberValue(run?.stats?.coinsPerHour ?? run?.core?.coinsPerHour ?? 0);
}

function getCellsPerHour(run = null) {
    return numberValue(run?.stats?.cellsPerHour ?? run?.core?.cellsPerHour ?? 0);
}

function numberValue(value = 0) {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
}

function normaliseSort(value = "newest") {
    const key = String(value || "newest").trim().toLowerCase();
    return HISTORY_SORT_OPTIONS.some(option => option.value === key) ? key : "newest";
}

function normaliseBuild(value = "all", { allowAll = true } = {}) {
    const key = String(value || (allowAll ? "all" : "unknown"))
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/\//g, "_")
        .replace(/__+/g, "_");

    const allowed = HISTORY_BUILD_OPTIONS.some(option => option.value === key);

    if (allowed && (allowAll || key !== "all")) return key;
    return allowAll ? "all" : "unknown";
}

function normaliseTagFilter(value = "all") {
    const key = String(value || "all").trim().toLowerCase().replace(/^#+/, "");
    return key || "all";
}

export default {
    HISTORY_SORT_OPTIONS,
    HISTORY_BUILD_OPTIONS,
    normaliseHistoryFilters,
    getHistoryTags,
    getHistoryEntries,
    getVisibleHistoryEntries,
    historyEntryMatchesQuery,
    getRunBuildStyle,
    getRunTags,
    sortHistoryEntries,
    getOptionLabel
};
