"use strict";

import {
    buildGameBrainHistorySearchText
} from "./historyGameBrain.js";

/**
 * HISTORY FILTERS
 * Pure filter/sort helpers for Battle History Trace.
 */

export const HISTORY_SORT_OPTIONS = Object.freeze([
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "tier_desc", label: "Highest Tier" },
    { value: "wave_desc", label: "Highest Wave" },
    { value: "quality_desc", label: "Best Score" },
    { value: "coins_desc", label: "Highest Coins" },
    { value: "cph_desc", label: "Highest Coins/h" },
    { value: "cells_desc", label: "Highest Cells" },
    { value: "cellsph_desc", label: "Highest Cells/h" }
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

export const HISTORY_RUN_TYPE_OPTIONS = Object.freeze([
    { value: "all", label: "All Run Types" },
    { value: "normal", label: "Normal" },
    { value: "tournament", label: "Tournament" },
    { value: "farming", label: "Farming" },
    { value: "milestone", label: "Milestone" },
    { value: "event", label: "Event" },
    { value: "test", label: "Test" }
]);

export function normaliseHistoryFilters(filters = {}) {
    const safe = filters && typeof filters === "object" ? filters : {};

    return {
        query: String(safe.query || ""),
        sort: normaliseSort(safe.sort || "newest"),
        build: normaliseBuild(safe.build || "all"),
        tag: normaliseTagFilter(safe.tag || "all"),
        runType: normaliseRunTypeFilter(safe.runType || safe.type || "all"),
        page: normalisePage(safe.page || 1),
        selectedIndex: normaliseSelectedIndex(safe.selectedIndex),
        showArchived: Boolean(safe.showArchived),
        mode: String(safe.mode || safe.searchMode || "normal").toLowerCase() === "deep" ? "deep" : "normal"
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
            if (safeFilters.runType !== "all" && getRunType(run) !== safeFilters.runType) return false;
            if (query && !historyEntryMatchesQuery(run, query, entry.originalIndex, { mode: safeFilters.mode })) return false;

            return true;
        });

    return sortHistoryEntries(entries, safeFilters.sort, summary)
        .map((entry, position) => ({
            ...entry,
            visibleIndex: position
        }));
}

export function historyEntryMatchesQuery(run = null, query = "", index = 0, options = {}) {
    return searchTextMatches(buildHistoryEntrySearchText(run, index, options), query);
}

export function buildHistoryEntrySearchText(run = null, index = 0, options = {}) {
    const mode = String(options?.mode || options?.searchMode || "normal").toLowerCase() === "deep" ? "deep" : "normal";
    return mode === "deep"
        ? buildHistoryEntryDeepSearchText(run, index)
        : buildHistoryEntryNormalSearchText(run, index);
}

export function buildHistoryEntryNormalSearchText(run = null, index = 0) {
    const core = run?.core || {};
    const meta = run?.meta || {};
    const stats = run?.stats || {};
    const tags = getRunTags(run).join(" ");
    const markers = getRunManualMarkers(run).join(" ");
    const runType = getRunType(run);
    const gb = safeGameBrainSummary(run);

    return [
        `run ${Number(index) + 1}`,
        core.battleDate,
        core.tier ? `tier ${core.tier}` : "",
        core.tier ? `t${core.tier}` : "",
        core.wave ? `wave ${core.wave}` : "",
        core.wave ? `w${core.wave}` : "",
        core.wave,
        core.coins,
        core.cells,
        core.killedBy ? `killed by ${core.killedBy}` : "",
        core.killedBy,
        stats.coinsPerHour,
        stats.cellsPerHour,
        formatSearchNumber(core.coins),
        formatSearchNumber(core.cells),
        formatSearchNumber(stats.coinsPerHour),
        formatSearchNumber(stats.cellsPerHour),
        gb.nextCheckpoint ? `next checkpoint wave ${gb.nextCheckpoint}` : "",
        gb.bandLabel,
        gb.killedByLabel,
        gb.killedByMeaning,
        gb.familyLabel,
        gb.officialLabels ? `${gb.officialLabels} labels recognised` : "",
        gb.unknownLabels ? `${gb.unknownLabels} mapping polish` : "mapping clean",
        runType !== "normal" ? `${runType} run` : "normal run",
        markers,
        meta.sourceMarker,
        meta.reportId,
        meta.buildStyle,
        meta.build,
        meta.notes,
        tags
    ]
        .filter(value => value != null && String(value).trim())
        .join(" ");
}

export function buildHistoryEntryDeepSearchText(run = null, index = 0) {
    const core = run?.core || {};
    const meta = run?.meta || {};
    const stats = run?.stats || {};
    const tags = getRunTags(run).join(" ");
    const markers = getRunManualMarkers(run).join(" ");
    const runType = getRunType(run);
    const sectionNames = Object.keys(run?.sections || {}).join(" ");
    const gameBrainSearch = buildGameBrainHistorySearchText(run, index);

    return [
        buildHistoryEntryNormalSearchText(run, index),
        core.coins,
        core.cells,
        stats.coinsPerHour,
        stats.cellsPerHour,
        run?.raw?.originalText,
        run?.raw?.reportText,
        Array.isArray(run?.raw?.lines) ? run.raw.lines.join(" ") : "",
        runType,
        markers,
        meta.sourceMarker,
        meta.reportId,
        meta.buildStyle,
        meta.build,
        meta.notes,
        tags,
        sectionNames,
        gameBrainSearch
    ]
        .filter(value => value != null && String(value).trim())
        .join(" ");
}

function safeGameBrainSummary(run = null) {
    try {
        return buildGameBrainHistorySearchText && run
            ? normaliseGameBrainSummary(run)
            : {};
    } catch (_error) {
        return {};
    }
}

function normaliseGameBrainSummary(run = null) {
    // buildGameBrainHistorySearchText is intentionally kept for deep mode.
    // Normal mode should only expose user-visible run-card style facts, so
    // derive these common fields without pulling in raw report/schema labels.
    const core = run?.core || {};
    const parsed = run?.gameBrain || run?.meta?.gameBrain || run?.historyGameBrainSummary || {};
    const readable = parsed?.readableSummary || {};

    return {
        nextCheckpoint: parsed.nextCheckpoint || readable.nextCheckpoint || "",
        bandLabel: parsed.bandLabel || readable.bandLabel || "",
        killedByLabel: parsed.killedByLabel || core.killedBy || "",
        killedByMeaning: parsed.killedByMeaning || "",
        familyLabel: parsed.familyLabel || parsed.topFamily || "",
        officialLabels: parsed.officialLabels || parsed.recognisedLabels || readable.officialLabels || "",
        unknownLabels: parsed.unknownLabels || readable.unknownLabels || 0
    };
}

export function searchTextMatches(haystack = "", query = "") {
    const tokens = normaliseSearchText(query).split(/\s+/g).filter(Boolean);
    if (!tokens.length) return true;

    const text = normaliseSearchText(haystack);
    return tokens.every(token => text.includes(token));
}

export function normaliseSearchText(value = "") {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9+]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
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

export function getRunType(run = null) {
    const value = String(run?.meta?.runType || run?.userMeta?.runType || "normal").trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (["tournament", "farming", "milestone", "event", "test"].includes(value)) return value;
    return "normal";
}

export function getRunManualMarkers(run = null) {
    const source = Array.isArray(run?.meta?.manualMarkers)
        ? run.meta.manualMarkers
        : Array.isArray(run?.meta?.markers)
            ? run.meta.markers
            : Array.isArray(run?.userMeta?.manualMarkers)
                ? run.userMeta.manualMarkers
                : [];

    return Array.from(new Set(source
        .map(value => String(value || "").trim().toLowerCase())
        .filter(Boolean)));
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


function formatSearchNumber(value = 0) {
    const num = Number(value || 0);
    if (!Number.isFinite(num) || num === 0) return String(value || "");

    const units = [
        [1e18, "Q"],
        [1e15, "q"],
        [1e12, "T"],
        [1e9, "B"],
        [1e6, "M"],
        [1e3, "K"]
    ];

    const unit = units.find(([limit]) => Math.abs(num) >= limit);
    if (!unit) return String(num);

    const [limit, suffix] = unit;
    const short = num / limit;
    const fixed = short >= 100 ? short.toFixed(0) : short >= 10 ? short.toFixed(1) : short.toFixed(2);
    return `${fixed.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1")}${suffix}`;
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

function normaliseRunTypeFilter(value = "all") {
    const key = String(value || "all").trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (key === "all") return "all";
    return getRunType({ meta: { runType: key } });
}

function normalisePage(value = 1) {
    const num = Number.parseInt(String(value || 1), 10);
    return Number.isFinite(num) && num > 0 ? num : 1;
}

function normaliseSelectedIndex(value = null) {
    if (value == null || value === "") return null;
    const num = Number.parseInt(String(value), 10);
    return Number.isFinite(num) && num >= 0 ? num : null;
}

export default {
    HISTORY_SORT_OPTIONS,
    HISTORY_BUILD_OPTIONS,
    HISTORY_RUN_TYPE_OPTIONS,
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
