"use strict";

import {
    escapeHTML,
    escapeAttr,
    HISTORY_SORT_OPTIONS,
    HISTORY_BUILD_OPTIONS,
    HISTORY_RUN_TYPE_OPTIONS,
    selectControl,
    tagOptions
} from "./historyShared.js";

export function buildHistoryToolbar(model = {}) {
    const { history = [], filters = {}, visibleEntries = [], tags = [] } = model;
    const modeIsDeep = filters.mode === "deep";
    const query = filters.query || "";

    return `
        <section class="tbi-history2-toolbar tbi-card" aria-label="History search filters and library actions">
            <div class="tbi-history2-search-row">
                <label class="tbi-history2-search" data-search-control="history">
                    <span>Search saved reports</span>
                    <input
                        type="search"
                        class="history-search tbi-history2-search-input"
                        data-history-filter-query="true"
                        data-tbi-global-search="history"
                        value="${escapeAttr(query)}"
                        placeholder="Search killed by, exact wave, date, coins, cells, tags, notes..."
                    >
                </label>

                <button
                    type="button"
                    class="tbi-history2-mode ${modeIsDeep ? "active" : ""}"
                    data-history-search-mode-toggle="true"
                    data-history-filter-value="mode"
                    data-history-filter-kind="mode"
                    data-history-filter-option="${modeIsDeep ? "normal" : "deep"}"
                    aria-pressed="${modeIsDeep ? "true" : "false"}"
                    title="Normal search checks visible run facts. Deep Report Search checks raw report labels and parser evidence."
                >
                    <span>${modeIsDeep ? "Deep report search" : "Normal search"}</span>
                    <b>${modeIsDeep ? "Raw labels on" : "Run facts"}</b>
                </button>
            </div>

            <div class="tbi-history2-filter-grid">
                ${selectControl("Sort", "data-history-filter-sort", filters.sort, HISTORY_SORT_OPTIONS)}
                ${selectControl("Build", "data-history-filter-build", filters.build, HISTORY_BUILD_OPTIONS)}
                ${selectControl("Tags", "data-history-filter-tag", filters.tag, tagOptions(tags))}
                ${selectControl("Run Type", "data-history-filter-run-type", filters.runType, HISTORY_RUN_TYPE_OPTIONS)}
                <button
                    type="button"
                    class="tbi-history2-archive-toggle ${filters.showArchived ? "active" : ""}"
                    data-history-filter-value="showArchived"
                    data-history-filter-kind="showArchived"
                    data-history-filter-option="${filters.showArchived ? "false" : "true"}"
                    aria-pressed="${filters.showArchived ? "true" : "false"}"
                >
                    <span>Archived runs</span>
                    <b>${filters.showArchived ? "Shown" : "Hidden"}</b>
                </button>
            </div>

            <div class="tbi-history2-toolbar-footer">
                <div class="tbi-history2-filter-status">
                    <strong data-history-search-visible-count="true">${escapeHTML(String(visibleEntries.length))}</strong>
                    <span data-history-search-total-count="true">visible of ${escapeHTML(String(history.length))} saved</span>
                    <em data-history-global-search-status="true">${query ? `Search: ${escapeHTML(query)}` : "Normal search avoids raw-label noise. Use Deep report search only when you need raw Battle Report evidence."}</em>
                </div>

                <div class="tbi-history2-actions" aria-label="History library actions">
                    <button type="button" class="tbi-history2-btn" data-history-filter-reset="true">Reset Filters</button>
                    <button type="button" class="tbi-history2-btn" data-ui-action="import-history">Import JSON</button>
                    <button type="button" class="tbi-history2-btn" data-export-history="true">Export JSON</button>
                    <button type="button" class="tbi-history2-btn" data-clear-history-selection="true">Clear A/B</button>
                    <button type="button" class="tbi-history2-btn ${canSwap(model) ? "" : "is-disabled"}" data-swap-history-slots="true" ${canSwap(model) ? "" : "disabled"}>Swap A/B</button>
                </div>
            </div>
        </section>
    `;
}

function canSwap(model = {}) {
    return Boolean(model?.state?.runA && model?.state?.runB);
}
