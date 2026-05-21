"use strict";

import {
    escapeHTML,
    escapeAttr,
    formatDelta,
    formatPercentDelta,
    firstExisting,
    toneFromDiffData
} from "./sectionUtils.js";

export function buildDifferenceOverview(state = {}) {
    const items = buildDifferenceItems(state);

    return `
        <section class="tbi-card tbi-difference-overview">
            <div class="tbi-card-heading compact-heading">
                <h3>Difference Overview</h3>
                <span class="tbi-legend"><b class="good-dot"></b> Better for B <b class="bad-dot"></b> Better for A <b class="neutral-dot"></b> Neutral</span>
            </div>
            <div class="tbi-diff-row">
                ${items.map(diffTile).join("")}
            </div>
        </section>
    `;
}

export function buildMobileKeyDifferences(state = {}) {
    return `
        <section class="tbi-card tbi-mobile-key-diffs">
            <h3>Key Differences</h3>
            <div class="tbi-mobile-diff-grid">
                ${buildDifferenceItems(state).slice(0, 4).map(diffTile).join("")}
            </div>
        </section>
    `;
}

export function buildDifferenceItems(state = {}) {
    const core = state.core || {};
    const stats = state.stats || {};

    return [
        diffItem("Wave", core.wave, "⌁"),
        diffItem("Coins Earned", core.coins, "$"),
        diffItem("Coins / Hour", stats.coinsPerHour || stats.coins_per_hour, "↗"),
        diffItem("Cells Earned", core.cells, "●"),
        diffItem("Cells / Hour", stats.cellsPerHour || stats.cells_per_hour, "◌"),
        diffItem("Total Damage", firstExisting(state.sections?.damage, ["damage_dealt", "total_damage"]), "✹")
    ];
}

function diffItem(label, data, icon) {
    const enriched = { ...(data || {}), key: label };
    return {
        label,
        icon,
        diff: data?.diff ?? 0,
        percent: data?.pct,
        tone: toneFromDiffData(enriched)
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
