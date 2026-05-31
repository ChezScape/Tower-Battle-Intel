"use strict";

/**
 * RUN SLOT STORE FOUNDATION v4.11z52w12
 * Owns persisted Run A / Run B duplicate-slot compatibility rules.
 */

export function normaliseComparisonSlotsForStorage(payload = {}, preferredSlot = "runB") {
    if (!sameRunIdentity(payload.runA, payload.runB)) {
        return payload;
    }

    const keepRunA = preferredSlot === "runA";
    const keptRun = keepRunA ? payload.runA : payload.runB;
    const clearedRun = keepRunA ? payload.runB : payload.runA;

    if (keepRunA) {
        payload.runB = null;
    } else {
        payload.runA = null;
    }

    if (!payload.currentRun || sameRunIdentity(payload.currentRun, clearedRun)) {
        payload.currentRun = keptRun || payload.runB || payload.runA || null;
    }

    payload.compareData = null;
    payload.insights = [];
    payload.ai = [];
    payload.anomalies = [];
    payload.inspection = null;

    payload.meta = {
        ...(payload.meta || {}),
        comparisonSlotGuard: {
            cleanedDuplicate: true,
            keptSlot: keepRunA ? "runA" : "runB"
        }
    };

    return payload;
}

export function sameRunIdentity(a = null, b = null) {
    if (!a || !b) return false;

    const idA = a?.meta?.reportId || a?.meta?.id || a?.id || "";
    const idB = b?.meta?.reportId || b?.meta?.id || b?.id || "";

    if (idA && idB) {
        return String(idA) === String(idB);
    }

    const fpA = a?.meta?.fingerprint || a?.fingerprint || "";
    const fpB = b?.meta?.fingerprint || b?.fingerprint || "";

    if (fpA && fpB) {
        return String(fpA) === String(fpB);
    }

    const coreA = a?.core || {};
    const coreB = b?.core || {};
    const keyA = buildRunFallbackIdentity(coreA);
    const keyB = buildRunFallbackIdentity(coreB);

    return Boolean(keyA && keyB && keyA === keyB);
}

function buildRunFallbackIdentity(core = {}) {
    return [
        core.battleDate || core.battle_date || "",
        core.tier || 0,
        core.wave || 0,
        core.coins || 0,
        core.cells || 0,
        core.time || 0,
        core.killedBy || core.killed_by || ""
    ].join("|");
}

export function getRunSlotStoreStatus() {
    return {
        version: "v4.11z52w12",
        owner: "src/storage/runSlotStore.js",
        owns: ["Run A/B duplicate cleanup", "run identity comparison", "fingerprint duplicate comparison"]
    };
}

export default {
    normaliseComparisonSlotsForStorage,
    sameRunIdentity,
    getRunSlotStoreStatus
};
