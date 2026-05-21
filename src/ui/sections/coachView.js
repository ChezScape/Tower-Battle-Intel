"use strict";

import { escapeHTML, escapeAttr, toneFromGeneric } from "./sectionUtils.js";
import { buildTakeawaysPanel, buildRecommendationsPanel } from "./sideIntel.js";

export function buildCoachView(state = {}, options = {}) {
    return `
        <div class="tbi-view-stack">
            <section class="tbi-card tbi-view-intro">
                <h2>Coach</h2>
                <p>Game-brain recommendations, killed-by context, farming reads, and upgrade pressure.</p>
            </section>
            <div class="tbi-grid ${options.mobile ? "tbi-grid-1" : "tbi-grid-2"}">
                ${buildAdviceList("AI Coach", state.ai || [], "coach")}
                ${buildAdviceList("Insights", state.insights || [], "insight")}
                ${buildTakeawaysPanel(state)}
                ${buildRecommendationsPanel(state)}
            </div>
        </div>
    `;
}

function buildAdviceList(title, items = [], type = "insight") {
    const rows = Array.isArray(items) ? items.slice(0, 8) : [];

    return `
        <section class="tbi-card tbi-advice-list ${escapeAttr(type)}">
            <h3>${escapeHTML(title)}</h3>
            ${rows.length ? rows.map(item => `
                <article class="tbi-advice-item ${escapeAttr(toneFromGeneric(item))}">
                    <strong>${escapeHTML(item.title || item.headline || item.name || "Insight")}</strong>
                    <p>${escapeHTML(item.message || item.description || item.note || "No message")}</p>
                    ${item.meta ? `<em>${escapeHTML(item.meta)}</em>` : ""}
                </article>
            `).join("") : `<p class="tbi-muted">No ${escapeHTML(title.toLowerCase())} yet.</p>`}
        </section>
    `;
}
