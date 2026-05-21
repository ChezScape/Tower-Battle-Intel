"use strict";

import {
    escapeHTML,
    escapeAttr,
    formatLabel,
    formatDelta,
    sectionTotal,
    buildMetricRows
} from "./sectionUtils.js";

export function buildSystemsMatrix(state = {}) {
    const selectedSection = getActiveSection(state.ui?.selectedSection, state.sections || {});
    const selectedData = selectedSection ? state.sections[selectedSection] : null;

    return `
        <div class="tbi-view-stack">
            <section class="tbi-card tbi-systems-panel">
                <div class="tbi-card-heading">
                    <div>
                        <h2>Subsystem Matrix</h2>
                        <p>Tap a subsystem to inspect it. The detail panel opens in place and does not force-scroll the page.</p>
                    </div>
                    <span>${escapeHTML(Object.keys(state.sections || {}).length)} systems</span>
                </div>
                <div class="tbi-system-grid">
                    ${Object.entries(state.sections || {}).map(([key, value]) => systemTile(key, value, selectedSection)).join("")}
                </div>
            </section>
            ${selectedSection ? buildSystemDetail(selectedSection, selectedData) : buildNoSystemSelected()}
        </div>
    `;
}

function systemTile(key, section, selectedSection) {
    const total = sectionTotal(section);
    const tone = total > 0 ? "good" : total < 0 ? "bad" : "neutral";
    const active = key === selectedSection;

    return `
        <button
            type="button"
            class="tbi-system-tile ${tone} ${active ? "active" : ""}"
            data-section="${escapeAttr(key)}"
            aria-pressed="${active ? "true" : "false"}"
        >
            <span>${escapeHTML(formatLabel(key))}</span>
            <strong>${escapeHTML(formatDelta(total, { compact: true }))}</strong>
        </button>
    `;
}

function buildNoSystemSelected() {
    return `
        <section class="tbi-card tbi-system-detail empty">
            <h3>System detail closed</h3>
            <p>Select a Subsystem Matrix tile to open its detail panel.</p>
        </section>
    `;
}

function buildSystemDetail(sectionName, section) {
    return `
        <details class="tbi-card tbi-system-detail" open>
            <summary>
                <span>${escapeHTML(formatLabel(sectionName))} Detail</span>
                <em>Collapse / expand</em>
            </summary>
            ${buildMetricRows(section, { limit: 24, showHeader: true })}
        </details>
    `;
}

function getActiveSection(selectedSection = null, sections = {}) {
    if (selectedSection && Object.prototype.hasOwnProperty.call(sections || {}, selectedSection)) {
        return selectedSection;
    }

    return null;
}
