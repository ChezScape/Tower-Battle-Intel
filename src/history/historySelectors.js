"use strict";

/**
 * HISTORY SELECTORS
 * Small helpers for finding runs inside Battle History Trace.
 */

export function getHistoryRun(history = [], index = -1) {

    const runs =
        Array.isArray(history)
            ? history
            : [];

    const safeIndex =
        Number(index);

    if (!Number.isInteger(safeIndex)) {
        return null;
    }

    return runs[safeIndex] || null;
}

export function getVisibleHistory(history = []) {
    return Array.isArray(history)
        ? history.filter(Boolean)
        : [];
}
