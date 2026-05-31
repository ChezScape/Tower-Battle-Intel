"use strict";

/**
 * MOBILE SHELL EVENTS v4.11z52w12
 * Minimal mobile shell open/close owner. Real mobile actions remain parked.
 */

import { closestEnabled, consumeEvent, UI_EVENT_FOUNDATION_VERSION } from "./shellEventUtils.js";
import { activateTab } from "./tabEvents.js";

let mobileCommandCount = 0;
let mobileCloseCount = 0;

export function handleMobileShellClick(event, context = {}) {
    const mobileCommand = closestEnabled(event?.target, "[data-mobile-command]");

    if (!mobileCommand) {
        return false;
    }

    consumeEvent(event);
    handleMobileCommand(mobileCommand.dataset.mobileCommand || "", context);
    return true;
}

export function handleMobileShellKeydown(event) {
    if (event?.key !== "Escape") {
        return false;
    }

    closeMobileShell();
    return true;
}

export function handleMobileCommand(command = "", context = {}) {
    mobileCommandCount += 1;

    switch (command) {
        case "open-report":
            openMobileShell();
            break;
        case "history-tab":
            closeMobileShell();
            activateTab("history", context.renderApp);
            break;
        case "save-report":
        case "clear-input":
        default:
            context.showToast?.(`${command || "Mobile command"} is parked for the UI shell reset.`);
            break;
    }
}

export function openMobileShell() {
    document.body?.classList.add("mobile-report-open");
    document.documentElement?.classList.add("mobile-scroll-locked");
    document.body?.classList.add("mobile-scroll-locked");
    document.getElementById("mobileReportFab")?.setAttribute("aria-expanded", "true");
}

export function closeMobileShell() {
    mobileCloseCount += 1;
    document.body?.classList.remove("mobile-report-open", "mobile-command-rail-open", "mobile-scroll-locked");
    document.documentElement?.classList.remove("mobile-scroll-locked");
    document.getElementById("mobileReportFab")?.setAttribute("aria-expanded", "false");
}

export function getMobileShellEventStatus() {
    return {
        module: "mobileShellEvents",
        version: UI_EVENT_FOUNDATION_VERSION,
        active: true,
        owns: ["data-mobile-command", "Escape mobile close"],
        mobileCommands: mobileCommandCount,
        mobileCloses: mobileCloseCount
    };
}
