"use strict";

/**
 * UI STATE STORE v4.11c
 * Browser-only UI choices live here and mirror into global state.
 */

const DEFAULT_HISTORY_DRAWERS = Object.freeze({
    summary: true,
    filter: true
});

const DEFAULT_UI_STATE = Object.freeze({
    selectedSection: null,
    activeView: "dashboard",
    viewMode: "default",
    dashboardTab: "command",
    buildStyle: "unknown",
    historyFilters: {
        query: "",
        sort: "newest",
        build: "all",
        tag: "all",
        showArchived: false
    },
    historyDrawers: DEFAULT_HISTORY_DRAWERS
});

const uiState = clone(DEFAULT_UI_STATE);

export function getUIState() {
    return uiState;
}

export function setUIState(partial = {}) {
    if (!isObject(partial)) return uiState;
    mergeUI(partial);
    return uiState;
}

export function hydrateUIState(state = {}) {
    const incoming = isObject(state?.ui) ? state.ui : {};
    mergeUI(incoming);
    return uiState;
}

export function resetUIState() {
    Object.assign(uiState, clone(DEFAULT_UI_STATE));
    return uiState;
}

export function normaliseDashboardTab(tab = "command") {
    const value = String(tab || "command").trim().toLowerCase();
    const aliases = {
        dashboard: "overview",
        intel: "compare",
        gains: "compare",
        losses: "compare",
        deck: "command",
        commanddeck: "command"
    };
    const normalised = aliases[value] || value;
    return allowedTabs().has(normalised) ? normalised : "command";
}

export function allowedTabs() {
    return new Set([
        "overview",
        "compare",
        "systems",
        "coach",
        "history",
        "anomalies",
        "command",
        "more",
        "settings"
    ]);
}

function mergeUI(partial = {}) {
    const next = {
        ...uiState,
        ...partial,
        historyFilters: {
            ...DEFAULT_UI_STATE.historyFilters,
            ...(uiState.historyFilters || {}),
            ...(partial.historyFilters || {})
        },
        historyDrawers: {
            ...DEFAULT_HISTORY_DRAWERS,
            ...(uiState.historyDrawers || {}),
            ...(partial.historyDrawers || {})
        }
    };

    next.dashboardTab = normaliseDashboardTab(next.dashboardTab);
    next.selectedSection = next.selectedSection || null;
    next.buildStyle = String(next.buildStyle || "unknown");
    next.viewMode = String(next.viewMode || "default");
    next.activeView = String(next.activeView || "dashboard");
    next.historyFilters.query = String(next.historyFilters.query || "");
    next.historyFilters.sort = String(next.historyFilters.sort || "newest");
    next.historyFilters.build = String(next.historyFilters.build || "all");
    next.historyFilters.tag = String(next.historyFilters.tag || "all");
    next.historyFilters.showArchived = Boolean(next.historyFilters.showArchived);
    next.historyFilters.mode = String(next.historyFilters.mode || "normal").toLowerCase() === "deep" ? "deep" : "normal";

    Object.assign(uiState, next);
}

function isObject(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

export default {
    getUIState,
    setUIState,
    hydrateUIState,
    resetUIState,
    normaliseDashboardTab,
    allowedTabs
};
