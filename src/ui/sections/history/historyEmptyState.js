"use strict";

import { escapeHTML } from "./historyShared.js";

export function buildHistoryEmptyState({ filters = {}, hasHistory = false } = {}) {
    const hasFilters = Boolean(filters.query || filters.build !== "all" || filters.tag !== "all" || filters.showArchived || filters.mode === "deep");

    return `
        <section class="tbi-history2-empty tbi-card" aria-label="History empty state">
            <span>${escapeHTML(hasHistory ? "No visible reports" : "No saved reports")}</span>
            <strong>${escapeHTML(hasFilters ? "Nothing matches the current filters." : "History is ready for Command Deck reports.")}</strong>
            <p>${escapeHTML(hasFilters ? "Reset filters, search broader, or show archived runs." : "Validate and save a Battle Report from Command Deck. History will keep the parsed card and raw source link together.")}</p>
            <div>
                ${hasFilters ? `<button type="button" class="tbi-history2-btn" data-history-filter-reset="true">Reset Filters</button>` : `<button type="button" class="tbi-history2-btn" data-dashboard-tab="command">Open Command Deck</button>`}
            </div>
        </section>
    `;
}
