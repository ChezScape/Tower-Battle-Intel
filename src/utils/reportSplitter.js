"use strict";

/**
 * REPORT SPLITTER
 * Handles pasted input containing one or more Battle Reports.
 */

/* --------------------------------------------------
   SPLIT REPORTS
-------------------------------------------------- */

export function splitBattleReports(rawText = "") {

    const text =
        String(rawText || "")
            .replace(/\r/g, "")
            .trim();

    if (!text) {
        return [];
    }

    const starts =
        [...text.matchAll(/^Battle Report\b/gmi)]
            .map(match => match.index);

    if (!starts.length) {
        return [text];
    }

    return starts
        .map((start, index) => {

            const end =
                starts[index + 1] ?? text.length;

            return text
                .slice(start, end)
                .trim();
        })
        .filter(Boolean);
}

/* --------------------------------------------------
   FIRST REPORT
-------------------------------------------------- */

export function getFirstBattleReport(rawText = "") {

    const reports =
        splitBattleReports(rawText);

    return reports[0] || "";
}

/* --------------------------------------------------
   MULTI REPORT CHECK
-------------------------------------------------- */

export function hasMultipleReports(rawText = "") {

    return splitBattleReports(rawText).length > 1;
}

/* --------------------------------------------------
   REPORT FINGERPRINT
-------------------------------------------------- */

export function fingerprintReport(rawText = "") {

    const normalised =
        normaliseReportText(rawText);

    return hashString(normalised);
}

/* --------------------------------------------------
   NORMALISE
-------------------------------------------------- */

function normaliseReportText(rawText = "") {

    return String(rawText || "")
        .replace(/\r/g, "")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .join("\n")
        .toLowerCase();
}

/* --------------------------------------------------
   HASH
-------------------------------------------------- */

function hashString(input = "") {

    let hash = 2166136261;

    for (let i = 0; i < input.length; i++) {

        hash ^= input.charCodeAt(i);

        hash = Math.imul(hash, 16777619);
    }

    return `report_${(hash >>> 0).toString(16)}`;
}
