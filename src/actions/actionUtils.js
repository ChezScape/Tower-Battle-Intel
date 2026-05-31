"use strict";

/**
 * ACTION UTILS v4.11z52w47
 * Shared helpers for the modular action foundation. No DOM code lives here.
 */

import { getState } from "../core/state.js";
import { saveStorage } from "../storage/localStore.js";

export const ACTION_FOUNDATION_VERSION = "v4.11z52w47";

export function persistState(extra = null) {
    const base = getState();
    const payload = extra && typeof extra === "object"
        ? { ...base, ...extra }
        : base;

    saveStorage(payload);
    return payload;
}

export function toSafeIndex(index = -1) {
    const value = Number(index);
    return Number.isInteger(value) && value >= 0 ? value : -1;
}

export function normaliseSlot(slot = "runA") {
    const value = String(slot || "runA")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    if (value === "a" || value === "runa") return "runA";
    if (value === "b" || value === "runb") return "runB";
    if (value === "history") return "history";

    return "runA";
}

export function normaliseDashboardTab(tab = "overview") {
    const value = String(tab || "overview").trim().toLowerCase();

    const aliases = {
        dashboard: "overview",
        intel: "compare",
        gains: "compare",
        losses: "compare"
    };

    const normalised = aliases[value] || value;

    const allowed = new Set([
        "overview",
        "compare",
        "systems",
        "coach",
        "history",
        "anomalies",
        "command",
        "more",
        "settings"
    ]);

    return allowed.has(normalised) ? normalised : "overview";
}

export function normaliseActionKey(action = "") {
    return String(action || "")
        .trim()
        .toLowerCase()
        .replace(/_/g, "-");
}

export function installGlobalActionBridge(api) {
    if (typeof window === "undefined") return;
    window.TowerBattleIntelActions = api;
}

export function getActionUtilsStatus() {
    return {
        version: ACTION_FOUNDATION_VERSION,
        owner: "src/actions/actionUtils.js",
        owns: ["action key normalisation", "slot normalisation", "safe persistence", "global action bridge install"]
    };
}

export default {
    ACTION_FOUNDATION_VERSION,
    persistState,
    toSafeIndex,
    normaliseSlot,
    normaliseDashboardTab,
    normaliseActionKey,
    installGlobalActionBridge,
    getActionUtilsStatus
};
