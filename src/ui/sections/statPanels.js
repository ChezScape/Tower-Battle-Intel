"use strict";

import {
    escapeHTML,
    escapeAttr,
    formatDelta,
    sectionTotal,
    mergeSections,
    buildMetricRows
} from "./sectionUtils.js";

export function buildPrimaryStatGrid(state = {}) {
    return `
        <div class="tbi-grid tbi-grid-4 tbi-primary-matrix">
            ${buildMetricTableCard("Damage Dealt", state.sections.damage, { icon: "✹", accent: "cyan", limit: 7, footer: "View Full Damage Breakdown", sectionKey: "damage" })}
            ${buildMetricTableCard("Defense & Survival", mergeSections(state.sections, ["damage_taken", "health_regenerated", "damage_blocked"]), { icon: "⬡", accent: "blue", limit: 6, footer: "View Full Defense Breakdown", sectionKey: "damage_taken" })}
            ${buildMetricTableCard("Utility", state.sections.utility, { icon: "⚒", accent: "violet", limit: 6, footer: "View Full Utility Breakdown", sectionKey: "utility" })}
            ${state.gapPanel || ""}
        </div>
    `;
}

export function buildSecondaryStatGrid(state = {}) {
    return `
        <div class="tbi-grid tbi-grid-4 tbi-secondary-matrix">
            ${buildMetricTableCard("Enemies Hit By", state.sections.enemies_hit_by, { icon: "◎", accent: "violet", limit: 5, footer: "View All Enemy Stats", sectionKey: "enemies_hit_by" })}
            ${buildMetricTableCard("Counts", state.sections.counts, { icon: "#", accent: "cyan", limit: 5, footer: "View All Counts", sectionKey: "counts" })}
            ${buildMetricTableCard("Coins Breakdown", state.sections.coins, { icon: "$", accent: "gold", limit: 6, footer: "View Full Economy Breakdown", sectionKey: "coins" })}
            ${buildMetricTableCard("Effects Active", state.sections.killed_with_effect_active, { icon: "✦", accent: "pink", limit: 5, footer: "View Effect Breakdown", sectionKey: "killed_with_effect_active" })}
        </div>
    `;
}

export function buildMetricTableCard(title, section, { icon = "◇", accent = "cyan", limit = 8, footer = "View Details", sectionKey = "" } = {}) {
    return `
        <section class="tbi-card tbi-metric-card ${escapeAttr(accent)}">
            <div class="tbi-card-heading">
                <h3><span>${escapeHTML(icon)}</span> ${escapeHTML(title)}</h3>
                <strong>${escapeHTML(formatDelta(sectionTotal(section), { compact: true }))}</strong>
            </div>
            ${buildMetricRows(section, { limit })}
            <button type="button" class="tbi-card-footer-action" data-ui-action="open-compare-section" data-compare-section="${escapeAttr(sectionKey)}">${escapeHTML(footer)}</button>
        </section>
    `;
}
