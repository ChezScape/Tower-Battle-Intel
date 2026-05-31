"use strict";

/**
 * UI EVENT ROOT v4.11z52w47
 *
 * Capture-level rebuilt event owner with a browser-visible click truth probe.
 * Top nav still owns tabs. workspaceEvents.js owns active Command Deck +
 * History controls. importExportEvents.js owns shared file picker/download IO.
 */

import { getState } from "../../core/state.js";
import { UI_EVENT_FOUNDATION_VERSION } from "./shellEventUtils.js";
import { activateTab, getTabEventStatus, handleTabClick } from "./tabEvents.js";
import { closeMobileShell, getMobileShellEventStatus, handleMobileShellClick, handleMobileShellKeydown } from "./mobileShellEvents.js";
import { handleWorkspaceClick, handleWorkspaceChange, handleWorkspaceInput, handleWorkspaceKeydown, getWorkspaceEventStatus } from "./workspaceEvents.js";
import { getImportExportEventStatus } from "./importExportEvents.js";
import {
    ensureBrowserClickTruthProbe,
    exposeBrowserClickTruthProbe,
    getBrowserClickTruthProbeStatus,
    recordClickProbe,
    recordHandledProbe,
    recordPointerProbe,
    recordProbeError,
    recordRenderProbe
} from "./browserClickTruthProbe.js";

let bound = false;
let renderNow = null;
let pointerEvents = 0;
let clickEvents = 0;
let changeEvents = 0;
let inputEvents = 0;
let keydownEvents = 0;
let lastHandledBy = "";
let lastCaptureTarget = "";
let lastError = "";

const clickHandlers = Object.freeze([
    ["tabEvents", handleTabClick],
    ["mobileShellEvents", handleMobileShellClick],
    ["workspaceEvents", handleWorkspaceClick]
]);

const changeHandlers = Object.freeze([
    ["workspaceEvents", handleWorkspaceChange]
]);

const inputHandlers = Object.freeze([
    ["workspaceEvents", handleWorkspaceInput]
]);

const keydownHandlers = Object.freeze([
    ["mobileShellEvents", handleMobileShellKeydown],
    ["workspaceEvents", handleWorkspaceKeydown]
]);

export function bindUIEvents(renderCallback = null) {
    if (typeof renderCallback === "function") {
        renderNow = renderCallback;
    }

    if (bound) {
        syncShellRuntime();
        ensureBrowserClickTruthProbe(document);
        return;
    }

    bound = true;

    // Capture phase is intentional. It proves clicks reach the rebuilt owner
    // before any old bubble-phase code, modal shell, or broad parked listener can
    // swallow them. Bubble fallback is not used for active workspace controls.
    document.addEventListener("pointerdown", handleDocumentPointerDownCapture, true);
    document.addEventListener("click", handleDocumentClickCapture, true);
    document.addEventListener("change", handleDocumentChangeCapture, true);
    document.addEventListener("input", handleDocumentInputCapture, true);
    document.addEventListener("keydown", handleDocumentKeydownCapture, true);

    exposeShellConsole();
    exposeBrowserClickTruthProbe();
    syncShellRuntime();
    ensureBrowserClickTruthProbe(document);
}

function isStaleRenderTimingError(error = null) {
    const message = String(error?.message || error || "");
    return /replaceChildren|no longer a child|blur event handler|node to be removed/i.test(message);
}

function handleEventError(error, details = {}) {
    lastError = String(error?.message || error || "Unknown event error");
    recordProbeError(error, details);
    if (!isStaleRenderTimingError(error)) {
        showShellToast(`TBI ${details.action || "event"} error: ${lastError}`);
    }
}

function handleDocumentPointerDownCapture(event) {
    pointerEvents += 1;
    const snapshot = recordPointerProbe(event, "capture");
    lastCaptureTarget = snapshot.target;
}

function handleDocumentClickCapture(event) {
    clickEvents += 1;
    const snapshot = recordClickProbe(event, "capture");
    lastCaptureTarget = snapshot.target;
    const context = getEventContext();

    for (const [name, handler] of clickHandlers) {
        try {
            if (handler(event, context)) {
                lastHandledBy = name;
                recordHandledProbe({
                    handler: name,
                    action: snapshot.action || "unknown",
                    scope: name === "workspaceEvents" ? "workspace" : "shell",
                    target: snapshot.target,
                    result: "click handled"
                });
                return;
            }
        } catch (error) {
            handleEventError(error, { handler: name, action: snapshot.action || "click" });
            return;
        }
    }

    recordHandledProbe({
        handler: "none",
        action: snapshot.action || "none",
        scope: "unhandled",
        target: snapshot.target,
        result: "click seen but no handler matched"
    });
}

function handleDocumentChangeCapture(event) {
    changeEvents += 1;
    const context = getEventContext();

    for (const [name, handler] of changeHandlers) {
        try {
            if (handler(event, context)) {
                lastHandledBy = name;
                recordHandledProbe({ handler: name, action: "change", scope: "workspace", result: "change handled" });
                return;
            }
        } catch (error) {
            handleEventError(error, { handler: name, action: "change" });
            return;
        }
    }
}

function handleDocumentInputCapture(event) {
    inputEvents += 1;
    const context = getEventContext();

    for (const [name, handler] of inputHandlers) {
        try {
            if (handler(event, context)) {
                lastHandledBy = name;
                return;
            }
        } catch (error) {
            handleEventError(error, { handler: name, action: "input" });
            return;
        }
    }
}

function handleDocumentKeydownCapture(event) {
    keydownEvents += 1;
    const context = getEventContext();

    for (const [name, handler] of keydownHandlers) {
        try {
            if (handler(event, context)) {
                lastHandledBy = name;
                return;
            }
        } catch (error) {
            handleEventError(error, { handler: name, action: "keydown" });
            return;
        }
    }
}

function getEventContext() {
    return {
        renderApp,
        showToast: showShellToast
    };
}

function renderApp() {
    if (typeof renderNow === "function") {
        renderNow();
        recordRenderProbe({
            reason: "ui-event",
            activeTab: getState().ui?.dashboardTab || "command"
        });
        // The render replaces dashboard innerHTML, so rebuild the visible probe.
        ensureBrowserClickTruthProbe(document);
    }
}

function showShellToast(message = "Action") {
    let toast = document.querySelector("[data-ui-shell-toast]");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "tbi-ui-shell-toast";
        toast.dataset.uiShellToast = "true";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        document.body?.appendChild(toast);
    }

    toast.textContent = message;
    toast.dataset.visible = "true";

    window.clearTimeout(showShellToast.timer);
    showShellToast.timer = window.setTimeout(() => {
        toast.dataset.visible = "false";
    }, 2600);
}

function syncShellRuntime() {
    document.documentElement.dataset.uiShellEvents = "v4.11z52w47";
    document.documentElement.dataset.uiEventModules = "capture-workspace-events-click-truth";
    document.documentElement.dataset.oldParkedCatchAll = "removed";
    document.body?.setAttribute("data-ui-shell-events", "v4.11z52w47");
    document.body?.setAttribute("data-ui-event-modules", "capture-workspace-events-click-truth");
    document.body?.setAttribute("data-old-parked-catch-all", "removed");
}

export function getUIShellEventStatus() {
    return {
        version: "v4.11z52w47",
        foundationVersion: UI_EVENT_FOUNDATION_VERSION,
        owner: "src/ui/events/index.js",
        bound,
        capturePhaseOwner: true,
        activeTab: getState().ui?.dashboardTab || "command",
        shellPanels: document.querySelectorAll("[data-ui-visual-shell]").length,
        legacyWorkspaceEventsActive: false,
        oldParkedCatchAllActive: false,
        realWorkspaceActionsActive: true,
        lastHandledBy,
        lastCaptureTarget,
        lastError,
        counts: { pointerEvents, clickEvents, changeEvents, inputEvents, keydownEvents },
        modules: [
            getTabEventStatus(),
            getMobileShellEventStatus(),
            getWorkspaceEventStatus(),
            getImportExportEventStatus()
        ],
        clickTruth: getBrowserClickTruthProbeStatus()
    };
}

function exposeShellConsole() {
    window.TowerBattleIntelUIShell = Object.freeze({
        status: getUIShellEventStatus,
        activateTab(tab = "command") {
            return activateTab(tab, renderApp);
        },
        closeMobileShell
    });
}

export default {
    bindUIEvents,
    getUIShellEventStatus
};
