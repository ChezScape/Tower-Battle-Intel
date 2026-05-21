"use strict";

import { buildAnomalyList } from "./sideIntel.js";

export function buildAnomaliesView(state = {}) {
    return `
        <div class="tbi-view-stack">
            <section class="tbi-card tbi-view-intro danger-zone">
                <h2>Anomalies</h2>
                <p>Extreme deltas, strange values, missing data, and unusual run patterns.</p>
            </section>
            ${buildAnomalyList(state.anomalies, { full: true })}
        </div>
    `;
}
