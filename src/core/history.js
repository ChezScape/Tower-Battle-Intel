"use strict";

/**
 * CORE HISTORY ENGINE
 * Pure history mutations. No DOM, no file picker, no direct rendering.
 */

import {
    getState,
    setState,
    normaliseBuildStyle,
    normaliseHistoryFilters
} from "./state.js";

export function pushHistory(run) {
    if (!run) {
        return getHistory();
    }

    const history = getHistory();
    const normalised = normaliseHistoryRun(run);

    if (history.some(item => sameHistoryRun(item, normalised))) {
        return history;
    }

    const nextHistory = [...history, normalised];
    setState({ history: nextHistory });
    return nextHistory;
}

export function pushHistoryMany(runs = []) {
    const list = Array.isArray(runs) ? runs.filter(Boolean) : [];
    let output = getHistory();

    list.forEach(run => {
        output = pushHistory(run);
    });

    return output;
}

export function deleteHistoryRun(index = -1) {
    const safeIndex = toIndex(index);
    const history = getHistory();

    if (safeIndex < 0 || safeIndex >= history.length) {
        return history;
    }

    const nextHistory = [...history];
    const [removed] = nextHistory.splice(safeIndex, 1);
    applyHistoryPatchAfterRemoval(nextHistory, removed);
    return nextHistory;
}

export function deleteLastHistory() {
    const history = getHistory();

    if (!history.length) {
        return history;
    }

    const nextHistory = [...history];
    const removed = nextHistory.pop();
    applyHistoryPatchAfterRemoval(nextHistory, removed);
    return nextHistory;
}

export function clearHistory() {
    setState({
        history: [],
        runA: null,
        runB: null,
        currentRun: null,
        compareData: null,
        insights: [],
        ai: [],
        anomalies: [],
        inspection: null,
        ui: {
            selectedSection: null
        }
    });

    return [];
}

export function swapHistorySlots() {
    const state = getState();
    const runA = clone(state.runB);
    const runB = clone(state.runA);

    setState({
        runA,
        runB,
        currentRun: runB || runA || null,
        compareData: null,
        insights: [],
        ai: [],
        anomalies: [],
        inspection: null,
        ui: {
            selectedSection: null
        }
    });

    return getState();
}

export function clearHistorySelection() {
    setState({
        runA: null,
        runB: null,
        currentRun: null,
        compareData: null,
        insights: [],
        ai: [],
        anomalies: [],
        inspection: null,
        ui: {
            selectedSection: null
        }
    });

    return getState();
}

export function archiveHistoryRun(index = -1) {
    return setHistoryArchivedState(index, true);
}

export function restoreHistoryRun(index = -1) {
    return setHistoryArchivedState(index, false);
}

export function updateHistoryRunMeta(index = -1, metaPatch = {}) {
    const safeIndex = toIndex(index);
    const history = getHistory();

    if (safeIndex < 0 || safeIndex >= history.length) {
        return null;
    }

    const previous = history[safeIndex];
    const updated = normaliseHistoryRun({
        ...previous,
        meta: {
            ...(previous?.meta || {}),
            ...(metaPatch || {})
        }
    });

    const nextHistory = [...history];
    nextHistory[safeIndex] = updated;

    const state = getState();
    const patch = {
        history: nextHistory,
        ui: {
            selectedSection: null
        }
    };

    if (sameHistoryRun(state.runA, previous)) patch.runA = clone(updated);
    if (sameHistoryRun(state.runB, previous)) patch.runB = clone(updated);
    if (sameHistoryRun(state.currentRun, previous)) patch.currentRun = clone(updated);

    setState(patch);
    return updated;
}

export function setHistoryFilters(filters = {}) {
    const state = getState();
    const nextFilters = normaliseHistoryFilters({
        ...(state.ui?.historyFilters || {}),
        ...(filters || {})
    });

    setState({
        ui: {
            historyFilters: nextFilters
        }
    });

    return nextFilters;
}

export function exportHistoryJSON() {
    const state = getState();

    return JSON.stringify({
        app: "Tower Battle Intel",
        exportType: "history-export",
        version: "v4.9w",
        exportedAt: new Date().toISOString(),
        history: getHistory(state)
    }, null, 2);
}

export function importHistoryRuns(input = null) {
    const imported = normaliseImportedHistory(input);

    if (!imported.length) {
        return getHistory();
    }

    const current = getHistory();
    const nextHistory = [...current];

    imported.forEach(run => {
        const normalised = normaliseHistoryRun(run);

        if (!nextHistory.some(item => sameHistoryRun(item, normalised))) {
            nextHistory.push(normalised);
        }
    });

    setState({ history: nextHistory });
    return nextHistory;
}

export function hasHistoryRun(run) {
    if (!run) return false;
    return getHistory().some(item => sameHistoryRun(item, run));
}

export function loadHistoryRun(index, slot = "runA") {
    const safeIndex = toIndex(index);
    const history = getHistory();
    const run = history[safeIndex];

    if (!run) {
        return null;
    }

    const targetSlot = normaliseSlot(slot);
    const loaded = clone(run);

    setState({
        [targetSlot]: loaded,
        currentRun: loaded,
        compareData: null,
        insights: [],
        ai: [],
        anomalies: [],
        inspection: null,
        ui: {
            selectedSection: null
        }
    });

    return loaded;
}

export function sameHistoryRun(a, b) {
    if (!a || !b) return false;

    const idA = a?.meta?.reportId || a?.meta?.id || a?.id;
    const idB = b?.meta?.reportId || b?.meta?.id || b?.id;

    if (idA && idB) {
        return String(idA) === String(idB);
    }

    return getFallbackRunKey(a) === getFallbackRunKey(b);
}

export function runMatchesSlot(run, slot = "runA") {
    const state = getState();
    return sameHistoryRun(run, state[normaliseSlot(slot)]);
}

export function getHistorySummary() {
    const history = getHistory();

    return {
        count: history.length,
        latest: history.at(-1) || null,
        archived: history.filter(run => Boolean(run?.meta?.archived)).length,
        visible: history.filter(run => !run?.meta?.archived).length
    };
}

export function normaliseHistoryRun(run = null) {
    const copy = clone(run || {});

    copy.meta = {
        ...(copy.meta || {}),
        savedAt: copy.meta?.savedAt || copy.meta?.saved_at || new Date().toISOString(),
        archived: Boolean(copy.meta?.archived),
        notes: String(copy.meta?.notes || ""),
        tags: normaliseTags(copy.meta?.tags),
        buildStyle: normaliseBuildStyle(copy.meta?.buildStyle || copy.meta?.build || getState().ui?.buildStyle || "unknown")
    };

    return copy;
}

function setHistoryArchivedState(index = -1, archived = false) {
    const safeIndex = toIndex(index);
    const history = getHistory();

    if (safeIndex < 0 || safeIndex >= history.length) {
        return history;
    }

    return updateHistoryRunMeta(safeIndex, { archived: Boolean(archived) })
        ? getHistory()
        : history;
}

function applyHistoryPatchAfterRemoval(history = [], removed = null) {
    const state = getState();
    const patch = {
        history,
        ui: {
            selectedSection: null
        }
    };

    if (removed && sameHistoryRun(state.runA, removed)) patch.runA = null;
    if (removed && sameHistoryRun(state.runB, removed)) patch.runB = null;
    if (removed && sameHistoryRun(state.currentRun, removed)) patch.currentRun = null;

    if ("runA" in patch || "runB" in patch || "currentRun" in patch) {
        const nextRunA = "runA" in patch ? patch.runA : state.runA;
        const nextRunB = "runB" in patch ? patch.runB : state.runB;
        patch.currentRun = nextRunB || nextRunA || null;
        patch.compareData = null;
        patch.insights = [];
        patch.ai = [];
        patch.anomalies = [];
        patch.inspection = null;
    }

    setState(patch);
}

function normaliseImportedHistory(input = null) {
    if (!input) return [];

    let value = input;

    if (typeof input === "string") {
        try {
            value = JSON.parse(input);
        } catch {
            return [];
        }
    }

    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (Array.isArray(value?.history)) {
        return value.history.filter(Boolean);
    }

    if (Array.isArray(value?.runs)) {
        return value.runs.filter(Boolean);
    }

    return [];
}

function getHistory(state = getState()) {
    return Array.isArray(state.history) ? state.history : [];
}

function normaliseTags(tags = []) {
    const source = typeof tags === "string"
        ? tags.split(/[,#\n]/g)
        : Array.isArray(tags)
        ? tags
        : [];

    const seen = new Set();

    return source
        .map(tag => String(tag || "").trim().replace(/^#+/, ""))
        .map(tag => tag.toLowerCase().replace(/\s+/g, "-"))
        .map(tag => tag.replace(/[^a-z0-9_-]/g, ""))
        .filter(Boolean)
        .filter(tag => {
            if (seen.has(tag)) return false;
            seen.add(tag);
            return true;
        })
        .slice(0, 12);
}

function normaliseSlot(slot = "runA") {
    const value = String(slot || "runA").trim().toLowerCase().replace(/[\s-]+/g, "_");

    if (["a", "runa", "run_a"].includes(value)) return "runA";
    if (["b", "runb", "run_b"].includes(value)) return "runB";
    return "runA";
}

function getFallbackRunKey(run = {}) {
    const core = run?.core || {};

    return [
        core.battleDate || core.battle_date || "",
        core.tier || 0,
        core.wave || 0,
        core.coins || 0,
        core.cells || 0,
        core.time || 0,
        core.killedBy || core.killed_by || ""
    ].join("|");
}

function toIndex(value) {
    const num = Number(value);
    return Number.isInteger(num) ? num : -1;
}

function clone(value) {
    if (value == null) return null;

    try {
        return typeof structuredClone === "function"
            ? structuredClone(value)
            : JSON.parse(JSON.stringify(value));
    } catch {
        return value;
    }
}
