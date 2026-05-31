"use strict";

import {
    escapeHTML,
    escapeAttr,
    formatNumber,
    formatTime,
    getRunViewModel,
    formatWaveNumber,
    shortReportId,
    metricTile,
    statusPill,
    countLabel
} from "./historyShared.js";

export function buildHistoryInspector(model = {}) {
    const { highlightedEntry = null, state = {}, insights = {} } = model;

    if (!highlightedEntry?.run) {
        return `
            <aside class="tbi-history2-inspector tbi-card" aria-label="History inspector">
                <span class="tbi-history2-kicker">Inspector</span>
                <h3>No run selected</h3>
                <p>Save a report or adjust filters. The inspector will show the current A/B context and the first visible saved report.</p>
                ${buildLibraryIntel(insights)}
            </aside>
        `;
    }

    const vm = getRunViewModel(highlightedEntry, state);
    const { core, stats, gb } = vm;
    return `
        <aside class="tbi-history2-inspector tbi-card" aria-label="Selected report inspector">
            <div class="tbi-history2-inspector-head">
                <span class="tbi-history2-kicker">Selected Report</span>
                <h3>${escapeHTML(vm.title)}</h3>
                <p>${escapeHTML(vm.tierWave)} · Killed By ${escapeHTML(vm.killedBy)}</p>
            </div>

            <div class="tbi-history2-inspector-actions">
                <button type="button" class="tbi-history2-btn slot-a ${vm.isRunA ? "active" : ""}" data-history-index="${escapeAttr(vm.index)}" data-history-slot="runA" ${vm.archived ? "disabled" : ""}>${vm.isRunA ? "Run A active" : "Load Run A"}</button>
                <button type="button" class="tbi-history2-btn slot-b ${vm.isRunB ? "active" : ""}" data-history-index="${escapeAttr(vm.index)}" data-history-slot="runB" ${vm.archived ? "disabled" : ""}>${vm.isRunB ? "Run B active" : "Load Run B"}</button>
                <button type="button" class="tbi-history2-btn" data-history-stats-index="${escapeAttr(vm.index)}" data-history-display-index="${escapeAttr(vm.displayIndex)}">Open Stats</button>
                <button type="button" class="tbi-history2-btn" data-history-edit-index="${escapeAttr(vm.index)}" data-history-display-index="${escapeAttr(vm.displayIndex)}">Edit Metadata</button>
                <button type="button" class="tbi-history2-btn is-wide" data-dashboard-tab="overview">Open Dashboard</button>
            </div>

            <div class="tbi-history2-inspector-metrics">
                ${metricTile("Wave", formatWaveNumber(core.wave || 0), "info")}
                ${metricTile("Coins", formatNumber(core.coins || 0), "gold")}
                ${metricTile("Cells", formatNumber(core.cells || 0), "good")}
                ${metricTile("Coins/h", formatNumber(stats.coinsPerHour ?? core.coinsPerHour ?? 0), "gold")}
                ${metricTile("Cells/h", formatNumber(stats.cellsPerHour ?? core.cellsPerHour ?? 0), "good")}
                ${metricTile("Real time", resolveInspectorRealTime(vm.run), "neutral")}
            </div>

            <div class="tbi-history2-inspector-proof">
                ${statusPill("Run type", vm.runTypeLabel || "Normal", vm.runType === "tournament" ? "watch" : "info")}
                ${statusPill("Source", vm.rawSource ? "Raw source linked" : "Parsed only", vm.rawSource ? "good" : "watch")}
                ${statusPill("Report ID", shortReportId(vm.reportId), vm.reportId ? "info" : "quiet")}
            </div>

            <section class="tbi-history2-run-intel" aria-label="Run intel summary">
                <span>Run Intel Summary</span>
                <div class="tbi-history2-run-intel-compact">
                    ${buildRunIntelRows(gb)}
                </div>
            </section>

            ${buildLibraryIntel(insights)}
        </aside>
    `;
}

function resolveInspectorRealTime(run = {}) {
    const core = run?.core || {};
    const stats = run?.stats || {};
    const flat = run?.flat || {};
    const sectionsCore = run?.sections?.core || {};
    const rawParsed = run?.raw?.parsed || {};
    const rawCore = rawParsed?.core || {};
    const rawFlat = rawParsed?.flat || {};

    const candidates = [
        core.realTime,
        core.real_time,
        core.timeText,
        stats.realTime,
        stats.realTimeSeconds,
        flat.real_time,
        sectionsCore.real_time,
        sectionsCore.realTime,
        rawCore.real_time,
        rawCore.realTime,
        rawFlat.real_time,
        core.time
    ];

    for (const value of candidates) {
        const formatted = formatDurationForInspector(value);
        if (formatted) return formatted;
    }

    return "-";
}

function formatDurationForInspector(value = null) {
    if (value == null || value === "") return "";
    if (typeof value === "string") {
        const text = value.trim();
        if (!text) return "";
        if (/[a-z]/i.test(text)) return text;
        const numeric = Number(text);
        return Number.isFinite(numeric) && numeric > 0 ? formatTime(numeric) : "";
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? formatTime(numeric) : "";
}

function buildRunIntelRows(gb = {}) {
    return [
        runIntelRow("Report read", buildReportReadValue(gb), buildReportReadSub(gb)),
        runIntelRow("Next target", gb.nextCheckpoint ? `Wave ${formatWaveNumber(gb.nextCheckpoint)}` : "Not available", gb.nextCheckpoint ? "Next checkpoint" : "No checkpoint"),
        runIntelRow("Run band", formatBandLabel(gb.bandLabel || ""), "Current run"),
        runIntelRow("Death pressure", gb.killedByLabel || gb.killedBy || "Unknown", "Killed by"),
        runIntelRow("Mapping", Number(gb.unknownLabels || 0) ? `${Number(gb.unknownLabels || 0)} labels` : "Clean", Number(gb.unknownLabels || 0) ? "Needs review" : "No parser work")
    ].join("");
}

function buildReportReadValue(gb = {}) {
    const recognised = Number(gb.officialLabels || 0);
    const total = Number(gb.totalLabels || 0);
    if (recognised && total) return `${recognised} / ${total} labels`;
    if (recognised) return `${recognised} labels`;
    return "Ready";
}

function buildReportReadSub(gb = {}) {
    const unknown = Number(gb.unknownLabels || 0);
    if (unknown) return `${unknown} unknown`;
    return "Recognised";
}

function runIntelRow(label = "", value = "", sub = "") {
    return `
        <div class="tbi-history2-run-intel-row">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
            <em>${escapeHTML(sub)}</em>
        </div>
    `;
}

function buildLibraryIntel(insights = {}) {
    return `
        <section class="tbi-history2-library-intel" aria-label="Library Intel">
            <span>Library Intel</span>
            <div class="tbi-history2-library-compact">
                ${intelRow("Most common deaths", insights.topKilledBy?.label || "None yet", formatInsightCount(insights.topKilledBy))}
                ${intelRow("Run band mix", formatBandLabel(insights.topBand?.label), formatInsightCount(insights.topBand))}
                ${intelRow("Death family", formatFamilyLabel(insights.topFamily?.label), formatInsightCount(insights.topFamily))}
                ${buildEliteDeathIntelRow(insights)}
                ${intelRow("Next checkpoint", insights.topCheckpoint?.label || "None yet", formatInsightCount(insights.topCheckpoint))}
            </div>
        </section>
    `;
}


function buildEliteDeathIntelRow(insights = {}) {
    const elite = insights?.deathFamilyDetails?.elite || null;
    if (!elite?.count) return "";
    return intelRow("Elite deaths", elite.label || "Elite enemies", elite.countText || countLabel(elite.count));
}

function formatBandLabel(value = "") {
    const text = String(value || "").trim();
    if (!text) return "None yet";
    if (/deep run\s*\/\s*farming endurance band/i.test(text)) return "Deep farming";
    if (/first sustained tier push/i.test(text)) return "First tier push";
    if (/mid-run pressure band/i.test(text)) return "Mid-run pressure";
    if (/long push band/i.test(text)) return "Long push";
    return text.replace(/\s+band$/i, "");
}

function formatFamilyLabel(value = "") {
    const text = String(value || "").trim();
    const lower = text.toLowerCase();
    if (lower.includes("common")) return "Common enemies";
    if (lower.includes("elite")) return "Elite enemies";
    if (lower.includes("boss")) return "Boss deaths";
    return text || "None yet";
}

function formatInsightCount(insight = {}) {
    if (insight?.countText) return insight.countText;
    return countLabel(insight?.count || 0);
}

function intelRow(label = "", value = "", sub = "") {
    return `
        <div class="tbi-history2-intel-row-small">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
            <em>${escapeHTML(sub)}</em>
        </div>
    `;
}
