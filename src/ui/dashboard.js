"use strict";

/**
 * TOWER BATTLE INTEL v4.9m
 * Full UI overhaul renderer.
 *
 * dashboard.js is now a small orchestration layer only.
 */

import { getUIState, hydrateUIState } from "./uistate.js";
import { mountHTML } from "./mount.js";
import { qs, clearElement } from "./dom.js";
import { buildTopNav } from "./components/topNav.js";
import { buildDesktopWorkspace } from "./views/desktopView.js";
import { buildMobileWorkspace } from "./views/mobileView.js";
import { normaliseViewState, escapeAttr } from "./sections/sectionUtils.js";

export function renderDashboard(state = {}) {
    const root = qs("#dashboard");

    if (!root) {
        return;
    }

    hydrateUIState(state);

    const ui = getUIState();
    const activeTab = normaliseDashboardTab(ui.dashboardTab);
    const viewState = normaliseViewState({
        ...state,
        ui: {
            ...(state.ui || {}),
            ...ui
        }
    });
    const mobileMode = isMobileMode();

    document.body.dataset.dashboardTab = activeTab;
    document.documentElement.dataset.dashboardTab = activeTab;

    const html = `
        <div
            class="tbi-shell wa-dashboard-shell"
            data-dashboard-shell="true"
            data-dashboard-tab-active="${escapeAttr(activeTab)}"
        >
            ${buildTopNav(activeTab)}
            ${mobileMode ? buildMobileWorkspace(activeTab, viewState) : buildDesktopWorkspace(activeTab, viewState)}
        </div>
    `;

    clearElement(root);
    mountHTML(root, html);
}

function isMobileMode() {
    return (
        typeof document !== "undefined" &&
        document.documentElement?.getAttribute("data-device-mode") === "mobile"
    );
}

function normaliseDashboardTab(tab = "overview") {
    const value = String(tab || "overview");

    const aliases = {
        dashboard: "overview",
        intel: "compare",
        gains: "compare",
        losses: "compare"
    };

    const normalised = aliases[value] || value;

    const valid = new Set([
        "overview",
        "compare",
        "systems",
        "coach",
        "history",
        "anomalies",
        "command",
        "more",
        "settings"
    ]);

    return valid.has(normalised) ? normalised : "overview";
}

export default {
    renderDashboard
};
