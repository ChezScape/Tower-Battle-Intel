"use strict";

/**
 * EXPORT STORE FOUNDATION v4.11z52w12
 * Owns export payload selection and serialisation. UI/download clicks remain
 * parked until import/export actions are rewired deliberately.
 */

import { STORAGE_KEY, BACKUP_KEY, LEGACY_KEYS } from "./storageKeys.js";
import { parseRawStorageValue } from "./storageUtils.js";
import { createHistoryCandidateAccumulator } from "./historyStore.js";

export function createExportJSONString(payload = {}) {
    return JSON.stringify(payload || {}, null, 2);
}

export function createStoredHistoryCandidates({ loaded = null, raw = null } = {}) {
    const accumulator = createHistoryCandidateAccumulator();

    accumulator.addCandidate(STORAGE_KEY, loaded?.history);

    const sources = [
        { source: STORAGE_KEY, value: raw?.primary },
        { source: BACKUP_KEY, value: raw?.backup },
        ...((raw?.legacy || []).map(legacy => ({ source: legacy.key || "legacy", value: legacy.value })))
    ];

    for (const item of sources) {
        const parsed = parseRawStorageValue(item.value);
        accumulator.addCandidate(item.source, parsed?.history);
    }

    return accumulator.getCandidates();
}

export function pickBestHistoryCandidate(candidates = []) {
    const safe = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
    if (!safe.length) return null;

    return [...safe].sort((a, b) => {
        const historyA = Array.isArray(a.history) ? a.history.length : 0;
        const historyB = Array.isArray(b.history) ? b.history.length : 0;
        return historyB - historyA;
    })[0] || null;
}

export function getExportSourceSummary({ loaded = null, raw = null, candidates = [] } = {}) {
    const best = pickBestHistoryCandidate(candidates);

    return {
        primaryKey: STORAGE_KEY,
        backupKey: BACKUP_KEY,
        legacyKeys: [...LEGACY_KEYS],
        loadedHistoryCount: Array.isArray(loaded?.history) ? loaded.history.length : 0,
        rawPrimaryPresent: Boolean(raw?.primary),
        rawBackupPresent: Boolean(raw?.backup),
        rawLegacyCount: Array.isArray(raw?.legacy) ? raw.legacy.length : 0,
        candidateCount: Array.isArray(candidates) ? candidates.length : 0,
        bestCandidateSource: best?.source || null,
        bestCandidateHistoryCount: Array.isArray(best?.history) ? best.history.length : 0
    };
}

export function getExportStoreStatus() {
    return {
        version: "v4.11z52w12",
        owner: "src/storage/exportStore.js",
        owns: ["export JSON serialisation", "history fallback candidate selection"]
    };
}

export default {
    createExportJSONString,
    createStoredHistoryCandidates,
    pickBestHistoryCandidate,
    getExportSourceSummary,
    getExportStoreStatus
};
