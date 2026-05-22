"use strict";

import { escapeHTML, formatDelta, miniStat, toneFromGeneric } from "./sectionUtils.js";
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
            <div class="tbi-target-reticle" aria-hidden="true"></div>
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
            <div class="tbi-chart-icon" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        </section>
    `;
}

export function buildAnomalyMiniPanel(state = {}) {
    return `
        <section class="tbi-card tbi-anomaly-mini">
            <div class="tbi-card-heading">
                <h3>Anomalies</h3>
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
            <div class="tbi-action-grid">
                <button type="button" data-ui-action="open-command">Paste Report</button>
                <button type="button" data-ui-action="save-report">Save Report</button>
                <button type="button" data-ui-action="open-history">History</button>
                <button type="button" data-ui-action="clear-runs">Clear Runs</button>
            </div>
        </section>
    `;
}
