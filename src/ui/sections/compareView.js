"use strict";

import { escapeHTML, mergeSections } from "./sectionUtils.js";
import { buildMetricTableCard } from "./statPanels.js";

export function buildCompareView(state = {}, options = {}) {
    const blocks = [
        ["Damage Dealt", state.sections.damage, "✹", "damage"],
        ["Defense & Survival", mergeSections(state.sections, ["damage_taken", "health_regenerated", "damage_blocked"]), "⬡", "damage_taken"],
        ["Utility", state.sections.utility, "⚒", "utility"],
        ["Coins Breakdown", state.sections.coins, "$", "coins"],
        ["Enemies Hit By", state.sections.enemies_hit_by, "◎", "enemies_hit_by"],
        ["Counts", state.sections.counts, "#", "counts"],
        ["Records", state.sections.records, "▤", "records"],
        ["Effects Active", state.sections.killed_with_effect_active, "✦", "killed_with_effect_active"]
    ];

    return `
        <div class="tbi-view-stack">
            <section class="tbi-card tbi-view-intro">
                <h2>Compare</h2>
                <p>Detailed A - B breakdowns. Positive and negative colours use the game-brain role logic where available.</p>
            </section>
            <div class="tbi-grid ${options.mobile ? "tbi-grid-1" : "tbi-grid-2"}">
                ${blocks.map(([label, section, icon, sectionKey]) => buildMetricTableCard(label, section, { icon, limit: options.mobile ? 8 : 12, footer: `View ${escapeHTML(label)}`, sectionKey })).join("")}
            </div>
        </div>
    `;
}
