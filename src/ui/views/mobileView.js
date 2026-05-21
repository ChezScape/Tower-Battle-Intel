"use strict";

import { buildMobileBottomNav } from "../components/topNav.js";
import { buildMobileRunDuel } from "../sections/runHeader.js";
import { buildMobileKeyDifferences } from "../sections/differenceOverview.js";
import { buildGapPanel } from "../sections/gapRadar.js";
import { buildCompareView } from "../sections/compareView.js";
import { buildSystemsMatrix } from "../sections/systemsMatrix.js";
import { buildCoachView } from "../sections/coachView.js";
import { buildHistoryView } from "../sections/historyView.js";
import { buildAnomaliesView } from "../sections/anomaliesView.js";
import { buildCommandDeckView, buildMoreView, buildSettingsView } from "../sections/commandDeckView.js";
import { escapeHTML, escapeAttr, formatLabel, formatDelta, mergeSections, sectionTotal } from "../sections/sectionUtils.js";

export function buildMobileWorkspace(activeTab, state) {
    return `
        <div class="tbi-mobile-workspace">
            ${workspacePanel("overview", activeTab, buildMobileDashboard(state))}
            ${workspacePanel("compare", activeTab, buildCompareView(state, { mobile: true }))}
            ${workspacePanel("systems", activeTab, buildSystemsMatrix(state))}
            ${workspacePanel("coach", activeTab, buildCoachView(state, { mobile: true }))}
            ${workspacePanel("more", activeTab, buildMoreView(state))}
            ${workspacePanel("history", activeTab, buildHistoryView(state))}
            ${workspacePanel("anomalies", activeTab, buildAnomaliesView(state))}
            ${workspacePanel("command", activeTab, buildCommandDeckView(state))}
            ${workspacePanel("settings", activeTab, buildSettingsView(state))}
            ${buildMobileBottomNav(activeTab)}
        </div>
    `;
}

function buildMobileDashboard(state) {
    return `
        <div class="tbi-mobile-stack" data-mobile-quick-strip="true">
            ${buildMobileRunDuel(state)}
            ${buildMobileKeyDifferences(state)}
            ${buildMobileAccordionList(state)}
            ${buildGapPanel(state)}
        </div>
    `;
}

function buildMobileAccordionList(state) {
    const items = [
        ["damage", "Damage", "✹"],
        ["damage_taken", "Defense", "⬡"],
        ["utility", "Utility", "⚒"],
        ["coins", "Coins", "$"],
        ["enemies_hit_by", "Enemies", "◎"]
    ];

    return `
        <section class="tbi-card tbi-mobile-accordion-list">
            ${items.map(([key, label, icon]) => {
                const section = key === "damage_taken"
                    ? mergeSections(state.sections, ["damage_taken", "health_regenerated", "damage_blocked"])
                    : state.sections[key];
                const total = sectionTotal(section);
                return `
                    <button type="button" class="tbi-accordion-row" data-dashboard-tab="compare">
                        <span class="tbi-accordion-icon">${escapeHTML(icon)}</span>
                        <strong>${escapeHTML(label || formatLabel(key))}</strong>
                        <em>${escapeHTML(formatDelta(total, { compact: true }))}</em>
                        <span aria-hidden="true">›</span>
                    </button>
                `;
            }).join("")}
        </section>
    `;
}

function workspacePanel(key, activeTab, html = "") {
    return `
        <section class="tbi-view wa-dashboard-panel ${key === activeTab ? "active" : ""}" data-dashboard-panel="${escapeAttr(key)}">
            ${html}
        </section>
    `;
}
