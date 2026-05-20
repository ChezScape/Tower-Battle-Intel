"use strict";

/**
 * TOWER BATTLE INTEL DASHBOARD v4.9b
 * Clean workspace renderer.
 *
 * Keeps runtime/data systems intact and replaces the old dashboard UI stack.
 * - Desktop: wide neon command dashboard with real workspace tabs.
 * - Mobile: locked app layout with top analysis tabs + bottom app destinations.
 * - No legacy topbar/summary/heatmap layout imports.
 */

import {
    buildHistory
} from "./layouts/historyLayout.js";

import {
    getUIState,
    hydrateUIState
} from "./uistate.js";

import {
    mountHTML
} from "./mount.js";

import {
    qs,
    clearElement
} from "./dom.js";

import {
    formatNumber,
    formatTime,
    formatLabel,
    escapeHTML,
    escapeAttr
} from "./utils/format.js";

import {
    formatDelta,
    formatPercentDelta
} from "./utils/deltaFormat.js";

/* --------------------------------------------------
   TAB DEFINITIONS
-------------------------------------------------- */

const WORKSPACE_TABS = [
    ["overview", "Dashboard", "⌁"],
    ["compare", "Compare", "⇄"],
    ["systems", "Systems", "◇"],
    ["coach", "Coach", "✦"],
    ["history", "History", "◷"],
    ["anomalies", "Anomalies", "△"],
    ["command", "Command Deck", "▣"]
];

const MOBILE_TOP_TABS = [
    ["overview", "Dashboard", "⌁"],
    ["compare", "Compare", "⇄"],
    ["systems", "Systems", "◎"],
    ["coach", "Coach", "?"],
    ["more", "More", "•••"]
];

const MOBILE_BOTTOM_TABS = [
    ["overview", "Dashboard", "⌂"],
    ["history", "History", "▤"],
    ["command", "Command Deck", "▣"],
    ["settings", "Settings", "⚙"]
];

const DETAIL_SECTIONS = [
    ["damage", "Damage Dealt", "✹"],
    ["damage_taken", "Defense & Survival", "⬡"],
    ["utility", "Utility", "⚒"],
    ["enemies_hit_by", "Enemies Hit By", "◎"],
    ["coins", "Coins Breakdown", "$"],
    ["counts", "Counts", "#"],
    ["killed_with_effect_active", "Effects Active", "✦"],
    ["records", "Records", "▤"]
];

/* --------------------------------------------------
   MAIN RENDER
-------------------------------------------------- */

export function renderDashboard(state = {}) {

    const root = qs("#dashboard");

    if (!root) {
        return;
    }

    hydrateUIState(state);

    const ui = getUIState();
    const activeTab = normaliseDashboardTab(ui.dashboardTab);

    const viewState = normaliseState(state);
    const mobileMode = isMobileMode();

    document.body.dataset.dashboardTab = activeTab;
    document.documentElement.dataset.dashboardTab = activeTab;

    const html = `
        <div
            class="tbi-shell wa-dashboard-shell"
            data-dashboard-shell="true"
            data-dashboard-tab-active="${escapeAttr(activeTab)}"
        >
            ${buildHeader(activeTab)}
            ${mobileMode ? buildMobileWorkspace(activeTab, viewState) : buildDesktopWorkspace(activeTab, viewState)}
        </div>
    `;

    clearElement(root);
    mountHTML(root, html);
}

/* --------------------------------------------------
   STATE SHAPE
-------------------------------------------------- */

function normaliseState(state = {}) {

    const compare = state.compareData || {};

    return {
        runA: state.runA || null,
        runB: state.runB || null,
        history: Array.isArray(state.history) ? state.history : [],
        insights: Array.isArray(state.insights) ? state.insights : [],
        ai: Array.isArray(state.ai) ? state.ai : [],
        anomalies: Array.isArray(state.anomalies) ? state.anomalies : [],
        trend: state.trend || {},
        compare,
        core: compare.core || {},
        stats: compare.stats || {},
        sections: compare.sections || {},
        summary: compare.summary || {},
        ui: state.ui || {}
    };
}

/* --------------------------------------------------
   HEADER / NAVIGATION
-------------------------------------------------- */

function buildHeader(activeTab = "overview") {

    return `
        <header class="tbi-header" data-debug-hold-zone="true" aria-label="Tower Battle Intel header. Hold for diagnostics.">
            <div class="tbi-brand-block">
                <div class="tbi-logo" aria-hidden="true">⌂</div>
                <div>
                    <div class="tbi-brand-title">Tower Battle Intel</div>
                    <div class="tbi-brand-subtitle">Battle Report Intelligence Dashboard</div>
                </div>
            </div>

            <nav class="tbi-desktop-nav" aria-label="Desktop workspaces">
                ${WORKSPACE_TABS.map(([key, label]) => navButton(key, label, activeTab)).join("")}
            </nav>

            <nav class="tbi-mobile-top-nav" aria-label="Mobile analysis workspaces">
                ${MOBILE_TOP_TABS.map(([key, label, icon]) => navButton(key, label, mobileTopActive(activeTab), icon)).join("")}
            </nav>

            <div class="tbi-header-actions">
                <span class="tbi-version-pill">TBI: v4.9b</span>
                <button type="button" class="tbi-icon-button" data-dashboard-tab="command" aria-label="Open command deck">▣</button>
            </div>
        </header>
    `;
}

function navButton(key, label, activeTab, icon = "") {

    const active = key === activeTab;

    return `
        <button
            type="button"
            class="tbi-nav-button ${active ? "active" : ""}"
            data-dashboard-tab="${escapeAttr(key)}"
            aria-pressed="${active ? "true" : "false"}"
        >
            ${icon ? `<span class="tbi-nav-icon" aria-hidden="true">${escapeHTML(icon)}</span>` : ""}
            <span>${escapeHTML(label)}</span>
        </button>
    `;
}

function mobileTopActive(activeTab = "overview") {

    if (["history", "command", "settings", "anomalies"].includes(activeTab)) {
        return "more";
    }

    return activeTab;
}

/* --------------------------------------------------
   WORKSPACE SHELLS
-------------------------------------------------- */

function buildDesktopWorkspace(activeTab, state) {

    return `
        <div class="tbi-desktop-workspace">
            ${workspacePanel("overview", activeTab, buildDesktopDashboard(state))}
            ${workspacePanel("compare", activeTab, buildCompareView(state))}
            ${workspacePanel("systems", activeTab, buildSystemsView(state))}
            ${workspacePanel("coach", activeTab, buildCoachView(state))}
            ${workspacePanel("history", activeTab, buildHistoryView(state))}
            ${workspacePanel("anomalies", activeTab, buildAnomaliesView(state))}
            ${workspacePanel("command", activeTab, buildCommandView(state))}
            ${workspacePanel("settings", activeTab, buildSettingsView(state))}
        </div>
    `;
}

function buildMobileWorkspace(activeTab, state) {

    return `
        <div class="tbi-mobile-workspace">
            ${workspacePanel("overview", activeTab, buildMobileDashboard(state))}
            ${workspacePanel("compare", activeTab, buildCompareView(state, { mobile: true }))}
            ${workspacePanel("systems", activeTab, buildSystemsView(state, { mobile: true }))}
            ${workspacePanel("coach", activeTab, buildCoachView(state, { mobile: true }))}
            ${workspacePanel("more", activeTab, buildMoreView(state))}
            ${workspacePanel("history", activeTab, buildHistoryView(state))}
            ${workspacePanel("anomalies", activeTab, buildAnomaliesView(state))}
            ${workspacePanel("command", activeTab, buildCommandView(state))}
            ${workspacePanel("settings", activeTab, buildSettingsView(state))}
            ${buildMobileBottomNav(activeTab)}
        </div>
    `;
}

function workspacePanel(key, activeTab, html = "") {

    return `
        <section
            class="tbi-view wa-dashboard-panel ${key === activeTab ? "active" : ""}"
            data-dashboard-panel="${escapeAttr(key)}"
        >
            ${html}
        </section>
    `;
}

function buildMobileBottomNav(activeTab = "overview") {

    return `
        <nav class="tbi-mobile-bottom-nav" aria-label="Mobile app destinations">
            ${MOBILE_BOTTOM_TABS.map(([key, label, icon]) => navButton(key, label, activeTab, icon)).join("")}
        </nav>
    `;
}

/* --------------------------------------------------
   DASHBOARD VIEWS
-------------------------------------------------- */

function buildDesktopDashboard(state) {

    return `
        <div class="tbi-desktop-grid">
            <div class="tbi-main-column">
                ${buildRunStrip(state)}
                ${buildDifferenceOverview(state)}
                <div class="tbi-grid tbi-grid-4">
                    ${buildMetricTableCard("Damage Dealt", state.sections.damage, { icon: "✹", accent: "cyan" })}
                    ${buildMetricTableCard("Defense & Survival", mergeSections(state.sections, ["damage_taken", "health_regenerated", "damage_blocked"]), { icon: "⬡", accent: "blue" })}
                    ${buildMetricTableCard("Utility", state.sections.utility, { icon: "⚒", accent: "violet" })}
                    ${buildGapPanel(state)}
                </div>
                <div class="tbi-grid tbi-grid-4 compact">
                    ${buildMetricTableCard("Enemies Hit By", state.sections.enemies_hit_by, { icon: "◎", accent: "violet", limit: 5 })}
                    ${buildMetricTableCard("Counts", state.sections.counts, { icon: "#", accent: "cyan", limit: 5 })}
                    ${buildMetricTableCard("Coins Breakdown", state.sections.coins, { icon: "$", accent: "gold", limit: 6 })}
                    ${buildMetricTableCard("Effects Active", state.sections.killed_with_effect_active, { icon: "✦", accent: "pink", limit: 5 })}
                </div>
            </div>
            <aside class="tbi-side-column">
                ${buildTakeawaysPanel(state)}
                ${buildQuickInsightsPanel(state)}
                ${buildRecommendationsPanel(state)}
                ${buildAnomalyMiniPanel(state)}
                ${buildQuickActionsPanel()}
            </aside>
        </div>
    `;
}

function buildMobileDashboard(state) {

    return `
        <div class="tbi-mobile-stack">
            ${buildMobileRunDuel(state)}
            ${buildMobileKeyDifferences(state)}
            ${buildMobileAccordionList(state)}
            ${buildGapPanel(state)}
        </div>
    `;
}

function buildRunStrip(state) {

    return `
        <section class="tbi-run-strip">
            ${buildRunCard("Run A", state.runA, "a")}
            <div class="tbi-vs-core">
                <div class="tbi-vs-gem">VS</div>
                <div>A vs B Comparison</div>
            </div>
            ${buildRunCard("Run B", state.runB, "b")}
        </section>
    `;
}

function buildRunCard(title, run, side = "a") {

    const core = run?.core || {};
    const stats = run?.stats || {};

    return `
        <article class="tbi-run-card run-${escapeAttr(side)}">
            <div class="tbi-run-card-top">
                <div>
                    <h2>${escapeHTML(title)}</h2>
                    <span>${escapeHTML(core.battleDate || "No battle loaded")}</span>
                </div>
                <div class="tbi-run-time-stack">
                    <span>${escapeHTML(formatTime(core.time || 0))}</span>
                    <span>${escapeHTML(formatNumber(stats.coinsPerHour || 0))} / hour</span>
                </div>
            </div>
            <div class="tbi-run-metrics">
                ${runMetric("Wave", core.wave ?? "-", "primary")}
                ${runMetric("Killed By", core.killedBy || "-", "danger")}
                ${runMetric("Coins Earned", formatNumber(core.coins || 0), "gold")}
                ${runMetric("Cells Earned", formatNumber(core.cells || 0), "green")}
            </div>
            <div class="tbi-run-footer">
                <span>Coins / Hour <strong>${escapeHTML(formatNumber(stats.coinsPerHour || 0))}</strong></span>
                <span>Cells / Hour <strong>${escapeHTML(formatNumber(stats.cellsPerHour || 0))}</strong></span>
                <span>Real Time <strong>${escapeHTML(formatTime(core.time || 0))}</strong></span>
            </div>
        </article>
    `;
}

function runMetric(label, value, tone = "neutral") {

    return `
        <div class="tbi-run-metric ${escapeAttr(tone)}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
        </div>
    `;
}

function buildMobileRunDuel(state) {

    return `
        <section class="tbi-mobile-duel">
            <div class="tbi-mobile-run run-a">
                <h2>Run A</h2>
                <span>${escapeHTML(state.runA?.core?.battleDate || "No run")}</span>
                <strong>${escapeHTML(state.runA?.core?.wave ?? "-")}</strong>
                <em>${escapeHTML(formatNumber(state.runA?.core?.coins || 0))}</em>
            </div>
            <div class="tbi-mobile-vs">VS</div>
            <div class="tbi-mobile-run run-b">
                <h2>Run B</h2>
                <span>${escapeHTML(state.runB?.core?.battleDate || "No run")}</span>
                <strong>${escapeHTML(state.runB?.core?.wave ?? "-")}</strong>
                <em>${escapeHTML(formatNumber(state.runB?.core?.coins || 0))}</em>
            </div>
        </section>
    `;
}

function buildDifferenceOverview(state) {

    const items = buildDifferenceItems(state);

    return `
        <section class="tbi-card tbi-difference-overview">
            <div class="tbi-card-heading">
                <h3>Difference Overview</h3>
                <span>Better for B · Worse for B · Neutral</span>
            </div>
            <div class="tbi-diff-row">
                ${items.map(item => diffTile(item)).join("")}
            </div>
        </section>
    `;
}

function buildMobileKeyDifferences(state) {

    const items = buildDifferenceItems(state).slice(0, 4);

    return `
        <section class="tbi-card tbi-mobile-key-diffs">
            <h3>Key Differences</h3>
            <div class="tbi-mobile-diff-grid">
                ${items.map(item => diffTile(item)).join("")}
            </div>
        </section>
    `;
}

function buildDifferenceItems(state) {

    const core = state.core || {};
    const stats = state.stats || {};

    return [
        diffItem("Wave A - B", core.wave, "⌁"),
        diffItem("Coins A - B", core.coins, "$"),
        diffItem("Coins / Hour", stats.coinsPerHour || stats.coins_per_hour, "↗"),
        diffItem("Cells A - B", core.cells, "●"),
        diffItem("Cells / Hour", stats.cellsPerHour || stats.cells_per_hour, "◌"),
        diffItem("Total Damage", firstExisting(state.sections?.damage, ["damage_dealt", "total_damage"]), "✹")
    ];
}

function diffItem(label, data, icon) {

    const diff = data?.diff ?? 0;
    const pct = data?.pct;

    return {
        label,
        icon,
        diff,
        percent: pct,
        tone: toneFromDiffData(data)
    };
}

function diffTile(item) {

    return `
        <div class="tbi-diff-tile ${escapeAttr(item.tone)}">
            <div class="tbi-diff-icon">${escapeHTML(item.icon)}</div>
            <span>${escapeHTML(item.label)}</span>
            <strong>${escapeHTML(formatDelta(item.diff, { compact: true }))}</strong>
            <em>${escapeHTML(formatPercentDelta(item.percent))}</em>
        </div>
    `;
}

function buildMobileAccordionList(state) {

    return `
        <section class="tbi-card tbi-mobile-accordion-list">
            ${DETAIL_SECTIONS.slice(0, 5).map(([key, label, icon]) => {
                const section = key === "damage_taken"
                    ? mergeSections(state.sections, ["damage_taken", "health_regenerated", "damage_blocked"])
                    : state.sections[key];
                const total = sectionTotal(section);
                return `
                    <button type="button" class="tbi-accordion-row" data-dashboard-tab="compare">
                        <span class="tbi-accordion-icon">${escapeHTML(icon)}</span>
                        <strong>${escapeHTML(label)}</strong>
                        <em>${escapeHTML(formatDelta(total, { compact: true }))}</em>
                        <span aria-hidden="true">›</span>
                    </button>
                `;
            }).join("")}
        </section>
    `;
}

/* --------------------------------------------------
   COMPARE VIEW
-------------------------------------------------- */

function buildCompareView(state, options = {}) {

    const blocks = [
        ["Damage Dealt", state.sections.damage, "✹"],
        ["Defense & Survival", mergeSections(state.sections, ["damage_taken", "health_regenerated", "damage_blocked"]), "⬡"],
        ["Utility", state.sections.utility, "⚒"],
        ["Coins Breakdown", state.sections.coins, "$"],
        ["Enemies Hit By", state.sections.enemies_hit_by, "◎"],
        ["Counts", state.sections.counts, "#"],
        ["Records", state.sections.records, "▤"],
        ["Effects Active", state.sections.killed_with_effect_active, "✦"]
    ];

    return `
        <div class="tbi-view-stack">
            <section class="tbi-card tbi-view-intro">
                <h2>Compare</h2>
                <p>Detailed A - B breakdowns. Positive and negative colours use the game brain role logic where available.</p>
            </section>
            <div class="tbi-grid ${options.mobile ? "tbi-grid-1" : "tbi-grid-2"}">
                ${blocks.map(([label, section, icon]) => buildMetricTableCard(label, section, { icon, limit: options.mobile ? 8 : 12 })).join("")}
            </div>
        </div>
    `;
}

/* --------------------------------------------------
   SYSTEMS VIEW
-------------------------------------------------- */

function buildSystemsView(state) {

    const selectedSection = getActiveSection(state.ui.selectedSection, state.sections);
    const selectedData = selectedSection ? state.sections[selectedSection] : null;

    return `
        <div class="tbi-view-stack">
            <section class="tbi-card tbi-systems-panel">
                <div class="tbi-card-heading">
                    <div>
                        <h2>Subsystem Matrix</h2>
                        <p>Tap a subsystem to inspect it. The detail panel opens in place and does not force-scroll the page.</p>
                    </div>
                    <span>${escapeHTML(Object.keys(state.sections || {}).length)} systems</span>
                </div>
                <div class="tbi-system-grid">
                    ${Object.entries(state.sections || {}).map(([key, value]) => systemTile(key, value, selectedSection)).join("")}
                </div>
            </section>
            ${selectedSection ? buildSystemDetail(selectedSection, selectedData) : buildNoSystemSelected()}
        </div>
    `;
}

function systemTile(key, section, selectedSection) {

    const total = sectionTotal(section);
    const tone = total > 0 ? "good" : total < 0 ? "bad" : "neutral";
    const active = key === selectedSection;

    return `
        <button
            type="button"
            class="tbi-system-tile ${tone} ${active ? "active" : ""}"
            data-section="${escapeAttr(key)}"
            aria-pressed="${active ? "true" : "false"}"
        >
            <span>${escapeHTML(formatLabel(key))}</span>
            <strong>${escapeHTML(formatDelta(total, { compact: true }))}</strong>
        </button>
    `;
}

function buildNoSystemSelected() {

    return `
        <section class="tbi-card tbi-system-detail empty">
            <h3>System detail closed</h3>
            <p>Select a Subsystem Matrix tile to open its detail panel.</p>
        </section>
    `;
}

function buildSystemDetail(sectionName, section) {

    return `
        <details class="tbi-card tbi-system-detail" open>
            <summary>
                <span>${escapeHTML(formatLabel(sectionName))} Detail</span>
                <em>Collapse / expand</em>
            </summary>
            ${buildMetricRows(section, { limit: 24, showHeader: true })}
        </details>
    `;
}

/* --------------------------------------------------
   COACH / INSIGHTS / ANOMALIES
-------------------------------------------------- */

function buildCoachView(state, options = {}) {

    const ai = state.ai || [];
    const insights = state.insights || [];

    return `
        <div class="tbi-view-stack">
            <section class="tbi-card tbi-view-intro">
                <h2>Coach</h2>
                <p>Game-brain recommendations, killed-by context, farming reads, and upgrade pressure.</p>
            </section>
            <div class="tbi-grid ${options.mobile ? "tbi-grid-1" : "tbi-grid-2"}">
                ${buildAdviceList("AI Coach", ai, "coach")}
                ${buildAdviceList("Insights", insights, "insight")}
                ${buildTakeawaysPanel(state)}
                ${buildRecommendationsPanel(state)}
            </div>
        </div>
    `;
}

function buildAdviceList(title, items = [], type = "insight") {

    const rows = Array.isArray(items) ? items.slice(0, 8) : [];

    return `
        <section class="tbi-card tbi-advice-list ${escapeAttr(type)}">
            <h3>${escapeHTML(title)}</h3>
            ${rows.length ? rows.map(item => `
                <article class="tbi-advice-item ${escapeAttr(toneFromGeneric(item))}">
                    <strong>${escapeHTML(item.title || item.headline || item.name || "Insight")}</strong>
                    <p>${escapeHTML(item.message || item.description || item.note || "No message")}</p>
                    ${item.meta ? `<em>${escapeHTML(item.meta)}</em>` : ""}
                </article>
            `).join("") : `<p class="tbi-muted">No ${escapeHTML(title.toLowerCase())} yet.</p>`}
        </section>
    `;
}

function buildAnomaliesView(state) {

    return `
        <div class="tbi-view-stack">
            <section class="tbi-card tbi-view-intro danger-zone">
                <h2>Anomalies</h2>
                <p>Extreme deltas, strange values, missing data, and unusual run patterns.</p>
            </section>
            ${buildAnomalyList(state.anomalies, { full: true })}
        </div>
    `;
}

function buildAnomalyMiniPanel(state) {

    return `
        <section class="tbi-card tbi-anomaly-mini">
            <div class="tbi-card-heading">
                <h3>Anomalies</h3>
                <button type="button" data-dashboard-tab="anomalies">View All</button>
            </div>
            ${buildAnomalyList(state.anomalies, { full: false })}
        </section>
    `;
}

function buildAnomalyList(anomalies = [], { full = false } = {}) {

    const rows = Array.isArray(anomalies) ? anomalies.slice(0, full ? 20 : 3) : [];

    return `
        <section class="tbi-anomaly-list ${full ? "full" : ""}">
            ${rows.length ? rows.map(item => `
                <article class="tbi-anomaly-row ${escapeAttr(toneFromGeneric(item))}">
                    <strong>${escapeHTML(item.title || item.path || item.id || "Anomaly")}</strong>
                    <span>${escapeHTML(item.message || item.description || item.note || "Check this value")}</span>
                </article>
            `).join("") : `<p class="tbi-muted">No active anomalies detected.</p>`}
        </section>
    `;
}

/* --------------------------------------------------
   HISTORY / COMMAND / MORE / SETTINGS
-------------------------------------------------- */

function buildHistoryView(state) {

    return buildHistory({
        history: state.history,
        runA: state.runA,
        runB: state.runB,
        ui: state.ui || {}
    });
}

function buildCommandView(state) {

    return `
        <div class="tbi-command-view">
            <section class="tbi-card tbi-command-card">
                <h2>Command Deck</h2>
                <p>Paste, save, import, export, scan, and manage run data.</p>
                <div class="tbi-command-actions">
                    <button type="button" onclick="document.getElementById('saveReport')?.click()">Save Report</button>
                    <button type="button" onclick="document.getElementById('clearInput')?.click()">Clear Input</button>
                    <button type="button" onclick="document.getElementById('clearRuns')?.click()">Clear Runs</button>
                    <button type="button" data-dashboard-tab="history">Open History</button>
                </div>
                <p class="tbi-muted">The report console opens below on desktop. On mobile, use the Open Deck button.</p>
            </section>
            <section class="tbi-card tbi-command-status">
                <h3>Current Data</h3>
                <div class="tbi-command-stats">
                    ${miniStat("Run A", state.runA ? "Loaded" : "Empty")}
                    ${miniStat("Run B", state.runB ? "Loaded" : "Empty")}
                    ${miniStat("History", String(state.history.length))}
                    ${miniStat("Build", state.ui?.buildStyle || "unknown")}
                </div>
            </section>
        </div>
    `;
}

function buildMoreView(state) {

    return `
        <div class="tbi-more-view">
            <section class="tbi-card tbi-more-grid">
                <h2>More</h2>
                ${moreButton("history", "History", `${state.history.length} saved runs`)}
                ${moreButton("anomalies", "Anomalies", `${state.anomalies.length} active`)}
                ${moreButton("command", "Command Deck", "Paste, save, clear, export")}
                ${moreButton("settings", "Settings", "Theme and diagnostics")}
            </section>
        </div>
    `;
}

function moreButton(tab, label, subtitle) {

    return `
        <button type="button" class="tbi-more-button" data-dashboard-tab="${escapeAttr(tab)}">
            <strong>${escapeHTML(label)}</strong>
            <span>${escapeHTML(subtitle)}</span>
        </button>
    `;
}

function buildSettingsView(state) {

    return `
        <div class="tbi-view-stack">
            <section class="tbi-card">
                <h2>Settings</h2>
                <p>Current build style: <strong>${escapeHTML(state.ui?.buildStyle || "unknown")}</strong></p>
                <p>Hold the header for diagnostics. Debug output remains powered by the inspection panel.</p>
                <button type="button" data-dashboard-tab="command">Open Command Deck</button>
            </section>
        </div>
    `;
}

/* --------------------------------------------------
   CARDS / TABLES
-------------------------------------------------- */

function buildMetricTableCard(title, section, {
    icon = "◇",
    accent = "cyan",
    limit = 8
} = {}) {

    return `
        <section class="tbi-card tbi-metric-card ${escapeAttr(accent)}">
            <div class="tbi-card-heading">
                <h3><span>${escapeHTML(icon)}</span> ${escapeHTML(title)}</h3>
                <strong>${escapeHTML(formatDelta(sectionTotal(section), { compact: true }))}</strong>
            </div>
            ${buildMetricRows(section, { limit })}
        </section>
    `;
}

function buildMetricRows(section, { limit = 8, showHeader = false } = {}) {

    const rows = sectionRows(section).slice(0, limit);

    if (!rows.length) {
        return `<p class="tbi-muted">No comparison data yet.</p>`;
    }

    return `
        <div class="tbi-metric-table">
            ${showHeader ? `
                <div class="tbi-metric-row header">
                    <span>Metric</span><span>A</span><span>B</span><span>A - B</span>
                </div>
            ` : ""}
            ${rows.map(row => metricRow(row)).join("")}
        </div>
    `;
}

function metricRow(row) {

    const tone = toneFromDiffData(row.data);

    return `
        <div class="tbi-metric-row ${escapeAttr(tone)}">
            <span>${escapeHTML(formatLabel(row.key))}</span>
            <span>${escapeHTML(formatNumber(row.data?.a || 0))}</span>
            <span>${escapeHTML(formatNumber(row.data?.b || 0))}</span>
            <strong>${escapeHTML(formatDelta(row.data?.diff || 0, { compact: true }))}</strong>
        </div>
    `;
}

function buildGapPanel(state) {

    const scores = state.summary?.categoryScores || {};
    const cats = ["damage", "economy", "survivability", "utility"];

    return `
        <section class="tbi-card tbi-gap-panel">
            <div class="tbi-card-heading">
                <h3>The Gap In Numbers</h3>
                <span>A vs B shape</span>
            </div>
            <div class="tbi-gap-bars">
                ${cats.map(cat => {
                    const score = Math.abs(Number(scores?.[cat]?.score || scores?.[cat]?.value || 50));
                    const width = clamp(score % 100, 18, 92);
                    return `
                        <div class="tbi-gap-bar">
                            <span>${escapeHTML(formatLabel(cat))}</span>
                            <i><b style="width:${width}%"></b></i>
                            <strong>${Math.round(width)}%</strong>
                        </div>
                    `;
                }).join("")}
            </div>
            <div class="tbi-radar-fake" aria-hidden="true">
                <span></span>
            </div>
        </section>
    `;
}

function buildTakeawaysPanel(state) {

    const notes = [
        state.summary?.farming?.headline,
        state.summary?.gameAwareNotes?.[0]?.message,
        state.insights?.[0]?.message,
        state.ai?.[0]?.message
    ].filter(Boolean).slice(0, 4);

    return `
        <section class="tbi-card tbi-takeaways">
            <h3>Key Takeaways</h3>
            <ul>
                ${(notes.length ? notes : ["Load two reports to generate run takeaways."]).map(note => `<li>${escapeHTML(note)}</li>`).join("")}
            </ul>
        </section>
    `;
}

function buildQuickInsightsPanel(state) {

    const items = buildDifferenceItems(state).slice(0, 4);

    return `
        <section class="tbi-card tbi-quick-insights">
            <h3>Quick Insights</h3>
            <div class="tbi-mini-stat-grid">
                ${items.map(item => miniStat(item.label, formatDelta(item.diff, { compact: true }), item.tone)).join("")}
            </div>
        </section>
    `;
}

function buildRecommendationsPanel(state) {

    const rows = (state.ai || []).slice(0, 4);

    return `
        <section class="tbi-card tbi-recommendations">
            <h3>Recommendations</h3>
            ${rows.length ? rows.map(item => `
                <p>• ${escapeHTML(item.message || item.title || "Review this run")}</p>
            `).join("") : `<p class="tbi-muted">No recommendations yet.</p>`}
        </section>
    `;
}

function buildQuickActionsPanel() {

    return `
        <section class="tbi-card tbi-quick-actions">
            <h3>Quick Actions</h3>
            <div class="tbi-action-grid">
                <button type="button" data-dashboard-tab="command">Paste Report</button>
                <button type="button" onclick="document.getElementById('saveReport')?.click()">Save Report</button>
                <button type="button" data-dashboard-tab="history">History</button>
                <button type="button" onclick="document.getElementById('clearRuns')?.click()">Clear Runs</button>
            </div>
        </section>
    `;
}

function miniStat(label, value, tone = "neutral") {

    return `
        <div class="tbi-mini-stat ${escapeAttr(tone)}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
        </div>
    `;
}

/* --------------------------------------------------
   DATA HELPERS
-------------------------------------------------- */

function sectionRows(section) {

    if (!section || typeof section !== "object") {
        return [];
    }

    return Object.entries(section)
        .filter(([, data]) => data && typeof data === "object" && data.numeric !== false)
        .sort((a, b) => Math.abs(Number(b[1]?.diff || 0)) - Math.abs(Number(a[1]?.diff || 0)))
        .map(([key, data]) => ({ key, data }));
}

function sectionTotal(section) {

    return sectionRows(section)
        .reduce((sum, row) => sum + Number(row.data?.diff || 0), 0);
}

function mergeSections(sections = {}, keys = []) {

    return keys.reduce((merged, key) => ({
        ...merged,
        ...(sections?.[key] || {})
    }), {});
}

function firstExisting(section = {}, keys = []) {

    for (const key of keys) {
        if (section?.[key]) {
            return section[key];
        }
    }

    const rows = sectionRows(section);
    return rows[0]?.data || null;
}

function getActiveSection(selectedSection = null, sections = {}) {

    if (selectedSection && Object.prototype.hasOwnProperty.call(sections || {}, selectedSection)) {
        return selectedSection;
    }

    return null;
}

function toneFromDiffData(data = {}) {

    const outcome = String(data?.outcome || "").toLowerCase();

    if (["good", "positive", "better"].includes(outcome)) {
        return "good";
    }

    if (["bad", "negative", "worse"].includes(outcome)) {
        return "bad";
    }

    const diff = Number(data?.diff || 0);

    if (diff > 0) return "good";
    if (diff < 0) return "bad";
    return "neutral";
}

function toneFromGeneric(item = {}) {

    const level = String(item.level || item.tone || item.type || item.outcome || "").toLowerCase();

    if (["good", "positive", "success", "pass"].includes(level)) return "good";
    if (["bad", "negative", "danger", "warning", "warn", "fail"].includes(level)) return "bad";
    return "neutral";
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

    return valid.has(normalised)
        ? normalised
        : "overview";
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

