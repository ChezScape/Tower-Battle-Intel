"use strict";

/**
 * HISTORY EDIT MODAL
 * Phase 4 metadata editor for saved History Trace runs.
 *
 * Edits:
 * - notes
 * - tags
 * - build style
 */

import {
    escapeHTML,
    escapeAttr,
    formatLabel
} from "../utils/format.js";

import {
    HISTORY_BUILD_OPTIONS
} from "../../history/historyFilters.js";

/* --------------------------------------------------
   MOUNT
-------------------------------------------------- */

export function buildHistoryEditMount() {

    return `<div id="historyEditModalMount"></div>`;
}

/* --------------------------------------------------
   MODAL
-------------------------------------------------- */

export function buildHistoryEditModal({
    run = null,
    index = 0,
    displayIndex = 0
} = {}) {

    if (!run) {
        return "";
    }

    const core =
        run?.core || {};

    const meta =
        run?.meta || {};

    const notes =
        String(meta.notes || "");

    const tags =
        Array.isArray(meta.tags)
            ? meta.tags.filter(Boolean)
            : [];

    const buildStyle =
        normaliseBuildStyle(meta.buildStyle || meta.build || "unknown");

    return `
        <div
            class="history-edit-modal active"
            id="historyEditModal"
            role="dialog"
            aria-modal="true"
            aria-label="Edit history run"
            data-history-edit-modal="true"
            data-history-edit-index="${escapeAttr(index)}"
        >
            <div class="history-edit-card">

                <div class="history-edit-header">
                    <div>
                        <div class="history-edit-kicker">
                            Edit Run ${escapeHTML(displayIndex + 1)}
                        </div>

                        <div class="history-edit-title">
                            ${escapeHTML(core.battleDate || "Unknown date")}
                        </div>

                        <div class="history-edit-subtitle">
                            Tier ${escapeHTML(core.tier ?? "-")}
                            · Wave ${escapeHTML(core.wave ?? "-")}
                            · Build ${escapeHTML(formatLabel(buildStyle))}
                        </div>
                    </div>

                    <button
                        type="button"
                        class="history-edit-close"
                        data-history-edit-close="true"
                        aria-label="Close edit run"
                    >
                        Close
                    </button>
                </div>

                <div class="history-edit-body">

                    <label class="history-edit-field">
                        <span>Run notes</span>
                        <textarea
                            data-history-edit-notes="true"
                            rows="5"
                            placeholder="Example: Tried more damage focus, changed cards, bad perk luck..."
                        >${escapeHTML(notes)}</textarea>
                    </label>

                    <label class="history-edit-field">
                        <span>Tags</span>
                        <input
                            type="text"
                            data-history-edit-tags="true"
                            value="${escapeAttr(tags.join(", "))}"
                            placeholder="farm, push, coins, bad-luck"
                        >
                        <em>Separate tags with commas. Spaces become dashes.</em>
                    </label>

                    <div class="history-edit-field">
                        <span>Build style for this run</span>

                        <input
                            type="hidden"
                            data-history-edit-build="true"
                            value="${escapeAttr(buildStyle)}"
                        >

                        <div class="history-edit-build-grid" role="group" aria-label="Build style">
                            ${HISTORY_BUILD_OPTIONS
                                .filter(option => option.value !== "all")
                                .map(option => buildButton(option, buildStyle))
                                .join("")}
                        </div>
                    </div>

                </div>

                <div class="history-edit-footer">
                    <button
                        type="button"
                        data-history-edit-close="true"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        class="primary"
                        data-history-edit-save="true"
                    >
                        Save Run Details
                    </button>
                </div>

            </div>
        </div>
    `;
}

function buildButton(option = {}, current = "unknown") {

    const active =
        option.value === current;

    return `
        <button
            type="button"
            class="history-edit-build-choice ${active ? "active" : ""}"
            data-history-edit-build-choice="${escapeAttr(option.value)}"
            aria-pressed="${active ? "true" : "false"}"
        >
            ${escapeHTML(option.label || option.value)}
        </button>
    `;
}

function normaliseBuildStyle(value = "unknown") {

    const key =
        String(value || "unknown")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/\//g, "_")
            .replace(/__+/g, "_");

    return HISTORY_BUILD_OPTIONS.some(option => option.value === key)
        ? key
        : "unknown";
}

export default {
    buildHistoryEditMount,
    buildHistoryEditModal
};
