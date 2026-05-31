"use strict";

/**
 * GAME BRAIN KNOWLEDGE BASE v4.11z52w
 * Modular, update-friendly knowledge layer for Systems, Compare, Coach and Debug.
 */

import {
    getBattleReportFieldKnowledge,
    getBattleReportFamilySummary
} from "./knowledge/battleReportFieldsKnowledge.js";
import { getV282MechanicsKnowledge } from "./knowledge/v28_2MechanicsKnowledge.js";
import { getAccountStatsMetadataKnowledge } from "./knowledge/accountStatsMetadataKnowledge.js";
import { getApkEvidenceKnowledge } from "./knowledge/apkEvidenceKnowledge.js";
import { getGameUpdateAudit } from "./gameUpdateAudit.js";

function freezeEntry(entry) {
    return Object.freeze({
        ...entry,
        aliases: Object.freeze([...(entry.aliases || [])]),
        uses: Object.freeze([...(entry.uses || [])])
    });
}

const MODULES = Object.freeze([
    Object.freeze({ key: "battleReportFields", label: "Battle Report Fields", entries: getBattleReportFieldKnowledge().map(freezeEntry) }),
    Object.freeze({ key: "v28_2Mechanics", label: "v28.2 Mechanics", entries: getV282MechanicsKnowledge().map(freezeEntry) }),
    Object.freeze({ key: "accountStatsMetadata", label: "Account Stats Metadata", entries: getAccountStatsMetadataKnowledge().map(freezeEntry) }),
    Object.freeze({ key: "apkEvidence", label: "APK Evidence / Boundaries", entries: getApkEvidenceKnowledge().map(freezeEntry) })
]);

const ALL_ENTRIES = Object.freeze(MODULES.flatMap(module => module.entries));

function normalise(value = "") {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function getGameBrainKnowledgeModules() {
    return MODULES;
}

export function getGameBrainKnowledgeBase() {
    return ALL_ENTRIES;
}

export function searchGameBrainKnowledgeBase(query = "") {
    const needle = normalise(query);
    if (!needle) return ALL_ENTRIES;

    return Object.freeze(ALL_ENTRIES.filter(entry => {
        const haystack = normalise([
            entry.term,
            entry.type,
            entry.family,
            entry.section,
            entry.summary,
            ...(entry.aliases || []),
            ...(entry.uses || [])
        ].join(" "));
        return haystack.includes(needle);
    }));
}

export function explainGameBrainKnowledgeTerm(query = "") {
    const matches = searchGameBrainKnowledgeBase(query);
    return matches[0] || null;
}

export function getGameBrainKnowledgeBaseStatus() {
    const updateAudit = getGameUpdateAudit();
    const modules = MODULES.map(module => Object.freeze({
        key: module.key,
        label: module.label,
        count: module.entries.length
    }));
    const confidenceCounts = ALL_ENTRIES.reduce((counts, entry) => {
        const key = entry.sourceConfidence || "unknown";
        counts[key] = (counts[key] || 0) + 1;
        return counts;
    }, {});

    return Object.freeze({
        ok: ALL_ENTRIES.length >= 200,
        version: "v4.11z52w",
        gameVersion: updateAudit.version,
        catalogueVersion: "v28.2-knowledge-base",
        moduleCount: MODULES.length,
        entryCount: ALL_ENTRIES.length,
        modules: Object.freeze(modules),
        battleReportFamilySummary: getBattleReportFamilySummary(),
        confidenceCounts: Object.freeze(confidenceCounts),
        safePurpose: Object.freeze([
            "knowledge base",
            "parser confidence",
            "Compare grouping",
            "Systems glossary",
            "future Coach context"
        ]),
        notSafePurpose: Object.freeze([
            "hidden formulas",
            "live server values",
            "save-file extraction",
            "network interception",
            "automation/cheats"
        ])
    });
}

if (typeof window !== "undefined") {
    window.TowerBattleIntelGameBrainKnowledgeBase = Object.freeze({
        status: getGameBrainKnowledgeBaseStatus,
        all: getGameBrainKnowledgeBase,
        modules: getGameBrainKnowledgeModules,
        search: searchGameBrainKnowledgeBase,
        explain: explainGameBrainKnowledgeTerm
    });
}

export default Object.freeze({
    getGameBrainKnowledgeModules,
    getGameBrainKnowledgeBase,
    searchGameBrainKnowledgeBase,
    explainGameBrainKnowledgeTerm,
    getGameBrainKnowledgeBaseStatus
});
