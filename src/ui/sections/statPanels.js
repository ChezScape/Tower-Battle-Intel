"use strict";

import {
    escapeHTML,
    escapeAttr,
    formatDelta,
    formatNumber,
    formatLabel,
    toneFromDiffData,
    sectionRows,
    sectionTotal,
    mergeSections,
    buildMetricRows
} from "./sectionUtils.js";

export function buildPrimaryStatGrid(state = {}) {
    return `
        <div class="tbi-grid tbi-grid-4 tbi-primary-matrix">
            ${buildMetricTableCard("Damage Dealt", state.sections.damage, { icon: "✹", accent: "cyan", limit: 7, footer: "View Full Damage Breakdown", sectionKey: "damage", iconKey: "damage" })}
            ${buildMetricTableCard("Defense & Survival", mergeSections(state.sections, ["damage_taken", "health_regenerated", "damage_blocked"]), { icon: "⬡", accent: "blue", limit: 6, footer: "View Full Defense Breakdown", sectionKey: "damage_taken" })}
            ${buildMetricTableCard("Utility", state.sections.utility, { icon: "⚒", accent: "violet", limit: 6, footer: "View Full Utility Breakdown", sectionKey: "utility" })}
            ${state.gapPanel || ""}
        </div>
    `;
}

export function buildSecondaryStatGrid(state = {}) {
    return `
        <div class="tbi-grid tbi-grid-4 tbi-secondary-matrix">
            ${buildMetricTableCard("Enemies Hit By", state.sections.enemies_hit_by, { icon: "◎", accent: "violet", limit: 5, footer: "View All Enemy Stats", sectionKey: "enemies_hit_by", iconKey: "killed" })}
            ${buildMetricTableCard("Counts", state.sections.counts, { icon: "#", accent: "cyan", limit: 5, footer: "View All Counts", sectionKey: "counts" })}
            ${buildMetricTableCard("Coins Breakdown", state.sections.coins, { icon: "$", accent: "gold", limit: 6, footer: "View Full Economy Breakdown", sectionKey: "coins", iconKey: "coins" })}
            ${buildMetricTableCard("Effects Active", state.sections.killed_with_effect_active, { icon: "✦", accent: "pink", limit: 5, footer: "View Effect Breakdown", sectionKey: "killed_with_effect_active" })}
        </div>
    `;
}

export function buildMetricTableCard(title, section, { icon = "◇", accent = "cyan", limit = 8, footer = "View Details", sectionKey = "", iconKey = "" } = {}) {
    const total = sectionTotal(section);
    const leadSide = total > 0 ? "lead-b" : total < 0 ? "lead-a" : "lead-neutral";
    const fullRows = buildFullRowsData(section);

    return `
        <section class="tbi-card tbi-metric-card ${escapeAttr(accent)} ${escapeAttr(leadSide)}" data-metric-detail-title="${escapeAttr(title)}" data-metric-detail-accent="${escapeAttr(accent)}" data-lead-side="${escapeAttr(leadSide)}" data-metric-full-rows="${escapeAttr(JSON.stringify(fullRows))}">
            <div class="tbi-card-heading tbi-metric-title-row">
                <h3>${iconKey ? `<span class="metric-art metric-art-${escapeAttr(iconKey)}" aria-hidden="true"><b>${escapeHTML(icon)}</b></span>` : `<span>${escapeHTML(icon)}</span>`} ${escapeHTML(title)}</h3>
            </div>
            ${buildPanelDeltaStrip(total)}
            ${buildMetricRows(section, { limit, showHeader: true, diffToggle: false, leadSide })}
            <div class="tbi-metric-footer-action-row">
                <button type="button" class="tbi-card-footer-action" data-ui-action="open-compare-section" data-compare-section="${escapeAttr(sectionKey)}">${escapeHTML(footer)}</button>
                <button type="button" class="tbi-metric-table-toggle tbi-metric-footer-diff-button" data-metric-diff-toggle="true" aria-label="Open full ${escapeAttr(title)} Diff details">DIFF+</button>
            </div>
        </section>
    `;
}

function buildFullRowsData(section) {
    return sectionRows(section).map(row => {
        const data = { ...(row.data || {}), key: row.key };

        return {
            metric: data.label || formatLabel(row.key),
            runA: formatNumber(data.a || 0),
            runB: formatNumber(data.b || 0),
            diff: formatDelta(data.diff || 0, { compact: true }),
            tone: toneFromDiffData(data)
        };
    });
}

function buildPanelDeltaStrip(total = 0) {
    const value = Number(total || 0);
    const tone = value > 0 ? "good" : value < 0 ? "bad" : "neutral";
    const side = value > 0 ? "side-b" : value < 0 ? "side-a" : "neutral";
    const label = value > 0 ? "Run B leads" : value < 0 ? "Run A leads" : "Runs level";
    const directionLabel = value > 0 ? "Run B Leads" : value < 0 ? "Run A Leads" : "Even Match";

    return `
        <div class="tbi-panel-delta-strip tbi-column-lead-strip ${escapeAttr(tone)} ${escapeAttr(side)}" aria-label="${escapeAttr(label)} ${escapeAttr(formatDelta(value, { compact: true }))}">
            <span>${escapeHTML(directionLabel)}</span>
            <strong>${escapeHTML(formatDelta(value, { compact: true }))}</strong>
        </div>
    `;
}
