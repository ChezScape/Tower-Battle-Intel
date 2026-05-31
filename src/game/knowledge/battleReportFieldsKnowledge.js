"use strict";

/**
 * GAME BRAIN KNOWLEDGE — BATTLE REPORT FIELDS v4.11z52m
 * Modular wrapper around the protected official Battle Report schema.
 */

import { BattleReportOfficialSchema } from "../battleReportOfficialSchema.js";

function fieldToKnowledgeEntry(field = {}) {
    return Object.freeze({
        id: `battle-report:${field.property}`,
        term: field.displayLabel || field.property,
        type: "Battle Report field",
        family: field.family || "Battle Report",
        section: field.section || "Battle Report",
        sourceConfidence: field.sourceConfidence || "game-file-observed",
        summary: field.meaning || `Battle Report field linked to ${field.property}.`,
        aliases: Object.freeze([field.property, field.rawDisplayLabel, field.labelKey].filter(Boolean)),
        uses: Object.freeze(["parser confidence", "Compare grouping", "History search", "Systems knowledge base"]),
        source: "BattleHistoryEntry metadata + TBI official parser schema",
        caution: "Field/name knowledge only; no hidden formula claim."
    });
}

export const BATTLE_REPORT_FIELD_KNOWLEDGE = Object.freeze(
    BattleReportOfficialSchema.fields.map(fieldToKnowledgeEntry)
);

export function getBattleReportFieldKnowledge() {
    return BATTLE_REPORT_FIELD_KNOWLEDGE;
}

export function getBattleReportFamilySummary() {
    const families = new Map();

    for (const entry of BATTLE_REPORT_FIELD_KNOWLEDGE) {
        const current = families.get(entry.family) || { family: entry.family, count: 0, examples: [] };
        current.count += 1;
        if (current.examples.length < 5) current.examples.push(entry.term);
        families.set(entry.family, current);
    }

    return Object.freeze(Array.from(families.values()).map(item => Object.freeze({
        ...item,
        examples: Object.freeze(item.examples)
    })));
}
