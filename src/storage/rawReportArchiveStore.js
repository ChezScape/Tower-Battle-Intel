"use strict";

/**
 * RAW REPORT ARCHIVE STORE FOUNDATION v4.11z52w16
 *
 * Raw Battle Report text is the source of truth.
 * Parsed runs are cache/working objects.
 * Archived reports can be stored as raw-only lightweight records.
 */

import { normaliseBuildStyle, normaliseTags } from "./historyStore.js";

export const RAW_REPORT_ARCHIVE_SCHEMA = "tbi.rawReports.v1";
export const RAW_REPORT_ARCHIVE_VERSION = "v4.11z52w47";
export const ACTIVE_PARSED_HISTORY_LIMIT = 100;

const MONTHS = Object.freeze({
    jan: "01",
    january: "01",
    feb: "02",
    february: "02",
    mar: "03",
    march: "03",
    apr: "04",
    april: "04",
    may: "05",
    jun: "06",
    june: "06",
    jul: "07",
    july: "07",
    aug: "08",
    august: "08",
    sep: "09",
    sept: "09",
    september: "09",
    oct: "10",
    october: "10",
    nov: "11",
    november: "11",
    dec: "12",
    december: "12"
});

export function normaliseRawReportText(rawText = "") {
    return String(rawText || "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\u00a0/g, " ")
        .trim();
}

export function normaliseRawReportForFingerprint(rawText = "") {
    return normaliseRawReportText(rawText)
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .join("\n")
        .toLowerCase();
}

export function createRawReportFingerprint(rawText = "") {
    const text = normaliseRawReportForFingerprint(rawText);
    let hashA = 2166136261;
    let hashB = 2166136261 ^ 0x9e3779b9;

    for (let index = 0; index < text.length; index += 1) {
        const code = text.charCodeAt(index);
        hashA ^= code;
        hashA = Math.imul(hashA, 16777619);
        hashB ^= code + index;
        hashB = Math.imul(hashB, 1597334677);
    }

    return `${(hashA >>> 0).toString(16).padStart(8, "0")}${(hashB >>> 0).toString(16).padStart(8, "0")}`;
}

export function createStableReportId(rawText = "", run = null) {
    const text = normaliseRawReportText(rawText);
    const summary = extractRawReportSummary(text, run);
    const dateKey = normaliseBattleDateKey(summary.battleDate || "unknown-date");
    const tierKey = normaliseIdPart(summary.tier ? `t${summary.tier}` : "tunknown");
    const waveKey = normaliseIdPart(summary.wave ? `w${summary.wave}` : "wunknown");
    const fingerprint = createRawReportFingerprint(text).slice(0, 12);

    return `rpt_${dateKey}_${tierKey}_${waveKey}_${fingerprint}`;
}

export function extractRawReportSummary(rawText = "", run = null) {
    const core = run?.core || run || {};

    return {
        battleDate: core.battleDate || core.battle_date || getLineValue(rawText, "Battle Date") || null,
        tier: firstNumber(core.tier, getLineValue(rawText, "Tier")),
        wave: firstNumber(core.wave, getLineValue(rawText, "Wave")),
        killedBy: core.killedBy || core.killed_by || getLineValue(rawText, "Killed By") || null
    };
}

export function extractRawTextFromRun(run = null) {
    if (!run || typeof run !== "object") return "";

    const candidates = [
        run.rawText,
        run.rawReportText,
        run.reportText,
        run.battleReportText,
        run.raw?.reportText,
        run.raw?.rawText,
        run.raw?.battleReportText,
        run.meta?.rawText,
        run.meta?.rawReportText,
        run.meta?.reportText,
        run.source?.rawText,
        run.source?.reportText
    ];

    for (const candidate of candidates) {
        const text = normaliseRawReportText(candidate || "");
        if (looksLikeBattleReport(text)) return text;
    }

    return "";
}

export function looksLikeBattleReport(rawText = "") {
    const text = normaliseRawReportText(rawText);
    if (text.length < 20) return false;
    const lower = text.toLowerCase();
    return lower.includes("battle report")
        || lower.includes("battle date")
        || (lower.includes("tier") && lower.includes("wave"));
}

export function normaliseUserMeta(input = {}) {
    const source = input?.userMeta || input?.meta || input || {};
    const runType = normaliseRunType(source.runType || source.type || source.manualRunType || "normal");
    const manualMarkers = normaliseManualMarkers(source.manualMarkers || source.markers || source.sourceMarkers || []);

    return {
        tags: normaliseTags(source.tags),
        notes: String(source.notes || ""),
        buildStyle: normaliseBuildStyle(source.buildStyle || source.build || "unknown"),
        pinned: Boolean(source.pinned || source.favourite || source.favorite),
        archived: Boolean(source.archived),
        archivedAt: source.archivedAt || null,
        runType,
        sourceMarker: String(source.sourceMarker || manualMarkers[0] || "").trim(),
        manualMarkers
    };
}

export function createRawReportRecord(input = {}, options = {}) {
    const rawText = normaliseRawReportText(options.rawText || extractRawTextFromRun(input) || input.rawText || "");

    if (!looksLikeBattleReport(rawText)) {
        return null;
    }

    const summary = {
        ...extractRawReportSummary(rawText, input),
        ...(options.summary || {})
    };
    const fingerprint = createRawReportFingerprint(rawText);
    const stableReportId = createStableReportId(rawText, summary);
    const reportId = cleanId(options.reportId || stableReportId || getRunReportId(input));
    const userMeta = normaliseUserMeta({
        ...(input?.meta || {}),
        ...(input?.userMeta || {}),
        ...(options.userMeta || {})
    });

    return {
        reportId,
        fingerprint,
        schema: RAW_REPORT_ARCHIVE_SCHEMA,
        summary,
        userMeta,
        rawText,
        createdAt: input?.meta?.savedAt || input?.createdAt || options.createdAt || new Date().toISOString(),
        lastImportedAt: options.lastImportedAt || input?.lastImportedAt || null,
        lastParsedAt: input?.meta?.lastParsedAt || input?.lastParsedAt || null,
        parseVersion: input?.meta?.parseVersion || null,
        gameCatalogueVersion: input?.meta?.gameCatalogueVersion || null,
        legacyIds: normaliseLegacyIds(input, reportId)
    };
}

export function attachRawArchiveMetaToRun(run = null, rawText = "", options = {}) {
    if (!run || typeof run !== "object") return run;

    const text = normaliseRawReportText(rawText || extractRawTextFromRun(run));
    if (!looksLikeBattleReport(text)) return run;

    const record = createRawReportRecord(run, {
        ...options,
        rawText: text
    });

    if (!record) return run;

    return {
        ...run,
        meta: {
            ...(run.meta || {}),
            reportId: record.reportId,
            fingerprint: record.fingerprint,
            rawArchiveSchema: RAW_REPORT_ARCHIVE_SCHEMA,
            rawArchiveVersion: RAW_REPORT_ARCHIVE_VERSION,
            savedAt: run.meta?.savedAt || new Date().toISOString(),
            archived: Boolean(run.meta?.archived),
            notes: String(run.meta?.notes || ""),
            tags: normaliseTags(run.meta?.tags),
            buildStyle: normaliseBuildStyle(run.meta?.buildStyle || run.meta?.build || options.buildStyle || "unknown")
        },
        raw: {
            ...(run.raw || {}),
            reportText: text
        }
    };
}

export function canShrinkRunToRaw(run = null) {
    return Boolean(createRawReportRecord(run));
}

export function normaliseRawReportRecord(record = null) {
    if (!record || typeof record !== "object") return null;

    const rawText = normaliseRawReportText(record.rawText || "");
    if (!looksLikeBattleReport(rawText)) return null;

    const summary = {
        ...extractRawReportSummary(rawText, record.summary || {}),
        ...(record.summary || {})
    };
    const fingerprint = record.fingerprint || createRawReportFingerprint(rawText);
    const stableReportId = createStableReportId(rawText, summary);
    const reportId = cleanId(stableReportId || record.reportId);

    return {
        reportId,
        fingerprint,
        schema: RAW_REPORT_ARCHIVE_SCHEMA,
        summary,
        userMeta: normaliseUserMeta(record.userMeta || {}),
        rawText,
        createdAt: record.createdAt || new Date().toISOString(),
        lastImportedAt: record.lastImportedAt || null,
        lastParsedAt: record.lastParsedAt || null,
        parseVersion: record.parseVersion || null,
        gameCatalogueVersion: record.gameCatalogueVersion || null,
        legacyIds: normaliseLegacyIds(record, reportId)
    };
}

export function normaliseRawArchive(rawArchive = null) {
    const sourceReports = Array.isArray(rawArchive?.reports)
        ? rawArchive.reports
        : Array.isArray(rawArchive?.records)
            ? rawArchive.records
            : Array.isArray(rawArchive)
                ? rawArchive
                : [];

    const merged = upsertRawReportRecords([], sourceReports);

    return {
        schema: RAW_REPORT_ARCHIVE_SCHEMA,
        version: RAW_REPORT_ARCHIVE_VERSION,
        activeParsedHistoryLimit: ACTIVE_PARSED_HISTORY_LIMIT,
        reportCount: merged.length,
        reports: merged
    };
}

export function buildRawArchiveFromRuns(runs = [], existingArchive = null) {
    const existing = normaliseRawArchive(existingArchive).reports;
    const records = Array.isArray(runs)
        ? runs.map(run => createRawReportRecord(run)).filter(Boolean)
        : [];

    const merged = upsertRawReportRecords(existing, records);

    return {
        schema: RAW_REPORT_ARCHIVE_SCHEMA,
        version: RAW_REPORT_ARCHIVE_VERSION,
        activeParsedHistoryLimit: ACTIVE_PARSED_HISTORY_LIMIT,
        reportCount: merged.length,
        reports: merged
    };
}

export function upsertRawReportRecords(existing = [], incoming = []) {
    const map = new Map();

    for (const item of [...normaliseRecordList(existing), ...normaliseRecordList(incoming)]) {
        const key = item.reportId || item.fingerprint;
        const previous = map.get(key);
        map.set(key, previous ? mergeRawReportRecords(previous, item) : item);
    }

    return Array.from(map.values());
}

export function mergeRawReportRecords(existing = {}, incoming = {}) {
    const existingMeta = normaliseUserMeta(existing.userMeta || {});
    const incomingMeta = normaliseUserMeta(incoming.userMeta || {});

    return {
        ...incoming,
        ...existing,
        summary: {
            ...(incoming.summary || {}),
            ...(existing.summary || {})
        },
        rawText: existing.rawText || incoming.rawText || "",
        fingerprint: existing.fingerprint || incoming.fingerprint || "",
        reportId: existing.reportId || incoming.reportId || "",
        userMeta: {
            tags: existingMeta.tags.length ? existingMeta.tags : incomingMeta.tags,
            notes: existingMeta.notes || incomingMeta.notes || "",
            buildStyle: existingMeta.buildStyle !== "unknown" ? existingMeta.buildStyle : incomingMeta.buildStyle,
            pinned: Boolean(existingMeta.pinned || incomingMeta.pinned),
            archived: Boolean(existingMeta.archived || incomingMeta.archived),
            archivedAt: existingMeta.archivedAt || incomingMeta.archivedAt || null,
            runType: existingMeta.runType !== "normal" ? existingMeta.runType : incomingMeta.runType,
            sourceMarker: existingMeta.sourceMarker || incomingMeta.sourceMarker || "",
            manualMarkers: existingMeta.manualMarkers.length ? existingMeta.manualMarkers : incomingMeta.manualMarkers
        },
        legacyIds: Array.from(new Set([...(existing.legacyIds || []), ...(incoming.legacyIds || [])].filter(Boolean)))
    };
}


export function patchRawReportRecordUserMeta(rawArchive = null, identity = null, metaPatch = {}) {
    const archive = normaliseRawArchive(rawArchive);
    const targetId = cleanId(
        typeof identity === "string"
            ? identity
            : identity?.reportId || identity?.id || identity?.meta?.reportId || identity?.meta?.id || ""
    );
    const targetFingerprint = String(
        identity?.fingerprint || identity?.meta?.fingerprint || createRawReportRecord(identity)?.fingerprint || ""
    ).trim();

    const reports = archive.reports.map(record => {
        const sameId = targetId && record.reportId === targetId;
        const sameFingerprint = targetFingerprint && record.fingerprint === targetFingerprint;

        if (!sameId && !sameFingerprint) {
            return record;
        }

        return {
            ...record,
            userMeta: normaliseUserMeta({
                ...(record.userMeta || {}),
                ...(metaPatch || {})
            })
        };
    });

    return {
        ...archive,
        reportCount: reports.length,
        reports
    };
}

export function getRunReportId(run = null) {
    return cleanId(run?.reportId || run?.id || run?.meta?.reportId || run?.meta?.id || "");
}

export function sameRawReportIdentity(a = null, b = null) {
    if (!a || !b) return false;

    const idA = getRunReportId(a) || a.reportId || "";
    const idB = getRunReportId(b) || b.reportId || "";

    if (idA && idB) return idA === idB;

    const fpA = a.fingerprint || a.meta?.fingerprint || createRawReportRecord(a)?.fingerprint || "";
    const fpB = b.fingerprint || b.meta?.fingerprint || createRawReportRecord(b)?.fingerprint || "";

    return Boolean(fpA && fpB && fpA === fpB);
}

export function createRawArchiveSummary(rawArchive = null) {
    const archive = normaliseRawArchive(rawArchive);
    const archived = archive.reports.filter(report => report.userMeta?.archived).length;
    const pinned = archive.reports.filter(report => report.userMeta?.pinned).length;

    return {
        schema: archive.schema,
        version: archive.version,
        reportCount: archive.reportCount,
        archived,
        active: archive.reportCount - archived,
        pinned,
        activeParsedHistoryLimit: archive.activeParsedHistoryLimit
    };
}

export function getRawReportArchiveStoreStatus() {
    return {
        version: RAW_REPORT_ARCHIVE_VERSION,
        owner: "src/storage/rawReportArchiveStore.js",
        schema: RAW_REPORT_ARCHIVE_SCHEMA,
        activeParsedHistoryLimit: ACTIVE_PARSED_HISTORY_LIMIT,
        owns: [
            "raw report source-of-truth records",
            "stable reportId generation",
            "raw fingerprinting",
            "raw archive de-duplication",
            "History user metadata shape",
            "raw-only archive foundation",
            "History metadata sync into raw archive records"
        ]
    };
}


function normaliseRunType(value = "normal") {
    const text = String(value || "normal").trim().toLowerCase().replace(/[\s_-]+/g, "_");
    if (["tournament", "farming", "milestone", "event", "test"].includes(text)) return text;
    return "normal";
}

function normaliseManualMarkers(values = []) {
    const list = Array.isArray(values) ? values : [values];
    return Array.from(new Set(list
        .map(value => String(value || "").trim().toLowerCase())
        .filter(Boolean)));
}

function normaliseRecordList(list = []) {
    return (Array.isArray(list) ? list : [])
        .map(item => normaliseRawReportRecord(item))
        .filter(Boolean);
}

function normaliseLegacyIds(input = {}, canonicalId = "") {
    const ids = [
        canonicalId,
        input.reportId,
        input.id,
        input.meta?.reportId,
        input.meta?.id,
        ...(Array.isArray(input.legacyIds) ? input.legacyIds : [])
    ];

    return Array.from(new Set(ids.map(cleanId).filter(Boolean)));
}

function getLineValue(rawText = "", label = "") {
    const escaped = String(label).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tabPattern = new RegExp(`^\\s*${escaped}\\s*\\t\\s*(.+?)\\s*$`, "im");
    const tabMatch = String(rawText || "").match(tabPattern);
    if (tabMatch) return tabMatch[1].trim();

    const colonPattern = new RegExp(`^\\s*${escaped}\\s*:\\s*(.+?)\\s*$`, "im");
    const colonMatch = String(rawText || "").match(colonPattern);
    return colonMatch ? colonMatch[1].trim() : "";
}

function firstNumber(...values) {
    for (const value of values) {
        if (value == null || value === "") continue;
        const number = Number(String(value).replace(/,/g, "").trim());
        if (Number.isFinite(number)) return Math.round(number);
    }

    return null;
}

function normaliseBattleDateKey(value = "") {
    const text = String(value || "").trim();
    const match = text.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})/);

    if (match) {
        const month = MONTHS[match[1].toLowerCase()] || "00";
        return `${match[3]}${month}${match[2].padStart(2, "0")}_${match[4].padStart(2, "0")}${match[5]}`;
    }

    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
    if (iso) {
        return `${iso[1]}${iso[2]}${iso[3]}_${iso[4]}${iso[5]}`;
    }

    return normaliseIdPart(text || "unknown-date").slice(0, 24) || "unknown-date";
}

function normaliseIdPart(value = "") {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "unknown";
}

function cleanId(value = "") {
    return String(value || "").trim();
}

export default {
    RAW_REPORT_ARCHIVE_SCHEMA,
    RAW_REPORT_ARCHIVE_VERSION,
    ACTIVE_PARSED_HISTORY_LIMIT,
    normaliseRawReportText,
    normaliseRawReportForFingerprint,
    createRawReportFingerprint,
    createStableReportId,
    extractRawReportSummary,
    extractRawTextFromRun,
    looksLikeBattleReport,
    normaliseUserMeta,
    createRawReportRecord,
    attachRawArchiveMetaToRun,
    canShrinkRunToRaw,
    normaliseRawReportRecord,
    normaliseRawArchive,
    buildRawArchiveFromRuns,
    upsertRawReportRecords,
    mergeRawReportRecords,
    getRunReportId,
    sameRawReportIdentity,
    patchRawReportRecordUserMeta,
    createRawArchiveSummary,
    getRawReportArchiveStoreStatus
};
