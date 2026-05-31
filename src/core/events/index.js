"use strict";

/**
 * CORE EVENT MODULE FOUNDATION v4.11z52w12
 * Lightweight domain signal bus. It never binds DOM controls.
 */

import { CORE_STATE_EVENTS, getStateEventContract } from "./stateEvents.js";
import { CORE_HISTORY_EVENTS, getHistoryStateEventContract } from "./historyStateEvents.js";
import { CORE_RUN_SLOT_EVENTS, getRunSlotEventContract } from "./runSlotEvents.js";
import { CORE_STORAGE_EVENTS, getStorageEventContract } from "./storageEvents.js";

export const CORE_EVENT_FOUNDATION_VERSION = "v4.11z52w12";

const subscribers = new Map();
let emittedCount = 0;

export {
    CORE_STATE_EVENTS,
    CORE_HISTORY_EVENTS,
    CORE_RUN_SLOT_EVENTS,
    CORE_STORAGE_EVENTS
};

export function subscribeCoreEvent(name = "", handler = null) {
    if (!name || typeof handler !== "function") {
        return () => {};
    }

    const set = subscribers.get(name) || new Set();
    set.add(handler);
    subscribers.set(name, set);

    return () => {
        set.delete(handler);
        if (!set.size) {
            subscribers.delete(name);
        }
    };
}

export function emitCoreEvent(name = "", detail = {}) {
    emittedCount += 1;

    const handlers = Array.from(subscribers.get(name) || []);
    const event = Object.freeze({
        name,
        detail: detail && typeof detail === "object" ? { ...detail } : detail,
        emittedAt: new Date().toISOString()
    });

    for (const handler of handlers) {
        handler(event);
    }

    return {
        name,
        handled: handlers.length,
        emittedCount
    };
}

export function clearCoreEventSubscribers() {
    subscribers.clear();
}

export function bindCoreEvents() {
    return getCoreEventStatus();
}

export function getCoreEventStatus() {
    return {
        version: CORE_EVENT_FOUNDATION_VERSION,
        domBridgeActive: false,
        subscriberTopics: subscribers.size,
        emittedCount,
        modules: [
            getStateEventContract(),
            getHistoryStateEventContract(),
            getRunSlotEventContract(),
            getStorageEventContract()
        ]
    };
}

export default {
    bindCoreEvents,
    subscribeCoreEvent,
    emitCoreEvent,
    clearCoreEventSubscribers,
    getCoreEventStatus
};
