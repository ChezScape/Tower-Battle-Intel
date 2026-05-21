"use strict";

import { normaliseReportKey, formatReportLabel } from "./battleReportAliases.js";
import { findUnknownReportFields, validateReportAgainstSchema } from "./reportSchema.js";

export function scanUnknownReportMetrics(parsedOrSections = {}) {
    const sections = parsedOrSections?.sections || parsedOrSections || {};
    const schema = validateReportAgainstSchema(sections);
    const unknownFields = findUnknownReportFields(sections);

    return {
        ok: schema.unknownSections.length === 0 && unknownFields.length === 0,
        unknownSections: schema.unknownSections,
        missingSections: schema.missingSections,
        unknownFields,
        count: unknownFields.length
    };
}

export function buildUnknownReportMetricMessage(scan = {}) {
    const fields = Array.isArray(scan.unknownFields) ? scan.unknownFields : [];
    if (!fields.length && !(scan.unknownSections || []).length) {
        return "No unknown battle-report fields found.";
    }

    const fieldText = fields
        .slice(0, 12)
        .map(item => `${item.section || "unknown"}.${normaliseReportKey(item.key)} (${formatReportLabel(item.key)})`)
        .join(" | ");

    const sectionText = (scan.unknownSections || []).join(", ");

    return [
        sectionText ? `Unknown sections: ${sectionText}` : "",
        fieldText ? `Unknown fields: ${fieldText}` : ""
    ].filter(Boolean).join(". ");
}
