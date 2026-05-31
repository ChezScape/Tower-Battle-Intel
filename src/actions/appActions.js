"use strict";

/**
 * APP ACTION FOUNDATION v4.11z52w13
 * Owns app-level actions that are safe outside individual workspaces.
 */

import { refreshAnalysis } from "../core/update.js";
import {
    getState,
    setState,
    resetState,
    clearRuns,
    setBuildStyle
} from "../core/state.js";
import { clearStorage } from "../storage/localStore.js";
import { persistState, normaliseDashboardTab, ACTION_FOUNDATION_VERSION } from "./actionUtils.js";

export function actionReset() {
    resetState();
    clearStorage();
    return getState();
}

export function actionClearRuns() {
    clearRuns();
    refreshAnalysis({ reason: "clear_runs" });
    persistState();
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

    persistState();
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

    persistState();
    return getState().ui;
}

export function actionSelectSection(section = null) {
    const state = getState();
    const value = String(section || "").trim();
    const selectedSection = value && state.ui?.selectedSection === value
        ? null
        : value || null;

    setState({
        ui: {
            ...(state.ui || {}),
            selectedSection
        }
    });

    persistState();
    return selectedSection;
}

export function actionSetBuildStyle(buildStyle = "unknown") {
    const selected = setBuildStyle(buildStyle);

    refreshAnalysis({
        reason: "build_style_changed",
        buildStyle: selected
    });

    persistState();
    return selected;
}

export function actionGetState() {
    return getState();
}

export function getAppActionStatus() {
    return {
        version: ACTION_FOUNDATION_VERSION,
        owner: "src/actions/appActions.js",
        owns: ["reset", "clear runs", "tab action state", "section selection", "build style"]
    };
}

export default {
    actionReset,
    actionClearRuns,
    actionSetDashboardTab,
    actionOpenCompare,
    actionSelectSection,
    actionSetBuildStyle,
    actionGetState,
    getAppActionStatus
};
