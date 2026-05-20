"use strict";

/**
 * GLOBAL RUNTIME STATE
 * Single source of truth for Tower Battle Intel.
 */

const state = {

    // ---------------------------------
    // RUN STORAGE
    // ---------------------------------

    runA: null,
    runB: null,

    currentRun: null,

    // ---------------------------------
    // PIPELINE OUTPUT
    // ---------------------------------

    compareData: null,

    insights: [],
    ai: [],

    trend: [],
    anomalies: [],

    inspection: null,

    // ---------------------------------
    // HISTORY
    // ---------------------------------

    history: [],

    // ---------------------------------
    // UI
    // ---------------------------------

    ui: {

        selectedSection: null,

        debug: false,

        activeView: "dashboard",

        /**
         * Build-aware analysis mode.
         *
         * Allowed values:
         * - unknown
         * - health_ehp
         * - blender
         * - devo
         * - orb_devo
         * - glass_cannon
         * - hybrid
         */
        buildStyle: "unknown",

        historyFilters: {
            query: "",
            sort: "newest",
            build: "all",
            tag: "all",
            showArchived: false
        },

        /**
         * Mobile dashboard tab.
         * Desktop still renders the full dashboard.
         */
        dashboardTab: "overview"
    }
};

/* --------------------------------------------------
   GET
-------------------------------------------------- */

export function getState() {

    return state;
}

/* --------------------------------------------------
   PATCH
-------------------------------------------------- */

export function setState(patch = {}) {

    if (!patch || typeof patch !== "object") {
        return state;
    }

    Object.assign(state, {
        ...patch,

        ui: {
            ...state.ui,
            ...(patch.ui || {})
        }
    });

    return state;
}

/* --------------------------------------------------
   HYDRATE
-------------------------------------------------- */

export function hydrateState(saved = {}) {

    if (!saved || typeof saved !== "object") {
        return state;
    }

    Object.assign(state, {
        ...saved,

        ui: {
            ...state.ui,
            ...(saved.ui || {}),

            buildStyle:
                saved.ui?.buildStyle ||
                state.ui.buildStyle ||
                "unknown",

            historyFilters: {
                ...(state.ui.historyFilters || {}),
                ...(saved.ui?.historyFilters || {})
            },

            dashboardTab:
                saved.ui?.dashboardTab ||
                state.ui.dashboardTab ||
                "overview"
        }
    });

    return state;
}

/* --------------------------------------------------
   CLEAR RUNS
   Keeps history and build style.
-------------------------------------------------- */

export function clearRuns() {

    state.runA = null;
    state.runB = null;

    state.currentRun = null;

    state.compareData = null;

    state.insights = [];
    state.ai = [];

    state.trend = [];
    state.anomalies = [];

    state.inspection = null;

    state.ui.selectedSection = null;

    return state;
}

/* --------------------------------------------------
   SET BUILD STYLE
-------------------------------------------------- */

export function setBuildStyle(buildStyle = "unknown") {

    state.ui.buildStyle =
        normaliseBuildStyle(buildStyle);

    return state.ui.buildStyle;
}

/* --------------------------------------------------
   GET BUILD STYLE
-------------------------------------------------- */

export function getBuildStyle() {

    return state.ui.buildStyle || "unknown";
}

/* --------------------------------------------------
   RESET
-------------------------------------------------- */

export function resetState() {

    clearRuns();

    state.history = [];

    state.ui = {
        selectedSection: null,
        debug: false,
        activeView: "dashboard",
        buildStyle: "unknown",

        historyFilters: {
            query: "",
            sort: "newest",
            build: "all",
            tag: "all",
            showArchived: false
        },

        /**
         * Mobile dashboard tab.
         * Desktop still renders the full dashboard.
         */
        dashboardTab: "overview"
    };

    return state;
}

/* --------------------------------------------------
   BUILD STYLE NORMALISER
-------------------------------------------------- */

function normaliseBuildStyle(value = "unknown") {

    const key =
        String(value || "unknown")
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

    return allowed.has(key)
        ? key
        : "unknown";
}