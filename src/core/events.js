"use strict";

/**
 * CORE EVENT MODULE LOADER v4.11z52w12
 * Compatibility entry for the no-DOM core event foundation.
 */

export {
    CORE_EVENT_FOUNDATION_VERSION,
    CORE_STATE_EVENTS,
    CORE_HISTORY_EVENTS,
    CORE_RUN_SLOT_EVENTS,
    CORE_STORAGE_EVENTS,
    bindCoreEvents,
    subscribeCoreEvent,
    emitCoreEvent,
    clearCoreEventSubscribers,
    getCoreEventStatus
} from "./events/index.js";
