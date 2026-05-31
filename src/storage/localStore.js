"use strict";

/**
 * LOCAL STORE COMPATIBILITY WRAPPER v4.11z52w12
 * Public storage API remains stable while real ownership is split into smaller
 * storage modules. Keep this file as the front door until all callers migrate.
 */

import {
    STORAGE_SCHEMA_VERSION,
    STORAGE_KEY,
    BACKUP_KEY,
    LEGACY_KEYS,
    getStorageKey as getPrimaryStorageKey
} from "./storageKeys.js";
import {
    hasLocalStorage,
    readRawKey,
    readJSONKey,
    writeJSONKey,
    removeStorageKey,
    safeClone
} from "./storageUtils.js";
import { normaliseHistoryRuns, normaliseUIState } from "./historyStore.js";
import { normaliseComparisonSlotsForStorage } from "./runSlotStore.js";
import { parseImportJSON } from "./importStore.js";
import { createExportJSONString, createStoredHistoryCandidates, getExportSourceSummary } from "./exportStore.js";
import { buildRawArchiveFromRuns, createRawArchiveSummary } from "./rawReportArchiveStore.js";

export const LOCAL_STORE_WRAPPER_VERSION = "v4.11z52w16";

export function loadStorage() {
    if (!hasLocalStorage()) return null;

    const primary = readJSONKey(STORAGE_KEY);
    if (primary) return normaliseLoadedState(primary);

    const backup = readJSONKey(BACKUP_KEY);
    if (backup) return normaliseLoadedState(backup);

    const legacy = loadLegacyStorage();
    if (legacy) {
        console.warn("[Tower Battle Intel] Loaded legacy storage and migrated it.");
        saveStorage(legacy);
        return normaliseLoadedState(legacy);
    }

    return null;
}

export function saveStorage(state = {}) {
    if (!hasLocalStorage()) return false;

    try {
        const payload = normaliseStoredState(state);
        const existing = readRawKey(STORAGE_KEY);

        if (existing) {
            localStorage.setItem(BACKUP_KEY, existing);
        }

        return writeJSONKey(STORAGE_KEY, payload);
    } catch (error) {
        console.warn("[Tower Battle Intel] Failed to save local storage:", error);
        return false;
    }
}

export function clearStorage() {
    if (!hasLocalStorage()) return false;

    try {
        removeStorageKey(STORAGE_KEY);
        removeStorageKey(BACKUP_KEY);
        for (const key of LEGACY_KEYS) removeStorageKey(key);
        return true;
    } catch (error) {
        console.warn("[Tower Battle Intel] Failed to clear local storage:", error);
        return false;
    }
}

export function hasSavedStorage() {
    if (!hasLocalStorage()) return false;
    return Boolean(readRawKey(STORAGE_KEY) || readRawKey(BACKUP_KEY));
}

export function exportStorage() {
    return createExportJSONString(loadStorage() || {});
}

export function readRawStorageSnapshot() {
    if (!hasLocalStorage()) {
        return { available: false, primary: null, backup: null, legacy: [] };
    }

    return {
        available: true,
        storageKey: STORAGE_KEY,
        backupKey: BACKUP_KEY,
        primary: readRawKey(STORAGE_KEY),
        backup: readRawKey(BACKUP_KEY),
        legacy: LEGACY_KEYS
            .map(key => ({ key, value: readRawKey(key) }))
            .filter(item => item.value)
    };
}

export function readSavedHistoryCandidates() {
    return createStoredHistoryCandidates({
        loaded: loadStorage(),
        raw: readRawStorageSnapshot()
    });
}

export function inspectStorageExportSources() {
    const loaded = loadStorage();
    const raw = readRawStorageSnapshot();
    const candidates = createStoredHistoryCandidates({ loaded, raw });

    return getExportSourceSummary({ loaded, raw, candidates });
}

export function importStorage(json = "") {
    const parsed = parseImportJSON(json);

    if (!parsed.ok) {
        console.warn("[Tower Battle Intel] Failed to import storage:", parsed.error);
        return false;
    }

    return saveStorage(parsed.value);
}

export function getStorageKey() {
    return getPrimaryStorageKey();
}

export function getLocalStoreStatus() {
    return {
        version: LOCAL_STORE_WRAPPER_VERSION,
        owner: "src/storage/localStore.js",
        role: "compatibility-wrapper",
        storageKey: STORAGE_KEY,
        backupKey: BACKUP_KEY,
        legacyKeyCount: LEGACY_KEYS.length,
        modules: [
            "storageKeys.js",
            "storageUtils.js",
            "historyStore.js",
            "runSlotStore.js",
            "importStore.js",
            "exportStore.js",
            "rawReportArchiveStore.js"
        ]
    };
}

function loadLegacyStorage() {
    for (const key of LEGACY_KEYS) {
        const value = readJSONKey(key);
        if (value) return value;
    }

    return null;
}

function normaliseLoadedState(saved = {}) {
    if (!saved || typeof saved !== "object") return null;

    const history = normaliseHistoryRuns(saved.history);
    const rawArchive = buildRawArchiveFromRuns(
        [saved.runA, saved.runB, saved.currentRun, ...history].filter(Boolean),
        saved.rawArchive || saved.rawReportArchive || null
    );

    return normaliseComparisonSlotsForStorage({
        runA: saved.runA || null,
        runB: saved.runB || null,
        currentRun: saved.currentRun || null,
        compareData: saved.compareData || null,
        insights: Array.isArray(saved.insights) ? saved.insights : [],
        ai: Array.isArray(saved.ai) ? saved.ai : [],
        trend: saved.trend || [],
        anomalies: Array.isArray(saved.anomalies) ? saved.anomalies : [],
        inspection: saved.inspection || null,
        history,
        rawArchive,
        ui: normaliseUIState(saved.ui),
        lastInput: saved.lastInput || "",
        meta: {
            ...(saved.meta || {}),
            storageKey: STORAGE_KEY,
            rawArchive: createRawArchiveSummary(rawArchive),
            loadedAt: new Date().toISOString()
        }
    }, "runB");
}

function normaliseStoredState(state = {}) {
    const safe = state && typeof state === "object" ? state : {};

    const history = safeClone(normaliseHistoryRuns(safe.history));
    const rawArchive = buildRawArchiveFromRuns(
        [safe.runA, safe.runB, safe.currentRun, ...history].filter(Boolean),
        safe.rawArchive || safe.rawReportArchive || null
    );

    return normaliseComparisonSlotsForStorage({
        runA: safeClone(safe.runA || null),
        runB: safeClone(safe.runB || null),
        currentRun: safeClone(safe.currentRun || null),
        compareData: safeClone(safe.compareData || null),
        insights: safeClone(Array.isArray(safe.insights) ? safe.insights : []),
        ai: safeClone(Array.isArray(safe.ai) ? safe.ai : []),
        trend: safeClone(safe.trend || []),
        anomalies: safeClone(Array.isArray(safe.anomalies) ? safe.anomalies : []),
        inspection: safeClone(safe.inspection || null),
        history,
        rawArchive,
        ui: normaliseUIState(safe.ui),
        lastInput: safe.lastInput || "",
        meta: {
            ...(safe.meta || {}),
            app: "Tower Battle Intel",
            storageKey: STORAGE_KEY,
            rawArchive: createRawArchiveSummary(rawArchive),
            savedAt: new Date().toISOString(),
            schema: STORAGE_SCHEMA_VERSION
        }
    }, "runB");
}

export default {
    LOCAL_STORE_WRAPPER_VERSION,
    loadStorage,
    saveStorage,
    clearStorage,
    hasSavedStorage,
    exportStorage,
    importStorage,
    readRawStorageSnapshot,
    readSavedHistoryCandidates,
    inspectStorageExportSources,
    getStorageKey,
    getLocalStoreStatus
};
