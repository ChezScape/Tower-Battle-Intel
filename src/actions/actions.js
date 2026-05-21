"use strict";

/**
 * ACTION LAYER
 * High-level state commands for Tower Battle Intel.
 *
 * Used by UI event layers.
 */

import {
    update,
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
    deleteLastHistory,
    loadHistoryRun
} from "../core/history.js";

import {
    saveStorage,
    clearStorage
} from "../storage/localStore.js";

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

    saveStorage(
        getState()
    );

    return result;
}

/* --------------------------------------------------
   RESET EVERYTHING
-------------------------------------------------- */

export function actionReset() {

    resetState();

    clearStorage();

    return getState();
}

/* --------------------------------------------------
   CLEAR CURRENT RUNS ONLY
-------------------------------------------------- */

export function actionClearRuns() {

    clearRuns();

    refreshAnalysis({
        reason: "clear_runs"
    });

    saveStorage(
        getState()
    );

    return getState();
}

/* --------------------------------------------------
   DELETE LAST HISTORY RUN
-------------------------------------------------- */

export function actionDeleteLastRun() {

    deleteLastHistory();

    refreshAnalysis({
        reason: "delete_last_history"
    });

    saveStorage(
        getState()
    );

    return getState();
}

/* --------------------------------------------------
   CLEAR HISTORY
-------------------------------------------------- */

export function actionClearHistory() {

    clearHistory();

    clearRuns();

    refreshAnalysis({
        reason: "clear_history"
    });

    saveStorage(
        getState()
    );

    return getState();
}

/* --------------------------------------------------
   LOAD HISTORY RUN
-------------------------------------------------- */

export function actionLoadHistoryRun(index, slot = "runA") {

    const targetSlot =
        normaliseSlot(slot);

    const run =
        loadHistoryRun(
            Number(index),
            targetSlot
        );

    if (!run) {
        return null;
    }

    refreshAnalysis({
        reason: "load_history_run",
        targetSlot,
        historyIndex: Number(index)
    });

    saveStorage(
        getState()
    );

    return run;
}

/* --------------------------------------------------
   DEBUG TOGGLE
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
            ...state.ui,
            debug: next
        }
    });

    saveStorage(
        getState()
    );

    return next;
}

/* --------------------------------------------------
   UI SECTION
-------------------------------------------------- */

export function actionSelectSection(section) {

    const state =
        getState();

    const selectedSection =
        state.ui.selectedSection === section
            ? null
            : section;

    setState({
        ui: {
            ...state.ui,
            selectedSection
        }
    });

    saveStorage(
        getState()
    );

    return selectedSection;
}

/* --------------------------------------------------
   BUILD STYLE
-------------------------------------------------- */

export function actionSetBuildStyle(buildStyle = "unknown") {

    const selected =
        setBuildStyle(buildStyle);

    refreshAnalysis({
        reason: "build_style_changed",
        buildStyle: selected
    });

    saveStorage(
        getState()
    );

    return selected;
}

/* --------------------------------------------------
   GET STATE SNAPSHOT
-------------------------------------------------- */

export function actionGetState() {

    return getState();
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
