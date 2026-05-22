"use strict";

import { escapeHTML, escapeAttr } from "../sections/sectionUtils.js";
import { appConfig } from "../../../config/appConfig.js";

export const DESKTOP_TABS = Object.freeze([
    ["overview", "Dashboard"],
    ["compare", "Compare"],
    ["systems", "Systems"],
    ["coach", "Coach"],
    ["history", "History"],
    ["anomalies", "Anomalies"],
    ["command", "Command Deck"]
]);

export const MOBILE_TOP_TABS = Object.freeze([
    ["overview", "Dashboard", "⌂"],
    ["compare", "Compare", "⇄"],
    ["systems", "Systems", "◎"],
    ["coach", "Coach", "?"],
    ["more", "More", "•••"]
]);

export const MOBILE_BOTTOM_TABS = Object.freeze([
    ["overview", "Dashboard", "⌂"],
    ["history", "History", "▤"],
    ["command", "Deck", "▣"],
    ["settings", "Settings", "⚙"]
]);

export function buildTopNav(activeTab = "overview") {
    const version = appConfig?.app?.version || "v";

    return `
        <header class="tbi-header" data-debug-hold-zone="true" aria-label="Tower Battle Intel header. Hold for diagnostics.">
            <div class="tbi-brand-block">
                <div class="tbi-logo-mark" aria-hidden="true">${towerLogoSVG()}</div>
                <div class="tbi-brand-copy">
                    <div class="tbi-brand-title">Tower Battle Intel</div>
                    <div class="tbi-brand-subtitle">Battle Report Intelligence Dashboard</div>
                </div>
            </div>

            <nav class="tbi-desktop-nav" aria-label="Desktop workspaces">
                ${DESKTOP_TABS.map(([key, label]) => navButton(key, label, activeTab)).join("")}
            </nav>

            <nav class="tbi-mobile-top-nav" aria-label="Mobile analysis workspaces">
                ${MOBILE_TOP_TABS.map(([key, label, icon]) => navButton(key, label, mobileTopActive(activeTab), icon)).join("")}
            </nav>

            <div class="tbi-header-actions">
                <span class="tbi-version-pill">${escapeHTML(version)}</span>
                <button type="button" class="tbi-icon-button" data-ui-action="open-settings" aria-label="Open settings">⚙</button>
                <button type="button" class="tbi-mode-toggle" data-ui-action="toggle-display-mode" aria-label="Toggle quiet display mode">
                    <span aria-hidden="true">☼</span><span aria-hidden="true">◐</span>
                </button>
            </div>
        </header>
    `;
}

export function buildMobileBottomNav(activeTab = "overview") {
    return `
        <nav class="tbi-mobile-bottom-nav" aria-label="Mobile app destinations">
            ${MOBILE_BOTTOM_TABS.map(([key, label, icon]) => navButton(key, label, activeTab, icon)).join("")}
        </nav>
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

function towerLogoSVG() {
    return `
        <svg viewBox="0 0 64 64" role="img" aria-label="Tower icon">
            <path d="M32 5 L32 58" />
            <path d="M22 20 L42 20" />
            <path d="M18 35 L46 35" />
            <path d="M13 58 L51 58" />
            <path d="M24 58 L24 35 L18 35 L18 58" />
            <path d="M40 58 L40 35 L46 35 L46 58" />
            <path d="M26 20 L32 8 L38 20" />
            <path d="M10 44 L22 44" />
            <path d="M42 44 L54 44" />
            <circle cx="32" cy="31" r="3" />
        </svg>
    `;
}
