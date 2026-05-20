"use strict";

/**
 * HEATMAP LAYOUT
 * Subsystem performance matrix
 */

import {
    HeatTile
} from "../components/heatTile.js";

import {
    getHeatStyle,
    getSectionScore
} from "../utils/colourScale.js";

import {
    formatLabel
} from "../utils/format.js";

/* --------------------------------------------------
   BUILD HEATMAP
-------------------------------------------------- */

export function buildHeatmap({
    sections = {},
    selectedSection = null
} = {}) {

    const keys =
        Object.keys(sections || {});

    if (!keys.length) {

        return `
            <div class="wa-panel">

                <div class="wa-title">
                    SUBSYSTEM MATRIX
                </div>

                <div class="wa-sub">
                    No subsystem comparison data yet.
                </div>

            </div>
        `;
    }

    return `
        <details class="wa-panel wa-collapsible-panel wa-system-matrix-panel" open>

            <summary class="wa-collapsible-summary">
                <span>SUBSYSTEM MATRIX</span>
                <em>Tap to collapse</em>
            </summary>

            <div class="wa-heatmap">

                ${keys.map(sectionName => {

                    const values =
                        sections[sectionName] || {};

                    const score =
                        getSectionScore(values);

                    const heat =
                        getHeatStyle(score, 100);

                    return HeatTile({
                        name: sectionName,
                        label: formatLabel(sectionName),
                        value: score,
                        severity: heat.severity,
                        opacity: heat.opacity,
                        active: selectedSection === sectionName
                    });

                }).join("")}

            </div>

        </details>
    `;
}
