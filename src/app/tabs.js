"use strict";

/**
 * APP TAB FOUNDATION v4.11z52w12
 * One owner for active workspace/tab state during the shell phase.
 */

import { getState, setState } from "../core/state.js";
import { getUIState, setUIState, normaliseDashboardTab, allowedTabs } from "../ui/uistate.js";

export const APP_TAB_FOUNDATION_VERSION = "v4.11z52w12";

let tabChangeCount = 0;

export function normaliseAppTab(tab = "command") {
    return normaliseDashboardTab(tab);
}

export function getAllowedAppTabs() {
    return allowedTabs();
}

export function getActiveAppTab(state = getState()) {
    const stateTab = state?.ui?.dashboardTab;
    const uiTab = getUIState()?.dashboardTab;
    return normaliseAppTab(stateTab || uiTab || "command");
}

export function activateAppTab(tab = "command", options = {}) {
    const nextTab = normaliseAppTab(tab);
    const previousTab = getActiveAppTab();

    setUIState({ dashboardTab: nextTab });
    setState({ ui: { dashboardTab: nextTab } });

    if (previousTab !== nextTab || options.forceCount === true) {
        tabChangeCount += 1;
    }

    stampAppTabRuntime(nextTab);

    return getState();
}

export function stampAppTabRuntime(tab = getActiveAppTab(), targetDocument = globalThis.document) {
    if (!targetDocument) {
        return normaliseAppTab(tab);
    }

    const nextTab = normaliseAppTab(tab);
    targetDocument.documentElement.dataset.dashboardTab = nextTab;
    targetDocument.documentElement.dataset.appTabOwner = "src/app/tabs.js";
    targetDocument.body?.setAttribute("data-dashboard-tab", nextTab);
    targetDocument.body?.setAttribute("data-app-tab-owner", "src/app/tabs.js");
    return nextTab;
}

export function getAppTabStatus() {
    return {
        version: APP_TAB_FOUNDATION_VERSION,
        owner: "src/app/tabs.js",
        activeTab: getActiveAppTab(),
        allowedTabs: Array.from(getAllowedAppTabs()),
        tabChangeCount
    };
}

export default {
    APP_TAB_FOUNDATION_VERSION,
    normaliseAppTab,
    getAllowedAppTabs,
    getActiveAppTab,
    activateAppTab,
    stampAppTabRuntime,
    getAppTabStatus
};
