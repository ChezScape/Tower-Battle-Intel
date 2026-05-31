"use strict";

/**
 * HISTORY EDIT MODAL REBUILD
 * History-owned metadata editor for saved History runs.
 *
 * Edits:
 * - run type
 * - notes
 * - tags
 * - build style
 */

import {
    escapeHTML,
    escapeAttr,
    formatLabel
} from "../../utils/format.js";

import {
    HISTORY_BUILD_OPTIONS
} from "../../../history/historyFilters.js";

const HISTORY_RUN_TYPE_OPTIONS = Object.freeze([
    { value: "normal", label: "Normal" },
    { value: "tournament", label: "Tournament" },
    { value: "farming", label: "Farming" },
    { value: "milestone", label: "Milestone" },
    { value: "test", label: "Test" },
    { value: "event", label: "Event" }
]);

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

    const runType =
        normaliseRunType(meta.runType || run?.userMeta?.runType || "normal");

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
                            · ${escapeHTML(formatRunType(runType))}
                            · Build ${escapeHTML(formatLabel(buildStyle))}
                        </div>
                    </div>

                    <button
                        type="button"
                        class="history-edit-close"
                        data-history-edit-close="true"
                        data-ui-action="history-edit-close"
                        aria-label="Close edit run"
                    >
                        Close
                    </button>
                </div>

                <div class="history-edit-body">

                    <div class="history-edit-field">
                        <span>Run type</span>

                        <input
                            type="hidden"
                            data-history-edit-run-type="true"
                            data-ui-action="history-edit-run-type"
                            value="${escapeAttr(runType)}"
                        >

                        <div class="history-edit-build-grid history-edit-run-type-grid" role="group" aria-label="Run type">
                            ${HISTORY_RUN_TYPE_OPTIONS
                                .map(option => buildRunTypeButton(option, runType))
                                .join("")}
                        </div>

                        <em>Use this when a report did not include a manual marker such as Tournament--.</em>
                    </div>

                    <label class="history-edit-field">
                        <span>Run notes</span>
                        <textarea
                            data-history-edit-notes="true"
                            data-ui-action="history-edit-notes"
                            rows="5"
                            placeholder="Example: Tried more damage focus, changed cards, bad perk luck..."
                        >${escapeHTML(notes)}</textarea>
                    </label>

                    <label class="history-edit-field">
                        <span>Tags</span>
                        <input
                            type="text"
                            data-history-edit-tags="true"
                            data-ui-action="history-edit-tags"
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
                            data-ui-action="history-edit-build"
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
                        data-ui-action="history-edit-cancel"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        class="primary"
                        data-history-edit-save="true"
                        data-ui-action="history-edit-save"
                    >
                        Save Details
                    </button>
                </div>

            </div>
        </div>
    `;
}

function buildRunTypeButton(option = {}, current = "normal") {

    const active =
        option.value === current;

    return `
        <button
            type="button"
            class="history-edit-build-choice history-edit-run-type-choice ${active ? "active" : ""}"
            data-history-edit-run-type-choice="${escapeAttr(option.value)}"
            data-ui-action="history-edit-run-type-choice"
            aria-pressed="${active ? "true" : "false"}"
        >
            ${escapeHTML(option.label || option.value)}
        </button>
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
            data-ui-action="history-edit-build-choice"
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

function normaliseRunType(value = "normal") {

    const key =
        String(value || "normal")
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_")
            .replace(/__+/g, "_");

    return HISTORY_RUN_TYPE_OPTIONS.some(option => option.value === key)
        ? key
        : "normal";
}

function formatRunType(value = "normal") {
    const key = normaliseRunType(value);
    return HISTORY_RUN_TYPE_OPTIONS.find(option => option.value === key)?.label || "Normal";
}

export default {
    buildHistoryEditMount,
    buildHistoryEditModal
};
