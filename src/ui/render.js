"use strict";

/**
 * ROOT UI RENDERER v4.11c
 * One render entry for dashboard + debug panel + delegated UI events.
 */

import { getState } from "../core/state.js";
import { renderDashboard } from "./dashboard.js";
import { renderInspectionPanel } from "./dev/inspectionPanel.js";
import { bindUIEvents } from "./events.js";
import { applyDeviceMode } from "./deviceMode.js";

let renderDepth = 0;

export function render(incomingState = null) {
    const state = incomingState || getState();

    renderDepth += 1;

    try {
        applyDeviceMode();
        renderDashboard(state);
        renderInspectionPanel(state);
        bindUIEvents(() => render());
        return state;
    } finally {
        renderDepth = Math.max(0, renderDepth - 1);
    }
}

export function isRendering() {
    return renderDepth > 0;
}

export default {
    render,
    isRendering
};
