"use strict";

/**
 * APP CONFIG V9
 * Centralised runtime configuration
 * - pipeline safe
 * - UI safe
 * - diagnostics ready
 * - future module expansion ready
 */

export const appConfig = {

    /* --------------------------------------------------
       APP
    -------------------------------------------------- */

    app: {

        name: "Tower Battle Intel",

        version: "v4.11z52",

        buildVersion: "v4.11z52w59",

        displayVersion: "v4.11z52w59",

        environment: "production"
    },

    /* --------------------------------------------------
       UI
    -------------------------------------------------- */

    ui: {

        autoRender: true,

        renderThrottleMs: 80,

        animations: true,

        maxPanels: 2,

        defaultSection: "command",

        persistUIState: true
    },

    /* --------------------------------------------------
       PARSER
    -------------------------------------------------- */

    parser: {

        strictMode: true,

        allowEmptyFields: false,

        repairMalformedLines: true,

        normalizeKeys: true,

        normalizeValues: true,

        defaultValue: 0
    },

    /* --------------------------------------------------
       COMPUTE ENGINE
    -------------------------------------------------- */

    compute: {

        safeMath: true,

        clampNegativeValues: true,

        preventNaN: true,

        safeDivision: true,

        precision: 4
    },

    /* --------------------------------------------------
       COMPARE ENGINE
    -------------------------------------------------- */

    compare: {

        enabled: true,

        tolerance: 0.01,

        enableSummaryLayer: true,

        enableSectionDiffs: true,

        deepCompare: true
    },

    /* --------------------------------------------------
       ANALYSIS
    -------------------------------------------------- */

    analysis: {

        maxInsights: 10,

        enableHeuristics: true,

        enableTrendAnalysis: true,

        enableAnomalyDetection: true,

        enableAIRecommendations: true
    },

    /* --------------------------------------------------
       HISTORY
    -------------------------------------------------- */

    history: {

        enabled: true,

        maxEntries: 100,

        preventDuplicates: true,

        autoPersist: true
    },

    /* --------------------------------------------------
       STORAGE
    -------------------------------------------------- */

    storage: {

        localStorageKey: "battle_analyser_state",

        autoSave: true,

        compress: false
    },

    /* --------------------------------------------------
       OPTIMISER
    -------------------------------------------------- */

    optimiser: {

        decimals: 2,

        fallbackValue: 0,

        prioritiseEfficiency: true
    }
};















