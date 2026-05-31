"use strict";

/**
 * STORAGE UTILS FOUNDATION v4.11z52w12
 * Safe browser/localStorage and JSON helpers. No app-state rules live here.
 */

export function hasLocalStorage() {
    try {
        if (typeof localStorage === "undefined") return false;
        const testKey = "__tower_battle_intel_storage_test__";
        localStorage.setItem(testKey, "1");
        localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}

export function readRawKey(key) {
    if (!hasLocalStorage()) return null;

    try {
        const raw = localStorage.getItem(key);
        return raw || null;
    } catch (error) {
        console.warn(`[Tower Battle Intel] Failed to read raw storage key "${key}":`, error);
        return null;
    }
}

export function writeRawKey(key, value = "") {
    if (!hasLocalStorage()) return false;

    try {
        localStorage.setItem(key, String(value));
        return true;
    } catch (error) {
        console.warn(`[Tower Battle Intel] Failed to write storage key "${key}":`, error);
        return false;
    }
}

export function removeStorageKey(key) {
    if (!hasLocalStorage()) return false;

    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn(`[Tower Battle Intel] Failed to remove storage key "${key}":`, error);
        return false;
    }
}

export function parseRawStorageValue(raw = null) {
    if (!raw || typeof raw !== "string") return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function readJSONKey(key) {
    return parseRawStorageValue(readRawKey(key));
}

export function writeJSONKey(key, value = {}) {
    try {
        return writeRawKey(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`[Tower Battle Intel] Failed to serialise storage key "${key}":`, error);
        return false;
    }
}

export function safeClone(value) {
    if (value == null) return value;

    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return value;
    }
}

export function getStorageUtilsStatus() {
    return {
        version: "v4.11z52w12",
        owner: "src/storage/storageUtils.js",
        localStorageAvailable: hasLocalStorage()
    };
}

export default {
    hasLocalStorage,
    readRawKey,
    writeRawKey,
    removeStorageKey,
    parseRawStorageValue,
    readJSONKey,
    writeJSONKey,
    safeClone,
    getStorageUtilsStatus
};
