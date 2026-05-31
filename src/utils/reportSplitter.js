"use strict";

/**
 * REPORT SPLITTER v4.11z52w47
 * Handles pasted input containing one or more Battle Reports.
 *
 * Batch separators such as --- are paste wrappers, not game report data.
 * Manual markers such as Tournament-- are converted into metadata for the
 * next Battle Report block instead of being stored inside raw source text.
 */

const REPORT_MARKER = "Battle Report";

export function splitBattleReports(rawText = "") {
    return splitBattleReportEntries(rawText).map(entry => entry.rawText);
}

export function splitBattleReportEntries(rawText = "") {
    const text = normaliseLineEndings(rawText).trim();

    if (!text) {
        return [];
    }

    const starts = findReportStarts(text);

    if (!starts.length) {
        const cleaned = cleanBattleReportBlock(text);
        return cleaned.rawText ? [{
            rawText: cleaned.rawText,
            markers: detectManualMarkers(text),
            runType: runTypeFromMarkers(detectManualMarkers(text)),
            sourcePrelude: ""
        }] : [];
    }

    const entries = [];
    let pendingMarkers = detectManualMarkers(text.slice(0, starts[0]));

    starts.forEach((start, index) => {
        const end = starts[index + 1] ?? text.length;
        const slice = text.slice(start, end);
        const cleaned = cleanBattleReportBlock(slice);
        const markers = uniqueMarkers(pendingMarkers);

        if (cleaned.rawText) {
            entries.push({
                rawText: cleaned.rawText,
                markers,
                runType: runTypeFromMarkers(markers),
                sourcePrelude: cleaned.removedTrailer.join("\n")
            });
        }

        pendingMarkers = cleaned.nextMarkers;
    });

    return entries;
}

export function getFirstBattleReport(rawText = "") {
    return splitBattleReports(rawText)[0] || "";
}

export function hasMultipleReports(rawText = "") {
    return splitBattleReports(rawText).length > 1;
}

export function countBattleReports(rawText = "") {
    return splitBattleReports(rawText).length;
}

export function fingerprintReport(rawText = "") {
    return hashString(normaliseReportText(rawText));
}

export function normaliseReportText(rawText = "") {
    return normaliseLineEndings(rawText)
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .join("\n")
        .toLowerCase();
}

export function normaliseLineEndings(rawText = "") {
    return String(rawText || "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\u00a0/g, " ");
}

export function isBatchSeparatorLine(line = "") {
    const text = String(line || "").trim();
    if (!text) return true;

    return /^(?:-{3,}|={3,}|_{3,}|\*{3,}|~{3,}|•{3,}|—{3,}|–{3,})$/.test(text);
}

export function detectManualMarkers(text = "") {
    return uniqueMarkers(
        normaliseLineEndings(text)
            .split("\n")
            .map(line => normaliseManualMarker(line))
            .filter(Boolean)
    );
}

function cleanBattleReportBlock(block = "") {
    const lines = normaliseLineEndings(block).split("\n");
    const removedTrailer = [];
    const nextMarkers = [];

    while (lines.length) {
        const line = lines[lines.length - 1];
        const marker = normaliseManualMarker(line);

        if (marker) {
            removedTrailer.unshift(line);
            nextMarkers.unshift(marker);
            lines.pop();
            continue;
        }

        if (isBatchSeparatorLine(line)) {
            removedTrailer.unshift(line);
            lines.pop();
            continue;
        }

        break;
    }

    const rawText = lines.join("\n").trim();

    return {
        rawText,
        nextMarkers: uniqueMarkers(nextMarkers),
        removedTrailer
    };
}

function normaliseManualMarker(line = "") {
    const text = String(line || "").trim().toLowerCase().replace(/[:\-\s]+$/g, "");

    if (!text) return "";
    if (["tournament", "tourny", "tourney"].includes(text)) return "tournament";
    if (["farming", "farm"].includes(text)) return "farming";
    if (text === "milestone") return "milestone";
    if (text === "test") return "test";
    if (["event", "mission"].includes(text)) return "event";

    return "";
}

function runTypeFromMarkers(markers = []) {
    const list = uniqueMarkers(markers);
    if (list.includes("tournament")) return "tournament";
    if (list.includes("farming")) return "farming";
    if (list.includes("milestone")) return "milestone";
    if (list.includes("event")) return "event";
    if (list.includes("test")) return "test";
    return "normal";
}

function uniqueMarkers(values = []) {
    return Array.from(new Set((Array.isArray(values) ? values : [])
        .map(value => String(value || "").trim().toLowerCase())
        .filter(Boolean)));
}

function findReportStarts(text = "") {
    const starts = [];
    const regex = new RegExp(`(^|\\n)\\s*${REPORT_MARKER}\\b`, "gi");
    let match;

    while ((match = regex.exec(text)) !== null) {
        const offset = match[1] === "\n" ? 1 : 0;
        starts.push(match.index + offset);
    }

    return starts;
}

function hashString(input = "") {
    let hash = 2166136261;

    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    return `report_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export default {
    splitBattleReports,
    splitBattleReportEntries,
    getFirstBattleReport,
    hasMultipleReports,
    countBattleReports,
    fingerprintReport,
    normaliseReportText,
    normaliseLineEndings,
    isBatchSeparatorLine,
    detectManualMarkers
};
