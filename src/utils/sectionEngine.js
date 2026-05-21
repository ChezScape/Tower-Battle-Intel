"use strict";

import {
    getKnownSectionHeaders,
    getKnownBattleReportLabels,
    normaliseReportSection,
    normaliseReportKey
} from "../game/battleReportAliases.js";

/**
 * SECTION ENGINE
 *
 * Builds section data from The Tower battle reports.
 *
 * Supports:
 * - Tab-separated reports
 * - 2+ space separated reports
 * - Single-space copied reports
 */

const SECTION_HEADERS = new Set(getKnownSectionHeaders());

export function buildSections(lines = []) {

    const sections = {};

    let currentSection =
        "core";

    sections[currentSection] =
        {};

    for (const line of lines) {

        const trimmed =
            String(line || "").trim();

        if (!trimmed) {
            continue;
        }

        if (trimmed === "Battle Report") {
            continue;
        }

        if (SECTION_HEADERS.has(trimmed)) {

            currentSection =
                normaliseSectionName(trimmed);

            if (!sections[currentSection]) {
                sections[currentSection] = {};
            }

            continue;
        }

        const pair =
            splitSectionLine(trimmed);

        if (!pair) {
            continue;
        }

        const key =
            normaliseKey(pair.key);

        sections[currentSection][key] =
            pair.value;
    }

    return sections;
}

/* --------------------------------------------------
   SECTION LINE SPLITTER
-------------------------------------------------- */

function splitSectionLine(line = "") {

    const clean =
        String(line || "").trim();

    if (!clean) {
        return null;
    }

    /*
       Best case:
       Official reports often use tabs.
    */
    let parts =
        clean.split(/\t+/);

    if (parts.length >= 2) {
        return {
            key:
                parts[0].trim(),

            value:
                parts
                    .slice(1)
                    .join(" ")
                    .trim()
        };
    }

    /*
       Second case:
       Some copied reports keep 2+ spaces.
    */
    parts =
        clean.split(/\s{2,}/);

    if (parts.length >= 2) {
        return {
            key:
                parts[0].trim(),

            value:
                parts
                    .slice(1)
                    .join(" ")
                    .trim()
        };
    }

    /*
       Fallback:
       Some reports lose tabs completely:
       "Damage Dealt 37.17aa"
       "Coins Earned 542.11T"
       "Enemy Attack Levels Skipped 5095"
    */
    const labels =
        getKnownSectionLabels();

    for (const label of labels) {

        const prefix =
            `${label} `;

        if (clean.startsWith(prefix)) {

            const value =
                clean
                    .slice(prefix.length)
                    .trim();

            if (!value) {
                return null;
            }

            return {
                key:
                    label,

                value
            };
        }
    }

    return null;
}

/* --------------------------------------------------
   KNOWN LABELS
-------------------------------------------------- */

function getKnownSectionLabels() {

    return getKnownBattleReportLabels();
}

/* --------------------------------------------------
   NORMALISE
-------------------------------------------------- */

function normaliseSectionName(value = "") {
    return normaliseReportSection(value);
}

function normaliseKey(value = "") {
    return normaliseReportKey(value);
}