"use strict";

import {
    escapeHTML,
    escapeAttr,
    formatWaveNumber,
    formatTierWave,
    statusPill,
    countLabel
} from "./historyShared.js";

export function buildHistoryHeader(model = {}) {
    const { summary = {}, rawSummary = {}, visibleEntries = [], filters = {}, insights = {}, state = {} } = model;
    const runALabel = state.runA ? formatTierWave(state.runA) : "Not set";
    const runBLabel = state.runB ? formatTierWave(state.runB) : "Not set";
    const mappingTone = Number(insights.unknownLabelsTotal || 0) > 0 ? "watch" : "good";

    return `
        <section class="tbi-history2-hero tbi-card" aria-label="History report library summary">
            <div class="tbi-history2-hero-copy">
                <span class="tbi-history2-kicker">Report Management Hub</span>
                <h2>History</h2>
                <p>Manage saved Battle Reports, inspect runs, and choose clean Run A / Run B slots for Dashboard intelligence.</p>
            </div>

            <div class="tbi-history2-trust-strip" aria-label="History source status">
                ${statusPill("Saved runs", summary.totalRuns || 0, "info")}
                ${statusPill("Visible", visibleEntries.length, "info")}
                ${statusPill("Archived", summary.archivedRuns || 0, summary.archivedRuns ? "watch" : "quiet")}
                ${statusPill("Raw sources", rawSourceStatusText(rawSummary, summary), rawSourceTone(rawSummary, summary))}
                ${statusPill("Run A", runALabel, state.runA ? "run-a" : "quiet")}
                ${statusPill("Run B", runBLabel, state.runB ? "run-b" : "quiet")}
            </div>

            <div class="tbi-history2-workflow" aria-label="History workflow">
                ${workflowStep("1", "Find", "Search and filter reports")}
                ${workflowStep("2", "Choose", "Set Run A / Run B")}
                ${workflowStep("3", "Inspect", "Stats, edit, archive")}
                ${workflowStep("4", "Protect", rawSummary.reportCount ? "Raw sources backed up" : "No raw source records yet")}
            </div>

            <div class="tbi-history2-record-strip" aria-label="History records">
                ${recordTile("Latest saved", summary.latest?.label || "None", summary.latest?.sub || "No report saved", "info")}
                ${recordTile("Best wave", summary.bestWave?.label || "None", summary.bestWave?.sub || "Save reports first", "good")}
                ${recordTile("Common deaths", insights.topKilledBy?.label || "None yet", insights.topKilledBy?.countText || countLabel(insights.topKilledBy?.count), "watch")}
                ${recordTile("Parser mapping", Number(insights.unknownLabelsTotal || 0) ? `${insights.unknownLabelsTotal} labels` : "Clean", Number(insights.unknownLabelsTotal || 0) ? "Review needed" : "No review needed", mappingTone)}
            </div>
        </section>
    `;
}

function rawSourceStatusText(rawSummary = {}, summary = {}) {
    const totalRuns = Number(summary.totalRuns || rawSummary.parsedCacheRuns || 0);
    const rawBackedRuns = Number(rawSummary.rawBackedRuns || 0);
    const reportCount = Number(rawSummary.reportCount || 0);

    if (totalRuns > 0 && rawBackedRuns > 0 && rawBackedRuns < totalRuns) {
        return `${rawBackedRuns} / ${totalRuns} source records`;
    }

    if (reportCount > 0) {
        return `${reportCount} source records`;
    }

    return "0 source records";
}

function rawSourceTone(rawSummary = {}, summary = {}) {
    const totalRuns = Number(summary.totalRuns || rawSummary.parsedCacheRuns || 0);
    const rawBackedRuns = Number(rawSummary.rawBackedRuns || 0);
    const reportCount = Number(rawSummary.reportCount || 0);

    if (totalRuns > 0 && reportCount >= totalRuns) return "good";
    if (rawBackedRuns > 0 || reportCount > 0) return "info";
    return "watch";
}

function workflowStep(number = "", label = "", detail = "") {
    return `
        <div class="tbi-history2-step">
            <b>${escapeHTML(number)}</b>
            <span>${escapeHTML(label)}</span>
            <em>${escapeHTML(detail)}</em>
        </div>
    `;
}

function recordTile(label = "", value = "", sub = "", tone = "info") {
    return `
        <div class="tbi-history2-record tone-${escapeAttr(tone)}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
            <em>${escapeHTML(sub)}</em>
        </div>
    `;
}
