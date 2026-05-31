"use strict";

/**
 * STATE EVENT CONTRACTS v4.11z52w12
 * Domain event names only; no DOM ownership.
 */

export const CORE_STATE_EVENTS = Object.freeze({
    STATE_CHANGED: "state:changed",
    STATE_HYDRATED: "state:hydrated",
    STATE_RESET: "state:reset"
});

export function getStateEventContract() {
    return {
        module: "stateEvents",
        owns: Object.values(CORE_STATE_EVENTS),
        domOwner: false
    };
}
