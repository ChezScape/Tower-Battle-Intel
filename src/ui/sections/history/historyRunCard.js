"use strict";

import {
    escapeHTML,
    escapeAttr,
    formatNumber,
    formatTime,
    getRunViewModel,
    formatWaveNumber,
    metricTile,
    statusPill
} from "./historyShared.js";

export function buildHistoryRunCard(entry = {}, state = {}) {
    const vm = getRunViewModel(entry, state);
    const { core, stats, meta, gb } = vm;
    const slotClass = vm.isRunA ? "is-run-a" : (vm.isRunB ? "is-run-b" : "");
    const cardTone = vm.archived ? "is-archived" : (vm.active ? "is-active" : "");
    const sourceLabel = vm.rawSource ? "Raw source" : "Parsed only";
    const sourceTone = vm.rawSource ? "good" : "watch";

    return `
        <article
            class="tbi-history2-run-card ${cardTone} ${slotClass}"
            data-history-card="true"
            data-global-search-card="history"
            data-history-search-text="${escapeAttr(vm.searchText)}"
            data-history-deep-search-text="${escapeAttr(vm.deepSearchText)}"
            data-history-index-card="${escapeAttr(vm.index)}"
            data-history-select-index="${escapeAttr(vm.index)}"
            tabindex="0"
            role="button"
            aria-label="Select saved run ${escapeAttr(String(vm.displayIndex + 1))}"
        >
            <div class="tbi-history2-card-accent" aria-hidden="true"></div>

            <header class="tbi-history2-card-head">
                <div>
                    <span>Run ${escapeHTML(String(vm.displayIndex + 1))}${vm.archived ? " · Archived" : ""}</span>
                    <strong>${escapeHTML(vm.title)}</strong>
                    <em>${escapeHTML(vm.tierWave)} · Killed By ${escapeHTML(vm.killedBy)}</em>
                </div>
                <div class="tbi-history2-slot-flags" aria-label="Loaded slots">
                    ${vm.isRunA ? `<b class="slot-a">Run A</b>` : ""}
                    ${vm.isRunB ? `<b class="slot-b">Run B</b>` : ""}
                    ${!vm.active ? `<b class="slot-none">Saved</b>` : ""}
                </div>
            </header>

            <div class="tbi-history2-card-main">
                ${metricTile("Wave", formatWaveNumber(core.wave || 0), "info")}
                ${metricTile("Coins", formatNumber(core.coins || 0), "gold")}
                ${metricTile("Cells", formatNumber(core.cells || 0), "good")}
                ${metricTile("Coins/h", formatNumber(stats.coinsPerHour ?? core.coinsPerHour ?? 0), "gold")}
                ${metricTile("Cells/h", formatNumber(stats.cellsPerHour ?? core.cellsPerHour ?? 0), "good")}
                ${metricTile("Real time", formatTime(core.time || 0), "neutral")}
            </div>

            <div class="tbi-history2-source-row" aria-label="Source and run type">
                ${statusPill("Source", sourceLabel, sourceTone)}
                ${vm.runType !== "normal" ? statusPill("Run type", vm.runTypeLabel, vm.runType === "tournament" ? "watch" : "info") : ""}
                ${vm.buildStyle !== "unknown" ? statusPill("Build", vm.buildLabel, "info") : ""}
                ${vm.tags.map(tag => `<span class="tbi-history2-tag">#${escapeHTML(tag)}</span>`).join("")}
            </div>

            ${meta.notes ? `<p class="tbi-history2-card-note"><b>Notes</b>${escapeHTML(meta.notes)}</p>` : ""}

            <footer class="tbi-history2-card-actions">
                <button type="button" class="tbi-history2-btn slot-a ${vm.isRunA ? "active" : ""}" data-history-index="${escapeAttr(vm.index)}" data-history-slot="runA" ${vm.archived ? "disabled" : ""}>${vm.isRunA ? "Run A active" : "Load A"}</button>
                <button type="button" class="tbi-history2-btn slot-b ${vm.isRunB ? "active" : ""}" data-history-index="${escapeAttr(vm.index)}" data-history-slot="runB" ${vm.archived ? "disabled" : ""}>${vm.isRunB ? "Run B active" : "Load B"}</button>
                <button type="button" class="tbi-history2-btn" data-history-stats-index="${escapeAttr(vm.index)}" data-history-display-index="${escapeAttr(vm.displayIndex)}">Stats</button>
                <button type="button" class="tbi-history2-btn" data-history-edit-index="${escapeAttr(vm.index)}" data-history-display-index="${escapeAttr(vm.displayIndex)}">Edit</button>
                ${vm.archived
                    ? `<button type="button" class="tbi-history2-btn" data-restore-history-index="${escapeAttr(vm.index)}">Restore</button>`
                    : `<button type="button" class="tbi-history2-btn" data-archive-history-index="${escapeAttr(vm.index)}">Archive</button>`}
                <button type="button" class="tbi-history2-btn danger" data-delete-history-index="${escapeAttr(vm.index)}">Delete</button>
            </footer>
        </article>
    `;
}
