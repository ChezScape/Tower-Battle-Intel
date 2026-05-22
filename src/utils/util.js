"use strict";

/**
 * UTILS HUB v4.10b
 * Central compatibility export for shared helpers.
 */

export {
    clamp,
    sum,
    avg,
    min,
    max,
    median,
    safeDiv,
    parseNumber,
    toNumber,
    safeNumber as mathSafeNumber,
    toNumberArray,
    pctChange,
    percentChange,
    diffNumbers,
    compareNumbers,
    getDirection,
    normalise,
    normalize,
    ratio,
    percent,
    round,
    floor,
    ceil,
    isNumber,
    isPositive,
    isNegative,
    isZero,
    formatNumber as formatMathNumber
} from "./math.js";

export {
    formatNumber,
    formatCompactNumber,
    formatDelta,
    formatPercent,
    formatPercentDelta,
    formatTime,
    formatLabel,
    safeText,
    escapeHTML,
    escapeAttr,
    truncateText
} from "./format.js";

export {
    safeGet,
    safeSet,
    safeNumber,
    safeArray,
    safeObject,
    safeClone,
    safeString,
    safeBool,
    escapeHTML as safeEscapeHTML,
    escapeAttr as safeEscapeAttr,
    tryOrFallback
} from "./safe.js";

export {
    parseTimeToSeconds,
    secondsToHours,
    hoursToSeconds,
    formatSeconds,
    formatDuration,
    resolveBattleTime,
    buildTimeModel
} from "./timeEngine.js";

export {
    buildSections,
    splitSectionLine,
    isKnownSectionHeader,
    resolveSectionHeader,
    getKnownSectionLabels
} from "./sectionEngine.js";

export {
    splitBattleReports,
    getFirstBattleReport,
    hasMultipleReports,
    countBattleReports,
    fingerprintReport,
    normaliseReportText,
    normaliseLineEndings
} from "./reportSplitter.js";
