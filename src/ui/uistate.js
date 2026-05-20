"use strict";

/**
 * UI STATE STORE
 * Keeps dashboard-only UI state separate but synced with global state.
 */

const uiState = {

    selectedSection: null,

    debug: false,

    activeView: "dashboard",

    viewMode: "default",

    dashboardTab: "overview"
};

/* --------------------------------------------------
   GET
-------------------------------------------------- */

export function getUIState() {

    return uiState;
}

/* --------------------------------------------------
   SET
-------------------------------------------------- */

export function setUIState(partial = {}) {

    if (!partial || typeof partial !== "object") {
        return uiState;
    }

    Object.assign(uiState, partial);

    return uiState;
}

/* --------------------------------------------------
   HYDRATE FROM GLOBAL STATE
-------------------------------------------------- */

export function hydrateUIState(state = {}) {

    const incoming =
        state?.ui || {};

    Object.assign(uiState, {

        selectedSection:
            incoming.selectedSection ?? uiState.selectedSection,

        debug:
            incoming.debug ?? uiState.debug,

        activeView:
            incoming.activeView ?? uiState.activeView,

        viewMode:
            incoming.viewMode ?? uiState.viewMode,

        dashboardTab:
            incoming.dashboardTab ?? uiState.dashboardTab ?? "overview"
    });

    return uiState;
}

/* --------------------------------------------------
   RESET
-------------------------------------------------- */

export function resetUIState() {

    uiState.selectedSection = null;
    uiState.debug = false;
    uiState.activeView = "dashboard";
    uiState.viewMode = "default";
    uiState.dashboardTab = "overview";

    return uiState;
}
