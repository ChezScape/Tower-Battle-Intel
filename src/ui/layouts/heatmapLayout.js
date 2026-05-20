"use strict";

/**
 * HEATMAP LAYOUT
 * Subsystem performance matrix.
 *
 * v4.8w rebuild:
 * - one clean collapsible matrix section
 * - no hidden scroll behaviour
 * - no duplicate old matrix render paths
 */

import {
    HeatTile
} from "../components/heatTile.js";

import {
    getHeatStyle,
    getSectionScore
} from "../utils/colourScale.js";

import {
    formatLabel,
    escapeHTML
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

    const selectedLabel =
        selectedSection
            ? formatLabel(selectedSection)
            : "Select a subsystem";

    if (!keys.length) {

        return `
            <details class="wa-panel wa-collapsible-panel wa-subsystem-panel" open>

                <summary class="wa-collapsible-summary">
                    <span>SUBSYSTEM MATRIX</span>
                    <em>No comparison data yet</em>
                </summary>

                <div class="wa-sub">
                    No subsystem comparison data yet.
                </div>

            </details>
        `;
    }

    return `
        <details class="wa-panel wa-collapsible-panel wa-subsystem-panel" open>

            <summary class="wa-collapsible-summary">
                <span>SUBSYSTEM MATRIX</span>
                <em>${escapeHTML(selectedLabel)}</em>
            </summary>

            <div class="wa-sub wa-subsystem-help">
                Pick one tile to open its detail readout below. The page will stay where it is.
            </div>

            <div class="wa-heatmap" data-subsystem-matrix="true">

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
