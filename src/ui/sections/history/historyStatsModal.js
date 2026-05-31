"use strict";

/**
 * HISTORY STATS MODAL CLARITY POLISH v4.11z52w47
 *
 * History-owned replacement for the old src/ui/layouts/historyStatsModal.js.
 * Keeps the same data hooks used by workspaceEvents, but uses the rebuilt
 * History visual language and raw-archive-led run breakdown.
 */

import {
    escapeHTML,
    escapeAttr,
    formatNumber,
    formatTime,
    getRunViewModel,
    formatWaveNumber,
    shortReportId,
    sameRun,
    formatRunTypeLabel
} from "./historyShared.js";

import {
    buildRunQualityScore,
    buildPreviousDelta,
    buildHistoryStats
} from "../../../history/historyStats.js";

import { formatLabel, formatDelta, formatPercent } from "../../utils/format.js";

export const HISTORY_STATS_MODAL_REBUILD_VERSION = "v4.11z52w47";

const SECTION_ORDER = [
    "currencies",
    "economy",
    "damage",
    "survival",
    "health_regenerated",
    "damage_blocked",
    "records",
    "counts",
    "enemies_hit_by",
    "enemies_destroyed_by",
    "killed_with_effect_active",
    "miscellaneous"
];

const CORE_SUMMARY_ROWS = [
    ["Coins", run => run?.core?.coins, "number"],
    ["Cells", run => run?.core?.cells, "number"],
    ["Real Time", run => resolveRunDisplayTime(run, "real"), "duration"],
    ["Game Time", run => resolveRunDisplayTime(run, "game"), "duration"],
    ["Coins / hour", run => run?.stats?.coinsPerHour ?? run?.core?.coinsPerHour, "number"],
    ["Cells / hour", run => run?.stats?.cellsPerHour ?? run?.core?.cellsPerHour, "number"]
];

export function buildHistoryStatsModal(input = null, legacyIndex = 0) {
    const options = normaliseModalInput(input, legacyIndex);
    const { run, index, displayIndex, history, visibleHistory, runA, runB } = options;

    if (!run) return "";

    const vm = getRunViewModel({ run, originalIndex: index, visibleIndex: displayIndex }, { runA, runB });
    const summarySource = Array.isArray(visibleHistory) && visibleHistory.length
        ? visibleHistory
        : Array.isArray(history) && history.length
            ? history.filter(item => !item?.meta?.archived)
            : [run];
    const summary = { ...buildHistoryStats(summarySource), runs: summarySource };
    const qualityScore = buildRunQualityScore(run, summary);
    const previousDelta = buildPreviousDelta(Array.isArray(history) ? history : [run], Math.max(0, Number(index || 0)));
    const previousRun = getPreviousRun(Array.isArray(history) ? history : [run], Math.max(0, Number(index || 0)));
    const deltaContext = buildDeltaContext(run, previousRun);
    const sectionGroups = buildSectionGroups(run);
    const rawText = getRawReportText(run);
    const isA = runA && sameRun(run, runA);
    const isB = runB && sameRun(run, runB) && !isA;
    const archived = Boolean(run?.meta?.archived);

    return `
        <div
            class="tbi-history2-stats-modal active"
            id="historyStatsModal"
            role="dialog"
            aria-modal="true"
            aria-label="Rebuilt History run stats"
            data-history-stats-modal="${escapeAttr(HISTORY_STATS_MODAL_REBUILD_VERSION)}"
            data-history-stats-index="${escapeAttr(index)}"
        >
            <article class="tbi-history2-stats-card">
                <header class="tbi-history2-stats-hero">
                    <div class="tbi-history2-stats-title-block">
                        <span class="tbi-history2-kicker">Run Stats · rebuilt modal</span>
                        <strong>Run ${escapeHTML(String(displayIndex + 1))}${archived ? " · Archived" : ""}</strong>
                        <em>${escapeHTML(vm.title)} · ${escapeHTML(vm.tierWave)} · Killed By ${escapeHTML(vm.killedBy)}</em>
                    </div>

                    <div class="tbi-history2-stats-source">
                        ${sourceBadge(vm, rawText)}
                        <span>${escapeHTML(shortReportId(vm.reportId))}</span>
                    </div>

                    <button type="button" class="tbi-history2-stats-close" data-ui-action="history-stats-close" data-history-stats-close="true" aria-label="Close Run Stats">
                        Close
                    </button>
                </header>

                <section class="tbi-history2-stats-actionbar" aria-label="Run actions">
                    <button type="button" class="tbi-history2-btn slot-a ${isA ? "active" : ""}" data-history-modal-slot="runA" data-history-modal-index="${escapeAttr(index)}" ${archived ? "disabled" : ""}>${isA ? "Run A active" : "Load Run A"}</button>
                    <button type="button" class="tbi-history2-btn slot-b ${isB ? "active" : ""}" data-history-modal-slot="runB" data-history-modal-index="${escapeAttr(index)}" ${archived ? "disabled" : ""}>${isB ? "Run B active" : "Load Run B"}</button>
                    <button type="button" class="tbi-history2-btn" data-ui-action="history-stats-edit" data-history-edit-index="${escapeAttr(index)}" data-history-display-index="${escapeAttr(displayIndex)}">Edit Metadata</button>
                </section>

                <section class="tbi-history2-stats-trust-row" aria-label="Run status and comparison context">
                    ${trustChip("Run Type", vm.runTypeLabel || "Normal", vm.runType === "tournament" ? "warn" : "neutral")}
                    ${trustChip("Run A", isA ? "Loaded here" : "Available", isA ? "a" : "neutral")}
                    ${trustChip("Run B", isB ? "Loaded here" : "Available", isB ? "b" : "neutral")}
                    ${trustChip("Performance Score", `${qualityScore}/100`, qualityScore >= 70 ? "good" : "info")}
                </section>

                <nav class="tbi-history2-stats-tabs" role="tablist" aria-label="Run Stats sections">
                    ${tabButton("summary", "Summary", true)}
                    ${tabButton("sections", "Sections", false)}
                    ${tabButton("raw", "Raw Source", false)}
                </nav>

                <div class="tbi-history2-stats-body">
                    <section class="tbi-history2-stats-view active" data-history-stats-view="summary">
                        ${buildSummaryView(run, vm, qualityScore, previousDelta, summary, deltaContext)}
                    </section>

                    <section class="tbi-history2-stats-view" data-history-stats-view="sections">
                        ${buildSectionsView(sectionGroups)}
                    </section>

                    <section class="tbi-history2-stats-view" data-history-stats-view="raw">
                        ${buildRawView(run, rawText)}
                    </section>
                </div>

                <footer class="tbi-history2-stats-footer">
                    <span class="tbi-history2-stats-footer-note">Data actions</span>
                    <button type="button" class="tbi-history2-btn" data-ui-action="history-stats-copy" data-history-stats-copy="true">Copy JSON</button>
                    <button type="button" class="tbi-history2-btn" data-ui-action="history-stats-download" data-history-stats-download="true">Download JSON</button>
                </footer>
            </article>
        </div>
    `;
}

export function buildHistoryStatsMount() {
    return `<div id="historyStatsModalMount"></div>`;
}

function buildSummaryView(run, vm, qualityScore, previousDelta, summary, deltaContext = null) {
    return `
        <div class="tbi-history2-stats-summary-grid">
            ${summaryMetric("Tier", `T${run?.core?.tier ?? "?"}`, "info")}
            ${summaryMetric("Wave", formatWaveNumber(run?.core?.wave || 0), "info")}
            ${summaryMetric("Killed By", run?.core?.killedBy || "Unknown", "warn")}
            ${CORE_SUMMARY_ROWS.map(([label, getter, type]) => summaryMetric(label, formatMetricValue(getter(run), type), metricTone(label))).join("")}
        </div>

        <div class="tbi-history2-stats-panel-grid">
            <section class="tbi-history2-stats-panel">
                <h3>Run Identity</h3>
                <dl class="tbi-history2-stats-dl">
                    ${definitionRow("Battle date", vm.title)}
                    ${definitionRow("Tier / Wave", vm.tierWave)}
                    ${definitionRow("Killed by", vm.killedBy)}
                    ${definitionRow("Run type", vm.runTypeLabel || "Normal")}
                    ${definitionRow("Report ID", vm.reportId || "No raw ID")}
                    ${definitionRow("Build", vm.buildLabel)}
                    ${definitionRow("Tags", vm.tags.length ? vm.tags.map(tag => `#${tag}`).join(" ") : "No tags")}
                </dl>
            </section>

            <section class="tbi-history2-stats-panel">
                <h3>Previous Run Delta</h3>
                ${deltaContext ? buildDeltaContextNote(deltaContext) : ""}
                ${previousDelta ? `
                    <div class="tbi-history2-stats-mini-grid">
                        ${deltaTile("Wave", previousDelta.wave, false)}
                        ${deltaTile("Coins", previousDelta.coins, true)}
                        ${deltaTile("Cells", previousDelta.cells, true)}
                        ${deltaTile("Coins/h", previousDelta.coinsPerHour, true)}
                        ${deltaTile("Cells/h", previousDelta.cellsPerHour, true)}
                    </div>
                ` : `<p class="tbi-history2-stats-note">No previous run delta available for this saved position.</p>`}
            </section>

            <section class="tbi-history2-stats-panel">
                <h3>Library Context</h3>
                <dl class="tbi-history2-stats-dl">
                    ${definitionRow("Visible reports checked", summary.count || 0)}
                    ${definitionRow("Best wave in view", summary.bestWave ? formatWaveNumber(summary.bestWave.value) : "-")}
                    ${definitionRow("Best coins in view", summary.bestCoins ? formatNumber(summary.bestCoins.value) : "-")}
                    ${definitionRow("Best cells in view", summary.bestCells ? formatNumber(summary.bestCells.value) : "-")}
                    ${definitionRow("Same run type in view", countSameRunTypeInSummary(run, summary))}
                </dl>
            </section>
        </div>
    `;
}

function buildSectionsView(sectionGroups = []) {
    return `
        <section class="tbi-history2-stats-search-panel">
            <label>
                <span>Search this run</span>
                <input type="search" data-history-stats-section-search="true" placeholder="Search economy, tank, ray, cells, damage..." aria-label="Search Run Stats sections">
            </label>
            <button type="button" class="tbi-history2-btn" data-ui-action="history-stats-search-clear" data-global-search-clear="history-stats">Clear</button>
        </section>

        <div class="tbi-history2-stats-empty" data-history-stats-no-results="true" hidden>No matching stats in this run.</div>

        ${sectionGroups.length
            ? sectionGroups.map(group => buildSectionGroup(group)).join("")
            : `<div class="tbi-history2-stats-empty">No section stats available for this saved run.</div>`
        }
    `;
}

function buildRawView(run, rawText = "") {
    return `
        <div class="tbi-history2-stats-panel-grid raw-grid">
            <section class="tbi-history2-stats-panel">
                <h3>Original Battle Report Text</h3>
                ${rawText
                    ? `<pre class="tbi-history2-stats-raw" data-history-stats-raw-report="true">${escapeHTML(rawText)}</pre>`
                    : `<p class="tbi-history2-stats-note">No raw report text is attached to this parsed cache entry.</p>`
                }
            </section>

            <section class="tbi-history2-stats-panel">
                <h3>Parsed Run JSON</h3>
                <pre class="tbi-history2-stats-raw" data-history-stats-json="true">${escapeHTML(JSON.stringify(run, null, 2))}</pre>
            </section>
        </div>
    `;
}

function buildSectionGroup(group) {
    const rows = group.rows || [];
    const search = `${group.key} ${group.label} ${rows.map(row => `${row.label} ${row.value}`).join(" ")}`;
    return `
        <section class="tbi-history2-stats-section" data-history-stats-section="true" data-section-search="${escapeAttr(search)}">
            <header>
                <div>
                    <span>${escapeHTML(group.family)}</span>
                    <strong>${escapeHTML(group.label)}</strong>
                </div>
                <b data-history-stats-match-pill="true" hidden>Match</b>
            </header>
            <div class="tbi-history2-stats-table">
                ${rows.map(row => `
                    <div class="tbi-history2-stats-row" data-history-stats-row="true" data-history-stats-row-search="${escapeAttr(`${group.label} ${row.label} ${row.value}`)}">
                        <span>${escapeHTML(row.label)}</span>
                        <strong>${escapeHTML(row.value)}</strong>
                    </div>
                `).join("")}
            </div>
        </section>
    `;
}

function buildSectionGroups(run = {}) {
    const groups = [];

    const statsRows = objectRows(run?.stats || {}, "number");
    if (statsRows.length) {
        groups.push({ key: "stats", family: "Computed", label: "Computed Stats", rows: statsRows });
    }

    const sections = run?.sections && typeof run.sections === "object" ? run.sections : {};
    const orderedKeys = [
        ...SECTION_ORDER.filter(key => Object.prototype.hasOwnProperty.call(sections, key)),
        ...Object.keys(sections).filter(key => !SECTION_ORDER.includes(key)).sort()
    ];

    orderedKeys.forEach(key => {
        const rows = objectRows(sections[key], "auto");
        if (!rows.length) return;
        groups.push({
            key,
            family: sectionFamily(key),
            label: formatLabel(key),
            rows
        });
    });

    return groups;
}

function objectRows(value, mode = "auto", prefix = "") {
    if (!value || typeof value !== "object") return [];

    return Object.entries(value)
        .flatMap(([key, raw]) => {
            const label = prefix ? `${formatLabel(prefix)} · ${formatLabel(key)}` : formatLabel(key);
            if (raw && typeof raw === "object" && !Array.isArray(raw)) {
                return objectRows(raw, mode, key);
            }
            return [{ label, value: formatMetricValue(raw, mode) }];
        })
        .filter(row => row.value !== "" && row.value !== "-" && row.value !== "0")
        .slice(0, 220);
}


function getPreviousRun(history = [], index = 0) {
    const safeIndex = Number(index);
    if (!Array.isArray(history) || !Number.isInteger(safeIndex) || safeIndex <= 0) return null;
    return history[safeIndex - 1] || null;
}

function getRunType(run = null) {
    const value = run?.meta?.runType || run?.userMeta?.runType || "normal";
    const normalised = String(value || "normal").trim().toLowerCase().replace(/[\s-]+/g, "_");
    return ["tournament", "farming", "milestone", "event", "test"].includes(normalised) ? normalised : "normal";
}

function buildDeltaContext(run = null, previous = null) {
    if (!previous) return null;
    const currentType = getRunType(run);
    const previousType = getRunType(previous);
    return {
        currentType,
        previousType,
        currentLabel: formatRunTypeLabel(currentType),
        previousLabel: formatRunTypeLabel(previousType),
        differs: currentType !== previousType
    };
}

function buildDeltaContextNote(context = null) {
    if (!context) return "";
    const warning = context.differs
        ? `<b>Different run type: ${escapeHTML(context.previousLabel)} → ${escapeHTML(context.currentLabel)}.</b>`
        : `<b>Same run type: ${escapeHTML(context.currentLabel)}.</b>`;
    return `<p class="tbi-history2-stats-context-note">Compared with previous saved run. ${warning}</p>`;
}

function countSameRunTypeInSummary(run = null, summary = null) {
    const runs = Array.isArray(summary?.runs) ? summary.runs : [];
    if (!runs.length) return "Not tracked yet";
    const type = getRunType(run);
    const count = runs.filter(item => getRunType(item) === type).length;
    return `${count} ${formatRunTypeLabel(type)} run${count === 1 ? "" : "s"}`;
}

function sourceBadge(vm, rawText = "") {
    const good = rawText || vm.rawSource;
    return `<b class="source-${good ? "good" : "warn"}">${good ? "Raw Source Verified" : "Parsed Cache Only"}</b>`;
}

function trustChip(label, value, tone = "neutral") {
    return `<span class="tbi-history2-stats-chip tone-${escapeAttr(tone)}"><small>${escapeHTML(label)}</small><b>${escapeHTML(String(value ?? "-"))}</b></span>`;
}

function tabButton(view, label, active = false) {
    return `
        <button type="button" class="${active ? "active" : ""}" data-ui-action="history-stats-tab-${escapeAttr(view)}" data-history-stats-tab="${escapeAttr(view)}" aria-pressed="${active ? "true" : "false"}">
            ${escapeHTML(label)}
        </button>
    `;
}

function summaryMetric(label, value, tone = "neutral") {
    return `<div class="tbi-history2-stats-metric tone-${escapeAttr(tone)}"><span>${escapeHTML(label)}</span><strong>${escapeHTML(String(value ?? "-"))}</strong></div>`;
}

function definitionRow(label, value) {
    return `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(String(value ?? "-"))}</dd></div>`;
}

function deltaTile(label, value, compact = true) {
    const text = value == null ? "No delta" : formatDelta(value, { compact, precision: compact ? 2 : 0 });
    const tone = Number(value || 0) > 0 ? "good" : Number(value || 0) < 0 ? "bad" : "neutral";
    return `<div class="tbi-history2-stats-delta tone-${tone}"><span>${escapeHTML(label)}</span><strong>${escapeHTML(text)}</strong></div>`;
}

function formatMetricValue(value, type = "auto") {
    if (value == null || value === "") return "-";
    if (type === "duration") return formatDurationValue(value);
    if (type === "time") return formatTime(value);
    if (type === "number") return formatNumber(value);
    if (typeof value === "number") return formatNumber(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
}

function resolveRunDisplayTime(run = {}, kind = "real") {
    const core = run?.core || {};
    const flat = run?.flat || {};
    const sectionsCore = run?.sections?.core || {};
    const raw = run?.raw?.parsed || {};
    const rawCore = raw?.core || {};
    const rawFlat = raw?.flat || {};

    const candidates = kind === "game"
        ? [
            core.gameTime,
            core.game_time,
            flat.game_time,
            sectionsCore.game_time,
            sectionsCore.gameTime,
            rawCore.game_time,
            rawCore.gameTime,
            rawFlat.game_time
        ]
        : [
            core.realTime,
            core.real_time,
            flat.real_time,
            sectionsCore.real_time,
            sectionsCore.realTime,
            rawCore.real_time,
            rawCore.realTime,
            rawFlat.real_time,
            core.time
        ];

    return candidates.find(value => value != null && value !== "") ?? "";
}

function formatDurationValue(value) {
    if (value == null || value === "") return "-";
    if (typeof value === "string" && /[a-z]/i.test(value)) return value;
    return formatTime(value);
}

function metricTone(label = "") {
    const text = String(label).toLowerCase();
    if (text.includes("coin")) return "gold";
    if (text.includes("cell")) return "good";
    if (text.includes("wave")) return "info";
    return "neutral";
}

function sectionFamily(key = "") {
    const text = String(key || "").toLowerCase();
    if (text.includes("coin") || text.includes("currenc") || text.includes("econom")) return "Economy";
    if (text.includes("damage") || text.includes("destroyed")) return "Damage";
    if (text.includes("health") || text.includes("block") || text.includes("survival")) return "Survival";
    if (text.includes("enem") || text.includes("killed") || text.includes("hit")) return "Enemies";
    if (text.includes("record")) return "Records";
    return "Report Section";
}

function getRawReportText(run = {}) {
    return String(
        run?.raw?.reportText
        || run?.raw?.rawText
        || run?.rawText
        || run?.reportText
        || run?.meta?.rawText
        || run?.meta?.reportText
        || ""
    ).trim();
}

function normaliseModalInput(input = null, legacyIndex = 0) {
    if (input && typeof input === "object" && input.run) {
        return {
            run: input.run,
            index: safeInteger(input.index, 0),
            displayIndex: safeInteger(input.displayIndex, safeInteger(input.index, 0)),
            history: Array.isArray(input.history) ? input.history : [],
            visibleHistory: Array.isArray(input.visibleHistory) ? input.visibleHistory : [],
            runA: input.runA || null,
            runB: input.runB || null
        };
    }

    return {
        run: input,
        index: safeInteger(legacyIndex, 0),
        displayIndex: safeInteger(legacyIndex, 0),
        history: input ? [input] : [],
        visibleHistory: input ? [input] : [],
        runA: null,
        runB: null
    };
}

function safeInteger(value, fallback = 0) {
    const num = Number(value);
    return Number.isInteger(num) ? num : fallback;
}
