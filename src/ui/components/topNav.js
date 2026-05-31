"use strict";

import { escapeHTML, escapeAttr } from "../sections/sectionUtils.js";
import { appConfig } from "../../../config/appConfig.js";

export const DESKTOP_TABS = Object.freeze([
    ["command", "Command Deck"],
    ["overview", "Dashboard"],
    ["history", "History"],
    ["compare", "Compare"],
    ["coach", "Coach"],
    ["systems", "Systems"],
    ["anomalies", "Anomalies"],
    ["settings", "Settings"]
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

export function buildTopNav(activeTab = "command") {
    const version = appConfig?.app?.displayVersion || appConfig?.app?.buildVersion || appConfig?.app?.version || "v";

    return `
        <header class="tbi-header" aria-label="Tower Battle Intel">
            <div class="tbi-brand-block">
                <div class="tbi-logo-mark" aria-hidden="true">${towerLogoSVG()}</div>
                <div class="tbi-brand-copy">
                    <div class="tbi-brand-title">Tower Battle Intel</div>
                    <div class="tbi-brand-subtitle">Battle Report Intelligence Dashboard</div>
                </div>
            </div>

            <nav class="tbi-desktop-nav" aria-label="Desktop workspaces">
                ${DESKTOP_TABS.map(([key, label]) => navButton(key, label, activeTab, desktopTabIcon(key))).join("")}
            </nav>

            <nav class="tbi-mobile-top-nav" aria-label="Mobile analysis workspaces">
                ${MOBILE_TOP_TABS.map(([key, label, icon]) => navButton(key, label, mobileTopActive(activeTab), icon)).join("")}
            </nav>
            <div class="tbi-header-actions" aria-label="Build version">
                <span class="tbi-version-pill" title="Visible test build">${escapeHTML(version)}</span>
            </div>
        </header>
    `;
}

export function buildMobileBottomNav(activeTab = "command") {
    return `
        <nav class="tbi-mobile-bottom-nav" aria-label="Mobile app destinations">
            ${MOBILE_BOTTOM_TABS.map(([key, label, icon]) => navButton(key, label, activeTab, icon)).join("")}
        </nav>
    `;
}

function desktopTabIcon(key = "") {
    return key === "settings" ? "⚙" : "";
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

function mobileTopActive(activeTab = "command") {
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
