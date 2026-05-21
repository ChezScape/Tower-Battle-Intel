"use strict";

/**
 * ACTION LAYER
 * High-level state commands for Tower Battle Intel.
 *
 * v4.9t: this file is now the actual UI command bus.
 * UI buttons should call actions here instead of each section inventing
 * its own save/delete/import/tab logic.
 */

import {
    update,
    refreshAnalysis,
    saveReportToHistory
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
   LOW-LEVEL PERSIST / REFRESH
-------------------------------------------------- */

function persistAndRefresh(reason = "action", extra = {}) {

    refreshAnalysis({
        reason,
        ...extra
    });

    saveStorage(getState());

    return getState();
}

function persistOnly() {
    saveStorage(getState());
    return getState();
}

/* --------------------------------------------------
   PARSE INPUT / SAVE REPORT
-------------------------------------------------- */

export function actionParseInput(rawText, slot = "runA") {

    const result =
        update(
            rawText,
            normaliseSlot(slot)
        );

    if (!result) {
        return null;
    }

    saveStorage(getState());

    return result;
}

export function actionSaveReport(rawText = "") {

    const text =
        String(rawText || "").trim();

    if (!text) {
        return null;
    }

    const run =
        saveReportToHistory(text);

    persistAndRefresh("save_report_to_history");

    return run;
}

/* --------------------------------------------------
   DASHBOARD / VIEW COMMANDS
-------------------------------------------------- */

export function actionSetDashboardTab(dashboardTab = "overview") {

    const state =
        getState();

    const nextTab =
        normaliseDashboardTab(dashboardTab);

    setState({
        ui: {
            ...(state.ui || {}),
            dashboardTab: nextTab
        }
    });

    saveStorage(getState());

    return nextTab;
}

export function actionOpenCompareSection(section = "damage") {

    const state =
        getState();

    const selectedSection =
        normaliseSection(section);

    setState({
        ui: {
            ...(state.ui || {}),
            dashboardTab: "compare",
            selectedSection
        }
    });

    saveStorage(getState());

    return selectedSection;
}

export function actionOpenSystemSection(section = "core") {

    const state =
        getState();

    const selectedSection =
        normaliseSection(section);

    const alreadyOpen =
        state.ui?.dashboardTab === "systems" &&
        state.ui?.selectedSection === selectedSection;

    setState({
        ui: {
            ...(state.ui || {}),
            dashboardTab: "systems",
            selectedSection:
                alreadyOpen
                    ? null
                    : selectedSection
        }
    });

    saveStorage(getState());

    return getState().ui?.selectedSection || null;
}

export function actionSelectSection(section) {

    const state =
        getState();

    const nextSection =
        normaliseSection(section);

    const selectedSection =
        state.ui?.selectedSection === nextSection
            ? null
            : nextSection;

    setState({
        ui: {
            ...(state.ui || {}),
            selectedSection
        }
    });

    saveStorage(getState());

    return selectedSection;
}

export function actionToggleDisplayMode() {

    const state =
        getState();

    const current =
        state.ui?.displayMode || "normal";

    const next =
        current === "normal"
            ? "quiet"
            : "normal";

    setState({
        ui: {
            ...(state.ui || {}),
            displayMode: next
        }
    });

    saveStorage(getState());

    return next;
}

/* --------------------------------------------------
   RESET / CLEAR COMMANDS
-------------------------------------------------- */

export function actionReset() {

    resetState();

    clearStorage();

    return getState();
}

export function actionClearRuns() {

    clearRuns();

    return persistAndRefresh("clear_runs");
}

/* --------------------------------------------------
   HISTORY COMMANDS
-------------------------------------------------- */

export function actionLoadHistoryRun(index, slot = "runA") {

    const targetSlot =
        normaliseSlot(slot);

    const historyIndex =
        Number(index);

    const run =
        loadHistoryRun(
            historyIndex,
            targetSlot
        );

    if (!run) {
        return null;
    }

    persistAndRefresh("load_history_run", {
        targetSlot,
        historyIndex
    });

    return run;
}

export function actionDeleteHistoryRun(index = -1) {

    const historyIndex =
        Number(index);

    const history =
        deleteHistoryRun(historyIndex);

    persistAndRefresh("delete_history_run", {
        historyIndex
    });

    return history;
}

export function actionDeleteLastRun() {

    const history =
        deleteLastHistory();

    persistAndRefresh("delete_last_history");

    return history;
}

export function actionClearHistory() {

    const history =
        clearHistory();

    persistAndRefresh("clear_history");

    return history;
}

export function actionSwapHistorySlots() {

    const state =
        swapHistorySlots();

    persistAndRefresh("swap_history_slots");

    return state;
}

export function actionClearHistorySelection() {

    const state =
        clearHistorySelection();

    persistAndRefresh("clear_history_selection");

    return state;
}

export function actionArchiveHistoryRun(index = -1) {

    const historyIndex =
        Number(index);

    const history =
        archiveHistoryRun(historyIndex);

    persistAndRefresh("archive_history_run", {
        historyIndex
    });

    return history;
}

export function actionRestoreHistoryRun(index = -1) {

    const historyIndex =
        Number(index);

    const history =
        restoreHistoryRun(historyIndex);

    persistAndRefresh("restore_history_run", {
        historyIndex
    });

    return history;
}

export function actionUpdateHistoryRunMeta(index = -1, metaPatch = {}) {

    const historyIndex =
        Number(index);

    const updated =
        updateHistoryRunMeta(historyIndex, metaPatch);

    persistAndRefresh("update_history_run_meta", {
        historyIndex
    });

    return updated;
}

export function actionSetHistoryFilters(filters = {}) {

    const next =
        setHistoryFilters(filters);

    saveStorage(getState());

    return next;
}

export function actionExportHistoryJSON() {
    return exportHistoryJSON();
}

export function actionImportHistoryRuns(input = null) {

    const history =
        importHistoryRuns(input);

    persistAndRefresh("import_history_runs");

    return history;
}

/* --------------------------------------------------
   DEBUG / BUILD STYLE
-------------------------------------------------- */

export function actionToggleDebug(force = null) {

    const state =
        getState();

    const current =
        Boolean(state?.ui?.debug);

    const next =
        typeof force === "boolean"
            ? force
            : !current;

    setState({
        ui: {
            ...(state.ui || {}),
            debug: next
        }
    });

    saveStorage(getState());

    return next;
}

export function actionSetBuildStyle(buildStyle = "unknown") {

    const selected =
        setBuildStyle(buildStyle);

    persistAndRefresh("build_style_changed", {
        buildStyle: selected
    });

    return selected;
}

/* --------------------------------------------------
   GET STATE SNAPSHOT
-------------------------------------------------- */

export function actionGetState() {
    return getState();
}

/* --------------------------------------------------
   NORMALISERS
-------------------------------------------------- */

function normaliseSlot(slot = "runA") {

    const value =
        String(slot || "runA")
            .trim()
            .toLowerCase();

    if (
        value === "a" ||
        value === "runa" ||
        value === "run_a" ||
        value === "run-a"
    ) {
        return "runA";
    }

    return "runB";
}

function normaliseDashboardTab(tab = "overview") {

    const key =
        String(tab || "overview")
            .trim()
            .toLowerCase();

    const aliases = {
        dashboard: "overview",
        intel: "compare",
        gains: "compare",
        losses: "compare"
    };

    const normalised =
        aliases[key] || key;

    const valid = new Set([
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

    return valid.has(normalised)
        ? normalised
        : "overview";
}

function normaliseSection(value = "") {

    const key =
        String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[%:/()]/g, "")
            .replace(/\s*\/\s*/g, "_")
            .replace(/\s+/g, "_")
            .replace(/__+/g, "_")
            .replace(/^_+|_+$/g, "");

    const aliases = {
        defense: "damage_taken",
        survival: "damage_taken",
        economy: "coins",
        effects: "killed_with_effect_active",
        enemies: "enemies_hit_by"
    };

    return aliases[key] || key || "damage";
}
