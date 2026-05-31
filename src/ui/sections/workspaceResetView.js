"use strict";

/**
 * UI VISUAL SHELLS v4.11z52w12
 *
 * Stable parked workspace shells for the phased UI rebuild.
 * These views keep the app shape and visible button map without running old
 * tab-specific wiring. Real actions are reconnected later, one owner at a time.
 */

import { escapeHTML, escapeAttr } from "./sectionUtils.js";

const DEFAULT_NOTES = Object.freeze([
    "Visual shell only: old workspace wiring is disconnected.",
    "Parser, game catalogues, state, and localStore contract layer stay intact.",
    "Buttons are visible so placement can be judged before events are rebuilt."
]);

export function buildWorkspaceShell({
    key = "workspace",
    title = "Workspace",
    kicker = "UI shell reset",
    intro = "This workspace is parked as a clean visual shell.",
    status = "Parked",
    next = "Reconnect one clean event owner later.",
    actions = [],
    stats = [],
    notes = DEFAULT_NOTES,
    mobile = false
} = {}) {
    const safeActions = Array.isArray(actions) ? actions : [];
    const safeStats = Array.isArray(stats) ? stats : [];
    const safeNotes = Array.isArray(notes) && notes.length ? notes : DEFAULT_NOTES;

    return `
        <div class="tbi-view-stack tbi-workspace-reset ${mobile ? "tbi-mobile-shell-view" : ""}" data-workspace-reset="${escapeAttr(key)}" data-ui-visual-shell="${escapeAttr(key)}">
            <section class="tbi-card tbi-workspace-reset-card">
                <div class="tbi-reset-kicker">${escapeHTML(kicker)}</div>
                <h2>${escapeHTML(title)}</h2>
                <p>${escapeHTML(intro)}</p>

                <div class="tbi-reset-status-grid" aria-label="Shell status">
                    ${shellStat("Status", status)}
                    ${shellStat("Data layer", "Contract preserved")}
                    ${shellStat("Next step", next)}
                    ${safeStats.map(([label, value]) => shellStat(label, value)).join("")}
                </div>

                ${safeActions.length ? `
                    <div class="tbi-reset-action-grid" aria-label="Parked actions">
                        ${safeActions.map(action => shellButton(action)).join("")}
                    </div>
                ` : ""}

                <ul class="tbi-reset-note-list">
                    ${safeNotes.map(note => `<li>${escapeHTML(note)}</li>`).join("")}
                </ul>
            </section>
        </div>
    `;
}

export function buildBlankWorkspace(options = {}) {
    return buildWorkspaceShell(options);
}

export function buildMoreResetView() {
    return `
        <div class="tbi-more-view tbi-workspace-reset tbi-mobile-shell-view" data-workspace-reset="more" data-ui-visual-shell="more">
            <section class="tbi-card tbi-workspace-reset-card">
                <div class="tbi-reset-kicker">Mobile routing shell</div>
                <h2>More</h2>
                <p>Secondary mobile destinations are parked while the desktop concept is proved first.</p>
                <div class="tbi-reset-route-grid">
                    ${routeButton("history", "History")}
                    ${routeButton("anomalies", "Anomalies")}
                    ${routeButton("command", "Command Deck")}
                    ${routeButton("settings", "Settings")}
                </div>
            </section>
        </div>
    `;
}

function shellStat(label, value) {
    return `
        <div>
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
        </div>
    `;
}

function shellButton(action = {}) {
    const label = typeof action === "string" ? action : action.label;
    const hint = typeof action === "string" ? "Parked" : (action.hint || "Parked");
    const key = typeof action === "string" ? label : (action.key || label);

    return `
        <button
            type="button"
            class="tbi-reset-shell-action"
            data-workspace-action-inactive="${escapeAttr(key || "parked")}"
            title="This control is parked until the clean event layer is rebuilt."
        >
            <strong>${escapeHTML(label || "Parked action")}</strong>
            <span>${escapeHTML(hint)}</span>
        </button>
    `;
}

function routeButton(tab, label) {
    return `
        <button type="button" class="tbi-more-button tbi-reset-route-button" data-dashboard-tab="${escapeAttr(tab)}">
            <strong>${escapeHTML(label)}</strong>
            <span>Visual shell</span>
        </button>
    `;
}

export default {
    buildWorkspaceShell,
    buildBlankWorkspace,
    buildMoreResetView
};
