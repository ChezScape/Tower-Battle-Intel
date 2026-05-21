"use strict";

/**
 * CORE EVENT BRIDGE
 * Minimal permanent bindings for static controls that exist outside rerendered UI.
 * Dynamic dashboard buttons belong to src/ui/events.js.
 */

import {
    saveReportToHistory,
    update,
    refreshAnalysis
} from "./update.js";

import {
    getState,
    clearRuns,
    setState,
    setBuildStyle
} from "./state.js";

import {
    render
} from "../ui/render.js";

import {
    saveStorage
} from "../storage/localStore.js";

let bound = false;

export function bindCoreEvents() {
    if (bound) return;
    bound = true;

    bindStaticInputControls();
    bindDebugShortcut();
    bindDebugHoldZone();
    exposeDebugConsoleHelpers();

    console.log("[Tower Battle Intel] Core event bridge bound");
}

function bindStaticInputControls() {
    const input = document.getElementById("input");
    const saveReport = document.getElementById("saveReport");
    const clearInput = document.getElementById("clearInput");
    const clearRunsButton = document.getElementById("clearRuns");
    const buildStyleSelect = document.getElementById("buildStyleSelect");
    const debugButton = document.getElementById("toggleDebug");

    if (buildStyleSelect) {
        buildStyleSelect.value = getState().ui?.buildStyle || "unknown";
    }

    saveReport?.addEventListener("click", () => {
        const text = input?.value || "";

        if (!text.trim()) {
            if (input) input.placeholder = "Paste a battle report first...";
            return;
        }

        const result = saveReportToHistory(text);

        if (result && input) {
            input.value = "";
            input.placeholder = "Saved to Battle History. Paste another report here...";
        }

        saveStorage({ ...getState(), lastInput: input?.value || "" });
        closeMobileReportSheet();
        render();
    });

    clearInput?.addEventListener("click", () => {
        if (input) {
            input.value = "";
            input.placeholder = "Paste Battle Report Here...";
        }

        saveStorage({ ...getState(), lastInput: "" });
    });

    clearRunsButton?.addEventListener("click", () => {
        clearRuns();
        refreshAnalysis({ reason: "clear_runs" });
        saveStorage(getState());
        render();
    });

    buildStyleSelect?.addEventListener("change", () => {
        const selected = setBuildStyle(buildStyleSelect.value || "unknown");
        refreshAnalysis({ reason: "build_style_changed", buildStyle: selected });
        saveStorage(getState());
        render();
    });

    debugButton?.addEventListener("click", () => {
        toggleDebug();
    });

    document.getElementById("saveA")?.addEventListener("click", () => saveToSlot("A", input));
    document.getElementById("saveB")?.addEventListener("click", () => saveToSlot("B", input));
}

function saveToSlot(slot, input) {
    const text = input?.value || "";

    if (!text.trim()) {
        if (input) input.placeholder = "Paste a battle report first...";
        return;
    }

    const result = update(text, slot);

    if (result && input) {
        input.value = "";
        input.placeholder = `Saved to Run ${slot}. Paste next battle report here...`;
    }

    saveStorage({ ...getState(), lastInput: input?.value || "" });
    render();
}

function toggleDebug(force = null) {
    const state = getState();
    const next = typeof force === "boolean" ? force : !Boolean(state.ui?.debug);

    setState({ ui: { debug: next } });
    document.documentElement.classList.toggle("debug-open", next);
    document.body.classList.toggle("debug-open", next);
    saveStorage(getState());
    render();
    return next;
}

function bindDebugShortcut() {
    window.addEventListener("keydown", event => {
        const key = String(event.key || "").toLowerCase();
        const backquote = event.code === "Backquote" || ["`", "¬", "¦"].includes(event.key);

        if ((event.ctrlKey && event.altKey && key === "d") || (event.altKey && backquote)) {
            event.preventDefault();
            toggleDebug();
        }
    }, true);
}

function bindDebugHoldZone() {
    const target = document.querySelector("[data-debug-hold-zone]") ||
        document.getElementById("debugHoldZone") ||
        document.querySelector(".tbi-header") ||
        document.querySelector(".topbar");

    if (!target || target.dataset.coreDebugHoldBound === "true") return;
    target.dataset.coreDebugHoldBound = "true";

    let timer = null;
    let startX = 0;
    let startY = 0;

    target.addEventListener("pointerdown", event => {
        startX = Number(event.clientX || 0);
        startY = Number(event.clientY || 0);
        clearTimeout(timer);
        timer = window.setTimeout(() => {
            vibrate();
            toggleDebug(true);
        }, 2200);
    });

    target.addEventListener("pointermove", event => {
        if (!timer) return;
        if (Math.abs(Number(event.clientX || 0) - startX) > 16 || Math.abs(Number(event.clientY || 0) - startY) > 16) {
            clearTimeout(timer);
            timer = null;
        }
    });

    ["pointerup", "pointerleave", "pointercancel"].forEach(type => {
        target.addEventListener(type, () => {
            clearTimeout(timer);
            timer = null;
        });
    });
}

function closeMobileReportSheet() {
    document.body.classList.remove("mobile-report-open");
    document.documentElement.classList.remove("mobile-scroll-locked");
    document.body.classList.remove("mobile-scroll-locked");
    document.getElementById("mobileReportFab")?.setAttribute("aria-expanded", "false");
}

function exposeDebugConsoleHelpers() {
    window.BattleAnalyserDebug = {
        toggle: () => {
            toggleDebug();
            return getState();
        },
        show: () => {
            toggleDebug(true);
            return getState();
        },
        hide: () => {
            toggleDebug(false);
            return getState();
        },
        state: () => getState(),
        buildStyle(value = null) {
            if (!value) return getState().ui?.buildStyle || "unknown";
            const selected = setBuildStyle(value);
            refreshAnalysis({ reason: "console_build_style_changed", buildStyle: selected });
            saveStorage(getState());
            render();
            return selected;
        }
    };
}

function vibrate() {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(40);
    }
}
