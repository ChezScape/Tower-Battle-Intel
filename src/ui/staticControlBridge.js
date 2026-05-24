"use strict";

/**
 * STATIC CONTROL BRIDGE v4.11c
 *
 * Small browser-native safety bridge for controls that must work even when
 * the rendered UI was replaced after the normal UI event binding.
 *
 * Owns only hard browser behaviours:
 * - permanent History Import file picker
 * - History Export JSON download
 * - Debug close / copy / JSON downloads
 * - tiny handler audit helpers
 */

import {
    performUIAction,
    actionGetState,
    actionExportHistoryJSON,
    actionImportHistoryText
} from "../actions/actions.js";

import {
    runSystemHealthScan,
    buildTimeInfo,
    buildUKFilenameTimestamp
} from "../diagnostics/systemHealthScan.js";

let bound = false;
let renderNow = null;

export function bindStaticControlBridge(renderCallback = null) {
    if (typeof renderCallback === "function") {
        renderNow = renderCallback;
    }

    if (bound || typeof document === "undefined") {
        return;
    }

    bound = true;

    ensureHistoryImportInput();

    document.addEventListener("click", handleStaticClick, true);
    document.addEventListener("change", handleStaticChange, true);
    document.addEventListener("keydown", handleStaticKeydown, true);

    installHandlerAuditHelpers();

    console.log("[Tower Battle Intel] Static control bridge bound");
}

function handleStaticClick(event) {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return;

    const debugHandled = handleDebugControlClick(event, target);
    if (debugHandled) return;

    if (target.matches("#historyImportInput, .history-native-import-input, [data-history-visible-import-input]")) {
        return;
    }

    const importTrigger = target.closest(".history-native-import-control, [data-native-history-import-control], [data-native-history-import-label], [data-history-import-trigger], [data-import-history-button], [data-import-history-label], [data-ui-action='import-history']");
    if (importTrigger) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openHistoryImportPicker();
        return;
    }

    const exportTrigger = target.closest("[data-export-history], [data-ui-action='export-history'], [data-ui-action='history-export-json']");
    if (exportTrigger) {
        if (exportTrigger.disabled || exportTrigger.getAttribute("aria-disabled") === "true") return;
        event.preventDefault();
        event.stopImmediatePropagation();
        downloadTextFile(actionExportHistoryJSON(), historyExportFilename(), "application/json;charset=utf-8");
    }
}

function handleStaticChange(event) {
    const target = event.target;
    if (!target || typeof target.matches !== "function") return;

    if (target.matches("#historyImportInput, #historyImportFallbackInput, [data-history-import-input], [data-import-history-input], [data-history-import-fallback-input]")) {
        importHistoryFromInput(target);
    }
}

function handleStaticKeydown(event) {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return;

    const importLabel = target.closest(".history-native-import-control, [data-native-history-import-control], [data-native-history-import-label], [data-history-import-trigger], [data-import-history-label]");
    if (importLabel && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openHistoryImportPicker();
        return;
    }

    if (event.key === "Escape" && document.getElementById("debugPanel")?.classList?.contains("active")) {
        closeDebugPanelFromBridge();
    }
}

function handleDebugControlClick(event, target) {
    const panel = target.closest("#debugPanel");
    if (!panel || !panel.classList.contains("active")) return false;

    if (target.closest("#debugClose, [data-debug-close]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeDebugPanelFromBridge();
        return true;
    }

    if (target.closest("#debugDownloadHealth, [data-debug-download-health]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        downloadTextFile(JSON.stringify(buildHealthPayload(), null, 2), `tower-battle-intel-health-scan-${buildUKFilenameTimestamp()}.json`, "application/json;charset=utf-8");
        return true;
    }

    if (target.closest("#debugDownloadFull, [data-debug-download-full]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        downloadTextFile(JSON.stringify(buildFullDebugPayload(), null, 2), `tower-battle-intel-debug-export-${buildUKFilenameTimestamp()}.json`, "application/json;charset=utf-8");
        return true;
    }

    if (target.closest("#debugCopyHealth, [data-debug-copy-health]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        copyText(JSON.stringify(buildHealthPayload(), null, 2));
        return true;
    }

    if (target.closest("#debugCopyFull, [data-debug-copy-full]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        copyText(JSON.stringify(buildFullDebugPayload(), null, 2));
        return true;
    }

    if (target.closest("#debugCopy, [data-debug-copy-shown]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        copyText(document.getElementById("debugOutput")?.textContent || "");
        return true;
    }

    return false;
}

function closeDebugPanelFromBridge() {
    try {
        performUIAction("toggle-debug", { force: false });
    } catch (error) {
        console.warn("[Tower Battle Intel] Debug state close failed, using DOM fallback", error);
    }

    const panel = document.getElementById("debugPanel");
    if (panel) {
        panel.classList.remove("active");
        panel.hidden = true;
        panel.inert = true;
        panel.setAttribute("aria-hidden", "true");
        panel.innerHTML = "";
    }

    document.body.classList.remove("debug-open");
    document.documentElement.classList.remove("debug-open");
}

function getVisibleHistoryImportInput() {
    return document.querySelector("#historyImportInput[data-history-visible-import-input], .history-native-import-input[data-history-visible-import-input], [data-history-visible-import-input]");
}

function ensureHistoryImportInput() {
    const visible = getVisibleHistoryImportInput();
    if (visible) return visible;

    let input = document.getElementById("historyImportFallbackInput");

    if (!input) {
        input = document.createElement("input");
        input.id = "historyImportFallbackInput";
        input.type = "file";
        input.accept = "application/json,.json";
        input.setAttribute("aria-label", "Fallback Import Battle History JSON");
        document.body.appendChild(input);
    }

    input.classList.add("native-file-input");
    input.dataset.historyImportFallbackInput = "true";

    return input;
}

function openHistoryImportPicker() {
    const input = getVisibleHistoryImportInput() || ensureHistoryImportInput();
    input.value = "";
    input.click();
    return input;
}

async function importHistoryFromInput(input) {
    const file = input?.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        actionImportHistoryText(text);
        renderApp();
    } catch (error) {
        console.error("[Tower Battle Intel] History import failed", error);
        alert("Import failed. The selected file was not valid Tower Battle Intel history JSON.");
    } finally {
        if (input) input.value = "";
    }
}

function buildHealthPayload() {
    return runSystemHealthScan(actionGetState());
}

function buildFullDebugPayload() {
    const state = actionGetState();
    return {
        app: "Tower Battle Intel",
        exportType: "full-debug-export",
        exportedAt: new Date().toISOString(),
        time: buildTimeInfo(),
        healthScan: runSystemHealthScan(state),
        state
    };
}

function historyExportFilename() {
    return `tower-battle-intel-history-${new Date().toISOString().replace(/[:.]/g, "-").replace("T", "-").slice(0, 19)}.json`;
}

function downloadTextFile(text, filename, type = "text/plain;charset=utf-8") {
    const blob = new Blob([String(text || "")], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
}

async function copyText(value = "") {
    const text = String(value || "");

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // fallback below
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-10000px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand("copy");
    } catch {
        // ignore
    }

    textarea.remove();
    return true;
}

function renderApp() {
    if (typeof renderNow === "function") {
        renderNow();
    }
}

function installHandlerAuditHelpers() {
    window.TowerBattleIntelHandlers = Object.freeze({
        status,
        openImportPicker: openHistoryImportPicker,
        exportHistory() {
            downloadTextFile(actionExportHistoryJSON(), historyExportFilename(), "application/json;charset=utf-8");
            return true;
        },
        downloadHealth() {
            downloadTextFile(JSON.stringify(buildHealthPayload(), null, 2), `tower-battle-intel-health-scan-${buildUKFilenameTimestamp()}.json`, "application/json;charset=utf-8");
            return true;
        },
        downloadFullDebug() {
            downloadTextFile(JSON.stringify(buildFullDebugPayload(), null, 2), `tower-battle-intel-debug-export-${buildUKFilenameTimestamp()}.json`, "application/json;charset=utf-8");
            return true;
        }
    });
}

function status() {
    return {
        staticBridgeBound: bound,
        filePickerExists: Boolean(document.querySelector("#historyImportInput, #historyImportFallbackInput, [data-history-visible-import-input], [data-history-import-fallback-input]")),
        visibleFilePickerExists: Boolean(getVisibleHistoryImportInput()),
        fallbackFilePickerExists: Boolean(document.getElementById("historyImportFallbackInput")),
        filePickerSelector: "#historyImportInput or #historyImportFallbackInput",
        debugPanelExists: Boolean(document.getElementById("debugPanel")),
        debugCloseExists: Boolean(document.getElementById("debugClose")),
        historyImportTriggers: document.querySelectorAll("[data-native-history-import-control], [data-native-history-import-label], [data-history-import-trigger], [data-import-history-button], [data-import-history-label], [data-ui-action='import-history']").length,
        historyExportTriggers: document.querySelectorAll("[data-export-history], [data-ui-action='export-history']").length,
        dashboardActionButtons: document.querySelectorAll("[data-ui-action]").length,
        dashboardTabs: document.querySelectorAll("[data-dashboard-tab]").length
    };
}
