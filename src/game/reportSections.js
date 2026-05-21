"use strict";

import { REPORT_SCHEMA, getReportSchema } from "./reportSchema.js";
import { normaliseReportSection, formatReportLabel } from "./battleReportAliases.js";

export const REPORT_SECTIONS = Object.freeze(
    Object.fromEntries(
        Object.entries(REPORT_SCHEMA).map(([key, section]) => [
            key,
            Object.freeze({
                label: section.label,
                meaning: section.meaning,
                category: section.category
            })
        ])
    )
);

export const SECTION_ORDER = Object.freeze(Object.keys(REPORT_SCHEMA));

export function getSectionInfo(sectionKey = "") {
    const key = normaliseReportSection(sectionKey);
    return REPORT_SECTIONS[key] || {
        label: formatReportLabel(sectionKey),
        meaning: "Unregistered battle report section.",
        category: "unknown"
    };
}

export function getSectionOrder() { return [...SECTION_ORDER]; }
export { getReportSchema, normaliseReportSection };
