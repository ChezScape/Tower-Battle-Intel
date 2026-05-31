"use strict";

/**
 * HISTORY STATE EVENT CONTRACTS v4.11z52w12
 */

export const CORE_HISTORY_EVENTS = Object.freeze({
    HISTORY_CHANGED: "history:changed",
    HISTORY_IMPORTED: "history:imported",
    HISTORY_EXPORTED: "history:exported",
    HISTORY_FILTERS_CHANGED: "history:filters-changed"
});

export function getHistoryStateEventContract() {
    return {
        module: "historyStateEvents",
        owns: Object.values(CORE_HISTORY_EVENTS),
        domOwner: false
    };
}
