"use strict";

import { escapeHTML, escapeAttr, formatDelta, miniStat, toneFromGeneric } from "./sectionUtils.js";
import { buildDifferenceItems } from "./differenceOverview.js";

export function buildSideIntel(state = {}) {
    return `
        <aside class="tbi-side-column">
            ${buildTakeawaysPanel(state)}
            ${buildQuickInsightsPanel(state)}
            ${buildRecommendationsPanel(state)}
            ${buildAnomalyMiniPanel(state)}
            ${buildQuickActionsPanel()}
        </aside>
    `;
}

export function buildTakeawaysPanel(state = {}) {
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
            <div class="tbi-side-art tbi-target-reticle" aria-hidden="true"><i></i><b></b></div>
        </section>
    `;
}

export function buildQuickInsightsPanel(state = {}) {
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

export function buildRecommendationsPanel(state = {}) {
    const rows = (state.ai || []).slice(0, 4);

    return `
        <section class="tbi-card tbi-recommendations">
            <h3>Recommendations</h3>
            ${rows.length ? rows.map(item => `<p>• ${escapeHTML(item.message || item.title || "Review this run")}</p>`).join("") : `<p class="tbi-muted">No recommendations yet.</p>`}
            <div class="tbi-side-art tbi-chart-icon" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></div>
        </section>
    `;
}

export function buildAnomalyMiniPanel(state = {}) {
    return `
        <section class="tbi-card tbi-anomaly-mini">
            <div class="tbi-card-heading">
                <h3><span class="tbi-anomaly-sigil" aria-hidden="true"></span>Anomalies</h3>
                <button type="button" data-ui-action="open-anomalies">View All</button>
            </div>
            ${buildAnomalyList(state.anomalies, { full: false })}
        </section>
    `;
}

export function buildAnomalyList(anomalies = [], { full = false } = {}) {
    const rows = Array.isArray(anomalies) ? anomalies.slice(0, full ? 20 : 3) : [];

    return `
        <section class="tbi-anomaly-list ${full ? "full" : ""}">
            ${rows.length ? rows.map(item => `
                <article class="tbi-anomaly-row ${toneFromGeneric(item)}">
                    <strong>${escapeHTML(item.title || item.path || item.id || "Anomaly")}</strong>
                    <span>${escapeHTML(item.message || item.description || item.note || "Check this value")}</span>
                </article>
            `).join("") : `<p class="tbi-muted">No active anomalies detected.</p>`}
        </section>
    `;
}

export function buildQuickActionsPanel() {
    return `
        <section class="tbi-card tbi-quick-actions">
            <h3>Quick Actions</h3>
            <div class="tbi-action-grid concept5-actions">
                ${actionButton("open-command", "Paste Report", "paste")}
                ${actionButton("save-report", "Save Report", "save")}
                ${actionButton("export-history", "Export", "export")}
                ${actionButton("import-history", "Import", "import")}
                ${actionButton("toggle-debug", "Health Scan", "health", "wide")}
                ${actionButton("clear-runs", "Clear Runs", "clear", "wide")}
            </div>
        </section>
    `;
}

function actionButton(action, label, icon, extraClass = "") {
    return `
        <button type="button" class="${extraClass} action-${action}" data-ui-action="${action}">
            <span class="tbi-action-icon tbi-action-icon-${escapeAttr(icon)}" aria-hidden="true">${actionIcon(icon)}</span>
            <strong>${escapeHTML(label)}</strong>
        </button>
    `;
}

function actionIcon(icon = "") {
    const icons = {
        paste: `<svg viewBox="0 0 32 32"><path d="M10 5h10l6 6v16H10z"/><path d="M20 5v7h6"/><path d="M6 10v16h4"/><path d="M14 20h8"/><path d="M18 16l4 4-4 4"/></svg>`,
        save: `<svg viewBox="0 0 32 32"><path d="M7 6h15l3 3v17H7z"/><path d="M11 6v8h10V6"/><path d="M11 21h10"/><path d="M12 25h8"/></svg>`,
        export: `<svg viewBox="0 0 32 32"><path d="M9 6h14v20H9z"/><path d="M16 10v10"/><path d="M12 16l4 4 4-4"/></svg>`,
        import: `<svg viewBox="0 0 32 32"><path d="M9 6h14v20H9z"/><path d="M16 22V12"/><path d="M12 16l4-4 4 4"/></svg>`,
        health: `<svg viewBox="0 0 32 32"><path d="M16 4l10 4v7c0 6-4 10-10 13C10 25 6 21 6 15V8z"/><path d="M16 10v12"/><path d="M10 16h12"/><path d="M12 12l8 8"/><path d="M20 12l-8 8"/></svg>`,
        clear: `<svg viewBox="0 0 32 32"><path d="M9 9l14 14"/><path d="M23 9L9 23"/><path d="M7 16a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"/></svg>`
    };

    return icons[icon] || icons.paste;
}
