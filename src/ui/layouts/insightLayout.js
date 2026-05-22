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

            <div class="wa-panel">

                <div class="wa-title">
                    INSIGHTS
                </div>

                ${buildCards(insights)}

            </div>

            <div class="wa-panel">

                <div class="wa-title">
                    AI COACH
                </div>

                ${buildCards(ai)}

            </div>

            ${
                Array.isArray(anomalies) && anomalies.length
                    ? `
                        <div class="wa-panel">

                            <div class="wa-title">
                                ANOMALIES
                            </div>

                            ${buildCards(anomalies)}

                        </div>
                    `
                    : ""
            }

        </div>
    `;
}
