"use strict";

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

export function buildDesktopWorkspace(activeTab, state) {
    return `
        <div class="tbi-desktop-workspace">
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

function buildDesktopDashboard(state) {
    const gridState = {
        ...state,
        gapPanel: buildGapPanel(state)
    };

    return `
        <div class="tbi-desktop-grid">
            <main class="tbi-main-column">
                ${buildRunHeader(state)}
                ${buildDifferenceOverview(state)}
                ${buildPrimaryStatGrid(gridState)}
                ${buildSecondaryStatGrid(state)}
                <footer class="tbi-status-footer">
                    <span>ⓘ Tip: hover any metric for detailed information and formula.</span>
                    <span>🔒 Data is stored locally only.</span>
                    <span>★ Unknown report fields are now tracked by the game brain.</span>
                </footer>
            </main>
            ${buildSideIntel(state)}
        </div>
    `;
}

function workspacePanel(key, activeTab, html = "") {
    return `
        <section class="tbi-view wa-dashboard-panel ${key === activeTab ? "active" : ""}" data-dashboard-panel="${key}">
            ${html}
        </section>
    `;
}
