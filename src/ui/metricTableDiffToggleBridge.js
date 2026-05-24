"use strict";

/**
 * METRIC TABLE DIFF DETAILS MODAL BRIDGE v4.11q
 * Desktop dashboard helper.
 *
 * Replaces the narrow-table column toggle with a DIFF+ detail modal.
 * Card size stays unchanged; the popup shows Metric / Run A / Run B / Diff clearly.
 */

const VERSION = "v4.11q";
let bound = false;
let lastFocusedElement = null;

export function bindMetricTableDiffToggleBridge() {
    if (bound || window.__TowerBattleIntelMetricTableDiffToggleBound) {
        return;
    }

    bound = true;
    window.__TowerBattleIntelMetricTableDiffToggleBound = true;

    document.addEventListener("click", handleMetricDiffDetailsClick, true);
    document.addEventListener("keydown", handleMetricDiffDetailsKeydown, true);
    console.log(`[Tower Battle Intel] Metric table diff details modal bridge bound ${VERSION}`);
}

function handleMetricDiffDetailsClick(event) {
    const closeTrigger = event.target?.closest?.("[data-metric-diff-modal-close]");

    if (closeTrigger) {
        event.preventDefault();
        event.stopPropagation();
        closeMetricDiffModal();
        return;
    }

    const backdrop = event.target?.closest?.("[data-metric-diff-modal]");

    if (backdrop && event.target === backdrop) {
        event.preventDefault();
        event.stopPropagation();
        closeMetricDiffModal();
        return;
    }

    const button = event.target?.closest?.("[data-metric-diff-toggle]");

    if (!button) {
        return;
    }

    const table = button.closest("[data-metric-table]");

    if (!table) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    openMetricDiffModal(table, button);
}

function handleMetricDiffDetailsKeydown(event) {
    if (event.key !== "Escape") {
        return;
    }

    const modal = document.querySelector("[data-metric-diff-modal]");

    if (!modal) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    closeMetricDiffModal();
}

function openMetricDiffModal(table, sourceButton) {
    const card = table.closest(".tbi-metric-card");
    const title = cleanText(card?.dataset?.metricDetailTitle || card?.querySelector("h3")?.textContent || "Metric Details");
    const accent = cleanText(card?.dataset?.metricDetailAccent || "cyan").toLowerCase();
    const rows = readRows(table);

    if (!rows.length) {
        return;
    }

    closeMetricDiffModal({ restoreFocus: false });
    lastFocusedElement = sourceButton || document.activeElement;

    const modal = document.createElement("div");
    modal.className = `tbi-diff-modal-backdrop accent-${safeClass(accent)}`;
    modal.dataset.metricDiffModal = "true";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", `${title} Diff details`);

    modal.innerHTML = `
        <section class="tbi-diff-modal-shell" role="document">
            <header class="tbi-diff-modal-header">
                <div>
                    <span class="tbi-diff-modal-kicker">DIFF+ DETAILS</span>
                    <h2>${escapeHTML(title)}</h2>
                    <p>Full A - B comparison without resizing the dashboard card.</p>
                </div>
                <button type="button" class="tbi-diff-modal-close" data-metric-diff-modal-close="true" aria-label="Close Diff details">×</button>
            </header>
            <div class="tbi-diff-modal-table-wrap">
                <div class="tbi-diff-modal-table" role="table" aria-label="${escapeHTML(title)} full comparison">
                    <div class="tbi-diff-modal-row header" role="row">
                        <span role="columnheader">Metric</span>
                        <span role="columnheader">Run A</span>
                        <span role="columnheader">Run B</span>
                        <span role="columnheader">Diff</span>
                    </div>
                    ${rows.map(row => `
                        <div class="tbi-diff-modal-row ${escapeHTML(row.tone)}" role="row">
                            <span role="cell">${escapeHTML(row.metric)}</span>
                            <span role="cell">${escapeHTML(row.runA)}</span>
                            <span role="cell">${escapeHTML(row.runB)}</span>
                            <strong role="cell">${escapeHTML(row.diff)}</strong>
                        </div>
                    `).join("")}
                </div>
            </div>
            <footer class="tbi-diff-modal-footer">
                <span>Esc closes this popup.</span>
                <button type="button" data-metric-diff-modal-close="true">Close</button>
            </footer>
        </section>
    `;

    document.body.appendChild(modal);
    document.body.classList.add("tbi-diff-modal-open");

    window.requestAnimationFrame(() => {
        modal.querySelector("[data-metric-diff-modal-close]")?.focus?.();
    });
}

function closeMetricDiffModal({ restoreFocus = true } = {}) {
    const modal = document.querySelector("[data-metric-diff-modal]");

    if (!modal) {
        return;
    }

    modal.remove();
    document.body.classList.remove("tbi-diff-modal-open");

    if (restoreFocus && lastFocusedElement?.isConnected) {
        lastFocusedElement.focus?.();
    }

    lastFocusedElement = null;
}

function readRows(table) {
    return Array.from(table.querySelectorAll(".tbi-metric-row:not(.header)"))
        .map(row => {
            const spans = Array.from(row.querySelectorAll("span"));
            const diff = row.querySelector("strong");

            return {
                metric: cleanText(spans[0]?.textContent || ""),
                runA: cleanText(spans[1]?.textContent || ""),
                runB: cleanText(spans[2]?.textContent || ""),
                diff: cleanText(diff?.textContent || ""),
                tone: row.classList.contains("good") ? "good" : row.classList.contains("bad") ? "bad" : "neutral"
            };
        })
        .filter(row => row.metric);
}

function cleanText(value = "") {
    return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function safeClass(value = "cyan") {
    return String(value || "cyan").toLowerCase().replace(/[^a-z0-9_-]/g, "") || "cyan";
}

export default {
    bindMetricTableDiffToggleBridge
};
