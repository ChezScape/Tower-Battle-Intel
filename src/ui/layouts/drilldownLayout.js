"use strict";

/**
 * DRILLDOWN LAYOUT
 * Detailed selected section diff view.
 */

import {
    formatLabel,
    escapeHTML
} from "../utils/format.js";

import {
    formatDelta,
    formatPercentDelta
} from "../utils/deltaFormat.js";

import {
    getDeltaClass
} from "../utils/colourScale.js";

/* --------------------------------------------------
   BUILD DRILLDOWN
-------------------------------------------------- */

export function buildDrilldown({
    sectionName = null,
    sections = {}
} = {}) {

    if (
        !sectionName ||
        !sections?.[sectionName]
    ) {
        return "";
    }

    return Drilldown(
        sectionName,
        sections[sectionName]
    );
}

/* --------------------------------------------------
   OLD COMPATIBILITY ALIAS
-------------------------------------------------- */

export function Drilldown(name, sectionData = {}) {

    const entries =
        Object.entries(sectionData || {})
            .filter(([, value]) => isNumericDiff(value))
            .sort(
                (a, b) =>
                    Math.abs(b[1]?.diff ?? 0) -
                    Math.abs(a[1]?.diff ?? 0)
            );

    const title =
        `${formatLabel(name)} Detail`;

    if (!entries.length) {

        return `
            <details class="wa-panel wa-drill-details-panel" open>

                <summary class="wa-drill-summary">
                    <span>${escapeHTML(title)}</span>
                    <em>Tap to collapse</em>
                </summary>

                <div class="wa-sub">
                    No numeric detailed metrics available.
                </div>

            </details>
        `;
    }

    return `
        <details class="wa-panel wa-drill-details-panel" open>

            <summary class="wa-drill-summary">
                <span>${escapeHTML(title)}</span>
                <em>Tap to collapse</em>
            </summary>

            <div class="wa-drillgrid">

                ${entries.slice(0, 40).map(([key, value]) => {

                    const diff =
                        Number(value?.diff ?? 0);

                    const pct =
                        value?.pct ?? 0;

                    const cls =
                        getDeltaClass(diff);

                    return `
                        <div class="wa-drill ${escapeHTML(cls)}">

                            <div class="wa-drill-key">
                                ${escapeHTML(formatLabel(key))}
                            </div>

                            <div class="wa-drill-val">
                                ${escapeHTML(formatDelta(diff, {
                                    compact: true
                                }))}
                            </div>

                            <div class="wa-muted">
                                ${escapeHTML(formatPercentDelta(pct))}
                            </div>

                        </div>
                    `;
                }).join("")}

            </div>

        </details>
    `;
}

/* --------------------------------------------------
   FILTERS
-------------------------------------------------- */

function isNumericDiff(value) {

    if (
        !value ||
        typeof value !== "object"
    ) {
        return false;
    }

    if (value.numeric === false) {
        return false;
    }

    if (!("diff" in value)) {
        return false;
    }

    const diff =
        Number(value.diff);

    return Number.isFinite(diff);
}