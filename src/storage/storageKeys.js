"use strict";

/**
 * STORAGE KEYS FOUNDATION v4.11z52w12
 * Single owner for browser storage key names and storage schema constants.
 */

export const STORAGE_SCHEMA_VERSION = 1;

export const STORAGE_KEY = "towerBattleIntel.state.v1";
export const BACKUP_KEY = "towerBattleIntel.state.backup.v1";

export const LEGACY_KEYS = Object.freeze([
    "battleAnalyserState",
    "battle-analyser-state",
    "towerBattleIntel",
    "towerBattleIntel.state"
]);

export function getStorageKey() {
    return STORAGE_KEY;
}

export function getBackupStorageKey() {
    return BACKUP_KEY;
}

export function getLegacyStorageKeys() {
    return [...LEGACY_KEYS];
}

export function getStorageKeyStatus() {
    return {
        version: "v4.11z52w12",
        owner: "src/storage/storageKeys.js",
        schema: STORAGE_SCHEMA_VERSION,
        primary: STORAGE_KEY,
        backup: BACKUP_KEY,
        legacy: getLegacyStorageKeys()
    };
}

export default {
    STORAGE_SCHEMA_VERSION,
    STORAGE_KEY,
    BACKUP_KEY,
    LEGACY_KEYS,
    getStorageKey,
    getBackupStorageKey,
    getLegacyStorageKeys,
    getStorageKeyStatus
};
