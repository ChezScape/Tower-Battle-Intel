"use strict";

/**
 * RUN SLOT EVENT CONTRACTS v4.11z52w12
 */

export const CORE_RUN_SLOT_EVENTS = Object.freeze({
    RUN_A_CHANGED: "run-slot:a-changed",
    RUN_B_CHANGED: "run-slot:b-changed",
    RUN_SLOTS_SWAPPED: "run-slot:swapped",
    RUN_SLOTS_CLEARED: "run-slot:cleared"
});

export function getRunSlotEventContract() {
    return {
        module: "runSlotEvents",
        owns: Object.values(CORE_RUN_SLOT_EVENTS),
        domOwner: false
    };
}
