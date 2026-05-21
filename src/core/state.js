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
    showArchived: false
});

const DEFAULT_UI = Object.freeze({
    selectedSection: null,
    debug: false,
    activeView: "dashboard",
    dashboardTab: "overview",
    buildStyle: "unknown",
    historyFilters: DEFAULT_HISTORY_FILTERS,
    quietDisplay: false
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
        insights: Array.isArray(saved.insights) ? saved.insights : [],
        ai: Array.isArray(saved.ai) ? saved.ai : [],
        trend: saved.trend || [],
        anomalies: Array.isArray(saved.anomalies) ? saved.anomalies : [],
        ui: normaliseUI({
            ...DEFAULT_UI,
            ...(saved.ui || {})
        })
    });

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

    return {
        query: String(merged.query || ""),
        sort: String(merged.sort || "newest"),
        build: String(merged.build || "all"),
        tag: String(merged.tag || "all"),
        showArchived: Boolean(merged.showArchived)
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
        dashboardTab: String(merged.dashboardTab || "overview"),
        debug: Boolean(merged.debug),
        quietDisplay: Boolean(merged.quietDisplay)
    };
}

function normaliseRun(run = null) {
    return isObject(run) ? run : null;
}

function isObject(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
