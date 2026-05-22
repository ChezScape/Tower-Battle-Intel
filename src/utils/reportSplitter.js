"use strict";

/**
 * REPORT SPLITTER v4.10b
 * Handles pasted input containing one or more Battle Reports.
 */

const REPORT_MARKER = "Battle Report";

export function splitBattleReports(rawText = "") {
    const text = normaliseLineEndings(rawText).trim();

    if (!text) {
        return [];
    }

    const starts = findReportStarts(text);

    if (!starts.length) {
        return [text];
    }

    return starts
        .map((start, index) => {
            const end = starts[index + 1] ?? text.length;
            return text.slice(start, end).trim();
        })
        .filter(Boolean);
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
    getFirstBattleReport,
    hasMultipleReports,
    countBattleReports,
    fingerprintReport,
    normaliseReportText,
    normaliseLineEndings
};
