"use strict";

/**
 * LOCAL STORAGE
 * Persistent browser storage for Tower Battle Intel.
 *
 * Stores:
 * - runA
 * - runB
 * - currentRun
 * - compareData
 * - insights
 * - ai
 * - trend
 * - anomalies
 * - inspection
 * - history
 * - ui
 * - lastInput
 */

const STORAGE_KEY =
    "towerBattleIntel.state.v1";

const LEGACY_KEYS = [
    "battleAnalyserState",
    "battle-analyser-state",
    "towerBattleIntel",
    "towerBattleIntel.state"
];

/* --------------------------------------------------
   LOAD STORAGE
-------------------------------------------------- */

export function loadStorage() {

    if (!hasLocalStorage()) {
        return null;
    }

    const primary =
        readKey(STORAGE_KEY);

    if (primary) {
        return normaliseLoadedState(primary);
    }

    const legacy =
        loadLegacyStorage();

    if (legacy) {

        console.warn(
            "[Tower Battle Intel] Loaded legacy storage and migrated it."
        );

        saveStorage(legacy);

        return normaliseLoadedState(legacy);
    }

    return null;
}

/* --------------------------------------------------
   SAVE STORAGE
-------------------------------------------------- */

export function saveStorage(state = {}) {

    if (!hasLocalStorage()) {
        return false;
    }

    try {

        const payload =
            normaliseStoredState(state);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(payload)
        );

        return true;

    } catch (error) {

        console.warn(
            "[Tower Battle Intel] Failed to save local storage:",
            error
        );

        return false;
    }
}

/* --------------------------------------------------
   CLEAR STORAGE
-------------------------------------------------- */

export function clearStorage() {

    if (!hasLocalStorage()) {
        return false;
    }

    try {

        localStorage.removeItem(
            STORAGE_KEY
        );

        for (const key of LEGACY_KEYS) {
            localStorage.removeItem(key);
        }

        return true;

    } catch (error) {

        console.warn(
            "[Tower Battle Intel] Failed to clear local storage:",
            error
        );

        return false;
    }
}

/* --------------------------------------------------
   STORAGE EXISTS
-------------------------------------------------- */

export function hasSavedStorage() {

    if (!hasLocalStorage()) {
        return false;
    }

    return Boolean(
        localStorage.getItem(STORAGE_KEY)
    );
}

/* --------------------------------------------------
   EXPORT / IMPORT
-------------------------------------------------- */

export function exportStorage() {

    const saved =
        loadStorage();

    return JSON.stringify(
        saved || {},
        null,
        2
    );
}

export function importStorage(json = "") {

    if (!json || typeof json !== "string") {
        return false;
    }

    try {

        const parsed =
            JSON.parse(json);

        return saveStorage(parsed);

    } catch (error) {

        console.warn(
            "[Tower Battle Intel] Failed to import storage:",
            error
        );

        return false;
    }
}

/* --------------------------------------------------
   LEGACY LOAD
-------------------------------------------------- */

function loadLegacyStorage() {

    for (const key of LEGACY_KEYS) {

        const value =
            readKey(key);

        if (value) {
            return value;
        }
    }

    return null;
}

/* --------------------------------------------------
   READ KEY
-------------------------------------------------- */

function readKey(key) {

    try {

        const raw =
            localStorage.getItem(key);

        if (!raw) {
            return null;
        }

        return JSON.parse(raw);

    } catch (error) {

        console.warn(
            `[Tower Battle Intel] Failed to read storage key "${key}":`,
            error
        );

        return null;
    }
}

/* --------------------------------------------------
   NORMALISE LOADED STATE
-------------------------------------------------- */

function normaliseLoadedState(saved = {}) {

    if (!saved || typeof saved !== "object") {
        return null;
    }

    return {
        runA:
            saved.runA || null,

        runB:
            saved.runB || null,

        currentRun:
            saved.currentRun || null,

        compareData:
            saved.compareData || null,

        insights:
            Array.isArray(saved.insights)
                ? saved.insights
                : [],

        ai:
            Array.isArray(saved.ai)
                ? saved.ai
                : [],

        trend:
            saved.trend || [],

        anomalies:
            Array.isArray(saved.anomalies)
                ? saved.anomalies
                : [],

        inspection:
            saved.inspection || null,

        history:
            normaliseHistoryRuns(saved.history),

        ui: {
            selectedSection:
                saved.ui?.selectedSection ?? null,

            debug:
                Boolean(saved.ui?.debug),

            activeView:
                saved.ui?.activeView || "dashboard",

            buildStyle:
                saved.ui?.buildStyle || "unknown",

            historyFilters:
                normaliseHistoryFilters(saved.ui?.historyFilters)
        },

        lastInput:
            saved.lastInput || "",

        meta: {
            ...(saved.meta || {}),

            storageKey:
                STORAGE_KEY,

            savedAt:
                saved.meta?.savedAt || null
        }
    };
}

/* --------------------------------------------------
   NORMALISE STORED STATE
-------------------------------------------------- */

function normaliseStoredState(state = {}) {

    const safe =
        state && typeof state === "object"
            ? state
            : {};

    return {
        runA:
            safeClone(safe.runA || null),

        runB:
            safeClone(safe.runB || null),

        currentRun:
            safeClone(safe.currentRun || null),

        compareData:
            safeClone(safe.compareData || null),

        insights:
            safeClone(
                Array.isArray(safe.insights)
                    ? safe.insights
                    : []
            ),

        ai:
            safeClone(
                Array.isArray(safe.ai)
                    ? safe.ai
                    : []
            ),

        trend:
            safeClone(safe.trend || []),

        anomalies:
            safeClone(
                Array.isArray(safe.anomalies)
                    ? safe.anomalies
                    : []
            ),

        inspection:
            safeClone(safe.inspection || null),

        history:
            safeClone(
                normaliseHistoryRuns(safe.history)
            ),

        ui: {
            selectedSection:
                safe.ui?.selectedSection ?? null,

            debug:
                Boolean(safe.ui?.debug),

            activeView:
                safe.ui?.activeView || "dashboard",

            buildStyle:
                safe.ui?.buildStyle || "unknown",

            historyFilters:
                normaliseHistoryFilters(safe.ui?.historyFilters)
        },

        lastInput:
            safe.lastInput || "",

        meta: {
            ...(safe.meta || {}),

            app:
                "Tower Battle Intel",

            storageKey:
                STORAGE_KEY,

            savedAt:
                new Date().toISOString()
        }
    };
}


/* --------------------------------------------------
   HISTORY METADATA NORMALISER
-------------------------------------------------- */

function normaliseHistoryRuns(history = []) {

    const runs =
        Array.isArray(history)
            ? history
            : [];

    return runs
        .filter(Boolean)
        .map(run => ({
            ...run,

            meta: {
                ...(run.meta || {}),

                savedAt:
                    run.meta?.savedAt || null,

                archived:
                    Boolean(run.meta?.archived),

                notes:
                    run.meta?.notes || "",

                tags:
                    normaliseTags(run.meta?.tags),

                buildStyle:
                    normaliseBuildStyle(run.meta?.buildStyle || run.meta?.build || "unknown")
            }
        }));
}


function normaliseHistoryFilters(filters = {}) {

    const safe =
        filters && typeof filters === "object"
            ? filters
            : {};

    return {
        query:
            String(safe.query || ""),

        sort:
            String(safe.sort || "newest"),

        build:
            String(safe.build || "all"),

        tag:
            String(safe.tag || "all"),

        showArchived:
            Boolean(safe.showArchived)
    };
}

function normaliseTags(tags = []) {

    const source =
        typeof tags === "string"
            ? tags.split(/[,\s#]+/g)
            : Array.isArray(tags)
                ? tags
                : [];

    const seen =
        new Set();

    return source
        .map(tag => String(tag || "").trim())
        .map(tag => tag.replace(/^#+/, ""))
        .map(tag => tag.toLowerCase())
        .map(tag => tag.replace(/\s+/g, "-"))
        .map(tag => tag.replace(/[^a-z0-9_-]/g, ""))
        .filter(Boolean)
        .filter(tag => {
            if (seen.has(tag)) {
                return false;
            }

            seen.add(tag);
            return true;
        })
        .slice(0, 12);
}

function normaliseBuildStyle(value = "unknown") {

    const key =
        String(value || "unknown")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/\//g, "_")
            .replace(/__+/g, "_");

    const allowed = new Set([
        "unknown",
        "health_ehp",
        "blender",
        "devo",
        "orb_devo",
        "glass_cannon",
        "hybrid"
    ]);

    return allowed.has(key)
        ? key
        : "unknown";
}

/* --------------------------------------------------
   LOCAL STORAGE CHECK
-------------------------------------------------- */

function hasLocalStorage() {

    try {

        const testKey =
            "__tower_battle_intel_test__";

        localStorage.setItem(
            testKey,
            "1"
        );

        localStorage.removeItem(
            testKey
        );

        return true;

    } catch {

        return false;
    }
}

/* --------------------------------------------------
   SAFE CLONE
-------------------------------------------------- */

function safeClone(value) {

    try {

        if (
            typeof structuredClone === "function"
        ) {
            return structuredClone(value);
        }

        return JSON.parse(
            JSON.stringify(value)
        );

    } catch {

        return value;
    }
}

/* --------------------------------------------------
   DEFAULT EXPORT COMPATIBILITY
-------------------------------------------------- */

export default {
    loadStorage,
    saveStorage,
    clearStorage,
    hasSavedStorage,
    exportStorage,
    importStorage
};