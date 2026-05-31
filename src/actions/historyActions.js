"use strict";

/**
 * HISTORY ACTION FOUNDATION v4.11z52w13
 * Owns History domain commands. UI click wiring remains parked until the
 * History workspace is rebuilt.
 */

import { getState, setState } from "../core/state.js";
import { refreshAnalysis } from "../core/update.js";
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
    setHistoryFilters
} from "../core/history.js";
import { persistState, normaliseSlot, toSafeIndex, ACTION_FOUNDATION_VERSION } from "./actionUtils.js";
import { patchRawReportRecordUserMeta } from "../storage/rawReportArchiveStore.js";

export function actionLoadHistoryRun(index, slot = "runA") {
    const safeIndex = toSafeIndex(index);
    const targetSlot = normaliseSlot(slot);
    if (safeIndex < 0) return null;

    const run = loadHistoryRun(safeIndex, targetSlot);
    if (!run) return null;

    refreshAnalysis({
        reason: "load_history_run",
        historyIndex: safeIndex,
        targetSlot
    });

    persistState();
    return run;
}

export function actionSwapHistorySlots() {
    swapHistorySlots();
    refreshAnalysis({ reason: "swap_history_slots" });
    persistState();
    return getState();
}

export function actionClearHistorySelection() {
    clearHistorySelection();
    refreshAnalysis({ reason: "clear_history_selection" });
    persistState();
    return getState();
}

export function actionArchiveHistoryRun(index = -1) {
    const safeIndex = toSafeIndex(index);
    if (safeIndex < 0) return null;

    const before = getState().history?.[safeIndex] || null;
    archiveHistoryRun(safeIndex);
    syncRawArchiveUserMeta(getState().history?.[safeIndex] || before, { archived: true, archivedAt: new Date().toISOString() });
    refreshAnalysis({ reason: "archive_history_run", historyIndex: safeIndex });
    persistState();
    return getState().history;
}

export function actionRestoreHistoryRun(index = -1) {
    const safeIndex = toSafeIndex(index);
    if (safeIndex < 0) return null;

    const before = getState().history?.[safeIndex] || null;
    restoreHistoryRun(safeIndex);
    syncRawArchiveUserMeta(getState().history?.[safeIndex] || before, { archived: false, archivedAt: null });
    refreshAnalysis({ reason: "restore_history_run", historyIndex: safeIndex });
    persistState();
    return getState().history;
}

export function actionDeleteHistoryRun(index = -1) {
    const safeIndex = toSafeIndex(index);
    if (safeIndex < 0) return null;

    deleteHistoryRun(safeIndex);
    refreshAnalysis({ reason: "delete_history_run", historyIndex: safeIndex });
    persistState();
    return getState().history;
}

export function actionDeleteLastRun() {
    deleteLastHistory();
    refreshAnalysis({ reason: "delete_last_history" });
    persistState();
    return getState().history;
}

export function actionClearHistory() {
    clearHistory();
    refreshAnalysis({ reason: "clear_history" });
    persistState();
    return getState();
}

export function actionSetHistoryFilters(filters = {}) {
    const next = setHistoryFilters(filters || {});
    persistState();
    return next;
}

export function actionResetHistoryFilters() {
    return actionSetHistoryFilters({
        query: "",
        sort: "newest",
        build: "all",
        tag: "all",
        runType: "all",
        page: 1,
        selectedIndex: null,
        showArchived: false,
        mode: "normal"
    });
}

export function actionUpdateHistoryRunMeta(index = -1, meta = {}) {
    const safeIndex = toSafeIndex(index);
    if (safeIndex < 0) return null;

    const updated = updateHistoryRunMeta(safeIndex, meta || {});
    syncRawArchiveUserMeta(updated, meta || {});
    refreshAnalysis({ reason: "update_history_meta", historyIndex: safeIndex });
    persistState();
    return updated;
}


function syncRawArchiveUserMeta(run = null, metaPatch = {}) {
    if (!run) return null;

    const state = getState();
    const rawArchive = patchRawReportRecordUserMeta(state.rawArchive || state.rawReportArchive || null, run, metaPatch || {});
    setState({ rawArchive });
    return rawArchive;
}

export function getHistoryActionStatus() {
    return {
        version: ACTION_FOUNDATION_VERSION,
        owner: "src/actions/historyActions.js",
        activeInShell: true,
        owns: ["History domain commands", "History filter state", "History Run A/B selection", "raw archive user metadata sync"]
    };
}

export default {
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
    getHistoryActionStatus
};
