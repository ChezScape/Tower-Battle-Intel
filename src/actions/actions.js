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

import {
    splitBattleReports,
    fingerprintReport
} from "../utils/reportSplitter.js";

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
        const feedback = buildSaveFeedback({
            status: "empty",
            loaded: false,
            message: "No report loaded. Paste a battle report first."
        });
        showSaveReportFeedback(feedback);
        console.warn("[Tower Battle Intel] Save Report blocked: empty input");
        return feedback;
    }

    const beforeState = getState();
    const beforeHistory = Array.isArray(beforeState.history) ? beforeState.history : [];
    const beforeIds = new Set(beforeHistory.map(getRunReportId).filter(Boolean));
    const candidateIds = getCandidateReportIds(text);

    const result = saveReportToHistory(text);
    const afterState = getState();
    const afterHistory = Array.isArray(afterState.history) ? afterState.history : [];
    const addedRuns = afterHistory.filter(run => {
        const id = getRunReportId(run);
        return id && !beforeIds.has(id);
    });
    const addedIds = addedRuns.map(getRunReportId).filter(Boolean);

    const duplicateIds = candidateIds
        .filter(id => beforeIds.has(id) && !addedIds.includes(id))
        .filter((id, index, list) => list.indexOf(id) === index);

    if (!result) {
        const feedback = buildSaveFeedback({
            status: "failed",
            loaded: false,
            message: "Report not loaded. I could not read a valid Battle Report from the input.",
            candidateIds
        });
        showSaveReportFeedback(feedback);
        console.warn("[Tower Battle Intel] Save Report failed");
        return feedback;
    }

    const feedback = buildSaveFeedback({
        status: addedIds.length ? "saved" : "duplicate",
        loaded: Boolean(addedIds.length),
        addedIds,
        duplicateIds,
        candidateIds,
        historyCountBefore: beforeHistory.length,
        historyCountAfter: afterHistory.length
    });

    showSaveReportFeedback(feedback);

    if (target && addedIds.length) {
        target.value = "";
        target.placeholder = addedIds.length === 1
            ? `Saved ${addedIds[0]} to Battle History. Paste another report here...`
            : `Saved ${addedIds.length} reports to Battle History. Paste another report here...`;
    }

    if (target && !addedIds.length) {
        target.placeholder = duplicateIds.length
            ? `Duplicate report not loaded: ${duplicateIds[0]}`
            : "Report was not added to Battle History.";
    }

    persist({ lastInput: addedIds.length ? "" : text });

    return feedback;
}


function getCandidateReportIds(text = "") {
    return splitBattleReports(text)
        .slice(0, 50)
        .map(report => fingerprintReport(report))
        .filter(Boolean)
        .filter((id, index, list) => list.indexOf(id) === index);
}

function getRunReportId(run = null) {
    return run?.meta?.reportId || run?.meta?.id || run?.id || null;
}

function buildSaveFeedback(details = {}) {
    const addedIds = Array.isArray(details.addedIds) ? details.addedIds.filter(Boolean) : [];
    const duplicateIds = Array.isArray(details.duplicateIds) ? details.duplicateIds.filter(Boolean) : [];
    const candidateIds = Array.isArray(details.candidateIds) ? details.candidateIds.filter(Boolean) : [];
    const status = details.status || (addedIds.length ? "saved" : duplicateIds.length ? "duplicate" : "failed");
    const loaded = Boolean(details.loaded ?? addedIds.length);

    let title = "Save Report";
    let message = details.message || "";

    if (!message && status === "saved") {
        title = addedIds.length === 1 ? "Report saved" : "Reports saved";
        message = addedIds.length === 1
            ? `Loaded report ${addedIds[0]} into Battle History.`
            : `Loaded ${addedIds.length} reports into Battle History: ${addedIds.join(", ")}.`;

        if (duplicateIds.length) {
            message += ` Duplicate not loaded: ${duplicateIds.join(", ")}.`;
        }
    }

    if (!message && status === "duplicate") {
        title = "Duplicate not loaded";
        const ids = duplicateIds.length ? duplicateIds : candidateIds;
        message = ids.length
            ? `Duplicate report not loaded: ${ids.join(", ")}.`
            : "Duplicate report not loaded.";
    }

    if (!message && status === "failed") {
        title = "Report not loaded";
        message = "Report not loaded. I could not read a valid Battle Report from the input.";
    }

    if (!message && status === "empty") {
        title = "Nothing to save";
        message = "No report loaded. Paste a battle report first.";
    }

    return {
        action: "save-report",
        status,
        loaded,
        title,
        message,
        reportId: addedIds[0] || duplicateIds[0] || candidateIds[0] || null,
        addedIds,
        duplicateIds,
        candidateIds,
        historyCountBefore: details.historyCountBefore ?? null,
        historyCountAfter: details.historyCountAfter ?? null,
        createdAt: new Date().toISOString()
    };
}

function showSaveReportFeedback(feedback = {}) {
    const doc = getDocument();
    if (!doc) return feedback;

    const status = feedback.status || "info";
    const tone = status === "saved" ? "good" : status === "duplicate" ? "warn" : "bad";
    const text = feedback.message || "Save Report finished.";
    const title = feedback.title || "Save Report";

    const inline = ensureSaveFeedbackInline(doc);
    if (inline) {
        inline.className = `save-report-feedback ${tone}`;
        inline.setAttribute("role", "status");
        inline.setAttribute("aria-live", "polite");
        inline.innerHTML = `
            <strong>${escapeHTML(title)}</strong>
            <span>${escapeHTML(text)}</span>
        `;
    }

    const toast = ensureSaveFeedbackToast(doc);
    if (toast) {
        toast.innerHTML = `
            <div class="save-report-toast ${tone}" role="status" aria-live="polite">
                <strong>${escapeHTML(title)}</strong>
                <span>${escapeHTML(text)}</span>
            </div>
        `;
        clearTimeout(showSaveReportFeedback.toastTimer);
        showSaveReportFeedback.toastTimer = setTimeout(() => {
            if (toast) toast.innerHTML = "";
        }, 5200);
    }

    try {
        doc.documentElement.dataset.lastSaveReportStatus = status;
        doc.documentElement.dataset.lastSaveReportId = feedback.reportId || "";
        doc.documentElement.dataset.lastSaveReportAt = feedback.createdAt || new Date().toISOString();
    } catch {
        // ignore dataset failures
    }

    if (typeof window !== "undefined") {
        window.TowerBattleIntelLastSaveReport = feedback;
    }

    return feedback;
}

function ensureSaveFeedbackInline(doc) {
    let node = doc.getElementById("saveReportFeedback");
    if (node) return node;

    node = doc.createElement("div");
    node.id = "saveReportFeedback";
    node.className = "save-report-feedback";
    node.hidden = false;

    const actions = doc.querySelector(".input-actions");
    if (actions?.parentNode) {
        actions.insertAdjacentElement("afterend", node);
        return node;
    }

    const input = doc.getElementById("input");
    if (input?.parentNode) {
        input.insertAdjacentElement("afterend", node);
        return node;
    }

    return null;
}

function ensureSaveFeedbackToast(doc) {
    let node = doc.getElementById("saveReportToastMount");
    if (node) return node;

    node = doc.createElement("div");
    node.id = "saveReportToastMount";
    node.className = "save-report-toast-mount";
    doc.body?.appendChild(node);
    return node;
}

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
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
