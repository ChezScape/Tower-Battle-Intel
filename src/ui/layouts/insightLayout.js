"use strict";

/**
 * INSIGHT + AI LAYOUT
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
        <div class="wa-grid">

            <details class="wa-panel wa-collapsible-panel wa-insights-panel" open>

                <summary class="wa-collapsible-summary">
                    <span>INSIGHTS</span>
                    <em>Tap to collapse</em>
                </summary>

                ${buildCards(insights)}

            </details>

            <details class="wa-panel wa-collapsible-panel wa-ai-coach-panel" open>

                <summary class="wa-collapsible-summary">
                    <span>AI COACH</span>
                    <em>Tap to collapse</em>
                </summary>

                ${buildCards(ai)}

            </details>

            ${
                Array.isArray(anomalies) && anomalies.length
                    ? `
                        <details class="wa-panel wa-collapsible-panel wa-anomalies-panel" open>

                            <summary class="wa-collapsible-summary">
                                <span>ANOMALIES</span>
                                <em>Tap to collapse</em>
                            </summary>

                            ${buildCards(anomalies)}

                        </details>
                    `
                    : ""
            }

        </div>
    `;
}
