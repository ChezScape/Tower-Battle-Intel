"use strict";

/**
 * ACTION LAYER v4.10j
 * One command bus for visible UI actions.
 * Root/action/style sync: supports current data-ui-action names and legacy aliases.
 *
 * UI path:
 * button/input/select -> src/ui/events.js -> here -> core/history/state/update -> render
 */

import {
    update,
    saveReportToHistory,
    refreshAnalysis
} from "../core/update.js";

import {
    getState,
    setState,
    resetState,
    clearRuns,
    setBuildStyle
} from "../core/state.js";

import {
    clearHistory,
    deleteHistoryRun,
    deleteLastHistory,
    loadHistoryRun,
    swapHistorySlots,
    clearHistorySelection,
    archiveHistoryRun,
    restoreHistoryRun,
    updateHistoryRunMeta,
    setHistoryFilters,
    exportHistoryJSON,
    importHistoryRuns
} from "../core/history.js";

import {
    saveStorage,
    clearStorage
} from "../storage/localStore.js";

/* --------------------------------------------------
   GENERIC COMMAND BUS
-------------------------------------------------- */

export function performUIAction(action = "", payload = {}) {

    const key = normaliseActionKey(action);

    switch (key) {
        case "save-report":
        case "save-report-to-history":
            return actionSaveReportFromInput(payload.input || getDocument()?.getElementById?.("input"));

        case "save-run-a":
            return actionParseInput(getInputText(payload.input), "runA");

        case "save-run-b":
            return actionParseInput(getInputText(payload.input), "runB");

        case "clear-input":
            return actionClearInput(payload.input || getDocument()?.getElementById?.("input"));

        case "clear-runs":
            return actionClearRuns();

        case "reset":
        case "reset-all":
            return actionReset();

        case "set-dashboard-tab":
            return actionSetDashboardTab(payload.tab || payload.dashboardTab || "overview");

        case "open-command":
            return actionSetDashboardTab("command");

        case "open-history":
            return actionSetDashboardTab("history");

        case "open-settings":
            return actionSetDashboardTab("settings");

        case "open-anomalies":
            return actionSetDashboardTab("anomalies");

        case "open-compare":
        case "open-compare-section":
            return actionOpenCompare(payload.section || payload.compareSection || null);

        case "select-section":
        case "toggle-section":
            return actionSelectSection(payload.section || null);

        case "set-build-style":
            return actionSetBuildStyle(payload.buildStyle || payload.value || "unknown");

        case "toggle-debug":
            return actionToggleDebug(payload.force ?? null);

        case "toggle-display-mode":
            return actionToggleDisplayMode();

        case "history-load-run":
            return actionLoadHistoryRun(payload.index, payload.slot || "runA");

        case "history-swap-slots":
            return actionSwapHistorySlots();

        case "history-clear-selection":
            return actionClearHistorySelection();

        case "history-archive-run":
            return actionArchiveHistoryRun(payload.index);

        case "history-restore-run":
            return actionRestoreHistoryRun(payload.index);

        case "history-delete-run":
            return actionDeleteHistoryRun(payload.index);

        case "history-delete-last":
            return actionDeleteLastRun();

        case "history-delete-all":
        case "history-clear-all":
            return actionClearHistory();

        case "history-set-filters":
            return actionSetHistoryFilters(payload.filters || payload);

        case "history-reset-filters":
            return actionResetHistoryFilters();

        case "history-update-meta":
            return actionUpdateHistoryRunMeta(payload.index, payload.meta || {});

        case "history-import-text":
        case "history-import-json":
        case "import-history-text":
        case "import-history-json":
            return actionImportHistoryText(payload.text || payload.json || "");

        case "history-export-json":
        case "history-export":
        case "export-history":
        case "export-history-json":
            return actionExportHistoryJSON();

        case "delete-last-history":
            return actionDeleteLastRun();

        case "delete-all-history":
        case "clear-all-history":
            return actionClearHistory();

        case "archive-history-run":
            return actionArchiveHistoryRun(payload.index);

        case "restore-history-run":
            return actionRestoreHistoryRun(payload.index);

        case "delete-history-run":
            return actionDeleteHistoryRun(payload.index);

        case "open-dashboard":
            return actionSetDashboardTab("overview");

        case "open-systems":
            return actionSetDashboardTab("systems");

        case "open-coach":
            return actionSetDashboardTab("coach");

        case "open-more":
            return actionSetDashboardTab("more");

        case "toggle-quiet-display":
            return actionToggleDisplayMode();

        default:
            console.warn("[Tower Battle Intel] Unknown UI action:", action, payload);
            return null;
    }
}

/* --------------------------------------------------
   INPUT / SAVE
-------------------------------------------------- */

export function actionParseInput(rawText, slot = "history") {

    const text = String(rawText || "").trim();

    if (!text) {
        return null;
    }

    const result = update(text, normaliseSlot(slot));

    if (!result) {
        return null;
    }

    persist();

    return result;
}

export function actionSaveReportFromInput(input = null) {

    const target = input || getDocument()?.getElementById?.("input") || null;
    const text = getInputText(target);

    if (!text.trim()) {
        if (target) {
            target.placeholder = "Paste a battle report first...";
        }
        console.warn("[Tower Battle Intel] Save Report blocked: empty input");
        return null;
    }

    const result = saveReportToHistory(text);

    if (!result) {
        console.warn("[Tower Battle Intel] Save Report failed");
        return null;
    }

    if (target) {
        target.value = "";
        target.placeholder = "Saved to Battle History. Paste another report here...";
    }

    persist({ lastInput: "" });

    return result;
}

export function actionClearInput(input = null) {

    const target = input || getDocument()?.getElementById?.("input") || null;

    if (target) {
        target.value = "";
        target.placeholder = "Paste Battle Report Here...";
    }

    persist({ lastInput: "" });

    return true;
}

/* --------------------------------------------------
   CORE STATE ACTIONS
-------------------------------------------------- */

export function actionReset() {
    resetState();
    clearStorage();
    return getState();
}

export function actionClearRuns() {
    clearRuns();
    refreshAnalysis({ reason: "clear_runs" });
    persist();
    return getState();
}

export function actionSetDashboardTab(dashboardTab = "overview") {

    const tab = normaliseDashboardTab(dashboardTab);
    const state = getState();

    setState({
        ui: {
            ...(state.ui || {}),
            dashboardTab: tab
        }
    });

    persist();

    return tab;
}

export function actionOpenCompare(section = null) {

    const state = getState();

    setState({
        ui: {
            ...(state.ui || {}),
            dashboardTab: "compare",
            selectedSection: section || state.ui?.selectedSection || null
        }
    });

    persist();

    return getState().ui;
}

export function actionSelectSection(section = null) {

    const state = getState();
    const value = String(section || "").trim();

    const selectedSection =
        value && state.ui?.selectedSection === value
            ? null
            : value || null;

    setState({
        ui: {
            ...(state.ui || {}),
            selectedSection
        }
    });

    persist();

    return selectedSection;
}

export function actionSetBuildStyle(buildStyle = "unknown") {

    const selected = setBuildStyle(buildStyle);

    refreshAnalysis({
        reason: "build_style_changed",
        buildStyle: selected
    });

    persist();

    return selected;
}

export function actionToggleDebug(force = null) {

    const state = getState();
    const current = Boolean(state?.ui?.debug);
    const next = typeof force === "boolean" ? force : !current;

    setState({
        ui: {
            ...(state.ui || {}),
            debug: next
        }
    });

    persist();

    return next;
}

export function actionToggleDisplayMode() {

    const doc = getDocument();
    const root = doc?.documentElement || null;
    const body = doc?.body || null;

    const next = !root?.classList?.contains("tbi-quiet-display");

    root?.classList?.toggle("tbi-quiet-display", next);
    body?.classList?.toggle("tbi-quiet-display", next);

    const state = getState();

    setState({
        ui: {
            ...(state.ui || {}),
            quietDisplay: next
        }
    });

    persist();

    return next;
}

/* --------------------------------------------------
   HISTORY ACTIONS
-------------------------------------------------- */

export function actionLoadHistoryRun(index, slot = "runA") {

    const safeIndex = toSafeIndex(index);
    const targetSlot = normaliseSlot(slot);

    if (safeIndex < 0) {
        return null;
    }

    const run = loadHistoryRun(safeIndex, targetSlot);

    if (!run) {
        return null;
    }

    refreshAnalysis({
        reason: "load_history_run",
        historyIndex: safeIndex,
        targetSlot
    });

    persist();

    return run;
}

export function actionSwapHistorySlots() {
    swapHistorySlots();
    refreshAnalysis({ reason: "swap_history_slots" });
    persist();
    return getState();
}

export function actionClearHistorySelection() {
    clearHistorySelection();
    refreshAnalysis({ reason: "clear_history_selection" });
    persist();
    return getState();
}

export function actionArchiveHistoryRun(index = -1) {

    const safeIndex = toSafeIndex(index);

    if (safeIndex < 0) {
        return null;
    }

    archiveHistoryRun(safeIndex);

    refreshAnalysis({
        reason: "archive_history_run",
        historyIndex: safeIndex
    });

    persist();

    return getState().history;
}

export function actionRestoreHistoryRun(index = -1) {

    const safeIndex = toSafeIndex(index);

    if (safeIndex < 0) {
        return null;
    }

    restoreHistoryRun(safeIndex);

    refreshAnalysis({
        reason: "restore_history_run",
        historyIndex: safeIndex
    });

    persist();

    return getState().history;
}

export function actionDeleteHistoryRun(index = -1) {

    const safeIndex = toSafeIndex(index);

    if (safeIndex < 0) {
        return null;
    }

    deleteHistoryRun(safeIndex);

    refreshAnalysis({
        reason: "delete_history_run",
        historyIndex: safeIndex
    });

    persist();

    return getState().history;
}

export function actionDeleteLastRun() {
    deleteLastHistory();
    refreshAnalysis({ reason: "delete_last_history" });
    persist();
    return getState().history;
}

export function actionClearHistory() {
    clearHistory();
    refreshAnalysis({ reason: "clear_history" });
    persist();
    return getState();
}

export function actionSetHistoryFilters(filters = {}) {
    const next = setHistoryFilters(filters || {});
    persist();
    return next;
}

export function actionResetHistoryFilters() {
    return actionSetHistoryFilters({
        query: "",
        sort: "newest",
        build: "all",
        tag: "all",
        showArchived: false
    });
}

export function actionUpdateHistoryRunMeta(index = -1, meta = {}) {

    const safeIndex = toSafeIndex(index);

    if (safeIndex < 0) {
        return null;
    }

    const updated = updateHistoryRunMeta(safeIndex, meta || {});

    refreshAnalysis({
        reason: "update_history_meta",
        historyIndex: safeIndex
    });

    persist();

    return updated;
}

export function actionExportHistoryJSON() {
    return exportHistoryJSON();
}

export function actionImportHistoryText(text = "") {

    const imported = importHistoryRuns(text);

    refreshAnalysis({
        reason: "import_history"
    });

    persist();

    return imported;
}

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

export function actionGetState() {
    return getState();
}

function persist(extra = null) {
    saveStorage(
        extra && typeof extra === "object"
            ? { ...getState(), ...extra }
            : getState()
    );
}

function getDocument() {
    return typeof document !== "undefined" ? document : null;
}

function getInputText(input = null) {
    return String(input?.value || "");
}

function toSafeIndex(index = -1) {
    const value = Number(index);
    return Number.isInteger(value) && value >= 0 ? value : -1;
}

function normaliseSlot(slot = "runA") {

    const value = String(slot || "runA")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    if (value === "a" || value === "runa") {
        return "runA";
    }

    if (value === "b" || value === "runb") {
        return "runB";
    }

    if (value === "history") {
        return "history";
    }

    return "runA";
}

function normaliseDashboardTab(tab = "overview") {

    const value = String(tab || "overview")
        .trim()
        .toLowerCase();

    const aliases = {
        dashboard: "overview",
        intel: "compare",
        gains: "compare",
        losses: "compare"
    };

    const normalised = aliases[value] || value;

    const allowed = new Set([
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

    return allowed.has(normalised) ? normalised : "overview";
}

function normaliseActionKey(action = "") {
    return String(action || "")
        .trim()
        .toLowerCase()
        .replace(/_/g, "-");
}

const ACTION_API = Object.freeze({
    performUIAction,
    actionParseInput,
    actionSaveReportFromInput,
    actionClearInput,
    actionReset,
    actionClearRuns,
    actionSetDashboardTab,
    actionOpenCompare,
    actionSelectSection,
    actionSetBuildStyle,
    actionToggleDebug,
    actionToggleDisplayMode,
    actionLoadHistoryRun,
    actionSwapHistorySlots,
    actionClearHistorySelection,
    actionArchiveHistoryRun,
    actionRestoreHistoryRun,
    actionDeleteHistoryRun,
    actionDeleteLastRun,
    actionClearHistory,
    actionSetHistoryFilters,
    actionResetHistoryFilters,
    actionUpdateHistoryRunMeta,
    actionExportHistoryJSON,
    actionImportHistoryText,
    actionGetState,

    // Browser fallback aliases used by the native control backbone.
    perform(action, payload) {
        return performUIAction(action, payload);
    },

    exportHistoryJSON() {
        return actionExportHistoryJSON();
    },

    importHistoryText(text) {
        return actionImportHistoryText(text);
    },

    getState() {
        return actionGetState();
    }
});

installGlobalActionBridge(ACTION_API);

function installGlobalActionBridge(api) {
    if (typeof window === "undefined") return;

    window.TowerBattleIntelActions = api;
}

export default ACTION_API;
