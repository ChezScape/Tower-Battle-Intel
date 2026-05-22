"use strict";

/**
 * CORE EVENT BRIDGE v4.9y
 * Static DOM controls only. Visible dashboard buttons go through src/ui/events.js.
 */

import {
    performUIAction,
    actionGetState,
    actionToggleDebug,
    actionSetBuildStyle
} from "../actions/actions.js";

import {
    render
} from "../ui/render.js";

let coreEventsBound = false;

export function bindCoreEvents() {

    if (coreEventsBound) {
        return;
    }

    coreEventsBound = true;

    const input = document.getElementById("input");
    const saveReport = document.getElementById("saveReport");
    const clearInput = document.getElementById("clearInput");
    const clearRuns = document.getElementById("clearRuns");
    const debugBtn = document.getElementById("toggleDebug");
    const buildStyleSelect = document.getElementById("buildStyleSelect");

    syncBuildStyleSelect(buildStyleSelect);

    saveReport?.addEventListener("click", () => {
        const hadText = Boolean(input?.value && input.value.trim());
        performUIAction("save-report", { input });
        if (hadText) closeMobileReportSheet();
        render();
    });

    clearInput?.addEventListener("click", () => {
        performUIAction("clear-input", { input });
    });

    clearRuns?.addEventListener("click", () => {
        performUIAction("clear-runs");
        render();
    });

    debugBtn?.addEventListener("click", () => {
        toggleDebug();
    });

    buildStyleSelect?.addEventListener("change", () => {
        actionSetBuildStyle(buildStyleSelect.value || "unknown");
        render();
    });

    bindLegacySlotButtons(input);
    bindDebugKeyboardShortcut();
    bindHeaderDebugHold();
    bindMobileCommandDeck(input);
    exposeDebugConsoleHelpers();

    console.log("[Tower Battle Intel] Core event bridge bound");
}

function bindLegacySlotButtons(input) {
    document.getElementById("saveA")?.addEventListener("click", () => {
        performUIAction("save-run-a", { input });
        render();
    });
    document.getElementById("saveB")?.addEventListener("click", () => {
        performUIAction("save-run-b", { input });
        render();
    });
}

function syncBuildStyleSelect(select) {
    if (!select) return;
    select.value = actionGetState().ui?.buildStyle || "unknown";
}

function toggleDebug(force = null) {
    const next = actionToggleDebug(force);
    document.body.classList.toggle("debug-open", next);
    document.documentElement.classList.toggle("debug-open", next);
    if (isMobileMode()) {
        document.documentElement.classList.toggle("mobile-scroll-locked", next);
        document.body.classList.toggle("mobile-scroll-locked", next);
    }
    render();
}

function bindDebugKeyboardShortcut() {
    window.addEventListener("keydown", event => {
        const key = String(event.key || "").toLowerCase();
        const isBackquote = event.code === "Backquote" || event.key === "`" || event.key === "¬" || event.key === "¦";
        if ((event.ctrlKey && event.altKey && key === "d") || (event.altKey && isBackquote)) {
            event.preventDefault();
            event.stopPropagation();
            toggleDebug();
        }
    }, true);
}

function bindHeaderDebugHold() {

    const HOLD_TIME_MS = 2600;
    const MOVE_CANCEL_PX = 14;

    const targets = Array.from(document.querySelectorAll("[data-debug-hold-zone], #debugHoldZone, .topbar-banner-brand, .topbar"))
        .filter(Boolean);

    targets.forEach(target => {

        if (target.dataset.debugHoldBound === "true") {
            return;
        }

        target.dataset.debugHoldBound = "true";

        let pressTimer = null;
        let startX = 0;
        let startY = 0;
        let holdActive = false;
        let tapCount = 0;
        let tapTimer = null;

        const clearPressTimer = () => {
            clearTimeout(pressTimer);
            pressTimer = null;
            holdActive = false;
        };

        const getPoint = event => {
            const point = event?.touches?.[0] || event?.changedTouches?.[0] || event;
            return { x: Number(point?.clientX || 0), y: Number(point?.clientY || 0) };
        };

        target.addEventListener("pointerdown", event => {
            const point = getPoint(event);
            startX = point.x;
            startY = point.y;
            holdActive = true;
            clearTimeout(pressTimer);
            pressTimer = setTimeout(() => {
                if (!holdActive) return;
                vibrate();
                toggleDebug(true);
                clearPressTimer();
            }, HOLD_TIME_MS);
        });

        target.addEventListener("pointermove", event => {
            if (!holdActive) return;
            const point = getPoint(event);
            if (Math.abs(point.x - startX) > MOVE_CANCEL_PX || Math.abs(point.y - startY) > MOVE_CANCEL_PX) {
                clearPressTimer();
            }
        });

        target.addEventListener("pointerup", clearPressTimer);
        target.addEventListener("pointerleave", clearPressTimer);
        target.addEventListener("pointercancel", clearPressTimer);
        target.addEventListener("contextmenu", event => {
            if (holdActive) event.preventDefault();
        });
        target.addEventListener("click", () => {
            tapCount++;
            clearTimeout(tapTimer);
            tapTimer = setTimeout(() => { tapCount = 0; }, 1600);
            if (tapCount >= 5) {
                tapCount = 0;
                clearTimeout(tapTimer);
                vibrate();
                toggleDebug(true);
            }
        });
    });
}

function bindMobileCommandDeck(input = null) {

    const fab = document.getElementById("mobileReportFab");
    const backdrop = document.getElementById("mobileSheetBackdrop");
    const closeButton = document.getElementById("mobileInputClose");
    const commandRail = document.getElementById("mobileCommandRail");

    if (!fab || fab.dataset.mobileCommandBound === "true") {
        return;
    }

    fab.dataset.mobileCommandBound = "true";

    let holdTimer = null;
    let suppressNextClick = false;

    const setExpanded = value => fab.setAttribute("aria-expanded", value ? "true" : "false");

    function openSheet() {
        document.body.classList.remove("mobile-command-rail-open");
        document.body.classList.add("mobile-report-open");
        document.documentElement.classList.add("mobile-scroll-locked");
        document.body.classList.add("mobile-scroll-locked");
        setExpanded(true);
    }

    function closeSheet() {
        document.body.classList.remove("mobile-report-open");
        if (!document.body.classList.contains("debug-open")) {
            document.documentElement.classList.remove("mobile-scroll-locked");
            document.body.classList.remove("mobile-scroll-locked");
        }
        setExpanded(false);
    }

    function toggleRail(force = null) {
        const shouldOpen = force == null ? !document.body.classList.contains("mobile-command-rail-open") : Boolean(force);
        document.body.classList.toggle("mobile-command-rail-open", shouldOpen);
        if (shouldOpen) {
            document.body.classList.remove("mobile-report-open");
            document.documentElement.classList.add("mobile-scroll-locked");
            document.body.classList.add("mobile-scroll-locked");
            setExpanded(false);
        } else if (!document.body.classList.contains("debug-open")) {
            document.documentElement.classList.remove("mobile-scroll-locked");
            document.body.classList.remove("mobile-scroll-locked");
        }
    }

    fab.addEventListener("pointerdown", () => {
        clearTimeout(holdTimer);
        suppressNextClick = false;
        holdTimer = window.setTimeout(() => {
            suppressNextClick = true;
            vibrate();
            toggleRail(true);
        }, 520);
    });
    fab.addEventListener("pointerup", () => clearTimeout(holdTimer));
    fab.addEventListener("pointerleave", () => clearTimeout(holdTimer));
    fab.addEventListener("pointercancel", () => clearTimeout(holdTimer));
    fab.addEventListener("click", event => {
        event.preventDefault();
        if (suppressNextClick) {
            suppressNextClick = false;
            return;
        }
        openSheet();
    });

    backdrop?.addEventListener("click", () => {
        closeSheet();
        toggleRail(false);
    });

    closeButton?.addEventListener("click", closeSheet);

    commandRail?.addEventListener("click", event => {
        const command = event.target?.closest?.("[data-mobile-command]");
        if (!command) return;
        const action = command.dataset.mobileCommand;
        if (action === "open-report") openSheet();
        if (action === "save-report") {
            performUIAction("save-report", { input });
            toggleRail(false);
            render();
        }
        if (action === "clear-input") {
            performUIAction("clear-input", { input });
            toggleRail(false);
            openSheet();
        }
        if (action === "history-tab") {
            performUIAction("set-dashboard-tab", { tab: "history" });
            toggleRail(false);
            render();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeSheet();
            toggleRail(false);
        }
    });

    window.TowerBattleIntelMobileDeck = { openReport: openSheet, closeReport: closeSheet, toggleRail };
}

function closeMobileReportSheet() {
    document.body.classList.remove("mobile-report-open");
    if (!document.body.classList.contains("debug-open")) {
        document.documentElement.classList.remove("mobile-scroll-locked");
        document.body.classList.remove("mobile-scroll-locked");
    }
    document.getElementById("mobileReportFab")?.setAttribute("aria-expanded", "false");
}

function exposeDebugConsoleHelpers() {
    window.BattleAnalyserDebug = {
        toggle() { toggleDebug(); return actionGetState(); },
        show() { toggleDebug(true); return actionGetState(); },
        hide() { toggleDebug(false); return actionGetState(); },
        state() { return actionGetState(); },
        buildStyle(value = null) {
            if (!value) return actionGetState().ui?.buildStyle || "unknown";
            const selected = actionSetBuildStyle(value);
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

function isMobileMode() {
    return document.documentElement?.getAttribute("data-device-mode") === "mobile";
}
