"use strict";

/**
 * DESKTOP VIEW v4.11z52w59
 *
 * Dashboard and Command Deck remain protected. History is now mounted as the
 * rebuilt raw-archive-led report management workspace. Other workspaces remain
 * parked to stop old active builders/events fighting the rebuild.
 */

import { buildDashboardVisualShell } from "./dashboardVisualShell.js";
import { buildWorkspaceShell } from "../sections/workspaceResetView.js";
import { buildCommandDeckView } from "../sections/commandDeckView.js";
import { buildHistoryView } from "../sections/historyView.js";
import { buildCompareView } from "../sections/compareView.js";
import { escapeAttr } from "../sections/sectionUtils.js";

export function buildDesktopWorkspace(activeTab = "command", state = {}) {
    return `
        <div class="tbi-desktop-workspace" data-desktop-workspace="true" data-ui-shell-reset="v4.11z52w59">
            ${workspacePanel("command", activeTab, buildCommandShell(state))}
            ${workspacePanel("overview", activeTab, buildDesktopDashboard(state))}
            ${workspacePanel("history", activeTab, buildHistoryShell(state))}
            ${workspacePanel("compare", activeTab, buildCompareShell(state))}
            ${workspacePanel("coach", activeTab, buildCoachShell(state))}
            ${workspacePanel("systems", activeTab, buildSystemsShell(state))}
            ${workspacePanel("anomalies", activeTab, buildAnomaliesShell(state))}
            ${workspacePanel("settings", activeTab, buildSettingsShell(state))}
        </div>
    `;
}

export function buildDesktopDashboard(state = {}) {
    return buildDashboardVisualShell(state);
}

export function workspacePanel(key, activeTab, html = "") {
    const active = key === activeTab;

    return `
        <section
            class="tbi-view wa-dashboard-panel ${active ? "active" : ""}"
            data-dashboard-panel="${escapeAttr(key)}"
            ${active ? "" : "aria-hidden=\"true\""}
        >
            ${html}
        </section>
    `;
}

function buildCommandShell(state = {}) {
    return buildCommandDeckView(state);
}

function buildHistoryShell(state = {}) {
    return buildHistoryView(state);
}

function buildCompareShell(state = {}) {
    return buildCompareView(state);
}

function buildCoachShell() {
    return buildWorkspaceShell({
        key: "coach",
        title: "Coach",
        intro: "Coach is parked until parser and saved-run facts are reconnected through the new event/data path.",
        next: "Rebuild advice from tested Game Brain facts.",
        actions: ["Run Advice", "Upgrade Focus", "Farming Notes"]
    });
}

function buildSystemsShell() {
    return buildWorkspaceShell({
        key: "systems",
        title: "Systems",
        intro: "Systems/Game Brain catalogue UI is parked so the old systems bridge and tab/search handlers cannot reset or fight the shell.",
        next: "Reconnect catalogue search/tabs as a single Systems owner.",
        actions: ["Overview", "Mechanics", "Battle Report", "Evidence"]
    });
}

function buildAnomaliesShell() {
    return buildWorkspaceShell({
        key: "anomalies",
        title: "Anomalies",
        intro: "Anomalies is parked until the clean diagnostics and alert rules are reconnected.",
        next: "Rebuild anomaly list after History/Dashboard data is stable.",
        actions: ["View Alerts", "Rules", "Export Notes"]
    });
}

function buildSettingsShell() {
    return buildWorkspaceShell({
        key: "settings",
        title: "Settings",
        kicker: "Settings shell",
        intro: "Settings is parked. Theme/display/debug/startup controls remain removed so they cannot fight the main shell.",
        next: "Rebuild safe settings later with one owner.",
        actions: ["Import", "Export", "Reset", "About"]
    });
}

export default {
    buildDesktopWorkspace,
    buildDesktopDashboard,
    workspacePanel
};
