"use strict";

/**
 * DESKTOP VIEW v4.10f
 */

import { buildRunHeader } from "../sections/runHeader.js";
import { buildDifferenceOverview } from "../sections/differenceOverview.js";
import { buildPrimaryStatGrid, buildSecondaryStatGrid } from "../sections/statPanels.js";
import { buildGapPanel } from "../sections/gapRadar.js";
import { buildSideIntel } from "../sections/sideIntel.js";
import { buildCompareView } from "../sections/compareView.js";
import { buildSystemsMatrix } from "../sections/systemsMatrix.js";
import { buildCoachView } from "../sections/coachView.js";
import { buildHistoryView } from "../sections/historyView.js";
import { buildAnomaliesView } from "../sections/anomaliesView.js";
import { buildCommandDeckView, buildSettingsView } from "../sections/commandDeckView.js";
import { escapeAttr } from "../sections/sectionUtils.js";

export function buildDesktopWorkspace(activeTab = "overview", state = {}) {
    return `
        <div class="tbi-desktop-workspace" data-desktop-workspace="true">
            ${workspacePanel("overview", activeTab, buildDesktopDashboard(state))}
            ${workspacePanel("compare", activeTab, buildCompareView(state))}
            ${workspacePanel("systems", activeTab, buildSystemsMatrix(state))}
            ${workspacePanel("coach", activeTab, buildCoachView(state))}
            ${workspacePanel("history", activeTab, buildHistoryView(state))}
            ${workspacePanel("anomalies", activeTab, buildAnomaliesView(state))}
            ${workspacePanel("command", activeTab, buildCommandDeckView(state))}
            ${workspacePanel("settings", activeTab, buildSettingsView(state))}
        </div>
    `;
}

export function buildDesktopDashboard(state = {}) {
    const gridState = {
        ...state,
        gapPanel: buildGapPanel(state)
    };

    return `
        <div class="tbi-desktop-grid" data-dashboard-grid="desktop">
            <main class="tbi-main-column">
                ${buildRunHeader(state)}
                ${buildDifferenceOverview(state)}
                ${buildPrimaryStatGrid(gridState)}
                ${buildSecondaryStatGrid(state)}
                <footer class="tbi-status-footer">
                    <span>ⓘ Tip: buttons use the central action bus.</span>
                    <span>🔒 Data is stored locally only.</span>
                    <span>★ Unknown report fields are tracked by the game brain.</span>
                </footer>
            </main>
            ${buildSideIntel(state)}
        </div>
    `;
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

export default {
    buildDesktopWorkspace,
    buildDesktopDashboard,
    workspacePanel
};
