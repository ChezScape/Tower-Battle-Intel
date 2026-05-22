"use strict";

import { escapeHTML, miniStat } from "./sectionUtils.js";

export function buildCommandDeckView(state = {}) {
    return `
        <div class="tbi-command-view">
            <section class="tbi-card tbi-command-card">
                <h2>Command Deck</h2>
                <p>Paste, save, import, export, scan, and manage run data.</p>
                <div class="tbi-command-actions">
                    <button type="button" data-ui-action="save-report">Save Report</button>
                    <button type="button" data-ui-action="clear-input">Clear Input</button>
                    <button type="button" data-ui-action="clear-runs">Clear Runs</button>
                    <button type="button" data-ui-action="open-history">Open History</button>
                </div>
                <p class="tbi-muted">The report console opens below on desktop. On mobile, use the Open Deck button.</p>
            </section>
            <section class="tbi-card tbi-command-status">
                <h3>Current Data</h3>
                <div class="tbi-command-stats">
                    ${miniStat("Run A", state.runA ? "Loaded" : "Empty")}
                    ${miniStat("Run B", state.runB ? "Loaded" : "Empty")}
                    ${miniStat("History", String(state.history.length))}
                    ${miniStat("Build", escapeHTML(state.ui?.buildStyle || "unknown"))}
                </div>
            </section>
        </div>
    `;
}

export function buildSettingsView(state = {}) {
    return `
        <div class="tbi-view-stack">
            <section class="tbi-card">
                <h2>Settings</h2>
                <p>Current build style: <strong>${escapeHTML(state.ui?.buildStyle || "unknown")}</strong></p>
                <p>Hold the header for diagnostics. Debug output remains powered by the inspection panel.</p>
                <button type="button" data-ui-action="open-command">Open Command Deck</button>
            </section>
        </div>
    `;
}

export function buildMoreView(state = {}) {
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
        <button type="button" class="tbi-more-button" data-dashboard-tab="${tab}">
            <strong>${escapeHTML(label)}</strong>
            <span>${escapeHTML(subtitle)}</span>
        </button>
    `;
}
