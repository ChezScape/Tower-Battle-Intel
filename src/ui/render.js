"use strict";

/**
 * ROOT UI RENDERER
 * One render entry for dashboard + dev panel + UI events.
 */

import {
    getState
} from "../core/state.js";

import {
    renderDashboard
} from "./dashboard.js";

import {
    renderInspectionPanel
} from "./dev/inspectionPanel.js";

import {
    bindUIEvents
} from "./events.js";

/* --------------------------------------------------
   RENDER
-------------------------------------------------- */

export function render(incomingState = null) {

    const state =
        incomingState || getState();

    renderDashboard(state);

    renderInspectionPanel(state);

    bindUIEvents(() => render());
}
