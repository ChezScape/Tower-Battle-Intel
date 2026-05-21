"use strict";

import { escapeHTML, mergeSections } from "./sectionUtils.js";
import { buildMetricTableCard } from "./statPanels.js";

export function buildCompareView(state = {}, options = {}) {
    const blocks = [
        ["damage", "Damage Dealt", state.sections.damage, "✹"],
        ["defense", "Defense & Survival", mergeSections(state.sections, ["damage_taken", "health_regenerated", "damage_blocked"]), "⬡"],
        ["utility", "Utility", state.sections.utility, "⚒"],
        ["coins", "Coins Breakdown", state.sections.coins, "$"],
        ["enemies_hit_by", "Enemies Hit By", state.sections.enemies_hit_by, "◎"],
        ["counts", "Counts", state.sections.counts, "#"],
        ["records", "Records", state.sections.records, "▤"],
        ["effects", "Effects Active", state.sections.killed_with_effect_active, "✦"]
    ];

    return `
        <div class="tbi-view-stack">
            <section class="tbi-card tbi-view-intro">
                <h2>Compare</h2>
                <p>Detailed A - B breakdowns. Positive and negative colours use the game-brain role logic where available.</p>
            </section>
            <div class="tbi-grid ${options.mobile ? "tbi-grid-1" : "tbi-grid-2"}">
                ${blocks.map(([key, label, section, icon]) => `
                    <div data-compare-section="${escapeHTML(key)}">
                        ${buildMetricTableCard(label, section, { icon, limit: options.mobile ? 8 : 12, footer: `View ${escapeHTML(label)}`, target: key })}
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}
