"use strict";

/**
 * FINAL CONTROL POLISH BRIDGE v4.11q
 *
 * Focuses only on the remaining working-but-unreliable controls after v4.11q:
 * - Dashboard quiet display toggle
 * - History Stats Download JSON
 * - History Edit build-style buttons
 * - Debug Health JSON download
 * - Debug Full Debug JSON download
 *
 * This bridge deliberately avoids native selects/details/textareas so it does not undo
 * the v4.11q native-control guard fix.
 */

import {
    performUIAction,
    actionGetState,
    actionUpdateHistoryRunMeta
} from "../actions/actions.js";

import {
    runSystemHealthScan,
    buildTimeInfo,
    buildUKFilenameTimestamp
} from "../diagnostics/systemHealthScan.js";

const VERSION = "v4.11q";
const BOUND_FLAG = "__TowerBattleIntelFinalControlPolishBridgeBound";

let renderNow = null;
let lastAction = null;
let lastDownload = null;
let lastError = null;

export function bindFinalControlPolishBridge(renderCallback = null) {
    if (typeof renderCallback === "function") {
        renderNow = renderCallback;
    }

    if (typeof document === "undefined") return false;

    if (window[BOUND_FLAG]) {
        installStatusHook();
        return true;
    }

    window[BOUND_FLAG] = true;

    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeydown, true);

    installStatusHook();
    console.log("[Tower Battle Intel] Final control polish bridge bound", VERSION);
    return true;
}

function handleClick(event) {
    const target = event.target;
    if (!isElement(target)) return;

    if (handleDisplayModeToggle(event, target)) return;
    if (handleStatsDownload(event, target)) return;
    if (handleEditBuildChoice(event, target)) return;
    if (handleDebugDownloads(event, target)) return;
}

function handleKeydown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target;
    if (!isElement(target)) return;

    if (target.closest("[data-history-edit-build-choice]")) {
        handleEditBuildChoice(event, target);
    }
}

/* --------------------------------------------------
   Dashboard quiet display toggle
-------------------------------------------------- */

function handleDisplayModeToggle(event, target) {
    const button = target.closest(".tbi-mode-toggle, [data-ui-action='toggle-display-mode'], [data-ui-action='toggle-quiet-display']");
    if (!button || button.disabled) return false;

    capture(event);

    const next = toggleQuietDisplay();
    lastAction = {
        action: "toggle-display-mode",
        quietDisplay: next,
        at: now()
    };
    stamp(lastAction);

    toast(next ? "Quiet display enabled." : "Quiet display disabled.", "good");
    return true;
}

function toggleQuietDisplay() {
    let next = null;

    try {
        const result = performUIAction("toggle-display-mode", {});
        if (typeof result === "boolean") next = result;
    } catch {
        // local fallback below
    }

    if (typeof next !== "boolean") {
        next = !document.documentElement.classList.contains("tbi-quiet-display");
    }

    document.documentElement.classList.toggle("tbi-quiet-display", next);
    document.body?.classList?.toggle("tbi-quiet-display", next);
    try { localStorage.setItem("tower_battle_intel_quiet_display", next ? "true" : "false"); } catch { /* ignore */ }

    renderAppSoon();
    window.setTimeout(() => {
        document.documentElement.classList.toggle("tbi-quiet-display", next);
        document.body?.classList?.toggle("tbi-quiet-display", next);
    }, 0);

    return next;
}

/* --------------------------------------------------
   Stats modal download
-------------------------------------------------- */

function handleStatsDownload(event, target) {
    const button = target.closest("[data-history-stats-download], .history-stats-download, [data-ui-action='history-stats-download']");
    if (!button || button.disabled) return false;

    const modal = button.closest("#historyStatsModal, [data-history-stats-modal]") || document.getElementById("historyStatsModal");
    if (!modal) return false;

    capture(event);

    const run = getStatsModalRun(modal);
    const payload = {
        app: "Tower Battle Intel",
        exportType: "history-run-export",
        exportedAt: new Date().toISOString(),
        run
    };

    const filename = `tower-battle-intel-history-run-${fileTimestamp()}.json`;
    const ok = downloadJSON(payload, filename);

    lastAction = { action: "history-stats-download", at: now(), filename, ok };
    stamp(lastAction);
    toast(ok ? "Stats JSON downloaded." : "Stats JSON download failed.", ok ? "good" : "bad");
    return true;
}

function getStatsModalRun(modal) {
    const state = safeState();
    const history = Array.isArray(state.history) ? state.history : [];
    const index = Number(
        modal?.dataset?.historyStatsIndex ??
        modal?.querySelector?.("[data-history-modal-index]")?.dataset?.historyModalIndex ??
        modal?.querySelector?.("[data-history-stats-index]")?.dataset?.historyStatsIndex
    );

    if (Number.isInteger(index) && history[index]) return history[index];

    const titleText = modal?.textContent || "";
    const byReportId = history.find(run => run?.meta?.reportId && titleText.includes(String(run.meta.reportId)));
    return byReportId || history[0] || null;
}

/* --------------------------------------------------
   Edit modal build buttons
-------------------------------------------------- */

function handleEditBuildChoice(event, target) {
    const button = target.closest("[data-history-edit-build-choice]");
    if (!button || button.disabled) return false;

    const modal = button.closest("#historyEditModal, [data-history-edit-modal]");
    if (!modal) return false;

    capture(event);

    const value = String(button.dataset.historyEditBuildChoice || "unknown").trim() || "unknown";
    const hidden = modal.querySelector("[data-history-edit-build]");
    if (hidden) {
        hidden.value = value;
        hidden.setAttribute("value", value);
        hidden.dispatchEvent(new Event("input", { bubbles: true }));
        hidden.dispatchEvent(new Event("change", { bubbles: true }));
    }

    modal.querySelectorAll("[data-history-edit-build-choice]").forEach(choice => {
        const active = choice === button;
        choice.classList.toggle("active", active);
        choice.setAttribute("aria-pressed", active ? "true" : "false");
    });

    // Apply immediately to runtime state too. The Save button can still close/confirm later,
    // but this makes the buttons visibly and functionally work at once.
    const index = Number(modal.dataset.historyEditIndex);
    if (Number.isInteger(index)) {
        try {
            actionUpdateHistoryRunMeta(index, { buildStyle: value });
        } catch {
            // keep UI update even if action layer refuses
        }
    }

    lastAction = { action: "history-edit-build-choice", buildStyle: value, at: now() };
    stamp(lastAction);
    return true;
}

/* --------------------------------------------------
   Debug downloads
-------------------------------------------------- */

function handleDebugDownloads(event, target) {
    const health = target.closest("#debugDownloadHealth, [data-debug-download-health]");
    const full = target.closest("#debugDownloadFull, [data-debug-download-full]");

    if (!health && !full) return false;

    capture(event);

    if (health) {
        const filename = `tower-battle-intel-health-scan-${safeUKTimestamp()}.json`;
        const payload = safeHealthPayload();
        const ok = downloadJSON(payload, filename);
        lastAction = { action: "debug-download-health", at: now(), filename, ok };
        stamp(lastAction);
        toast(ok ? "Health JSON downloaded." : "Health JSON download failed.", ok ? "good" : "bad");
        return true;
    }

    const filename = `tower-battle-intel-debug-export-${safeUKTimestamp()}.json`;
    const payload = buildFullDebugPayload();
    const ok = downloadJSON(payload, filename);
    lastAction = { action: "debug-download-full", at: now(), filename, ok };
    stamp(lastAction);
    toast(ok ? "Full Debug JSON downloaded." : "Full Debug JSON download failed.", ok ? "good" : "bad");
    return true;
}

function safeHealthPayload() {
    try {
        return runSystemHealthScan(safeState());
    } catch (error) {
        return {
            app: "Tower Battle Intel",
            exportType: "health-scan",
            status: "fallback",
            generatedAt: new Date().toISOString(),
            error: String(error?.message || error),
            stateSummary: stateSummary()
        };
    }
}

function buildFullDebugPayload() {
    return {
        app: "Tower Battle Intel",
        exportType: "full-debug-export",
        version: window.TowerBattleIntel?.version || VERSION,
        exportedAt: new Date().toISOString(),
        time: safeTimeInfo(),
        state: safeState(),
        health: safeHealthPayload(),
        controls: window.TowerBattleIntelNativeControls?.status?.() || null,
        nativeGuard: window.TowerBattleIntelNativeControlGuard?.status?.() || null,
        finalControlPolish: status(),
        location: typeof location !== "undefined" ? location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : ""
    };
}

/* --------------------------------------------------
   download helper
-------------------------------------------------- */

function downloadJSON(payload, filename) {
    return downloadText(JSON.stringify(payload ?? {}, null, 2), filename, "application/json;charset=utf-8");
}

function downloadText(text, filename, type) {
    try {
        const blob = new Blob([String(text || "")], { type: type || "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.rel = "noopener";
        link.style.position = "fixed";
        link.style.left = "-9999px";
        link.style.top = "0";
        link.style.width = "1px";
        link.style.height = "1px";
        document.body.appendChild(link);

        // Use native click(), not dispatchEvent(), because Chrome treats it more reliably
        // for downloads inside a trusted user click path.
        link.click();

        window.setTimeout(() => {
            try { URL.revokeObjectURL(url); } catch { /* ignore */ }
            try { link.remove(); } catch { /* ignore */ }
        }, 1500);

        lastDownload = { filename, type, at: now(), bytes: String(text || "").length };
        document.documentElement.dataset.finalControlLastDownload = filename;
        document.documentElement.dataset.finalControlLastDownloadAt = lastDownload.at;
        return true;
    } catch (error) {
        lastError = String(error?.message || error);
        console.error("[Tower Battle Intel] Final control download failed", error);
        return false;
    }
}

/* --------------------------------------------------
   Status / helpers
-------------------------------------------------- */

function installStatusHook() {
    const api = {
        version: VERSION,
        status,
        downloadHealth: () => downloadJSON(safeHealthPayload(), `tower-battle-intel-health-scan-${safeUKTimestamp()}.json`),
        downloadFullDebug: () => downloadJSON(buildFullDebugPayload(), `tower-battle-intel-debug-export-${safeUKTimestamp()}.json`),
        toggleQuietDisplay
    };

    window.TowerBattleIntelFinalControlPolish = api;

    const existing = window.TowerBattleIntelNativeControls;
    if (existing && !existing.__finalControlPolishWrapped) {
        const previousStatus = typeof existing.status === "function" ? existing.status.bind(existing) : null;
        window.TowerBattleIntelNativeControls = {
            ...existing,
            __finalControlPolishWrapped: true,
            status() {
                let base = {};
                try { base = previousStatus ? previousStatus() : {}; } catch (error) { base = { statusError: String(error?.message || error) }; }
                return {
                    ...base,
                    finalControlPolishBound: Boolean(window[BOUND_FLAG]),
                    finalControlPolishVersion: VERSION,
                    quietDisplayActive: document.documentElement.classList.contains("tbi-quiet-display"),
                    lastFinalControlAction: lastAction,
                    lastFinalControlDownload: lastDownload,
                    lastFinalControlError: lastError
                };
            }
        };
    }
}

function status() {
    return {
        version: VERSION,
        bound: Boolean(window[BOUND_FLAG]),
        quietDisplayActive: document.documentElement.classList.contains("tbi-quiet-display"),
        statsDownloadButtons: document.querySelectorAll("[data-history-stats-download]").length,
        editBuildButtons: document.querySelectorAll("[data-history-edit-build-choice]").length,
        debugHealthButtons: document.querySelectorAll("#debugDownloadHealth, [data-debug-download-health]").length,
        debugFullButtons: document.querySelectorAll("#debugDownloadFull, [data-debug-download-full]").length,
        lastAction,
        lastDownload,
        lastError
    };
}

function safeState() {
    try { return actionGetState() || {}; } catch { return {}; }
}

function stateSummary() {
    const state = safeState();
    return {
        hasRunA: Boolean(state.runA),
        hasRunB: Boolean(state.runB),
        historyCount: Array.isArray(state.history) ? state.history.length : 0,
        activeView: state.ui?.activeView || state.activeView || null
    };
}

function safeTimeInfo() {
    try { return buildTimeInfo(); } catch { return { iso: new Date().toISOString() }; }
}

function safeUKTimestamp() {
    try { return buildUKFilenameTimestamp(); } catch { return fileTimestamp(); }
}

function fileTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, "-").replace("T", "-").slice(0, 19);
}

function renderAppSoon() {
    window.setTimeout(() => {
        try {
            if (typeof renderNow === "function") renderNow();
            else if (window.TowerBattleIntel?.render) window.TowerBattleIntel.render();
        } catch { /* ignore */ }
    }, 0);
}

function toast(message, tone = "good") {
    let mount = document.getElementById("finalControlPolishToastMount");
    if (!mount) {
        mount = document.createElement("div");
        mount.id = "finalControlPolishToastMount";
        document.body.appendChild(mount);
    }

    mount.innerHTML = `<div class="final-control-toast ${escapeAttr(tone)}" role="status">${escapeHTML(message)}</div>`;
    window.setTimeout(() => { if (mount) mount.innerHTML = ""; }, 3400);
}

function capture(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
}

function stamp(action) {
    try {
        document.documentElement.dataset.finalControlLastAction = action.action || "unknown";
        document.documentElement.dataset.finalControlLastActionAt = action.at || now();
    } catch { /* ignore */ }
}

function isElement(value) {
    return Boolean(value && value.nodeType === 1 && typeof value.closest === "function");
}

function now() {
    return new Date().toISOString();
}

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeAttr(value = "") {
    return escapeHTML(value).replace(/"/g, "&quot;");
}

export default {
    bindFinalControlPolishBridge
};
