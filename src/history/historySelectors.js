"use strict";

/**
 * HISTORY SELECTORS
 * Stable run lookup helpers for Battle History Trace.
 */

export function getHistoryRun(history = [], index = -1) {
    const runs = Array.isArray(history) ? history : [];
    const safeIndex = Number(index);

    if (!Number.isInteger(safeIndex) || safeIndex < 0) return null;
    return runs[safeIndex] || null;
}

export function getVisibleHistory(history = []) {
    return Array.isArray(history)
        ? history.filter(Boolean).filter(run => !run?.meta?.archived)
        : [];
}

export function getAllHistoryRuns(history = []) {
    return Array.isArray(history) ? history.filter(Boolean) : [];
}

export function getArchivedHistory(history = []) {
    return Array.isArray(history)
        ? history.filter(Boolean).filter(run => run?.meta?.archived)
        : [];
}

export function findHistoryIndex(history = [], runOrId = null) {
    const runs = Array.isArray(history) ? history : [];

    if (runOrId == null) return -1;

    if (typeof runOrId === "number") {
        return Number.isInteger(runOrId) && runs[runOrId] ? runOrId : -1;
    }

    const targetId = getRunId(runOrId);
    if (!targetId && typeof runOrId !== "string") return -1;

    return runs.findIndex(run => {
        const runId = getRunId(run);
        return runId && runId === (targetId || runOrId);
    });
}

export function getHistoryRunById(history = [], reportId = "") {
    const index = findHistoryIndex(history, String(reportId || ""));
    return index >= 0 ? history[index] : null;
}

export function getRunId(run = null) {
    return String(
        run?.meta?.reportId ||
        run?.reportId ||
        run?.id ||
        ""
    ).trim();
}

export default {
    getHistoryRun,
    getVisibleHistory,
    getAllHistoryRuns,
    getArchivedHistory,
    findHistoryIndex,
    getHistoryRunById,
    getRunId
};
