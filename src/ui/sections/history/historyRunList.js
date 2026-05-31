"use strict";

import { escapeHTML, escapeAttr } from "./historyShared.js";
import { buildHistoryEmptyState } from "./historyEmptyState.js";
import { buildHistoryRunCard } from "./historyRunCard.js";

export function buildHistoryRunList(model = {}) {
    const { visibleEntries = [], pagedEntries = [], history = [], filters = {}, state = {}, pagination = {} } = model;

    if (!visibleEntries.length) {
        return buildHistoryEmptyState({ filters, hasHistory: history.length > 0 });
    }

    return `
        <section class="tbi-history2-list tbi-card" aria-label="Saved Battle Report cards">
            <div class="tbi-history2-section-head tbi-history2-list-head">
                <span>Saved report cards</span>
                <strong data-history-list-visible-count="true">${escapeHTML(pagination.label || `${visibleEntries.length} visible`)}</strong>
            </div>
            ${buildPaginationControls(pagination, filters)}
            <div class="tbi-history2-card-grid" data-history-run-list="true">
                ${pagedEntries.map(entry => buildHistoryRunCard(entry, state)).join("")}
            </div>
            ${buildPaginationControls(pagination, filters, "bottom")}
            <div class="tbi-history-search-no-results" data-history-search-empty-message="true">
                <strong>No reports match this search.</strong>
                <span>Try a broader term, clear the search box, or use the filters above.</span>
            </div>
        </section>
    `;
}

function buildPaginationControls(pagination = {}, filters = {}, position = "top") {
    const current = Number(pagination.currentPage || 1);
    const total = Number(pagination.totalPages || 1);
    const hasPrevious = Boolean(pagination.hasPrevious);
    const hasNext = Boolean(pagination.hasNext);
    const showArchived = Boolean(filters.showArchived);
    const pageLabel = pagination.label || "Showing 0 of 0";

    return `
        <div class="tbi-history2-pager tbi-history2-pager-${escapeAttr(position)}" data-history-pager="true">
            <div class="tbi-history2-pager-copy">
                <strong>${escapeHTML(pageLabel)}</strong>
                <span>Page ${escapeHTML(String(current))} of ${escapeHTML(String(total))} · 6 cards per page</span>
            </div>
            <div class="tbi-history2-pager-actions" aria-label="History page controls">
                <div class="tbi-history2-pager-nav" aria-label="Move through current History results">
                    <button type="button" class="tbi-history2-btn ${hasPrevious ? "" : "is-disabled"}" data-history-page-target="1" ${hasPrevious ? "" : "disabled"}>First</button>
                    <button type="button" class="tbi-history2-btn ${hasPrevious ? "" : "is-disabled"}" data-history-page-target="${escapeAttr(String(current - 1))}" ${hasPrevious ? "" : "disabled"}>Previous</button>
                    <label class="tbi-history2-page-jump">
                        <span>Jump</span>
                        <input
                            type="number"
                            min="1"
                            max="${escapeAttr(String(total))}"
                            inputmode="numeric"
                            value="${escapeAttr(String(current))}"
                            data-history-page-jump="true"
                            aria-label="Jump to History page"
                        >
                        <button type="button" class="tbi-history2-btn" data-history-page-jump-go="true">Go</button>
                    </label>
                    <button type="button" class="tbi-history2-btn ${hasNext ? "" : "is-disabled"}" data-history-page-target="${escapeAttr(String(current + 1))}" ${hasNext ? "" : "disabled"}>Next</button>
                    <button type="button" class="tbi-history2-btn ${hasNext ? "" : "is-disabled"}" data-history-page-target="${escapeAttr(String(total))}" ${hasNext ? "" : "disabled"}>Last</button>
                </div>
                <div class="tbi-history2-page-actions" aria-label="History page actions">
                    <button type="button" class="tbi-history2-btn" data-history-page-archive="true">Archive Page</button>
                    ${showArchived
                        ? `<button type="button" class="tbi-history2-btn" data-history-page-restore="true">Restore Page</button>`
                        : ""}
                </div>
            </div>
        </div>
    `;
}
