"use strict";

/**
 * TOWER BATTLE INTEL DASHBOARD v4.10f
 * Small orchestration layer only.
 */

import { getUIState, hydrateUIState, normaliseDashboardTab } from "./uistate.js";
import { mountHTML } from "./mount.js";
import { qs, clearElement } from "./dom.js";
import { buildTopNav } from "./components/topNav.js";
import { buildDesktopWorkspace } from "./views/desktopView.js";
import { buildMobileWorkspace } from "./views/mobileView.js";
import { normaliseViewState, escapeAttr } from "./sections/sectionUtils.js";
import { getAppliedDeviceMode } from "./deviceMode.js";

export function renderDashboard(state = {}) {
    const root = qs("#dashboard");

    if (!root) {
        return null;
    }

    hydrateUIState(state);

    const ui = getUIState();
    const activeTab = normaliseDashboardTab(ui.dashboardTab);
    const viewState = normaliseViewState({
        ...state,
        ui: {
            ...(state.ui || {}),
            ...ui,
            dashboardTab: activeTab
        }
    });

    const mode = getAppliedDeviceMode();

    stampDashboardRuntime(activeTab, mode);

    const html = `
        <div
            class="tbi-shell wa-dashboard-shell"
            data-dashboard-shell="true"
            data-dashboard-tab-active="${escapeAttr(activeTab)}"
            data-dashboard-device-mode="${escapeAttr(mode)}"
        >
            ${buildTopNav(activeTab)}
            ${mode === "mobile" ? buildMobileWorkspace(activeTab, viewState) : buildDesktopWorkspace(activeTab, viewState)}
        </div>
    `;

    clearElement(root);
    mountHTML(root, html);

    return root;
}

function stampDashboardRuntime(activeTab, mode) {
    if (typeof document === "undefined") return;

    document.body.dataset.dashboardTab = activeTab;
    document.documentElement.dataset.dashboardTab = activeTab;
    document.body.dataset.dashboardDeviceMode = mode;
    document.documentElement.dataset.dashboardDeviceMode = mode;
}

export { normaliseDashboardTab };

export default {
    renderDashboard,
    normaliseDashboardTab
};
