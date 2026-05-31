"use strict";

/**
 * STORAGE EVENT CONTRACTS v4.11z52w12
 */

export const CORE_STORAGE_EVENTS = Object.freeze({
    STORAGE_LOADED: "storage:loaded",
    STORAGE_SAVED: "storage:saved",
    STORAGE_CLEARED: "storage:cleared",
    STORAGE_FALLBACK_USED: "storage:fallback-used"
});

export function getStorageEventContract() {
    return {
        module: "storageEvents",
        owns: Object.values(CORE_STORAGE_EVENTS),
        domOwner: false
    };
}
