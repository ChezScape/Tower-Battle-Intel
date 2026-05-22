"use strict";

/**
 * SECTION ENGINE v4.10b
 * Builds section data from The Tower battle reports.
 */

import {
    getKnownSectionHeaders,
    getKnownBattleReportLabels,
    normaliseReportSection,
    normaliseReportKey
} from "../game/battleReportAliases.js";

const SECTION_HEADERS = new Map(
    getKnownSectionHeaders()
        .map(header => [normaliseHeader(header), normaliseReportSection(header)])
);

export function buildSections(lines = []) {
    const sections = { core: {} };
    let currentSection = "core";

    for (const rawLine of safeLines(lines)) {
        const trimmed = String(rawLine || "").trim();

        if (!trimmed || /^Battle Report$/i.test(trimmed)) {
            continue;
        }

        const section = resolveSectionHeader(trimmed);

        if (section) {
            currentSection = section;
            sections[currentSection] ||= {};
            continue;
        }

        const pair = splitSectionLine(trimmed);

        if (!pair) {
            continue;
        }

        const key = normaliseReportKey(pair.key);

        if (!key) {
            continue;
        }

        sections[currentSection] ||= {};
        sections[currentSection][key] = pair.value;
    }

    return sections;
}

export function splitSectionLine(line = "") {
    const clean = String(line || "").trim();

    if (!clean) {
        return null;
    }

    const tabPair = splitOnTabs(clean);
    if (tabPair) return tabPair;

    const multiSpacePair = splitOnMultiSpaces(clean);
    if (multiSpacePair) return multiSpacePair;

    return splitOnKnownLabel(clean);
}

export function isKnownSectionHeader(value = "") {
    return Boolean(resolveSectionHeader(value));
}

export function resolveSectionHeader(value = "") {
    return SECTION_HEADERS.get(normaliseHeader(value)) || "";
}

export function getKnownSectionLabels() {
    return getKnownBattleReportLabels();
}

function splitOnTabs(clean = "") {
    const parts = clean.split(/\t+/).map(part => part.trim()).filter(Boolean);

    if (parts.length < 2) {
        return null;
    }

    return {
        key: parts[0],
        value: parts.slice(1).join(" ").trim()
    };
}

function splitOnMultiSpaces(clean = "") {
    const parts = clean.split(/\s{2,}/).map(part => part.trim()).filter(Boolean);

    if (parts.length < 2) {
        return null;
    }

    return {
        key: parts[0],
        value: parts.slice(1).join(" ").trim()
    };
}

function splitOnKnownLabel(clean = "") {
    const labels = getKnownBattleReportLabels();

    for (const label of labels) {
        const prefix = `${label} `;

        if (clean.toLowerCase().startsWith(prefix.toLowerCase())) {
            const value = clean.slice(prefix.length).trim();

            if (!value) {
                return null;
            }

            return { key: label, value };
        }
    }

    return null;
}

function safeLines(lines = []) {
    if (Array.isArray(lines)) {
        return lines;
    }

    return String(lines || "")
        .replace(/\r/g, "")
        .split("\n");
}

function normaliseHeader(value = "") {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

export default {
    buildSections,
    splitSectionLine,
    isKnownSectionHeader,
    resolveSectionHeader,
    getKnownSectionLabels
};
