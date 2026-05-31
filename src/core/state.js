"use strict";

/**
 * CORE STATE
 * One runtime state object, one normalisation path.
 *
 * This file deliberately has no DOM and no storage calls.
 */

const BUILD_STYLES = new Set([
    "unknown",
    "health_ehp",
    "blender",
    "devo",
    "orb_devo",
    "glass_cannon",
    "hybrid"
]);

const DEFAULT_HISTORY_FILTERS = Object.freeze({
    query: "",
    sort: "newest",
    build: "all",
    tag: "all",
    showArchived: false,
    mode: "normal",
    runType: "all",
    page: 1,
    selectedIndex: null
});

const DEFAULT_UI = Object.freeze({
    selectedSection: null,
    activeView: "dashboard",
    dashboardTab: "command",
    buildStyle: "unknown",
    historyFilters: DEFAULT_HISTORY_FILTERS
});

const DEFAULT_STATE = Object.freeze({
    runA: null,
    runB: null,
    currentRun: null,
    compareData: null,
    insights: [],
    ai: [],
    trend: [],
    anomalies: [],
    inspection: null,
    history: [],
    rawArchive: null,
    ui: DEFAULT_UI
});

const state = createState();

export function getState() {
    return state;
}

export function setState(patch = {}) {
    if (!isObject(patch)) {
        return state;
    }

    const preferredComparisonSlot = Object.prototype.hasOwnProperty.call(patch, "runB")
        ? "runB"
        : Object.prototype.hasOwnProperty.call(patch, "runA")
        ? "runA"
        : "runB";

    Object.assign(state, {
        ...patch,
        ui: normaliseUI({
            ...state.ui,
            ...(patch.ui || {})
        })
    });

    if (Array.isArray(patch.history)) {
        state.history = patch.history;
    }

    enforceDistinctComparisonSlots(preferredComparisonSlot);

    return state;
}

export function hydrateState(saved = {}) {
    if (!isObject(saved)) {
        return state;
    }

    Object.assign(state, createState(), {
        ...saved,
        runA: normaliseRun(saved.runA),
        runB: normaliseRun(saved.runB),
        currentRun: normaliseRun(saved.currentRun),
        history: Array.isArray(saved.history) ? saved.history.filter(Boolean) : [],
        rawArchive: saved.rawArchive || saved.rawReportArchive || null,
        insights: Array.isArray(saved.insights) ? saved.insights : [],
        ai: Array.isArray(saved.ai) ? saved.ai : [],
        trend: saved.trend || [],
        anomalies: Array.isArray(saved.anomalies) ? saved.anomalies : [],
        ui: normaliseUI({
            ...DEFAULT_UI,
            ...(saved.ui || {})
        })
    });

    enforceDistinctComparisonSlots("runB");

    return state;
}

export function clearRuns() {
    setState({
        runA: null,
        runB: null,
        currentRun: null,
        compareData: null,
        insights: [],
        ai: [],
        anomalies: [],
        inspection: null,
        ui: {
            selectedSection: null
        }
    });

    return state;
}

export function clearAnalysis() {
    setState({
        compareData: null,
        insights: [],
        ai: [],
        anomalies: [],
        inspection: null,
        ui: {
            selectedSection: null
        }
    });

    return state;
}

function enforceDistinctComparisonSlots(preferredSlot = "runB") {
    if (!sameRunIdentity(state.runA, state.runB)) {
        return state;
    }

    const keepRunA = preferredSlot === "runA";
    const keptRun = keepRunA ? state.runA : state.runB;
    const clearedRun = keepRunA ? state.runB : state.runA;

    if (keepRunA) {
        state.runB = null;
    } else {
        state.runA = null;
    }

    if (!state.currentRun || sameRunIdentity(state.currentRun, clearedRun)) {
        state.currentRun = keptRun || state.runB || state.runA || null;
    }

    state.compareData = null;
    state.insights = [];
    state.ai = [];
    state.anomalies = [];
    state.inspection = null;

    return state;
}

function sameRunIdentity(a = null, b = null) {
    if (!a || !b) return false;

    const idA = a?.meta?.reportId || a?.meta?.id || a?.id || "";
    const idB = b?.meta?.reportId || b?.meta?.id || b?.id || "";

    if (idA && idB) {
        return String(idA) === String(idB);
    }

    const coreA = a?.core || {};
    const coreB = b?.core || {};
    const keyA = [
        coreA.battleDate || coreA.battle_date || "",
        coreA.tier || 0,
        coreA.wave || 0,
        coreA.coins || 0,
        coreA.cells || 0,
        coreA.time || 0,
        coreA.killedBy || coreA.killed_by || ""
    ].join("|");
    const keyB = [
        coreB.battleDate || coreB.battle_date || "",
        coreB.tier || 0,
        coreB.wave || 0,
        coreB.coins || 0,
        coreB.cells || 0,
        coreB.time || 0,
        coreB.killedBy || coreB.killed_by || ""
    ].join("|");

    return Boolean(keyA && keyB && keyA === keyB);
}

export function setBuildStyle(buildStyle = "unknown") {
    const selected = normaliseBuildStyle(buildStyle);

    setState({
        ui: {
            buildStyle: selected
        }
    });

    return selected;
}

export function getBuildStyle() {
    return state.ui?.buildStyle || "unknown";
}

export function setActiveView(activeView = "dashboard") {
    const view = String(activeView || "dashboard").trim() || "dashboard";

    setState({
        ui: {
            activeView: view
        }
    });

    return view;
}

export function resetState() {
    Object.assign(state, createState());
    return state;
}

export function createState() {
    return {
        runA: null,
        runB: null,
        currentRun: null,
        compareData: null,
        insights: [],
        ai: [],
        trend: [],
        anomalies: [],
        inspection: null,
        history: [],
        rawArchive: null,
        ui: normaliseUI(DEFAULT_UI)
    };
}

export function normaliseBuildStyle(value = "unknown") {
    const key = String(value || "unknown")
        .trim()
        .toLowerCase()
        .replace(/[\s/]+/g, "_")
        .replace(/__+/g, "_");

    return BUILD_STYLES.has(key) ? key : "unknown";
}

export function normaliseHistoryFilters(filters = {}) {
    const merged = {
        ...DEFAULT_HISTORY_FILTERS,
        ...(isObject(filters) ? filters : {})
    };

    const rawMode = isObject(filters) && filters.mode == null && filters.searchMode != null
        ? filters.searchMode
        : merged.mode;

    const mode = String(rawMode || "normal")
        .trim()
        .toLowerCase() === "deep"
        ? "deep"
        : "normal";

    return {
        query: String(merged.query || ""),
        sort: String(merged.sort || "newest"),
        build: String(merged.build || "all"),
        tag: String(merged.tag || "all"),
        runType: String(merged.runType || "all"),
        page: normalisePositiveInteger(merged.page, 1),
        selectedIndex: normaliseNullableIndex(merged.selectedIndex),
        showArchived: Boolean(merged.showArchived),
        mode
    };
}

function normaliseUI(ui = {}) {
    const merged = {
        ...DEFAULT_UI,
        ...(isObject(ui) ? ui : {})
    };

    return {
        ...merged,
        buildStyle: normaliseBuildStyle(merged.buildStyle),
        historyFilters: normaliseHistoryFilters(merged.historyFilters),
        selectedSection: merged.selectedSection || null,
        activeView: String(merged.activeView || "dashboard"),
        dashboardTab: String(merged.dashboardTab || "command")
    };
}

function normaliseRun(run = null) {
    return isObject(run) ? run : null;
}

function normalisePositiveInteger(value = 1, fallback = 1) {
    const num = Number.parseInt(String(value ?? fallback), 10);
    return Number.isFinite(num) && num > 0 ? num : fallback;
}

function normaliseNullableIndex(value = null) {
    if (value == null || value === "") return null;
    const num = Number.parseInt(String(value), 10);
    return Number.isFinite(num) && num >= 0 ? num : null;
}

function isObject(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
