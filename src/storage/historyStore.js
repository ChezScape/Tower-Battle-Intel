"use strict";

/**
 * HISTORY STORE FOUNDATION v4.11z52w12
 * Owns persisted History shape rules, filter normalisation, tags, and safe
 * candidate de-duplication for import/export fallback. No DOM behaviour here.
 */

export function normaliseHistoryRuns(history = []) {
    const runs = Array.isArray(history) ? history : [];
    const seen = new Set();
    const output = [];

    for (const run of runs.filter(Boolean)) {
        const normalised = {
            ...run,
            meta: {
                ...(run.meta || {}),
                reportId: run.meta?.reportId || run.reportId || run.id || null,
                fingerprint: run.meta?.fingerprint || run.fingerprint || null,
                savedAt: run.meta?.savedAt || null,
                archived: Boolean(run.meta?.archived),
                notes: run.meta?.notes || "",
                tags: normaliseTags(run.meta?.tags),
                buildStyle: normaliseBuildStyle(run.meta?.buildStyle || run.meta?.build || "unknown")
            }
        };

        const key = getHistoryRunStorageKey(normalised);
        if (key && seen.has(key)) continue;
        if (key) seen.add(key);
        output.push(normalised);
    }

    return output;
}

export function normaliseHistoryFilters(filters = {}) {
    const safe = filters && typeof filters === "object" ? filters : {};
    const rawMode = safe.mode || safe.searchMode;

    return {
        query: String(safe.query || ""),
        sort: String(safe.sort || "newest"),
        build: String(safe.build || "all"),
        tag: String(safe.tag || "all"),
        runType: String(safe.runType || "all"),
        page: normalisePositiveInteger(safe.page, 1),
        selectedIndex: normaliseNullableIndex(safe.selectedIndex),
        showArchived: Boolean(safe.showArchived),
        mode: rawMode === "deep" ? "deep" : "normal"
    };
}

export function normaliseUIState(ui = {}) {
    const safe = ui && typeof ui === "object" ? ui : {};

    return {
        selectedSection: safe.selectedSection ?? null,
        activeView: safe.activeView || "dashboard",
        dashboardTab: safe.dashboardTab || safe.activeView || "overview",
        buildStyle: normaliseBuildStyle(safe.buildStyle || "unknown"),
        historyFilters: normaliseHistoryFilters(safe.historyFilters)
    };
}

export function normaliseTags(tags = []) {
    const source = typeof tags === "string"
        ? tags.split(/[#\s,]+/g)
        : Array.isArray(tags)
            ? tags
            : [];

    const seen = new Set();

    return source
        .map(tag => String(tag || "").trim().replace(/^#+/, "").toLowerCase())
        .map(tag => tag.replace(/\s+/g, "-"))
        .map(tag => tag.replace(/[^a-z0-9_-]/g, ""))
        .filter(Boolean)
        .filter(tag => {
            if (seen.has(tag)) return false;
            seen.add(tag);
            return true;
        })
        .slice(0, 12);
}

export function normalisePositiveInteger(value = 1, fallback = 1) {
    const num = Number.parseInt(String(value ?? fallback), 10);
    return Number.isFinite(num) && num > 0 ? num : fallback;
}

function normaliseNullableIndex(value = null) {
    if (value == null || value === "") return null;
    const num = Number.parseInt(String(value), 10);
    return Number.isFinite(num) && num >= 0 ? num : null;
}

export function normaliseBuildStyle(value = "unknown") {
    const key = String(value || "unknown")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/\//g, "_")
        .replace(/__+/g, "_");

    const allowed = new Set([
        "unknown",
        "health_ehp",
        "blender",
        "devo",
        "orb_devo",
        "glass_cannon",
        "hybrid"
    ]);

    return allowed.has(key) ? key : "unknown";
}

export function createHistoryCandidateAccumulator() {
    const candidates = [];
    const seen = new Set();

    function addCandidate(source = "unknown", history = []) {
        const safeHistory = normaliseHistoryRuns(history).filter(Boolean);
        if (!safeHistory.length) return;

        const key = `${source}|${safeHistory.length}|${safeHistory
            .map(run => run?.meta?.reportId || run?.id || run?.core?.battleDate || "")
            .join(",")}`;

        if (seen.has(key)) return;
        seen.add(key);
        candidates.push({ source, history: safeHistory });
    }

    return {
        addCandidate,
        getCandidates: () => candidates
    };
}


function getHistoryRunStorageKey(run = {}) {
    const meta = run.meta || {};
    if (meta.reportId) return `id:${meta.reportId}`;
    if (meta.fingerprint) return `fp:${meta.fingerprint}`;

    const core = run.core || {};
    const fallback = [
        core.battleDate || core.battle_date || "",
        core.tier || 0,
        core.wave || 0,
        core.killedBy || core.killed_by || ""
    ].join("|");

    return fallback.trim() ? `fallback:${fallback}` : "";
}

export function getHistoryStoreStatus() {
    return {
        version: "v4.11z52w12",
        owner: "src/storage/historyStore.js",
        owns: ["history run normalisation", "history filters", "tags", "build style", "candidate de-dupe", "duplicate report blocking by reportId/fingerprint"]
    };
}

export default {
    normaliseHistoryRuns,
    normaliseHistoryFilters,
    normaliseUIState,
    normaliseTags,
    normaliseBuildStyle,
    createHistoryCandidateAccumulator,
    getHistoryStoreStatus
};
