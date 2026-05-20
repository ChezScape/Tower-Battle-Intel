"use strict";

/**
 * THE TOWER NUMBER NOTATION
 *
 * Case-sensitive Tower-style notation.
 *
 * Single-letter order:
 *
 * K = 1e3
 * M = 1e6
 * B = 1e9
 * T = 1e12
 * q = 1e15
 * Q = 1e18
 * s = 1e21
 * S = 1e24
 * O = 1e27
 * N = 1e30
 * D = 1e33
 *
 * Then two-letter notation:
 *
 * aa = 1e36
 * ab = 1e39
 * ac = 1e42
 * ad = 1e45
 * ...
 *
 * Important:
 * q !== Q
 * s !== S
 *
 * JavaScript Number can only safely go up to around 1e308.
 * Anything above that is clamped to Number.MAX_VALUE instead of becoming 0.
 */

const BASE_SUFFIX_SCALE = {
    K: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12,

    q: 1e15,
    Q: 1e18,

    s: 1e21,
    S: 1e24,

    O: 1e27,
    N: 1e30,
    D: 1e33
};

export const TOWER_SUFFIX_SCALE =
    Object.freeze(
        buildSuffixScale()
    );

export const TOWER_FORMAT_SCALE =
    Object.freeze(
        buildFormatScale()
    );

/* --------------------------------------------------
   PARSE
-------------------------------------------------- */

export function parseTowerNumber(value) {

    if (value == null || value === "") {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value)
            ? value
            : 0;
    }

    const raw =
        cleanTowerNumberString(value);

    if (!raw) {
        return 0;
    }

    const plain =
        Number(raw);

    if (Number.isFinite(plain)) {
        return plain;
    }

    const match =
        raw.match(/^(-?\d+(?:\.\d+)?)([A-Za-z]{1,2})$/);

    if (!match) {
        return 0;
    }

    const numberPart =
        Number(match[1]);

    const suffix =
        match[2];

    const multiplier =
        getTowerMultiplier(suffix);

    if (
        !Number.isFinite(numberPart) ||
        !Number.isFinite(multiplier)
    ) {
        return 0;
    }

    const result =
        numberPart * multiplier;

    if (Number.isFinite(result)) {
        return result;
    }

    return numberPart < 0
        ? -Number.MAX_VALUE
        : Number.MAX_VALUE;
}

/* --------------------------------------------------
   FORMAT
-------------------------------------------------- */

export function formatTowerNumber(value, precision = 2) {

    const num =
        Number(value || 0);

    if (!Number.isFinite(num)) {
        return "0";
    }

    const abs =
        Math.abs(num);

    if (abs === 0) {
        return "0";
    }

    for (const [suffix, limit] of TOWER_FORMAT_SCALE) {

        if (abs >= limit) {

            return `${trimFixed(
                num / limit,
                precision
            )}${suffix}`;
        }
    }

    if (abs >= 100) {
        return trimFixed(num, 0);
    }

    if (abs >= 10) {
        return trimFixed(
            num,
            Math.min(precision, 1)
        );
    }

    if (abs >= 1) {
        return trimFixed(num, precision);
    }

    return trimFixed(num, precision);
}

export function formatTowerDelta(value, precision = 2) {

    const num =
        Number(value || 0);

    if (!Number.isFinite(num)) {
        return "0";
    }

    const formatted =
        formatTowerNumber(num, precision);

    return num > 0
        ? `+${formatted}`
        : formatted;
}

/* --------------------------------------------------
   DETECTION
-------------------------------------------------- */

export function isTowerNumberLike(value = "") {

    if (typeof value === "number") {
        return Number.isFinite(value);
    }

    const raw =
        cleanTowerNumberString(value);

    if (!raw) {
        return false;
    }

    return /^-?\d+(?:\.\d+)?(?:[A-Za-z]{1,2})?$/.test(raw) &&
        isValidTowerSuffix(getTowerSuffix(raw));
}

export function hasTowerSuffix(value = "") {
    return Boolean(getTowerSuffix(value));
}

export function getTowerSuffix(value = "") {

    const raw =
        cleanTowerNumberString(value);

    const match =
        raw.match(/^(-?\d+(?:\.\d+)?)([A-Za-z]{1,2})$/);

    return match
        ? match[2]
        : "";
}

export function getTowerMultiplier(suffix = "") {

    const clean =
        String(suffix || "").trim();

    if (!clean) {
        return 1;
    }

    if (Object.prototype.hasOwnProperty.call(BASE_SUFFIX_SCALE, clean)) {
        return BASE_SUFFIX_SCALE[clean];
    }

    if (isTwoLetterSuffix(clean)) {
        return twoLetterSuffixToMultiplier(clean);
    }

    return 1;
}

/* --------------------------------------------------
   CLEAN
-------------------------------------------------- */

export function cleanTowerNumberString(value = "") {

    return String(value)
        .trim()
        .replace(/,/g, "")
        .replace(/\$/g, "")
        .replace(/\s+/g, "");
}

/* --------------------------------------------------
   SCALE BUILDERS
-------------------------------------------------- */

function buildSuffixScale() {

    const scale = {
        ...BASE_SUFFIX_SCALE
    };

    const suffixes =
        generateTwoLetterSuffixes();

    for (const suffix of suffixes) {

        const multiplier =
            twoLetterSuffixToMultiplier(suffix);

        if (Number.isFinite(multiplier)) {
            scale[suffix] = multiplier;
        }
    }

    return scale;
}

function buildFormatScale() {

    const entries = [];

    for (const [suffix, multiplier] of Object.entries(TOWER_SUFFIX_SCALE)) {

        if (Number.isFinite(multiplier)) {
            entries.push([
                suffix,
                multiplier
            ]);
        }
    }

    return entries.sort(
        (a, b) => b[1] - a[1]
    );
}

function generateTwoLetterSuffixes() {

    const letters =
        "abcdefghijklmnopqrstuvwxyz";

    const suffixes = [];

    for (const first of letters) {

        for (const second of letters) {

            const suffix =
                `${first}${second}`;

            const multiplier =
                twoLetterSuffixToMultiplier(suffix);

            if (!Number.isFinite(multiplier)) {
                return suffixes;
            }

            suffixes.push(suffix);
        }
    }

    return suffixes;
}

function twoLetterSuffixToMultiplier(suffix = "") {

    if (!isTwoLetterSuffix(suffix)) {
        return 1;
    }

    const letters =
        "abcdefghijklmnopqrstuvwxyz";

    const first =
        letters.indexOf(suffix[0]);

    const second =
        letters.indexOf(suffix[1]);

    if (first < 0 || second < 0) {
        return 1;
    }

    /*
       aa starts after D.

       D  = 1e33
       aa = 1e36
       ab = 1e39
       ac = 1e42
    */
    const index =
        (first * 26) + second;

    const exponent =
        36 + (index * 3);

    const multiplier =
        Math.pow(10, exponent);

    return Number.isFinite(multiplier)
        ? multiplier
        : Number.MAX_VALUE;
}

/* --------------------------------------------------
   VALIDATION HELPERS
-------------------------------------------------- */

function isTwoLetterSuffix(suffix = "") {

    return /^[a-z]{2}$/.test(
        String(suffix || "")
    );
}

function isValidTowerSuffix(suffix = "") {

    if (!suffix) {
        return true;
    }

    if (Object.prototype.hasOwnProperty.call(BASE_SUFFIX_SCALE, suffix)) {
        return true;
    }

    return isTwoLetterSuffix(suffix);
}

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

export function trimFixed(value, precision = 2) {

    const num =
        Number(value || 0);

    if (!Number.isFinite(num)) {
        return "0";
    }

    if (precision <= 0) {
        return String(Math.round(num));
    }

    return num
        .toFixed(precision)
        .replace(/\.?0+$/, "");
}

export default {
    TOWER_SUFFIX_SCALE,
    TOWER_FORMAT_SCALE,
    parseTowerNumber,
    formatTowerNumber,
    formatTowerDelta,
    isTowerNumberLike,
    hasTowerSuffix,
    getTowerSuffix,
    getTowerMultiplier,
    cleanTowerNumberString,
    trimFixed
};