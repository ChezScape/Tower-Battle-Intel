"use strict";

/**
 * IMPORT STORE FOUNDATION v4.11z52w12
 * Owns JSON parsing and import payload validation. Saving remains delegated to
 * localStore.js so old imports keep the same public API.
 */

export function parseImportJSON(json = "") {
    if (!json || typeof json !== "string") {
        return { ok: false, value: null, error: "No JSON string supplied." };
    }

    try {
        const parsed = JSON.parse(json);
        if (!parsed || typeof parsed !== "object") {
            return { ok: false, value: null, error: "Imported JSON is not an object." };
        }

        return { ok: true, value: parsed, error: null };
    } catch (error) {
        return { ok: false, value: null, error: error?.message || "Invalid JSON." };
    }
}

export function getImportPayloadShape(payload = {}) {
    const safe = payload && typeof payload === "object" ? payload : {};

    return {
        hasHistory: Array.isArray(safe.history),
        historyCount: Array.isArray(safe.history) ? safe.history.length : 0,
        hasRunA: Boolean(safe.runA),
        hasRunB: Boolean(safe.runB),
        hasCurrentRun: Boolean(safe.currentRun),
        hasUI: Boolean(safe.ui && typeof safe.ui === "object"),
        hasMeta: Boolean(safe.meta && typeof safe.meta === "object")
    };
}

export function getImportStoreStatus() {
    return {
        version: "v4.11z52w12",
        owner: "src/storage/importStore.js",
        owns: ["JSON import parsing", "import payload shape inspection"]
    };
}

export default {
    parseImportJSON,
    getImportPayloadShape,
    getImportStoreStatus
};
