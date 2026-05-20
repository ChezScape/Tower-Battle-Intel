"use strict";

/**
 * HISTORY FILTERS
 * Pure helpers for Phase 2 Battle History Trace controls.
 */

export const HISTORY_SORT_OPTIONS = Object.freeze([
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "wave_desc", label: "Highest Wave" },
    { value: "coins_desc", label: "Highest Coins" },
    { value: "cells_desc", label: "Highest Cells" },
    { value: "cph_desc", label: "Highest Coins/h" },
    { value: "quality_desc", label: "Best Score" }
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

    const safe =
        filters && typeof filters === "object"
            ? filters
            : {};

    return {
        query:
            String(safe.query || ""),

        sort:
            normaliseSort(safe.sort || "newest"),

        build:
            normaliseBuild(safe.build || "all"),

        tag:
            String(safe.tag || "all"),

        showArchived:
            Boolean(safe.showArchived)
    };
}

export function getHistoryTags(history = []) {

    const tags = new Set();

    getHistoryEntries(history).forEach(entry => {
        getRunTags(entry.run).forEach(tag => {
            if (tag) {
                tags.add(tag);
            }
        });
    });

    return Array.from(tags)
        .sort((a, b) => a.localeCompare(b));
}

export function getHistoryEntries(history = []) {

    return Array.isArray(history)
        ? history
            .map((run, index) => ({
                run,
                originalIndex: index
            }))
            .filter(entry => Boolean(entry.run))
        : [];
}

export function getVisibleHistoryEntries(history = [], filters = {}, summary = null) {

    const safeFilters =
        normaliseHistoryFilters(filters);

    const query =
        safeFilters.query
            .trim()
            .toLowerCase();

    const buildFilter =
        safeFilters.build;

    const tagFilter =
        safeFilters.tag;

    let entries =
        getHistoryEntries(history)
            .filter(entry => {

                const run =
                    entry.run;

                const archived =
                    Boolean(run?.meta?.archived);

                if (!safeFilters.showArchived && archived) {
                    return false;
                }

                if (buildFilter !== "all" && getRunBuildStyle(run) !== buildFilter) {
                    return false;
                }

                if (tagFilter !== "all" && !getRunTags(run).includes(tagFilter)) {
                    return false;
                }

                if (query && !historyEntryMatchesQuery(run, query, entry.originalIndex)) {
                    return false;
                }

                return true;
            });

    entries =
        sortHistoryEntries(entries, safeFilters.sort, summary);

    return entries.map((entry, position) => ({
        ...entry,
        visibleIndex: position
    }));
}

export function historyEntryMatchesQuery(run = null, query = "", index = 0) {

    if (!query) {
        return true;
    }

    const core =
        run?.core || {};

    const meta =
        run?.meta || {};

    const tags =
        getRunTags(run)
            .join(" ");

    const haystack = [
        `run ${Number(index) + 1}`,
        core.battleDate,
        core.tier,
        core.wave,
        core.coins,
        core.cells,
        core.killedBy,
        meta.reportId,
        meta.buildStyle,
        meta.notes,
        tags
    ]
        .filter(value => value != null)
        .join(" ")
        .toLowerCase();

    return haystack.includes(query);
}

export function getRunBuildStyle(run = null) {

    return normaliseBuild(
        run?.meta?.buildStyle ||
        run?.meta?.build ||
        "unknown"
    );
}

export function getRunTags(run = null) {

    const tags =
        Array.isArray(run?.meta?.tags)
            ? run.meta.tags
            : [];

    return tags
        .map(tag => String(tag || "").trim())
        .filter(Boolean);
}

export function sortHistoryEntries(entries = [], sort = "newest", summary = null) {

    const safeSort =
        normaliseSort(sort);

    const scored =
        entries.map(entry => ({
            ...entry,
            score:
                summary && entry.run
                    ? scoreRun(entry.run, summary)
                    : 0
        }));

    const sorted =
        [...scored].sort((a, b) => {

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

                case "quality_desc":
                    return b.score - a.score;

                case "newest":
                default:
                    return b.originalIndex - a.originalIndex;
            }
        });

    return sorted;
}

function scoreRun(run = null, summary = null) {

    if (!run || !summary) {
        return 0;
    }

    const wave =
        ratio(run?.core?.wave, summary?.bestWave?.value);

    const coins =
        ratio(run?.core?.coins, summary?.bestCoins?.value);

    const cells =
        ratio(run?.core?.cells, summary?.bestCells?.value);

    const efficiency =
        Math.min(100, Math.max(0, Number(run?.stats?.efficiency || 0) * 7.5));

    return (
        wave * 0.28 +
        coins * 0.28 +
        cells * 0.24 +
        efficiency * 0.20
    );
}

function ratio(value = 0, best = 0) {

    const current =
        numberValue(value);

    const limit =
        numberValue(best);

    if (limit <= 0) {
        return 0;
    }

    return Math.min(100, Math.max(0, (current / limit) * 100));
}

function getCoinsPerHour(run = null) {
    return numberValue(run?.stats?.coinsPerHour ?? run?.core?.coinsPerHour ?? 0);
}

function numberValue(value = 0) {

    const num =
        Number(value || 0);

    return Number.isFinite(num)
        ? num
        : 0;
}

function normaliseSort(value = "newest") {

    const key =
        String(value || "newest")
            .trim()
            .toLowerCase();

    return HISTORY_SORT_OPTIONS.some(option => option.value === key)
        ? key
        : "newest";
}

function normaliseBuild(value = "all") {

    const key =
        String(value || "all")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/\//g, "_")
            .replace(/__+/g, "_");

    return HISTORY_BUILD_OPTIONS.some(option => option.value === key)
        ? key
        : "unknown";
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
    sortHistoryEntries
};