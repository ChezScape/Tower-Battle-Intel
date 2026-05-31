"use strict";

/**
 * BROWSER CLICK TRUTH PROBE v4.11z52w59
 *
 * Temporary browser-visible diagnostics for the rebuild phase. This is not the
 * old Debug UI. It is a tiny always-on click/action status strip so local Chrome
 * testing can prove whether a click was seen, which handler caught it, which
 * action ran, and whether an error happened.
 */

export const BROWSER_CLICK_TRUTH_PROBE_VERSION = "v4.11z52w59";

const MAX_LOG = 18;

let enabled = true;
let sequence = 0;
let lastPointer = null;
let lastClick = null;
let lastHandled = null;
let lastError = null;
let lastRender = null;
let log = [];

export function ensureBrowserClickTruthProbe(doc = document) {
    if (!enabled || !doc?.body) return null;

    let probe = doc.querySelector("[data-browser-click-truth-probe]");
    if (!probe) {
        probe = doc.createElement("aside");
        probe.className = "tbi-click-truth-probe";
        probe.dataset.browserClickTruthProbe = BROWSER_CLICK_TRUTH_PROBE_VERSION;
        probe.setAttribute("role", "status");
        probe.setAttribute("aria-live", "polite");
        doc.body.appendChild(probe);
    }

    renderProbe(probe);
    return probe;
}

export function recordPointerProbe(event, phase = "capture") {
    lastPointer = makeEventSnapshot(event, phase, "pointerdown");
    pushLog(lastPointer);
    ensureBrowserClickTruthProbe(event?.target?.ownerDocument || document);
    return lastPointer;
}

export function recordClickProbe(event, phase = "capture") {
    lastClick = makeEventSnapshot(event, phase, "click");
    pushLog(lastClick);
    ensureBrowserClickTruthProbe(event?.target?.ownerDocument || document);
    return lastClick;
}

export function recordHandledProbe(details = {}) {
    lastHandled = {
        id: ++sequence,
        type: "handled",
        at: new Date().toISOString(),
        handler: String(details.handler || "unknown"),
        action: String(details.action || "none"),
        scope: String(details.scope || "shell"),
        result: String(details.result || "handled"),
        target: String(details.target || lastClick?.target || lastPointer?.target || "unknown")
    };
    pushLog(lastHandled);
    ensureBrowserClickTruthProbe(document);
    return lastHandled;
}

export function recordRenderProbe(details = {}) {
    lastRender = {
        id: ++sequence,
        type: "render",
        at: new Date().toISOString(),
        reason: String(details.reason || "ui-event"),
        activeTab: String(details.activeTab || "unknown")
    };
    pushLog(lastRender);
    ensureBrowserClickTruthProbe(document);
    return lastRender;
}

export function recordProbeError(error, details = {}) {
    const staleRender = isStaleRenderTimingError(error);
    lastError = {
        id: ++sequence,
        type: staleRender ? "guarded" : "error",
        at: new Date().toISOString(),
        handler: String(details.handler || "unknown"),
        action: String(details.action || "unknown"),
        message: staleRender
            ? "Guarded stale DOM timing after render"
            : String(error?.message || error || "Unknown error"),
        stack: staleRender ? "" : String(error?.stack || "").slice(0, 600)
    };
    pushLog(lastError);
    ensureBrowserClickTruthProbe(document);
    return lastError;
}

export function disableBrowserClickTruthProbe() {
    enabled = false;
    document.querySelector("[data-browser-click-truth-probe]")?.remove?.();
}

export function enableBrowserClickTruthProbe() {
    enabled = true;
    ensureBrowserClickTruthProbe(document);
}

export function getBrowserClickTruthProbeStatus() {
    return {
        version: BROWSER_CLICK_TRUTH_PROBE_VERSION,
        enabled,
        lastPointer,
        lastClick,
        lastHandled,
        lastError,
        lastRender,
        log: log.slice()
    };
}

export function exposeBrowserClickTruthProbe() {
    if (typeof window === "undefined") return;
    window.TowerBattleIntelClickTruth = Object.freeze({
        version: BROWSER_CLICK_TRUTH_PROBE_VERSION,
        status: getBrowserClickTruthProbeStatus,
        enable: enableBrowserClickTruthProbe,
        disable: disableBrowserClickTruthProbe,
        clear() {
            log = [];
            lastPointer = null;
            lastClick = null;
            lastHandled = null;
            lastError = null;
            lastRender = null;
            ensureBrowserClickTruthProbe(document);
            return getBrowserClickTruthProbeStatus();
        }
    });
}

function isStaleRenderTimingError(error = null) {
    const message = String(error?.message || error || "");
    return /replaceChildren|no longer a child|blur event handler|node to be removed/i.test(message);
}

function makeEventSnapshot(event, phase = "capture", type = "click") {
    const target = event?.target || null;
    const actionEl = findFirstInPath(event, el => el?.dataset?.uiAction || el?.dataset?.dashboardTab || el?.dataset?.historySlot);
    const rootEl = findFirstInPath(event, el => el?.classList?.contains?.("tbi-command-clean-view")
        || el?.classList?.contains?.("tbi-history-clean-view")
        || el?.classList?.contains?.("tbi-shell"));

    return {
        id: ++sequence,
        type,
        phase,
        at: new Date().toISOString(),
        target: describeElement(target),
        action: String(actionEl?.dataset?.uiAction || actionEl?.dataset?.dashboardTab || actionEl?.dataset?.historySlot || "none"),
        root: describeElement(rootEl),
        defaultPrevented: Boolean(event?.defaultPrevented),
        button: event?.button,
        clientX: event?.clientX,
        clientY: event?.clientY
    };
}

function findFirstInPath(event, predicate) {
    const path = typeof event?.composedPath === "function" ? event.composedPath() : [];
    for (const item of path) {
        if (item && item.nodeType === 1 && predicate(item)) return item;
    }
    return null;
}

function describeElement(element) {
    if (!element || element.nodeType !== 1) return "none";
    const tag = String(element.tagName || "element").toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const classes = element.className && typeof element.className === "string"
        ? `.${element.className.trim().split(/\s+/).slice(0, 3).join(".")}`
        : "";
    const data = element.dataset?.uiAction
        ? `[data-ui-action=${element.dataset.uiAction}]`
        : element.dataset?.dashboardTab
            ? `[data-dashboard-tab=${element.dataset.dashboardTab}]`
            : element.dataset?.historySlot
                ? `[data-history-slot=${element.dataset.historySlot}]`
                : "";
    const text = element.textContent?.trim?.().replace(/\s+/g, " ").slice(0, 42) || "";
    return `${tag}${id}${classes}${data}${text ? ` · ${text}` : ""}`;
}

function pushLog(entry) {
    log.unshift(entry);
    log = log.slice(0, MAX_LOG);
}

function renderProbe(probe) {
    const safe = escapeHTML;
    const handled = lastHandled ? `${lastHandled.handler} / ${lastHandled.action}` : "none yet";
    const clicked = lastClick ? `${lastClick.action} · ${lastClick.target}` : "none yet";
    const pointer = lastPointer ? `${lastPointer.action} · ${lastPointer.target}` : "none yet";
    const error = lastError ? `${lastError.handler}: ${lastError.message}` : "none";
    const render = lastRender ? `${lastRender.reason} / ${lastRender.activeTab}` : "none yet";

    probe.innerHTML = `
        <div class="tbi-click-truth-title">Click Truth Probe <b>${safe(BROWSER_CLICK_TRUTH_PROBE_VERSION)}</b></div>
        <div class="tbi-click-truth-grid">
            <span>Pointer</span><strong>${safe(pointer)}</strong>
            <span>Click</span><strong>${safe(clicked)}</strong>
            <span>Handled</span><strong>${safe(handled)}</strong>
            <span>Render</span><strong>${safe(render)}</strong>
            <span>Error</span><strong class="${lastError?.type === "error" ? "is-bad" : ""}">${safe(error)}</strong>
        </div>
    `;
}

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export default {
    BROWSER_CLICK_TRUTH_PROBE_VERSION,
    ensureBrowserClickTruthProbe,
    recordPointerProbe,
    recordClickProbe,
    recordHandledProbe,
    recordRenderProbe,
    recordProbeError,
    getBrowserClickTruthProbeStatus,
    exposeBrowserClickTruthProbe
};
