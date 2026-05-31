"use strict";

/**
 * DASHBOARD SHELL RENDERER v4.11z52w12
 * UI composition only. App render/tab ownership lives in src/app/.
 */

import { getUIState, hydrateUIState } from "./uistate.js";
import { mountHTML } from "./mount.js";
import { qs, clearElement } from "./dom.js";
import { buildTopNav } from "./components/topNav.js";
import { buildDesktopWorkspace } from "./views/desktopView.js";
import { buildMobileWorkspace } from "./views/mobileView.js";
import { normaliseViewState, escapeAttr } from "./sections/sectionUtils.js";
import { getAppliedDeviceMode } from "./deviceMode.js";
import { getActiveAppTab, normaliseAppTab, stampAppTabRuntime } from "../app/tabs.js";

export function renderDashboard(state = {}, options = {}) {
    const root = qs("#dashboard");

    if (!root) {
        return null;
    }

    hydrateUIState(state);

    const activeTab = normaliseAppTab(options.activeTab || getActiveAppTab(state));
    const ui = getUIState();
    const viewState = normaliseViewState({
        ...state,
        ui: {
            ...(state.ui || {}),
            ...ui,
            dashboardTab: activeTab
        }
    });

    const mode = getAppliedDeviceMode();

    stampDashboardRuntime(activeTab, mode, options.owner || "src/ui/dashboard.js");

    const html = `
        <div
            class="tbi-shell wa-dashboard-shell"
            data-dashboard-shell="true"
            data-dashboard-tab-active="${escapeAttr(activeTab)}"
            data-dashboard-device-mode="${escapeAttr(mode)}"
            data-dashboard-render-owner="${escapeAttr(options.owner || "src/ui/dashboard.js") }"
        >
            ${buildTopNav(activeTab)}
            ${mode === "mobile" ? buildMobileWorkspace(activeTab, viewState) : buildDesktopWorkspace(activeTab, viewState)}
        </div>
    `;

    clearElement(root);
    mountHTML(root, html);

    return root;
}

function stampDashboardRuntime(activeTab, mode, owner = "src/ui/dashboard.js") {
    if (typeof document === "undefined") return;

    stampAppTabRuntime(activeTab);
    document.body.dataset.dashboardDeviceMode = mode;
    document.documentElement.dataset.dashboardDeviceMode = mode;
    document.documentElement.dataset.dashboardRenderOwner = owner;
    document.body?.setAttribute("data-dashboard-render-owner", owner);
}

export { normaliseAppTab as normaliseDashboardTab };

export default {
    renderDashboard,
    normaliseDashboardTab: normaliseAppTab
};
