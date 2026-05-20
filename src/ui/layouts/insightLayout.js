"use strict";

/**
 * INSIGHT + AI LAYOUT
 *
 * v4.8w rebuild:
 * - collapsible panels reclaim space on desktop and mobile
 * - one render path, no duplicate mobile/desktop variants
 */

import {
    buildCards
} from "../components/card.js";

/* --------------------------------------------------
   BUILD INSIGHTS
-------------------------------------------------- */

export function buildInsights({
    insights = [],
    ai = [],
    anomalies = []
} = {}) {

    return `
        <div class="wa-grid wa-coach-grid">

            ${collapsiblePanel({
                title: "INSIGHTS",
                hint: `${Array.isArray(insights) ? insights.length : 0} item(s)`,
                content: buildCards(insights),
                open: false
            })}

            ${collapsiblePanel({
                title: "AI COACH",
                hint: `${Array.isArray(ai) ? ai.length : 0} recommendation(s)`,
                content: buildCards(ai),
                open: true
            })}

            ${Array.isArray(anomalies) && anomalies.length
                ? collapsiblePanel({
                    title: "ANOMALIES",
                    hint: `${anomalies.length} warning(s)`,
                    content: buildCards(anomalies),
                    open: false,
                    tone: "warn"
                })
                : ""}

        </div>
    `;
}

function collapsiblePanel({
    title = "Panel",
    hint = "",
    content = "",
    open = false,
    tone = ""
} = {}) {

    return `
        <details class="wa-panel wa-collapsible-panel wa-insight-panel ${tone}" ${open ? "open" : ""}>

            <summary class="wa-collapsible-summary">
                <span>${title}</span>
                <em>${hint}</em>
            </summary>

            <div class="wa-collapsible-content">
                ${content}
            </div>

        </details>
    `;
}
