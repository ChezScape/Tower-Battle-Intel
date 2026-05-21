"use strict";

/**
 * ACTION LAYER
 * Single command bus for Tower Battle Intel UI actions.
 *
 * All visible UI buttons should route through here instead of directly
 * calling random core modules or inline onclick handlers.
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
   INPUT / REPORT ACTIONS
-------------------------------------------------- */

export function actionSaveReportFromInput(input = null) {
    const target = input || document.getElementById("input");
    const text = target?.value || "";

    if (!text.trim()) {
        if (target) {
            target.placeholder = "Paste a battle report first...";
            target.focus?.({ preventScroll: true });
        }
        return null;
    }

    const result = saveReportToHistory(text);

    if (!result) {
        if (target) {
            target.placeholder = "Could not read that report. Check the paste format...";
        }
        return null;
    }

    if (target) {
        target.value = "";
        target.placeholder = "Saved to Battle History. Paste another report here...";
    }

    saveStorage({
        ...getState(),
        lastInput: ""
    });

    return result;
}

export function actionParseInput(rawText, slot = "runA") {
    const result = update(rawText, normaliseSlot(slot));

    if (!result) {
        return null;
    }

    saveStorage(getState());
    return result;
}

export function actionClearInput(input = null) {
    const target = input || document.getElementById("input");

    if (target) {
        target.value = "";
        target.placeholder = "Paste Battle Report Here...";
        target.focus?.({ preventScroll: true });
    }

    saveStorage({
        ...getState(),
        lastInput: ""
    });

    return true;
}

export function actionClearRuns() {
    clearRuns();

    refreshAnalysis({
        reason: "clear_runs"
    });

    saveStorage(getState());
    return getState();
}

export function actionReset() {
    resetState();
    clearStorage();
    return getState();
}

/* --------------------------------------------------
   HISTORY ACTIONS
-------------------------------------------------- */

export function actionLoadHistoryRun(index, slot = "runA") {
    const safeIndex = Number(index);

    if (!Number.isInteger(safeIndex)) {
        return null;
    }

    const targetSlot = normaliseSlot(slot);
    const run = loadHistoryRun(safeIndex, targetSlot);

    if (!run) {
        return null;
    }

    refreshAnalysis({
        reason: "load_history_run",
        targetSlot,
        historyIndex: safeIndex
    });

    saveStorage(getState());
    return run;
}

export function actionSwapHistorySlots() {
    swapHistorySlots();

    refreshAnalysis({
        reason: "swap_history_slots"
    });

    saveStorage(getState());
    return getState();
}

export function actionClearHistorySelection() {
    clearHistorySelection();

    refreshAnalysis({
        reason: "clear_history_selection"
    });

    saveStorage(getState());
    return getState();
}

export function actionArchiveHistoryRun(index) {
    const safeIndex = Number(index);

    if (!Number.isInteger(safeIndex)) {
        return null;
    }

    const result = archiveHistoryRun(safeIndex);

    refreshAnalysis({
        reason: "archive_history_run",
        historyIndex: safeIndex
    });

    saveStorage(getState());
    return result;
}

export function actionRestoreHistoryRun(index) {
    const safeIndex = Number(index);

    if (!Number.isInteger(safeIndex)) {
        return null;
    }

    const result = restoreHistoryRun(safeIndex);

    refreshAnalysis({
        reason: "restore_history_run",
        historyIndex: safeIndex
    });

    saveStorage(getState());
    return result;
}

export function actionDeleteHistoryRun(index) {
    const safeIndex = Number(index);

    if (!Number.isInteger(safeIndex)) {
        return null;
    }

    const result = deleteHistoryRun(safeIndex);

    refreshAnalysis({
        reason: "delete_history_run",
        historyIndex: safeIndex
    });

    saveStorage(getState());
    return result;
}

export function actionDeleteLastRun() {
    const result = deleteLastHistory();

    refreshAnalysis({
        reason: "delete_last_history"
    });

    saveStorage(getState());
    return result;
}

export function actionClearHistory() {
    const result = clearHistory();

    refreshAnalysis({
        reason: "clear_history"
    });

    saveStorage(getState());
    return result;
}

export function actionSetHistoryFilters(patch = {}) {
    const filters = setHistoryFilters(patch);
    saveStorage(getState());
    return filters;
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

export function actionExportHistoryJSON() {
    return exportHistoryJSON();
}

export function actionImportHistoryText(text = "") {
    const result = importHistoryRuns(text);

    refreshAnalysis({
        reason: "import_history"
    });

    saveStorage(getState());
    return result;
}

export function actionUpdateHistoryRunMeta(index, metaPatch = {}) {
    const updated = updateHistoryRunMeta(Number(index), metaPatch);

    if (!updated) {
        return null;
    }

    refreshAnalysis({
        reason: "update_history_meta",
        historyIndex: Number(index)
    });

    saveStorage(getState());
    return updated;
}

/* --------------------------------------------------
   UI ACTIONS
-------------------------------------------------- */

export function actionSelectDashboardTab(tab = "overview") {
    const state = getState();
    const dashboardTab = normaliseDashboardTab(tab);

    setState({
        ui: {
            ...(state.ui || {}),
            dashboardTab
        }
    });

    saveStorage(getState());
    return dashboardTab;
}

export function actionOpenCompareSection(section = "") {
    const state = getState();
    const compareSection = String(section || "").trim();

    setState({
        ui: {
            ...(state.ui || {}),
            dashboardTab: "compare",
            compareSection
        }
    });

    saveStorage(getState());
    return compareSection;
}

export function actionSelectSection(section = "") {
    const state = getState();
    const value = String(section || "").trim();

    const selectedSection =
        state.ui?.selectedSection === value
            ? null
            : value;

    setState({
        ui: {
            ...(state.ui || {}),
            selectedSection
        }
    });

    saveStorage(getState());
    return selectedSection;
}

export function actionSetBuildStyle(buildStyle = "unknown") {
    const selected = setBuildStyle(buildStyle);

    refreshAnalysis({
        reason: "build_style_changed",
        buildStyle: selected
    });

    saveStorage(getState());
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

    saveStorage(getState());
    return next;
}

export function actionToggleDisplayMode() {
    const state = getState();
    const current = Boolean(state?.ui?.quietDisplay);
    const quietDisplay = !current;

    setState({
        ui: {
            ...(state.ui || {}),
            quietDisplay
        }
    });

    saveStorage(getState());
    return quietDisplay;
}

export function actionGetState() {
    return getState();
}

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

function normaliseSlot(slot = "runA") {
    const value = String(slot || "runA")
        .trim()
        .toLowerCase();

    if (value === "a" || value === "runa" || value === "run_a") {
        return "runA";
    }

    return "runB";
}

function normaliseDashboardTab(tab = "overview") {
    const value = String(tab || "overview")
        .trim()
        .toLowerCase();

    const aliases = {
        dashboard: "overview",
        deck: "command",
        command_deck: "command",
        settings_panel: "settings",
        more_menu: "more"
    };

    const normalised = aliases[value] || value;

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

    return valid.has(normalised) ? normalised : "overview";
}
