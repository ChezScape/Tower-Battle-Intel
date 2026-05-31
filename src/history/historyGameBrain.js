"use strict";

/**
 * HISTORY GAME BRAIN HELPERS v4.11z52
 *
 * Read-only History helpers that make saved Battle Reports easier to search,
 * group, and skim using the official/source-labelled Game Brain feedback.
 * No Dashboard, Compare, mobile, or hidden formula logic is changed here.
 */

import {
    buildRunGameBrainSummary
} from "../game/gameBrainRuntimeFeedback.js";

const MAX_SEARCH_PREVIEW = 28;

export function buildHistoryRunGameBrainSummary(run = null) {
    if (!run) {
        return emptyRunSummary();
    }

    const hasSavedFeedback = Boolean(run?.meta?.gameBrainFeedback);
    const summary = buildRunGameBrainSummary(run);
    const feedback = run?.meta?.gameBrainFeedback || null;
    const readable = summary?.readableSummary || {};
    const milestone = summary?.milestone || feedback?.milestone || null;
    const killedByContext = summary?.killedByContext || feedback?.killedBy || null;
    const coverage = summary?.labelCoverage || feedback?.labelCoverage || {};

    return {
        available: Boolean(summary?.available),
        hasSavedFeedback,
        reportId: summary?.reportId || run?.meta?.reportId || null,
        battleDate: summary?.battleDate || run?.core?.battleDate || null,
        tier: summary?.tier ?? run?.core?.tier ?? null,
        wave: summary?.wave ?? run?.core?.wave ?? null,
        killedBy: summary?.killedBy || run?.core?.killedBy || "",
        killedByLabel: killedByContext?.label || summary?.killedBy || run?.core?.killedBy || "",
        killedByFamily: killedByContext?.family || "",
        killedByMeaning: killedByContext?.meaning || "",
        nextCheckpoint: milestone?.ok ? milestone.nextCheckpoint : null,
        previousCheckpoint: milestone?.ok ? milestone.previousCheckpoint : null,
        remainingToNextCheckpoint: milestone?.ok ? milestone.remainingToNextCheckpoint : null,
        bandLabel: milestone?.band?.label || "",
        bandTone: milestone?.band?.tone || "info",
        officialLabels: Number(coverage.knownOfficialLabels || 0),
        totalLabels: Number(coverage.totalLabels || 0),
        schemaMappedLabels: Number(coverage.schemaMappedLabels || 0),
        parserKnownLabels: Number(coverage.parserKnownLabels || 0),
        schemaReviewLabels: Number(coverage.schemaReviewLabels || 0),
        unknownLabels: Number(coverage.unknownLabels || 0),
        coveragePercent: Number(coverage.coveragePercent || 0),
        warningCount: Number(summary?.warningCount || 0),
        warnings: Array.isArray(summary?.warnings) ? summary.warnings.slice(0, 8) : [],
        readableSummary: readable,
        searchText: buildGameBrainHistorySearchText(run)
    };
}

export function buildHistoryGameBrainInsights(history = []) {
    const runs = Array.isArray(history) ? history.filter(Boolean) : [];
    const summaries = runs.map(run => buildHistoryRunGameBrainSummary(run));
    const active = summaries.filter(item => item.available);
    const withFeedback = active.filter(item => item.hasSavedFeedback).length;
    const unknownLabelsTotal = active.reduce((sum, item) => sum + Number(item.unknownLabels || 0), 0);
    const warningTotal = active.reduce((sum, item) => sum + Number(item.warningCount || 0), 0);

    const killedByCounts = countBy(active.map(item => item.killedByLabel || item.killedBy || "Unknown"));
    const checkpointCounts = countBy(active.map(item => item.nextCheckpoint ? `Wave ${item.nextCheckpoint}` : "No checkpoint"));
    const bandCounts = countBy(active.map(item => item.bandLabel || "Unbanded"));
    const familyCounts = countBy(active.map(item => item.killedByFamily || "Run context"));

    const topKilledBy = topCount(killedByCounts);
    const topCheckpoint = topCount(checkpointCounts);
    const topBand = topCount(bandCounts);
    const topFamily = topCount(familyCounts);
    const deathFamilyDetails = buildDeathFamilyDetails(active);

    return {
        ok: runs.length > 0,
        count: runs.length,
        withGameBrainFeedback: withFeedback,
        withoutGameBrainFeedback: Math.max(0, active.length - withFeedback),
        unknownLabelsTotal,
        warningTotal,
        topKilledBy,
        topCheckpoint,
        topBand,
        topFamily,
        deathFamilyDetails,
        killedByCounts,
        checkpointCounts,
        bandCounts,
        familyCounts,
        searchHints: buildSearchHints({ topKilledBy, topCheckpoint, topBand, topFamily, unknownLabelsTotal }),
        note: active.length && withFeedback < active.length
            ? "Some older saved runs may need re-importing before they carry saved Game Brain feedback. History can still build a live read-only summary for display/search."
            : "History Game Brain feedback is available for the visible saved runs."
    };
}

export function buildGameBrainHistorySearchText(run = null, index = 0) {
    if (!run) return "";

    const core = run.core || {};
    const meta = run.meta || {};
    const stats = run.stats || {};
    const feedback = meta.gameBrainFeedback || {};
    const readable = feedback.readableSummary || {};
    const milestone = feedback.milestone || {};
    const killedBy = feedback.killedBy || {};
    const coverage = feedback.labelCoverage || {};
    const officialFields = feedback.officialFields || {};

    const knownPreview = Array.isArray(officialFields.knownPreview) ? officialFields.knownPreview : [];
    const unknownPreview = Array.isArray(officialFields.unknownPreview) ? officialFields.unknownPreview : [];
    const quickFacts = Array.isArray(readable.quickFacts) ? readable.quickFacts : [];
    const summaryLines = Array.isArray(readable.summaryLines) ? readable.summaryLines : [];
    const warnings = Array.isArray(feedback.warnings) ? feedback.warnings : [];

    const parts = [
        `run ${Number(index || 0) + 1}`,
        core.battleDate,
        core.tier ? `tier ${core.tier}` : "",
        core.wave ? `wave ${core.wave}` : "",
        core.killedBy ? `killed by ${core.killedBy}` : "",
        core.coins,
        core.cells,
        stats.coinsPerHour,
        stats.cellsPerHour,
        meta.reportId,
        meta.buildStyle,
        meta.build,
        meta.notes,
        Array.isArray(meta.tags) ? meta.tags.join(" ") : meta.tags,
        readable.headline,
        ...summaryLines,
        ...quickFacts.flatMap(fact => [fact.label, fact.value, fact.tone]),
        killedBy.label,
        killedBy.family,
        killedBy.meaning,
        Array.isArray(killedBy.tags) ? killedBy.tags.join(" ") : "",
        milestone?.nextCheckpoint ? `next checkpoint wave ${milestone.nextCheckpoint}` : "",
        milestone?.previousCheckpoint ? `previous checkpoint wave ${milestone.previousCheckpoint}` : "",
        milestone?.remainingToNextCheckpoint != null ? `${milestone.remainingToNextCheckpoint} waves away` : "",
        milestone?.band?.label,
        milestone?.band?.tone,
        coverage.unknownLabels ? `mapping polish ${coverage.unknownLabels}` : "mapping polish none",
        coverage.knownOfficialLabels ? `official labels ${coverage.knownOfficialLabels}` : "",
        ...Object.keys(feedback.families || {}),
        ...Object.keys(feedback.sections || {}),
        ...knownPreview.slice(0, MAX_SEARCH_PREVIEW).flatMap(item => [
            item.displayLabel,
            item.rawDisplayLabel,
            item.family,
            item.section,
            item.meaning,
            item.property,
            item.key
        ]),
        ...unknownPreview.slice(0, MAX_SEARCH_PREVIEW).flatMap(item => [
            item.label,
            item.key,
            item.section
        ]),
        ...warnings
    ];

    return parts
        .filter(value => value != null && String(value).trim())
        .join(" ")
        .toLowerCase();
}

function emptyRunSummary() {
    return {
        available: false,
        hasSavedFeedback: false,
        searchText: ""
    };
}

function mergeFamilyCounts(runs = []) {
    const out = {};

    for (const run of runs) {
        const families = run?.meta?.gameBrainFeedback?.families || {};
        const topFamily = Object.entries(families)
            .filter(([key, value]) => key && Number(value || 0) > 0)
            .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0) || String(a[0]).localeCompare(String(b[0])))[0];

        if (!topFamily) continue;

        const safeKey = String(topFamily[0] || "Unmapped").trim() || "Unmapped";
        out[safeKey] = (out[safeKey] || 0) + 1;
    }

    return out;
}


function buildDeathFamilyDetails(items = []) {
    const familyMap = {};

    for (const item of Array.isArray(items) ? items : []) {
        const family = String(item?.killedByFamily || "Run context").trim() || "Run context";
        const label = String(item?.killedByLabel || item?.killedBy || "Unknown").trim() || "Unknown";

        if (!familyMap[family]) {
            familyMap[family] = {
                family,
                count: 0,
                deathCounts: {}
            };
        }

        familyMap[family].count += 1;
        familyMap[family].deathCounts[label] = (familyMap[family].deathCounts[label] || 0) + 1;
    }

    const details = {};

    Object.values(familyMap).forEach(item => {
        const deaths = Object.entries(item.deathCounts)
            .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0) || String(a[0]).localeCompare(String(b[0])));
        const labels = deaths.map(([label]) => label);
        const key = normaliseFamilyKey(item.family);
        details[key] = {
            family: item.family,
            familyLabel: formatFamilyForDisplay(item.family),
            count: item.count,
            countText: `${item.count} run${item.count === 1 ? "" : "s"}`,
            labels,
            label: formatTieLabel(labels),
            deathCounts: item.deathCounts
        };
    });

    return details;
}

function normaliseFamilyKey(value = "") {
    const text = String(value || "").toLowerCase();
    if (text.includes("elite")) return "elite";
    if (text.includes("common")) return "common";
    if (text.includes("boss")) return "boss";
    return text.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "other";
}

function formatFamilyForDisplay(value = "") {
    const text = String(value || "").trim();
    const lower = text.toLowerCase();
    if (lower.includes("elite")) return "Elite deaths";
    if (lower.includes("common")) return "Common enemies";
    if (lower.includes("boss")) return "Boss deaths";
    return text || "Run context";
}

function countBy(values = []) {
    const out = {};

    for (const value of values) {
        const key = String(value || "Unknown").trim() || "Unknown";
        out[key] = (out[key] || 0) + 1;
    }

    return out;
}

function topCount(counts = {}) {
    const entries = Object.entries(counts)
        .filter(([, value]) => Number(value || 0) > 0)
        .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0) || String(a[0]).localeCompare(String(b[0])));

    if (!entries.length) {
        return {
            label: "None yet",
            labels: [],
            count: 0,
            tied: false,
            countText: "No saved pattern yet"
        };
    }

    const topValue = Number(entries[0][1] || 0);
    const tiedEntries = entries.filter(([, value]) => Number(value || 0) === topValue);
    const labels = tiedEntries.map(([label]) => label);

    return {
        label: formatTieLabel(labels),
        labels,
        count: topValue,
        tied: labels.length > 1,
        countText: labels.length > 1
            ? `${topValue} each`
            : `${topValue} run${topValue === 1 ? "" : "s"}`
    };
}

function formatTieLabel(labels = []) {
    const safe = labels.map(value => String(value || "").trim()).filter(Boolean);
    if (!safe.length) return "None yet";
    if (safe.length <= 3) return safe.join(" + ");
    return `${safe.slice(0, 3).join(" + ")} +${safe.length - 3}`;
}

function buildSearchHints({ topKilledBy = {}, topCheckpoint = {}, topBand = {}, topFamily = {}, unknownLabelsTotal = 0 } = {}) {
    const hints = [
        topKilledBy?.count ? topKilledBy.label : "Killed By",
        topCheckpoint?.count ? topCheckpoint.label : "Wave checkpoint",
        topBand?.count ? topBand.label : "Run band",
        topFamily?.count ? topFamily.label : "Economy",
        unknownLabelsTotal ? "Mapping polish" : "recognised labels"
    ];

    return hints
        .map(value => String(value || "").trim())
        .filter(Boolean)
        .filter((value, index, list) => list.indexOf(value) === index)
        .slice(0, 6);
}

export default {
    buildHistoryRunGameBrainSummary,
    buildHistoryGameBrainInsights,
    buildGameBrainHistorySearchText
};
