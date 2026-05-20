"use strict";

/**
 * UTILS HUB
 * Central export file for shared utility helpers.
 */

/* --------------------------------------------------
   MATH
-------------------------------------------------- */

export {
    clamp,
    sum,
    avg,
    safeDiv,
    parseNumber,
    toNumber,
    safeNumber as mathSafeNumber,
    pctChange,
    percentChange,
    diffNumbers,
    isNumber,
    isPositive
} from "./math.js";

/* --------------------------------------------------
   FORMAT
-------------------------------------------------- */

export {
    formatNumber,
    formatDelta,
    formatPercent,
    formatTime,
    formatLabel,
    safeText
} from "./format.js";

/* --------------------------------------------------
   SAFE
-------------------------------------------------- */

export {
    safeGet,
    safeNumber,
    safeArray,
    safeObject,
    safeClone,
    safeString,
    safeBool,
    escapeHTML
} from "./safe.js";

/* --------------------------------------------------
   TIME
-------------------------------------------------- */

export {
    parseTimeToSeconds,
    secondsToHours,
    hoursToSeconds,
    formatSeconds,
    resolveBattleTime,
    buildTimeModel
} from "./timeEngine.js";

/* --------------------------------------------------
   SECTIONS
-------------------------------------------------- */

export {
    buildSections
} from "./sectionEngine.js";