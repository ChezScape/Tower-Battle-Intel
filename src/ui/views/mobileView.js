"use strict";

/**
 * MOBILE VIEW v4.11z52w12
 *
 * Mobile is allowed to be cleaned, but remains concept-shell only while the
 * desktop proof-of-concept is stabilised. This keeps the same premium language
 * as desktop without reconnecting old mobile handlers.
 */

import { buildMobileBottomNav } from "../components/topNav.js";
import { buildMoreResetView, buildWorkspaceShell } from "../sections/workspaceResetView.js";
import { escapeHTML, escapeAttr } from "../sections/sectionUtils.js";

export function buildMobileWorkspace(activeTab = "overview", state = {}) {
    return `
        <div class="tbi-mobile-workspace" data-mobile-workspace="true" data-ui-shell-reset="v4.11z52w12">
            ${workspacePanel("overview", activeTab, buildMobileDashboard(state))}
            ${workspacePanel("compare", activeTab, mobileShell("compare", "Compare", "Datasheet shell parked for later mobile rebuild."))}
            ${workspacePanel("systems", activeTab, mobileShell("systems", "Systems", "Game Brain catalogue shell parked for later mobile rebuild."))}
            ${workspacePanel("coach", activeTab, mobileShell("coach", "Coach", "Advice shell parked for later mobile rebuild."))}
            ${workspacePanel("more", activeTab, buildMoreResetView())}
            ${workspacePanel("history", activeTab, mobileShell("history", "History", "Saved-run shell parked until desktop History is clean."))}
            ${workspacePanel("anomalies", activeTab, mobileShell("anomalies", "Anomalies", "Alert shell parked for later mobile rebuild."))}
            ${workspacePanel("command", activeTab, mobileShell("command", "Command Deck", "Report intake shell parked while desktop wiring is rebuilt."))}
            ${workspacePanel("settings", activeTab, mobileShell("settings", "Settings", "Settings shell parked."))}
            ${buildMobileBottomNav(activeTab)}
        </div>
    `;
}

export function buildMobileDashboard(state = {}) {
    const runA = state.runA || {};
    const runB = state.runB || {};
    return `
        <div class="tbi-mobile-stack tbi-mobile-dashboard-shell" data-mobile-dashboard-visual-shell="v4.11z52w12">
            <section class="tbi-card tbi-mobile-hero-shell">
                <div class="tbi-reset-kicker">Mobile concept shell</div>
                <h2>Dashboard</h2>
                <p>Same Tower Battle Intel concept as desktop, stacked for mobile later. Live actions are parked while desktop ownership is rebuilt.</p>
            </section>
            <section class="tbi-card tbi-mobile-duel-shell">
                ${mobileRunCard("Run A", runA, "a")}
                <div class="tbi-mobile-vs-shell">VS</div>
                ${mobileRunCard("Run B", runB, "b")}
            </section>
            <section class="tbi-card tbi-mobile-quick-shell">
                <h3>Quick Actions</h3>
                <div class="tbi-reset-action-grid">
                    ${parkedMobileButton("Paste Report")}
                    ${parkedMobileButton("Save Report")}
                    ${parkedMobileButton("History")}
                    ${parkedMobileButton("Export")}
                </div>
            </section>
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

function mobileShell(key, title, intro) {
    return buildWorkspaceShell({
        key,
        title,
        intro,
        status: "Mobile visual shell",
        next: "Desktop shell gets rewired first.",
        mobile: true,
        actions: ["Primary action", "Secondary action", "Open details"]
    });
}

function mobileRunCard(label, run = {}, side = "a") {
    const core = run.core || {};
    return `
        <article class="tbi-mobile-run-shell run-${escapeAttr(side)}">
            <span>${escapeHTML(label)}</span>
            <strong>Wave ${escapeHTML(core.wave ?? "-")}</strong>
            <em>${escapeHTML(core.killedBy || "No run loaded")}</em>
        </article>
    `;
}

function parkedMobileButton(label) {
    return `
        <button type="button" class="tbi-reset-shell-action" data-dashboard-button-parked="true" data-ui-shell-action="${escapeAttr(label)}">
            <strong>${escapeHTML(label)}</strong>
            <span>Parked</span>
        </button>
    `;
}

export default {
    buildMobileWorkspace,
    buildMobileDashboard,
    workspacePanel
};
