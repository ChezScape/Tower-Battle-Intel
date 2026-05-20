"use strict";

/**
 * HISTORY ENGINE
 * Stores completed battle runs.
 *
 * Features:
 * - duplicate protection using meta.reportId
 * - fallback duplicate check using battle date / wave / coins / cells
 * - safe clone so history does not mutate live Run A / Run B
 * - helper for checking if a history run already matches a loaded slot
 * - safe deletion that clears A/B slots if deleted run was loaded
 * - swap and clear A/B helpers for History Trace controls
 * - edit notes, tags, and build metadata per saved run
 */

import {
    getState,
    setState
} from "./state.js";

/* --------------------------------------------------
   PUSH HISTORY
-------------------------------------------------- */

export function pushHistory(run) {

    if (!run) {
        return getState().history || [];
    }

    const state =
        getState();

    const history =
        Array.isArray(state.history)
            ? [...state.history]
            : [];

    const exists =
        history.some(item =>
            sameHistoryRun(item, run)
        );

    if (exists) {

        console.warn(
            "[Tower Battle Intel] Duplicate report ignored. Already exists in history."
        );

        return history;
    }

    const nextHistory = [
        ...history,
        normaliseHistoryRun(run)
    ];

    setState({
        history: nextHistory
    });

    return nextHistory;
}

/* --------------------------------------------------
   PUSH MANY HISTORY RUNS
-------------------------------------------------- */

export function pushHistoryMany(runs = []) {

    const validRuns =
        Array.isArray(runs)
            ? runs.filter(Boolean)
            : [];

    let latestHistory =
        getState().history || [];

    for (const run of validRuns) {
        latestHistory = pushHistory(run);
    }

    return latestHistory;
}

/* --------------------------------------------------
   DELETE HISTORY ITEM
-------------------------------------------------- */

export function deleteHistoryRun(index = -1) {

    const state =
        getState();

    const history =
        Array.isArray(state.history)
            ? [...state.history]
            : [];

    const safeIndex =
        Number(index);

    if (
        !Number.isInteger(safeIndex) ||
        safeIndex < 0 ||
        safeIndex >= history.length
    ) {
        return history;
    }

    const removed =
        history.splice(safeIndex, 1)[0] || null;

    applyHistoryDeletionPatch(history, removed);

    return history;
}

/* --------------------------------------------------
   DELETE LAST HISTORY ITEM
-------------------------------------------------- */

export function deleteLastHistory() {

    const state =
        getState();

    const history =
        Array.isArray(state.history)
            ? [...state.history]
            : [];

    const removed =
        history.pop() || null;

    applyHistoryDeletionPatch(history, removed);

    return history;
}

/* --------------------------------------------------
   CLEAR HISTORY
-------------------------------------------------- */

export function clearHistory() {

    setState({
        history: [],
        runA: null,
        runB: null,
        currentRun: null,
        compareData: null,
        insights: [],
        ai: [],
        trend: [],
        anomalies: [],
        inspection: null,
        ui: {
            ...(getState().ui || {}),
            selectedSection: null
        }
    });

    return [];
}

/* --------------------------------------------------
   SWAP / CLEAR A-B SELECTION
-------------------------------------------------- */

export function swapHistorySlots() {

    const state =
        getState();

    const nextRunA =
        state.runB
            ? safeClone(state.runB)
            : null;

    const nextRunB =
        state.runA
            ? safeClone(state.runA)
            : null;

    setState({
        runA:
            nextRunA,

        runB:
            nextRunB,

        currentRun:
            nextRunB || nextRunA || null,

        ui: {
            ...(state.ui || {}),
            selectedSection: null
        }
    });

    return getState();
}

export function clearHistorySelection() {

    const state =
        getState();

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
            ...(state.ui || {}),
            selectedSection: null
        }
    });

    return getState();
}

/* --------------------------------------------------
   ARCHIVE / RESTORE HISTORY RUN
-------------------------------------------------- */

export function archiveHistoryRun(index = -1) {

    return setHistoryArchivedState(index, true);
}

export function restoreHistoryRun(index = -1) {

    return setHistoryArchivedState(index, false);
}

function setHistoryArchivedState(index = -1, archived = false) {

    const state =
        getState();

    const history =
        Array.isArray(state.history)
            ? [...state.history]
            : [];

    const safeIndex =
        Number(index);

    if (
        !Number.isInteger(safeIndex) ||
        safeIndex < 0 ||
        safeIndex >= history.length
    ) {
        return history;
    }

    const updated =
        normaliseHistoryRun({
            ...history[safeIndex],
            meta: {
                ...(history[safeIndex]?.meta || {}),
                archived: Boolean(archived)
            }
        });

    history[safeIndex] = updated;

    const patch = {
        history,
        ui: {
            ...(state.ui || {}),
            selectedSection: null
        }
    };

    if (archived) {

        if (state.runA && sameHistoryRun(state.runA, updated)) {
            patch.runA = null;
        }

        if (state.runB && sameHistoryRun(state.runB, updated)) {
            patch.runB = null;
        }

        if (
            patch.runA === null ||
            patch.runB === null
        ) {
            patch.currentRun = patch.runB ?? patch.runA ?? state.runB ?? state.runA ?? null;
            patch.compareData = null;
            patch.insights = [];
            patch.ai = [];
            patch.anomalies = [];
            patch.inspection = null;
        }
    }

    setState(patch);

    return history;
}

/* --------------------------------------------------
   UPDATE HISTORY METADATA
-------------------------------------------------- */

export function updateHistoryRunMeta(index = -1, metaPatch = {}) {

    const state =
        getState();

    const history =
        Array.isArray(state.history)
            ? [...state.history]
            : [];

    const safeIndex =
        Number(index);

    if (
        !Number.isInteger(safeIndex) ||
        safeIndex < 0 ||
        safeIndex >= history.length
    ) {
        return null;
    }

    const previous =
        history[safeIndex];

    const updated =
        normaliseHistoryRun({
            ...previous,
            meta: {
                ...(previous?.meta || {}),
                ...(metaPatch || {})
            }
        });

    history[safeIndex] =
        updated;

    const patch = {
        history,
        ui: {
            ...(state.ui || {}),
            selectedSection: null
        }
    };

    if (state.runA && sameHistoryRun(state.runA, previous)) {
        patch.runA = safeClone(updated);
    }

    if (state.runB && sameHistoryRun(state.runB, previous)) {
        patch.runB = safeClone(updated);
    }

    if (state.currentRun && sameHistoryRun(state.currentRun, previous)) {
        patch.currentRun = safeClone(updated);
    }

    setState(patch);

    return updated;
}

/* --------------------------------------------------
   HISTORY FILTERS
-------------------------------------------------- */

export function setHistoryFilters(filters = {}) {

    const state =
        getState();

    setState({
        ui: {
            ...(state.ui || {}),
            historyFilters: {
                ...(state.ui?.historyFilters || {}),
                ...(filters || {})
            }
        }
    });

    return getState().ui?.historyFilters || {};
}

/* --------------------------------------------------
   EXPORT / IMPORT HISTORY ONLY
-------------------------------------------------- */

export function exportHistoryJSON() {

    const state =
        getState();

    return JSON.stringify(
        {
            app: "Tower Battle Intel",
            exportType: "history-export",
            exportedAt: new Date().toISOString(),
            history: Array.isArray(state.history) ? state.history : []
        },
        null,
        2
    );
}

export function importHistoryRuns(input = null) {

    const runs =
        normaliseImportedHistory(input);

    if (!runs.length) {
        return getState().history || [];
    }

    const state =
        getState();

    const history =
        Array.isArray(state.history)
            ? [...state.history]
            : [];

    for (const run of runs) {

        const normalised =
            normaliseHistoryRun(run);

        const exists =
            history.some(item => sameHistoryRun(item, normalised));

        if (!exists) {
            history.push(normalised);
        }
    }

    setState({
        history
    });

    return history;
}

function normaliseImportedHistory(input = null) {

    if (!input) {
        return [];
    }

    let value =
        input;

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

    return [];
}

/* --------------------------------------------------
   HAS HISTORY RUN
-------------------------------------------------- */

export function hasHistoryRun(run) {

    if (!run) {
        return false;
    }

    const state =
        getState();

    const history =
        Array.isArray(state.history)
            ? state.history
            : [];

    return history.some(item =>
        sameHistoryRun(item, run)
    );
}

/* --------------------------------------------------
   LOAD HISTORY RUN INTO SLOT
-------------------------------------------------- */

export function loadHistoryRun(index, slot = "runA") {

    const state =
        getState();

    const history =
        Array.isArray(state.history)
            ? state.history
            : [];

    const run =
        history[index];

    if (!run) {

        console.warn(
            "[Tower Battle Intel] History load failed. Run not found."
        );

        return null;
    }

    const targetSlot =
        normaliseSlot(slot);

    const currentSlotRun =
        state[targetSlot];

    if (
        currentSlotRun &&
        sameHistoryRun(currentSlotRun, run)
    ) {

        console.warn(
            `[Tower Battle Intel] History load ignored. Same report is already loaded in ${targetSlot}.`
        );

        return null;
    }

    setState({
        [targetSlot]:
            safeClone(run),

        currentRun:
            safeClone(run),

        ui: {
            ...(state.ui || {}),
            selectedSection: null
        }
    });

    return run;
}

/* --------------------------------------------------
   SAME HISTORY RUN CHECK
-------------------------------------------------- */

export function sameHistoryRun(a, b) {

    if (!a || !b) {
        return false;
    }

    const idA =
        a?.meta?.reportId;

    const idB =
        b?.meta?.reportId;

    if (idA && idB) {
        return idA === idB;
    }

    return getFallbackRunKey(a) === getFallbackRunKey(b);
}

/* --------------------------------------------------
   SLOT MATCH CHECK
-------------------------------------------------- */

export function runMatchesSlot(run, slot = "runA") {

    const state =
        getState();

    const targetSlot =
        normaliseSlot(slot);

    const slotRun =
        state[targetSlot];

    return sameHistoryRun(run, slotRun);
}

/* --------------------------------------------------
   HISTORY SUMMARY
-------------------------------------------------- */

export function getHistorySummary() {

    const state =
        getState();

    const history =
        Array.isArray(state.history)
            ? state.history
            : [];

    return {
        count:
            history.length,

        latest:
            history.length
                ? history[history.length - 1]
                : null
    };
}

/* --------------------------------------------------
   INTERNAL PATCH HELPERS
-------------------------------------------------- */

function applyHistoryDeletionPatch(history = [], removed = null) {

    const state =
        getState();

    const patch = {
        history,
        ui: {
            ...(state.ui || {}),
            selectedSection: null
        }
    };

    if (
        removed &&
        state.runA &&
        sameHistoryRun(state.runA, removed)
    ) {
        patch.runA = null;
    }

    if (
        removed &&
        state.runB &&
        sameHistoryRun(state.runB, removed)
    ) {
        patch.runB = null;
    }

    if (
        removed &&
        state.currentRun &&
        sameHistoryRun(state.currentRun, removed)
    ) {
        patch.currentRun =
            patch.runB ??
            patch.runA ??
            state.runB ??
            state.runA ??
            null;
    }

    if (
        patch.runA === null ||
        patch.runB === null
    ) {
        patch.compareData = null;
        patch.insights = [];
        patch.ai = [];
        patch.anomalies = [];
        patch.inspection = null;
    }

    setState(patch);
}

function normaliseHistoryRun(run) {

    const clone =
        safeClone(run);

    clone.meta = {
        ...(clone.meta || {}),

        savedAt:
            clone.meta?.savedAt || new Date().toISOString(),

        archived:
            Boolean(clone.meta?.archived),

        notes:
            clone.meta?.notes || "",

        tags:
            normaliseTags(clone.meta?.tags),

        buildStyle:
            normaliseBuildStyle(clone.meta?.buildStyle || clone.meta?.build || getState().ui?.buildStyle || "unknown")
    };

    return clone;
}

function normaliseTags(tags = []) {

    const source =
        typeof tags === "string"
            ? tags
                .split(/[,#\n]/g)
            : Array.isArray(tags)
                ? tags
                : [];

    const seen =
        new Set();

    return source
        .map(tag => String(tag || "").trim())
        .map(tag => tag.replace(/^#+/, ""))
        .map(tag => tag.toLowerCase())
        .map(tag => tag.replace(/\s+/g, "-"))
        .map(tag => tag.replace(/[^a-z0-9_-]/g, ""))
        .filter(Boolean)
        .filter(tag => {
            if (seen.has(tag)) {
                return false;
            }

            seen.add(tag);
            return true;
        })
        .slice(0, 12);
}

function normaliseBuildStyle(value = "unknown") {

    const key =
        String(value || "unknown")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/\//g, "_")
            .replace(/__+/g, "_");

    const allowed = new Set([
        "unknown",
        "health_ehp",
        "blender",
        "devo",
        "orb_devo",
        "glass_cannon",
        "hybrid"
    ]);

    return allowed.has(key)
        ? key
        : "unknown";
}

/* --------------------------------------------------
   SLOT NORMALISER
-------------------------------------------------- */

function normaliseSlot(slot = "runA") {

    const value =
        String(slot || "runA")
            .trim()
            .toLowerCase();

    if (
        value === "a" ||
        value === "runa" ||
        value === "run_a"
    ) {
        return "runA";
    }

    return "runB";
}

/* --------------------------------------------------
   FALLBACK DUPLICATE KEY
-------------------------------------------------- */

function getFallbackRunKey(run) {

    const core =
        run?.core || {};

    return [
        core.battleDate || "",
        core.tier || 0,
        core.wave || 0,
        core.coins || 0,
        core.cells || 0,
        core.time || 0,
        core.killedBy || ""
    ].join("|");
}

/* --------------------------------------------------
   SAFE CLONE
-------------------------------------------------- */

function safeClone(value) {

    try {

        if (typeof structuredClone === "function") {
            return structuredClone(value);
        }

        return JSON.parse(
            JSON.stringify(value)
        );

    } catch {

        return value;
    }
}
