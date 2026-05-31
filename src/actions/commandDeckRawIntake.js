"use strict";

/**
 * COMMAND DECK RAW INTAKE v4.11z52w16
 *
 * Pure Command Deck intake planner. No DOM, no rendering and no storage writes.
 * It decides which pasted Battle Reports are new raw source records before
 * commandDeckReportActions.js asks the parser/History cache to rebuild them.
 */

import { splitBattleReportEntries, splitBattleReports } from "../utils/reportSplitter.js";
import {
    createRawReportRecord,
    normaliseRawArchive,
    upsertRawReportRecords
} from "../storage/rawReportArchiveStore.js";

export const COMMAND_DECK_RAW_INTAKE_VERSION = "v4.11z52w47";
export const COMMAND_DECK_RAW_INTAKE_LIMIT = 50;

export function buildCommandDeckRawIntakePlan(rawText = "", state = {}) {
    const text = String(rawText || "").trim();
    const reportEntries = splitBattleReportEntries(text).slice(0, COMMAND_DECK_RAW_INTAKE_LIMIT);
    const reportTexts = reportEntries.map(entry => entry.rawText);
    const rawArchive = normaliseRawArchive(state?.rawArchive || state?.rawReportArchive || null);
    const existing = collectExistingRawIdentities(state, rawArchive);
    const seenBatchIds = new Set();
    const seenBatchFingerprints = new Set();
    const newRecords = [];
    const duplicateRecords = [];
    const invalidReports = [];

    reportTexts.forEach((reportText, index) => {
        const entry = reportEntries[index] || { rawText: reportText, markers: [], runType: "normal" };
        const markerMeta = buildManualMarkerMeta(entry);
        const record = createRawReportRecord({ rawText: reportText }, {
            rawText: reportText,
            createdAt: new Date().toISOString(),
            summary: {
                isTournament: markerMeta.runType === "tournament" || undefined
            },
            userMeta: markerMeta
        });

        if (!record) {
            invalidReports.push({ index, rawText: reportText });
            return;
        }

        const duplicate = isExistingRawRecord(record, existing)
            || seenBatchIds.has(record.reportId)
            || seenBatchFingerprints.has(record.fingerprint);

        seenBatchIds.add(record.reportId);
        seenBatchFingerprints.add(record.fingerprint);

        const decorated = {
            ...record,
            sourceIndex: index,
            rawText: reportText,
            markers: markerMeta.manualMarkers,
            runType: markerMeta.runType
        };

        if (duplicate) {
            duplicateRecords.push(decorated);
        } else {
            newRecords.push(decorated);
        }
    });

    const allRecords = [...newRecords, ...duplicateRecords];

    return {
        version: COMMAND_DECK_RAW_INTAKE_VERSION,
        sourceText: text,
        reportTexts,
        reportEntries,
        rawArchive,
        candidateRecords: allRecords,
        candidateIds: unique(allRecords.map(record => record.reportId)),
        candidateFingerprints: unique(allRecords.map(record => record.fingerprint)),
        newRecords,
        duplicateRecords,
        invalidReports,
        newIds: unique(newRecords.map(record => record.reportId)),
        duplicateIds: unique(duplicateRecords.map(record => record.reportId)),
        reportCount: reportTexts.length,
        validReportCount: allRecords.length,
        invalidReportCount: invalidReports.length
    };
}

export function applyCommandDeckRawArchivePlan(plan = {}, state = {}) {
    const rawArchive = normaliseRawArchive(state?.rawArchive || state?.rawReportArchive || plan.rawArchive || null);
    const incoming = Array.isArray(plan.newRecords) ? plan.newRecords : [];
    const reports = upsertRawReportRecords(rawArchive.reports, incoming);

    return {
        ...rawArchive,
        version: COMMAND_DECK_RAW_INTAKE_VERSION,
        reportCount: reports.length,
        reports
    };
}

export function joinCommandDeckRawReports(records = []) {
    return (Array.isArray(records) ? records : [])
        .map(record => String(record?.rawText || "").trim())
        .filter(Boolean)
        .join("\n\n");
}

export function describeCommandDeckRawRecord(record = null) {
    if (!record) return "Unknown report";

    const summary = record.summary || {};
    const parts = [];

    if (summary.battleDate) parts.push(String(summary.battleDate));
    if (summary.tier || summary.wave) parts.push(`T${summary.tier || "?"} / Wave ${formatRawWaveForCommand(summary.wave)}`);
    if (summary.killedBy) parts.push(`Killed By ${summary.killedBy}`);

    return parts.length ? parts.join(" · ") : (record.reportId || "Unknown report");
}

export function getCommandDeckRawIntakeStatus() {
    return {
        version: COMMAND_DECK_RAW_INTAKE_VERSION,
        owner: "src/actions/commandDeckRawIntake.js",
        owns: [
            "Command Deck raw intake planning",
            "raw archive duplicate checks before parse/save",
            "stable reportId candidate lists",
            "batch new-vs-duplicate split",
            "clean batch separator stripping",
            "manual run marker metadata such as Tournament--"
        ]
    };
}


function buildManualMarkerMeta(entry = {}) {
    const manualMarkers = Array.from(new Set((Array.isArray(entry.markers) ? entry.markers : [])
        .map(value => String(value || "").trim().toLowerCase())
        .filter(Boolean)));
    const runType = ["tournament", "farming", "milestone", "event", "test"].includes(entry.runType)
        ? entry.runType
        : (manualMarkers.includes("tournament") ? "tournament" : "normal");

    return {
        runType,
        manualMarkers,
        sourceMarker: manualMarkers[0] || ""
    };
}

function collectExistingRawIdentities(state = {}, rawArchive = null) {
    const archive = normaliseRawArchive(rawArchive || state?.rawArchive || state?.rawReportArchive || null);
    const reportIds = new Set();
    const fingerprints = new Set();

    archive.reports.forEach(record => addIdentity(record, reportIds, fingerprints));

    const history = Array.isArray(state?.history) ? state.history : [];
    [state?.runA, state?.runB, state?.currentRun, ...history]
        .filter(Boolean)
        .forEach(run => {
            addIdentity(run, reportIds, fingerprints);
            const record = createRawReportRecord(run);
            addIdentity(record, reportIds, fingerprints);
        });

    return { reportIds, fingerprints };
}

function addIdentity(item = null, reportIds, fingerprints) {
    if (!item || typeof item !== "object") return;

    const reportId = item.reportId || item.id || item.meta?.reportId || item.meta?.id || "";
    const fingerprint = item.fingerprint || item.meta?.fingerprint || "";

    if (reportId) reportIds.add(String(reportId));
    if (fingerprint) fingerprints.add(String(fingerprint));
}

function isExistingRawRecord(record = null, existing = {}) {
    if (!record) return false;
    return Boolean(
        (record.reportId && existing.reportIds?.has(String(record.reportId)))
        || (record.fingerprint && existing.fingerprints?.has(String(record.fingerprint)))
    );
}

function unique(values = []) {
    return Array.from(new Set((Array.isArray(values) ? values : []).filter(Boolean).map(String)));
}

function formatRawWaveForCommand(value = "?") {
    const number = Number(value);
    return Number.isFinite(number) ? String(Math.round(number)) : String(value || "?");
}

export default {
    COMMAND_DECK_RAW_INTAKE_VERSION,
    COMMAND_DECK_RAW_INTAKE_LIMIT,
    buildCommandDeckRawIntakePlan,
    applyCommandDeckRawArchivePlan,
    joinCommandDeckRawReports,
    describeCommandDeckRawRecord,
    getCommandDeckRawIntakeStatus
};
