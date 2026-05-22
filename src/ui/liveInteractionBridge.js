"use strict";

/**
 * LIVE INTERACTION BRIDGE v4.10l
 * Browser-level safety bridge for visible controls.
 *
 * This is deliberately small and delegated. It catches real browser clicks,
 * file input changes, native selects, debug buttons, history controls and
 * modal buttons even when a rendered section was replaced after binding.
 */

import {
    performUIAction,
    actionGetState,
    actionExportHistoryJSON,
    actionImportHistoryText,
    actionUpdateHistoryRunMeta
} from "../actions/actions.js";

import {
    buildHistoryStatsModal
} from "./layouts/historyStatsModal.js";

import {
    buildHistoryEditModal
} from "./layouts/historyEditModal.js";

import {
    runSystemHealthScan,
    buildTimeInfo,
    buildUKFilenameTimestamp
} from "../diagnostics/systemHealthScan.js";

let bound = false;
let renderNow = null;
let searchTimer = null;

export function bindLiveInteractionBridge(renderCallback = null) {
    if (typeof renderCallback === "function") {
        renderNow = renderCallback;
    }

    if (bound || typeof document === "undefined") {
        return;
    }

    bound = true;

    document.addEventListener("click", handleClick, true);
    document.addEventListener("change", handleChange, true);
    document.addEventListener("input", handleInput, true);
    document.addEventListener("keydown", handleKeydown, true);

    installConsoleBridge();

    console.log("[Tower Battle Intel] Live interaction bridge bound");
}

function handleClick(event) {
    const target = event.target;

    if (!target || typeof target.closest !== "function") {
        return;
    }

    if (handleDebugClick(event, target)) return;
    if (handleConfirmClick(event, target)) return;
    if (handleHistoryStatsClick(event, target)) return;
    if (handleHistoryEditClick(event, target)) return;

    // Do not block native details collapse/expand.
    if (target.closest("summary")) {
        return;
    }

    if (target.matches("#historyImportInput, .history-native-import-input, [data-history-visible-import-input]")) {
        return;
    }

    const importTrigger = target.closest(".history-native-import-control, [data-native-history-import-control], [data-native-history-import-label], [data-history-import-trigger], [data-import-history-trigger], [data-import-history-button], [data-import-history-label]");
    if (importTrigger) {
        event.preventDefault();
        event.stopPropagation();
        openImportPicker();
        return;
    }

    const exportTrigger = target.closest("[data-export-history], [data-ui-action='export-history'], [data-ui-action='history-export-json']");
    if (exportTrigger) {
        if (exportTrigger.getAttribute("aria-disabled") === "true" || exportTrigger.classList.contains("disabled")) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        downloadTextFile(actionExportHistoryJSON(), historyExportFilename(), "application/json;charset=utf-8");
        return;
    }

    const tab = target.closest("[data-dashboard-tab]");
    if (tab && !tab.disabled) {
        event.preventDefault();
        event.stopPropagation();
        runAction("set-dashboard-tab", { tab: tab.dataset.dashboardTab || "overview" });
        return;
    }

    const uiButton = target.closest("[data-ui-action]");
    if (uiButton && !uiButton.disabled) {
        event.preventDefault();
        event.stopPropagation();
        handleUIAction(uiButton);
        return;
    }

    const historyLoad = target.closest("[data-history-index][data-history-slot]");
    if (historyLoad && !historyLoad.disabled) {
        event.preventDefault();
        event.stopPropagation();
        runAction("history-load-run", {
            index: historyLoad.dataset.historyIndex,
            slot: historyLoad.dataset.historySlot || "runA"
        });
        return;
    }

    const stats = target.closest("[data-history-stats-index]");
    if (stats && !stats.disabled) {
        event.preventDefault();
        event.stopPropagation();
        openStatsModal(Number(stats.dataset.historyStatsIndex), stats);
        return;
    }

    const edit = target.closest("[data-history-edit-index]");
    if (edit && !edit.disabled) {
        event.preventDefault();
        event.stopPropagation();
        openEditModal(Number(edit.dataset.historyEditIndex), edit);
        return;
    }

    const archive = target.closest("[data-archive-history-index]");
    if (archive && !archive.disabled) {
        event.preventDefault();
        event.stopPropagation();
        runAction("history-archive-run", { index: archive.dataset.archiveHistoryIndex });
        return;
    }

    const restore = target.closest("[data-restore-history-index]");
    if (restore && !restore.disabled) {
        event.preventDefault();
        event.stopPropagation();
        runAction("history-restore-run", { index: restore.dataset.restoreHistoryIndex });
        return;
    }

    const del = target.closest("[data-delete-history-index]");
    if (del && !del.disabled) {
        event.preventDefault();
        event.stopPropagation();
        openConfirm({
            action: "history-delete-run",
            index: del.dataset.deleteHistoryIndex,
            phrase: "DELETE",
            title: `Delete Run ${Number(del.dataset.historyDisplayIndex || del.dataset.deleteHistoryIndex || 0) + 1}?`,
            message: "This saved run will be removed from Battle History Trace."
        });
        return;
    }

    const section = target.closest("[data-section]");
    if (section && !section.disabled && !section.closest("[data-history-stats-section], [data-history-stats-row]")) {
        event.preventDefault();
        event.stopPropagation();
        runAction("select-section", { section: section.dataset.section || "" });
    }
}

function handleUIAction(button) {
    const action = String(button.dataset.uiAction || "").trim();
    const payload = payloadFrom(button);

    switch (action) {
        case "import-history":
            openImportPicker();
            return;
        case "export-history":
        case "history-export-json":
            downloadTextFile(actionExportHistoryJSON(), historyExportFilename(), "application/json;charset=utf-8");
            return;
        case "delete-history-run":
            openConfirm({ action: "history-delete-run", index: payload.index, phrase: "DELETE", title: "Delete Saved Run?", message: "This saved run will be removed from Battle History Trace." });
            return;
        case "delete-last-history":
            openConfirm({ action: "history-delete-last", phrase: "LAST", title: "Delete Latest Saved Run?", message: "This removes the latest saved run only." });
            return;
        case "delete-all-history":
            openConfirm({ action: "history-delete-all", phrase: "DELETE ALL", title: "Delete All Battle History?", message: "This removes every saved run from this browser." });
            return;
        case "open-history-stats":
            openStatsModal(Number(payload.index), button);
            return;
        case "open-history-edit":
            openEditModal(Number(payload.index), button);
            return;
        default:
            runAction(action, payload);
    }
}

function payloadFrom(button) {
    return {
        tab: button.dataset.dashboardTab,
        section: button.dataset.section || button.dataset.compareSection,
        compareSection: button.dataset.compareSection,
        value: button.dataset.value,
        buildStyle: button.dataset.buildStyle,
        slot: button.dataset.historySlot || button.dataset.historyModalSlot,
        index: firstDefined(
            button.dataset.index,
            button.dataset.historyIndex,
            button.dataset.historyStatsIndex,
            button.dataset.historyEditIndex,
            button.dataset.deleteHistoryIndex,
            button.dataset.archiveHistoryIndex,
            button.dataset.restoreHistoryIndex,
            button.dataset.historyModalIndex
        ),
        input: document.getElementById("input")
    };
}

function handleChange(event) {
    const target = event.target;
    if (!target || typeof target.matches !== "function") return;

    if (target.matches("#historyImportInput, #historyImportFallbackInput, [data-history-import-input], [data-import-history-input], [data-history-import-fallback-input]")) {
        importFromInput(target);
        return;
    }

    if (target.matches("#buildStyleSelect")) {
        runAction("set-build-style", { buildStyle: target.value || "unknown" });
        return;
    }

    if (target.matches("[data-history-filter-sort]")) {
        runAction("history-set-filters", { filters: { sort: target.value || "newest" } });
        return;
    }

    if (target.matches("[data-history-filter-build]")) {
        runAction("history-set-filters", { filters: { build: target.value || "all" } });
        return;
    }

    if (target.matches("[data-history-filter-tag]")) {
        runAction("history-set-filters", { filters: { tag: target.value || "all" } });
        return;
    }

    if (target.matches("[data-history-filter-archived]")) {
        runAction("history-set-filters", { filters: { showArchived: Boolean(target.checked) } });
    }
}

function handleInput(event) {
    const target = event.target;
    if (!target || typeof target.matches !== "function") return;

    if (target.matches("[data-history-filter-query]")) {
        const value = target.value || "";
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            runAction("history-set-filters", { filters: { query: value } }, { preserveScroll: true });
        }, 160);
        return;
    }

    if (target.matches("[data-confirm-input]")) {
        updateConfirmState(target.closest("[data-confirm-modal]") || document.getElementById("historyConfirmModal"));
    }
}

function handleKeydown(event) {
    if (event.key !== "Escape") return;

    if (document.getElementById("debugPanel")?.classList?.contains("active")) {
        event.preventDefault();
        closeDebug();
        return;
    }

    closeStatsModal();
    closeEditModal();
    closeConfirm();
}

/* --------------------------------------------------
   DEBUG PANEL
-------------------------------------------------- */

function handleDebugClick(event, target) {
    const panel = target.closest("#debugPanel");
    if (!panel || !panel.classList.contains("active")) return false;

    const close = target.closest("#debugClose, [data-debug-close]");
    if (close) {
        event.preventDefault();
        event.stopPropagation();
        closeDebug();
        return true;
    }

    const view = target.closest("[data-debug-view]");
    if (view) {
        // Allow inspectionPanel's own delegated handler to run if present.
        return false;
    }

    const copyShown = target.closest("#debugCopy, [data-debug-copy-shown]");
    if (copyShown) {
        event.preventDefault();
        event.stopPropagation();
        copyText(document.getElementById("debugOutput")?.textContent || "");
        return true;
    }

    const copyHealth = target.closest("#debugCopyHealth, [data-debug-copy-health]");
    if (copyHealth) {
        event.preventDefault();
        event.stopPropagation();
        copyText(JSON.stringify(buildHealthPayload(), null, 2));
        return true;
    }

    const copyFull = target.closest("#debugCopyFull, [data-debug-copy-full]");
    if (copyFull) {
        event.preventDefault();
        event.stopPropagation();
        copyText(JSON.stringify(buildFullDebugPayload(), null, 2));
        return true;
    }

    const health = target.closest("#debugDownloadHealth, [data-debug-download-health]");
    if (health) {
        event.preventDefault();
        event.stopPropagation();
        downloadTextFile(JSON.stringify(buildHealthPayload(), null, 2), `tower-battle-intel-health-scan-${buildUKFilenameTimestamp()}.json`, "application/json;charset=utf-8");
        return true;
    }

    const full = target.closest("#debugDownloadFull, [data-debug-download-full]");
    if (full) {
        event.preventDefault();
        event.stopPropagation();
        downloadTextFile(JSON.stringify(buildFullDebugPayload(), null, 2), `tower-battle-intel-debug-export-${buildUKFilenameTimestamp()}.json`, "application/json;charset=utf-8");
        return true;
    }

    return false;
}

function closeDebug() {
    try {
        performUIAction("toggle-debug", { force: false });
    } catch (error) {
        console.warn("[Tower Battle Intel] Debug close action failed", error);
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

/* --------------------------------------------------
   HISTORY IMPORT / EXPORT
-------------------------------------------------- */

function getVisibleImportInput() {
    return document.querySelector("#historyImportInput[data-history-visible-import-input], .history-native-import-input[data-history-visible-import-input], [data-history-visible-import-input]");
}

function openImportPicker() {
    let input = getVisibleImportInput();

    if (!input) {
        input = document.getElementById("historyImportFallbackInput");
    }

    if (!input) {
        input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json,.json";
        input.id = "historyImportFallbackInput";
        input.dataset.historyImportFallbackInput = "true";
        input.style.position = "fixed";
        input.style.left = "-9999px";
        input.style.top = "0";
        input.style.width = "1px";
        input.style.height = "1px";
        input.style.opacity = "0";
        document.body.appendChild(input);
    }

    input.value = "";
    input.click();
    return input;
}

async function importFromInput(input) {
    const file = input?.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        actionImportHistoryText(text);
        renderApp();
    } catch (error) {
        console.error("[Tower Battle Intel] Import failed:", error);
        alert("Import failed. The selected file was not valid Tower Battle Intel history JSON.");
    } finally {
        if (input) input.value = "";
    }
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
    setTimeout(() => URL.revokeObjectURL(url), 300);
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
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand("copy"); } catch { /* ignore */ }
    textarea.remove();
    return true;
}

/* --------------------------------------------------
   HISTORY STATS / EDIT MODALS
-------------------------------------------------- */

function openStatsModal(index, button = null) {
    if (!Number.isInteger(index) || index < 0) return;
    const state = actionGetState();
    const history = Array.isArray(state.history) ? state.history : [];
    const run = history[index];
    if (!run) return;

    const mount = ensureMount("historyStatsModalMount");
    const displayIndex = Number(button?.dataset?.historyDisplayIndex);

    mount.innerHTML = buildHistoryStatsModal({
        run,
        index,
        displayIndex: Number.isInteger(displayIndex) ? displayIndex : index,
        history,
        visibleHistory: history.filter(item => !item?.meta?.archived),
        runA: state.runA,
        runB: state.runB
    });

    document.body.classList.add("history-stats-open");
}

function handleHistoryStatsClick(event, target) {
    const modal = target.closest("#historyStatsModal");
    if (!modal) return false;

    const close = target.closest("[data-history-stats-close]");
    if (close || target === modal) {
        event.preventDefault();
        closeStatsModal();
        return true;
    }

    const tab = target.closest("[data-history-stats-tab]");
    if (tab) {
        event.preventDefault();
        setStatsTab(tab.dataset.historyStatsTab || "overview");
        return true;
    }

    const slot = target.closest("[data-history-modal-slot]");
    if (slot) {
        event.preventDefault();
        runAction("history-load-run", { index: slot.dataset.historyModalIndex, slot: slot.dataset.historyModalSlot || "runA" });
        closeStatsModal();
        return true;
    }

    const copy = target.closest("[data-history-stats-copy]");
    if (copy) {
        event.preventDefault();
        copyText(JSON.stringify(getModalRun("historyStatsModal"), null, 2));
        return true;
    }

    const download = target.closest("[data-history-stats-download]");
    if (download) {
        event.preventDefault();
        downloadTextFile(JSON.stringify(getModalRun("historyStatsModal"), null, 2), "tower-battle-intel-history-run.json", "application/json;charset=utf-8");
        return true;
    }

    return false;
}

function setStatsTab(view) {
    const modal = document.getElementById("historyStatsModal");
    if (!modal) return;
    modal.querySelectorAll("[data-history-stats-tab]").forEach(button => {
        const active = button.dataset.historyStatsTab === view;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
    });
    modal.querySelectorAll("[data-history-stats-view]").forEach(panel => {
        panel.classList.toggle("active", panel.dataset.historyStatsView === view);
    });
}

function closeStatsModal() {
    const mount = document.getElementById("historyStatsModalMount");
    if (mount) mount.innerHTML = "";
    document.body.classList.remove("history-stats-open");
}

function openEditModal(index, button = null) {
    if (!Number.isInteger(index) || index < 0) return;
    const state = actionGetState();
    const history = Array.isArray(state.history) ? state.history : [];
    const run = history[index];
    if (!run) return;

    const mount = ensureMount("historyEditModalMount");
    const displayIndex = Number(button?.dataset?.historyDisplayIndex);

    mount.innerHTML = buildHistoryEditModal({
        run,
        index,
        displayIndex: Number.isInteger(displayIndex) ? displayIndex : index
    });

    document.body.classList.add("history-edit-open");
}

function handleHistoryEditClick(event, target) {
    const modal = target.closest("#historyEditModal");
    if (!modal) return false;

    const close = target.closest("[data-history-edit-close]");
    if (close || target === modal) {
        event.preventDefault();
        closeEditModal();
        return true;
    }

    const choice = target.closest("[data-history-edit-build-choice]");
    if (choice) {
        event.preventDefault();
        const value = choice.dataset.historyEditBuildChoice || "unknown";
        const input = modal.querySelector("[data-history-edit-build]");
        if (input) input.value = value;
        modal.querySelectorAll("[data-history-edit-build-choice]").forEach(button => button.classList.toggle("active", button === choice));
        return true;
    }

    const save = target.closest("[data-history-edit-save]");
    if (save) {
        event.preventDefault();
        const index = Number(modal.dataset.historyEditIndex);
        actionUpdateHistoryRunMeta(index, {
            notes: modal.querySelector("[data-history-edit-notes]")?.value || "",
            tags: modal.querySelector("[data-history-edit-tags]")?.value || "",
            buildStyle: modal.querySelector("[data-history-edit-build]")?.value || "unknown"
        });
        closeEditModal();
        renderApp();
        return true;
    }

    return false;
}

function closeEditModal() {
    const mount = document.getElementById("historyEditModalMount");
    if (mount) mount.innerHTML = "";
    document.body.classList.remove("history-edit-open");
}

function getModalRun(modalId) {
    const modal = document.getElementById(modalId);
    const index = Number(modal?.dataset?.historyStatsIndex || modal?.dataset?.historyEditIndex);
    const history = Array.isArray(actionGetState().history) ? actionGetState().history : [];
    return Number.isInteger(index) ? history[index] || null : null;
}

function ensureMount(id) {
    let mount = document.getElementById(id);
    if (!mount) {
        mount = document.createElement("div");
        mount.id = id;
        document.body.appendChild(mount);
    }
    return mount;
}

/* --------------------------------------------------
   CONFIRM MODAL
-------------------------------------------------- */

function openConfirm({ action, index = "", phrase = "DELETE", title = "Confirm Action", message = "This action cannot be undone." }) {
    let modal = document.getElementById("historyConfirmModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "historyConfirmModal";
        modal.className = "confirm-modal";
        modal.dataset.confirmModal = "true";
        modal.innerHTML = `
            <div class="confirm-card" role="dialog" aria-modal="true">
                <div class="confirm-title" data-confirm-title></div>
                <div class="confirm-message" data-confirm-message></div>
                <div class="confirm-warning">Type <strong data-confirm-required-phrase></strong> to continue.</div>
                <input class="confirm-input" data-confirm-input id="historyConfirmInput" autocomplete="off">
                <div class="confirm-actions">
                    <button type="button" data-confirm-cancel>No, Cancel</button>
                    <button type="button" data-confirm-accept class="danger" disabled>Confirm</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }

    modal.dataset.confirmAction = action;
    modal.dataset.confirmIndex = index == null ? "" : String(index);
    modal.dataset.confirmPhrase = phrase;
    modal.querySelector("[data-confirm-title]").textContent = title;
    modal.querySelector("[data-confirm-message]").textContent = message;
    modal.querySelector("[data-confirm-required-phrase]").textContent = phrase;
    const input = modal.querySelector("[data-confirm-input]");
    input.value = "";
    input.placeholder = `Type ${phrase}`;
    modal.hidden = false;
    modal.inert = false;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    updateConfirmState(modal);
    setTimeout(() => input.focus(), 20);
}

function handleConfirmClick(event, target) {
    const modal = target.closest("[data-confirm-modal], #historyConfirmModal");
    if (!modal || !modal.classList.contains("active")) return false;

    const cancel = target.closest("[data-confirm-cancel]");
    if (cancel || target === modal) {
        event.preventDefault();
        closeConfirm();
        return true;
    }

    const accept = target.closest("[data-confirm-accept]");
    if (accept) {
        event.preventDefault();
        if (!accept.disabled) {
            const action = modal.dataset.confirmAction || "";
            const index = modal.dataset.confirmIndex;
            closeConfirm();
            runAction(action, { index });
        }
        return true;
    }

    return false;
}

function updateConfirmState(modal) {
    if (!modal) return;
    const phrase = String(modal.dataset.confirmPhrase || "DELETE").toUpperCase();
    const typed = String(modal.querySelector("[data-confirm-input]")?.value || "").trim().toUpperCase();
    const accept = modal.querySelector("[data-confirm-accept]");
    if (accept) accept.disabled = typed !== phrase;
}

function closeConfirm() {
    const modal = document.getElementById("historyConfirmModal");
    if (!modal) return;
    if (modal.contains(document.activeElement)) document.activeElement.blur();
    modal.classList.remove("active");
    modal.hidden = true;
    modal.inert = true;
    modal.setAttribute("aria-hidden", "true");
}

/* --------------------------------------------------
   ACTION / RENDER
-------------------------------------------------- */

function runAction(action, payload = {}, options = {}) {
    const scroll = options.preserveScroll ? { x: window.scrollX || 0, y: window.scrollY || 0 } : null;
    const result = performUIAction(action, payload || {});
    renderApp();
    if (scroll) requestAnimationFrame(() => window.scrollTo(scroll.x, scroll.y));
    return result;
}

function renderApp() {
    if (typeof renderNow === "function") {
        renderNow();
    } else if (window.TowerBattleIntel?.render) {
        window.TowerBattleIntel.render();
    }
}

function firstDefined(...values) {
    return values.find(value => value !== undefined && value !== null && String(value) !== "");
}

function installConsoleBridge() {
    window.TowerBattleIntelBridge = Object.freeze({
        openImportPicker,
        downloadHistory() {
            downloadTextFile(actionExportHistoryJSON(), historyExportFilename(), "application/json;charset=utf-8");
            return true;
        },
        closeDebug,
        health() { return buildHealthPayload(); },
        fullDebug() { return buildFullDebugPayload(); }
    });
}

export default bindLiveInteractionBridge;
