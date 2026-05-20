"use strict";

/**
 * DASHBOARD RENDERER
 * Pure orchestration layer.
 *
 * No event binding.
 * No state mutation.
 */

import {

    buildTopbar,
    buildSummary,
    buildHeatmap,
    buildDrilldown,
    buildInsights,
    buildHistory

} from "./layouts/index.js";

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
    formatDelta
} from "./utils/format.js";

/* --------------------------------------------------
   DASHBOARD RENDERER
-------------------------------------------------- */

export function renderDashboard(state = {}) {

    const root =
        qs("#dashboard");

    if (!root) {
        return;
    }

    hydrateUIState(state);

    const {
        runA = null,
        runB = null,

        history = [],

        insights = [],
        ai = [],

        compareData = null,

        anomalies = [],
        trend = []
    } = state;

    const compare =
        compareData || {};

    const core =
        compare.core || {};

    const stats =
        compare.stats || {};

    const sections =
        compare.sections || {};

    const summary =
        compare.summary || {};

    const ui =
        getUIState();

    /* --------------------------------------------------
       EMPTY STATE
    -------------------------------------------------- */

    if (
        !runA &&
        !runB &&
        history.length === 0
    ) {

        clearElement(root);

        mountHTML(
            root,
            buildEmptyState() +
            buildHistory({
                history,
                runA,
                runB,
                ui: state.ui || {}
            })
        );

        return;
    }

    /* --------------------------------------------------
       BUILD DASHBOARD
    -------------------------------------------------- */

    const activeTab =
        normaliseDashboardTab(ui.dashboardTab);

    const topbarHTML =
        buildTopbar({
            runA,
            runB,
            compare
        });

    const compareHTML =
        buildSummary({
            summary,
            core,
            stats,
            trend,
            anomalies
        });

    const activeSection =
        getActiveSection(
            ui.selectedSection,
            sections
        );

    const systemsHTML =
        buildHeatmap({
            sections,
            selectedSection:
                activeSection
        }) +
        buildDrilldown({
            sectionName:
                activeSection,

            sections
        });

    const coachHTML =
        buildInsights({
            insights,
            ai,
            anomalies
        });

    const historyHTML =
        buildHistory({
            history,
            runA,
            runB,
            ui: state.ui || {}
        });

    const mobileMode =
        isMobileMode();

    const desktopPanelsHTML =
        dashboardPanel("overview", activeTab, topbarHTML) +
        dashboardPanel("compare", activeTab, compareHTML) +
        dashboardPanel("systems", activeTab, systemsHTML) +
        dashboardPanel("coach", activeTab, coachHTML) +
        dashboardPanel("history", activeTab, historyHTML);

    const mobilePanelsHTML =
        dashboardPanel("overview", activeTab, topbarHTML) +
        dashboardPanel("compare", activeTab, compareHTML) +
        dashboardPanel("systems", activeTab, systemsHTML) +
        dashboardPanel("history", activeTab, historyHTML) +
        dashboardPanel("coach", activeTab, coachHTML);

    let html = `
        <div
            class="wa-dashboard-shell"
            data-dashboard-shell="true"
            data-dashboard-tab-active="${activeTab}"
        >
            ${mobileMode ? buildMobileQuickStrip({ runA, runB, compare }) : ""}

            ${mobileMode ? mobilePanelsHTML : desktopPanelsHTML}

            ${mobileMode ? buildDashboardTabs(activeTab) : ""}
        </div>
    `;

    /* --------------------------------------------------
       MOUNT
    -------------------------------------------------- */

    clearElement(root);

    mountHTML(root, html);
}



function getActiveSection(selectedSection = null, sections = {}) {

    if (
        selectedSection &&
        Object.prototype.hasOwnProperty.call(sections || {}, selectedSection)
    ) {
        return selectedSection;
    }

    return null;
}

function isMobileMode() {

    return (
        typeof document !== "undefined" &&
        document.documentElement?.getAttribute("data-device-mode") === "mobile"
    );
}


/* --------------------------------------------------
   MOBILE DASHBOARD TABS
-------------------------------------------------- */

const DASHBOARD_TABS = [
    ["overview", "Overview", "⌂"],
    ["compare", "Compare", "⇄"],
    ["systems", "Systems", "◇"],
    ["history", "History", "◷"],
    ["coach", "Coach", "✦"]
];

function buildDashboardTabs(activeTab = "overview") {

    return `
        <nav
            class="wa-dashboard-tabs"
            data-dashboard-tabs="true"
            aria-label="Mobile dashboard sections"
        >
            ${DASHBOARD_TABS.map(([tab, label, icon]) => `
                <button
                    type="button"
                    class="wa-dashboard-tab ${tab === activeTab ? "active" : ""}"
                    data-dashboard-tab="${tab}"
                    aria-pressed="${tab === activeTab ? "true" : "false"}"
                >
                    <span class="wa-tab-icon" aria-hidden="true">${icon}</span>
                    <span class="wa-tab-label">${label}</span>
                </button>
            `).join("")}
        </nav>
    `;
}


function buildMobileQuickStrip({
    runA = null,
    runB = null,
    compare = {}
} = {}) {

    const core =
        compare?.core || {};

    const waveDelta =
        formatDelta(core?.wave?.diff, {
            compact: false,
            precision: 0
        });

    const coinDelta =
        formatDelta(core?.coins?.diff, {
            compact: true
        });

    return `
        <aside
            class="mobile-quick-strip"
            data-mobile-quick-strip="true"
            aria-label="Quick compare status"
        >
            ${quickStripItem("A Wave", runA?.core?.wave ?? "-")}
            ${quickStripItem("B Wave", runB?.core?.wave ?? "-")}
            ${quickStripItem("Wave Δ", waveDelta, "accent")}
            ${quickStripItem("Coin Δ", coinDelta, "accent")}
        </aside>
    `;
}

function quickStripItem(label, value, tone = "") {

    return `
        <div class="mobile-quick-item ${escapeText(tone)}">
            <span>${escapeText(label)}</span>
            <strong>${escapeText(value)}</strong>
        </div>
    `;
}

function dashboardPanel(tab, activeTab, html = "", extraClass = "") {

    return `
        <div
            class="wa-dashboard-panel ${tab === activeTab ? "active" : ""} ${extraClass}"
            data-dashboard-panel="${tab}"
        >
            ${html}
        </div>
    `;
}

function normaliseDashboardTab(tab = "overview") {

    const value =
        String(tab || "overview");

    if (["intel", "gains", "losses"].includes(value)) {
        return "compare";
    }

    return DASHBOARD_TABS.some(([key]) => key === value)
        ? value
        : "overview";
}

function buildMobileCompareListPanel({
    title = "Compare List",
    subtitle = "",
    items = [],
    tone = "neutral"
} = {}) {

    const rows =
        Array.isArray(items)
            ? items.slice(0, 8)
            : [];

    return `
        <section class="wa-panel wa-mobile-compare-panel ${tone}">

            <div class="wa-title">
                ${escapeText(title)}
            </div>

            <div class="wa-sub">
                ${escapeText(subtitle)}
            </div>

            <div class="wa-mobile-compare-list">
                ${rows.length
                    ? rows.map(item => mobileCompareRow(item, tone)).join("")
                    : `<div class="wa-top-list-empty">No major changes</div>`}
            </div>

        </section>
    `;
}

function mobileCompareRow(item = {}, fallbackTone = "neutral") {

    const cls =
        item.outcome === "good"
            ? "good"
            : item.outcome === "bad"
                ? "bad"
                : fallbackTone;

    const diff =
        item.diff ?? 0;

    const pct =
        item.pct ?? 0;

    return `
        <div class="wa-top-row ${cls}">
            <div class="wa-top-row-main">
                <span>${escapeText(item.label || item.path || item.key || "Unknown")}</span>
                <strong>${escapeText(formatDelta(diff, { compact: true }))}</strong>
            </div>
            <div class="wa-top-row-sub">
                ${Number(pct || 0).toFixed(1)}%
                ${item.category ? ` · ${escapeText(item.category)}` : ""}
            </div>
        </div>
    `;
}

function escapeText(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* --------------------------------------------------
   EMPTY STATE
-------------------------------------------------- */

function buildEmptyState() {

    return `
        <div class="wa-empty-shell">

            <div class="wa-panel wa-empty">

                <div class="wa-title">
                    SYSTEM
                </div>

                <div class="wa-sub">
                    Waiting for battle reports...
                </div>

            </div>

        </div>
    `;
}
