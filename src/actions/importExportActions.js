"use strict";

/**
 * IMPORT / EXPORT ACTION FOUNDATION v4.11z52w13
 * Owns action-level import/export payload commands. Browser file picker and
 * download clicks remain parked until the UI import/export workspace rewires.
 */

import { getState, setState } from "../core/state.js";
import { refreshAnalysis } from "../core/update.js";
import { importHistoryRuns } from "../core/history.js";
import { readSavedHistoryCandidates, getStorageKey } from "../storage/localStore.js";
import { parseImportJSON } from "../storage/importStore.js";
import { normaliseRawArchive, upsertRawReportRecords } from "../storage/rawReportArchiveStore.js";
import { createExportJSONString } from "../storage/exportStore.js";
import { persistState, ACTION_FOUNDATION_VERSION } from "./actionUtils.js";

export function actionExportHistoryJSON() {
    const state = getState();
    const liveHistory = Array.isArray(state.history) ? state.history.filter(Boolean) : [];

    if (liveHistory.length) {
        persistState();
    }

    const primaryStored = readSavedHistoryCandidates()
        .find(item => item.source === getStorageKey() && Array.isArray(item.history) && item.history.length);

    const history = liveHistory.length
        ? liveHistory
        : Array.isArray(primaryStored?.history)
            ? primaryStored.history.filter(Boolean)
            : liveHistory;

    return createExportJSONString({
        app: "Tower Battle Intel",
        exportType: "history-export",
        version: ACTION_FOUNDATION_VERSION,
        exportedAt: new Date().toISOString(),
        exportSource: liveHistory.length ? "live-state" : (primaryStored?.source || "live-state-empty"),
        history,
        rawArchive: state.rawArchive || null
    });
}

export function actionImportHistoryText(text = "") {
    const parsed = parseImportJSON(text);
    const imported = importHistoryRuns(text);

    if (parsed.ok && parsed.value?.rawArchive) {
        const existing = normaliseRawArchive(getState().rawArchive || null);
        const incoming = normaliseRawArchive(parsed.value.rawArchive);
        const reports = upsertRawReportRecords(existing.reports, incoming.reports);
        setState({
            rawArchive: {
                ...existing,
                version: incoming.version || existing.version,
                reportCount: reports.length,
                reports
            }
        });
    }

    refreshAnalysis({ reason: "import_history" });
    persistState();

    return imported;
}

export function getImportExportActionStatus() {
    return {
        version: ACTION_FOUNDATION_VERSION,
        owner: "src/actions/importExportActions.js",
        activeInShell: true,
        owns: ["history export payload", "history import text command", "rawArchive export payload"]
    };
}

export default {
    actionExportHistoryJSON,
    actionImportHistoryText,
    getImportExportActionStatus
};
