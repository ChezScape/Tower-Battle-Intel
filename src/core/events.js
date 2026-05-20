"use strict";

import {
    update,
    saveReportToHistory,
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

let coreEventsBound = false;

/* --------------------------------------------------
   CORE EVENT SYSTEM
-------------------------------------------------- */

export function bindCoreEvents() {

    if (coreEventsBound) {
        return;
    }

    coreEventsBound = true;

    const input =
        document.getElementById("input");

    const saveReport =
        document.getElementById("saveReport");

    const clearInput =
        document.getElementById("clearInput");

    const clearBtn =
        document.getElementById("clearRuns");

    const debugBtn =
        document.getElementById("toggleDebug");

    const buildStyleSelect =
        document.getElementById("buildStyleSelect");

    /* Legacy support if old buttons exist */
    const saveA =
        document.getElementById("saveA");

    const saveB =
        document.getElementById("saveB");

    syncBuildStyleSelect(buildStyleSelect);

    saveReport?.addEventListener("click", () => {

        const hadText =
            Boolean(input?.value && input.value.trim());

        saveInputToHistory(input);

        if (hadText) {
            closeMobileReportSheet();
        }
    });

    clearInput?.addEventListener("click", () => {

        if (input) {
            input.value = "";
            input.placeholder = "Paste Battle Report Here...";
        }

        saveStorage({
            ...getState(),
            lastInput: ""
        });
    });

    clearBtn?.addEventListener("click", () => {

        clearRuns();

        saveStorage(getState());

        render();
    });

    debugBtn?.addEventListener("click", () => {
        toggleDebug();
    });

    buildStyleSelect?.addEventListener("change", () => {

        const selected =
            buildStyleSelect.value || "unknown";

        const buildStyle =
            setBuildStyle(selected);

        refreshAnalysis({
            reason: "build_style_changed",
            buildStyle
        });

        saveStorage(getState());

        render();

        console.log(
            `[Tower Battle Intel] Build style set to ${buildStyle}`
        );
    });

    /* Legacy Save A / Save B support */
    saveA?.addEventListener("click", () => {
        saveToSlot("A", input);
    });

    saveB?.addEventListener("click", () => {
        saveToSlot("B", input);
    });

    bindDebugKeyboardShortcut();

    bindMobileDebugGesture();

    bindMobileCommandDeck(input);

    exposeDebugConsoleHelpers();

    console.log(
        "[Tower Battle Intel] Core events bound"
    );
}

/* --------------------------------------------------
   SAVE REPORT TO HISTORY
-------------------------------------------------- */

function saveInputToHistory(input) {

    const text =
        input?.value || "";

    if (!text.trim()) {

        console.warn(
            "[Tower Battle Intel] Save Report blocked: empty input"
        );

        if (input) {
            input.placeholder = "Paste a battle report first...";
        }

        return;
    }

    const result =
        saveReportToHistory(text);

    if (!result) {

        console.warn(
            "[Tower Battle Intel] Save Report failed"
        );

        return;
    }

    if (input) {
        input.value = "";
        input.placeholder = "Saved to Battle History. Paste another report here...";
    }

    saveStorage({
        ...getState(),
        lastInput: ""
    });

    render();
}

/* --------------------------------------------------
   LEGACY SAVE HELPER
-------------------------------------------------- */

function saveToSlot(slot, input) {

    const text =
        input?.value || "";

    if (!text.trim()) {

        console.warn(
            `[Tower Battle Intel] Save ${slot} blocked: empty input`
        );

        if (input) {
            input.placeholder = "Paste a battle report first...";
        }

        return;
    }

    const result =
        update(text, slot);

    if (!result) {

        console.warn(
            `[Tower Battle Intel] Save ${slot} failed`
        );

        return;
    }

    if (input) {
        input.value = "";
        input.placeholder = `Saved to Run ${slot}. Paste next battle report here...`;
    }

    saveStorage({
        ...getState(),
        lastInput: ""
    });

    render();
}

/* --------------------------------------------------
   BUILD STYLE SELECT SYNC
-------------------------------------------------- */

function syncBuildStyleSelect(select) {

    if (!select) {
        return;
    }

    const state =
        getState();

    select.value =
        state.ui?.buildStyle || "unknown";
}

/* --------------------------------------------------
   DEBUG TOGGLE
-------------------------------------------------- */

function toggleDebug(force = null) {

    const state =
        getState();

    const currentDebug =
        Boolean(state?.ui?.debug);

    const nextDebug =
        typeof force === "boolean"
            ? force
            : !currentDebug;

    setState({
        ui: {
            ...(state.ui || {}),
            debug: nextDebug
        }
    });

    saveStorage(getState());

    document.body.classList.toggle("debug-open", nextDebug);
    document.documentElement.classList.toggle("debug-open", nextDebug);

    if (isMobileMode()) {
        document.documentElement.classList.toggle("mobile-scroll-locked", nextDebug);
        document.body.classList.toggle("mobile-scroll-locked", nextDebug);
    }

    console.log(
        `[Tower Battle Intel] Debug ${nextDebug ? "enabled" : "disabled"}`
    );

    render();
}

/* --------------------------------------------------
   DESKTOP DEBUG SHORTCUTS
-------------------------------------------------- */

function bindDebugKeyboardShortcut() {

    window.addEventListener(
        "keydown",
        event => {

            const key =
                String(event.key || "").toLowerCase();

            const isBackquote =
                event.code === "Backquote" ||
                event.key === "`" ||
                event.key === "¬" ||
                event.key === "¦";

            const ctrlAltD =
                event.ctrlKey &&
                event.altKey &&
                key === "d";

            const altBackquote =
                event.altKey &&
                isBackquote;

            if (
                ctrlAltD ||
                altBackquote
            ) {

                event.preventDefault();
                event.stopPropagation();

                toggleDebug();
            }
        },
        true
    );
}

/* --------------------------------------------------
   HIDDEN BANNER DEBUG HOLD
-------------------------------------------------- */

function bindMobileDebugGesture() {

    const target =
        document.getElementById("debugHoldZone") ||
        document.querySelector(".topbar-banner-brand") ||
        document.querySelector(".topbar");

    if (!target) {
        return;
    }

    if (target.dataset.debugHoldBound === "true") {
        return;
    }

    target.dataset.debugHoldBound = "true";

    const HOLD_TIME_MS = 2600;
    const MOVE_CANCEL_PX = 14;

    let pressTimer = null;
    let startX = 0;
    let startY = 0;
    let holdActive = false;

    let tapCount = 0;
    let tapTimer = null;

    function clearPressTimer() {
        clearTimeout(pressTimer);
        pressTimer = null;
        holdActive = false;
    }

    function getPoint(event) {

        const point =
            event?.touches?.[0] ||
            event?.changedTouches?.[0] ||
            event;

        return {
            x: Number(point?.clientX || 0),
            y: Number(point?.clientY || 0)
        };
    }

    function startHold(event) {

        const point =
            getPoint(event);

        startX = point.x;
        startY = point.y;
        holdActive = true;

        clearTimeout(pressTimer);

        pressTimer = setTimeout(() => {

            if (!holdActive) {
                return;
            }

            vibrate();

            toggleDebug(true);

            clearPressTimer();

        }, HOLD_TIME_MS);
    }

    function moveHold(event) {

        if (!holdActive) {
            return;
        }

        const point =
            getPoint(event);

        const movedX =
            Math.abs(point.x - startX);

        const movedY =
            Math.abs(point.y - startY);

        if (movedX > MOVE_CANCEL_PX || movedY > MOVE_CANCEL_PX) {
            clearPressTimer();
        }
    }

    target.addEventListener("pointerdown", startHold);
    target.addEventListener("pointermove", moveHold);
    target.addEventListener("pointerup", clearPressTimer);
    target.addEventListener("pointerleave", clearPressTimer);
    target.addEventListener("pointercancel", clearPressTimer);

    target.addEventListener("contextmenu", event => {

        if (holdActive) {
            event.preventDefault();
        }
    });

    target.addEventListener("click", () => {

        tapCount++;

        clearTimeout(tapTimer);

        tapTimer = setTimeout(() => {
            tapCount = 0;
        }, 1600);

        if (tapCount >= 5) {

            tapCount = 0;

            clearTimeout(tapTimer);

            vibrate();

            toggleDebug(true);
        }
    });
}


/* --------------------------------------------------
   MOBILE COMMAND DECK
-------------------------------------------------- */

function bindMobileCommandDeck(input = null) {

    if (!isMobileMode()) {
        return;
    }

    const fab =
        document.getElementById("mobileReportFab");

    const backdrop =
        document.getElementById("mobileSheetBackdrop");

    const closeButton =
        document.getElementById("mobileInputClose");

    const commandRail =
        document.getElementById("mobileCommandRail");

    if (!fab) {
        return;
    }

    if (fab.dataset.mobileCommandBound === "true") {
        return;
    }

    fab.dataset.mobileCommandBound = "true";

    let holdTimer = null;
    let suppressNextClick = false;

    function setExpanded(value = false) {
        fab.setAttribute(
            "aria-expanded",
            value ? "true" : "false"
        );
    }

    function openSheet() {

        document.body.classList.remove("mobile-command-rail-open");
        document.body.classList.add("mobile-report-open");
        document.documentElement.classList.add("mobile-scroll-locked");
        document.body.classList.add("mobile-scroll-locked");

        setExpanded(true);

        // Do not auto-focus the textarea on mobile.
        // Android opens the keyboard immediately and can cover the command deck.
        // The user can tap the textarea when they are ready to type/paste.
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

        const shouldOpen =
            force == null
                ? !document.body.classList.contains("mobile-command-rail-open")
                : Boolean(force);

        document.body.classList.toggle(
            "mobile-command-rail-open",
            shouldOpen
        );

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

    fab.addEventListener("pointerup", () => {
        clearTimeout(holdTimer);
    });

    fab.addEventListener("pointerleave", () => {
        clearTimeout(holdTimer);
    });

    fab.addEventListener("pointercancel", () => {
        clearTimeout(holdTimer);
    });

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

    closeButton?.addEventListener("click", () => {
        closeSheet();
    });

    commandRail?.addEventListener("click", event => {

        const command =
            event.target?.closest?.("[data-mobile-command]");

        if (!command) {
            return;
        }

        const action =
            command.dataset.mobileCommand;

        if (action === "open-report") {
            openSheet();
            return;
        }

        if (action === "save-report") {
            document.getElementById("saveReport")?.click();
            toggleRail(false);
            return;
        }

        if (action === "clear-input") {
            document.getElementById("clearInput")?.click();
            toggleRail(false);
            openSheet();
            return;
        }

        if (action === "history-tab") {
            document.querySelector('[data-dashboard-tab="history"]')?.click();
            toggleRail(false);
        }
    });

    document.addEventListener("keydown", event => {

        if (event.key !== "Escape") {
            return;
        }

        closeSheet();
        toggleRail(false);
    });

    window.TowerBattleIntelMobileDeck = {
        openReport: openSheet,
        closeReport: closeSheet,
        toggleRail
    };
}

function closeMobileReportSheet() {

    document.body.classList.remove("mobile-report-open");

    if (!document.body.classList.contains("debug-open")) {
        document.documentElement.classList.remove("mobile-scroll-locked");
        document.body.classList.remove("mobile-scroll-locked");
    }

    const fab =
        document.getElementById("mobileReportFab");

    fab?.setAttribute("aria-expanded", "false");
}

/* --------------------------------------------------
   CONSOLE HELPERS
-------------------------------------------------- */

function exposeDebugConsoleHelpers() {

    window.BattleAnalyserDebug = {

        toggle() {
            toggleDebug();
            return getState();
        },

        show() {
            toggleDebug(true);
            return getState();
        },

        hide() {
            toggleDebug(false);
            return getState();
        },

        state() {
            return getState();
        },

        buildStyle(value = null) {

            if (!value) {
                return getState().ui?.buildStyle || "unknown";
            }

            const buildStyle =
                setBuildStyle(value);

            refreshAnalysis({
                reason: "console_build_style_changed",
                buildStyle
            });

            saveStorage(getState());

            render();

            return buildStyle;
        }
    };
}

/* --------------------------------------------------
   MOBILE VIBRATION
-------------------------------------------------- */

function vibrate() {

    if (
        typeof navigator !== "undefined" &&
        typeof navigator.vibrate === "function"
    ) {
        navigator.vibrate(40);
    }
}

function isMobileMode() {

    return (
        typeof document !== "undefined" &&
        document.documentElement?.getAttribute("data-device-mode") === "mobile"
    );
}
