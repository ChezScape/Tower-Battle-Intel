"use strict";

/**
 * UI EVENTS
 * v4.9v full action audit.
 *
 * This file is intentionally one delegated UI bridge.
 * It does not directly mutate history/state except through actions.js.
 */

import { render } from "./render.js";
import { getState } from "../core/state.js";
import {
    actionArchiveHistoryRun,
    actionClearHistory,
    actionClearHistorySelection,
    actionClearInput,
    actionClearRuns,
    actionDeleteHistoryRun,
    actionDeleteLastRun,
    actionExportHistoryJSON,
    actionImportHistoryText,
    actionLoadHistoryRun,
    actionOpenCompareSection,
    actionResetHistoryFilters,
    actionSaveReportFromInput,
    actionSelectDashboardTab,
    actionSelectSection,
    actionSetBuildStyle,
    actionSetHistoryFilters,
    actionSwapHistorySlots,
    actionToggleDebug,
    actionToggleDisplayMode,
    actionUpdateHistoryRunMeta
} from "../actions/actions.js";
import { saveStorage } from "../storage/localStore.js";
import { buildHistoryStatsModal } from "./layouts/historyStatsModal.js";
import { buildHistoryEditModal } from "./layouts/historyEditModal.js";

let eventsBound = false;
let historySearchTimer = null;

/* --------------------------------------------------
   BIND UI EVENTS
-------------------------------------------------- */

export function bindUIEvents() {
    if (eventsBound) {
        syncRuntimeClasses();
        return;
    }

    eventsBound = true;

    document.addEventListener("click", handleDocumentClick, false);
    document.addEventListener("change", handleDocumentChange, false);
    document.addEventListener("input", handleDocumentInput, false);
    document.addEventListener("toggle", handleDocumentToggle, true);
    document.addEventListener("keydown", handleDocumentKeydown, true);

    syncRuntimeClasses();
}

/* --------------------------------------------------
   CLICK DELEGATE
-------------------------------------------------- */

function handleDocumentClick(event) {
    const target = event.target;

    if (!target || typeof target.closest !== "function") {
        return;
    }

    if (handleConfirmClick(event, target)) return;
    if (handleHistoryStatsClick(event, target)) return;
    if (handleHistoryEditClick(event, target)) return;
    if (handleHistoryClick(event, target)) return;
    if (handleSystemTileClick(event, target)) return;
    if (handleUIActionClick(event, target)) return;
    if (handleDashboardTabClick(event, target)) return;
    if (handleLegacyViewClick(event, target)) return;
}

function handleDashboardTabClick(event, target) {
    const button = target.closest("[data-dashboard-tab]");

    if (!button || button.disabled) {
        return false;
    }

    event.preventDefault();

    const tab = button.dataset.dashboardTab || "overview";
    const previous = getState().ui?.dashboardTab || "overview";

    actionSelectDashboardTab(tab);
    render();

    if (tab === previous && isMobileMode()) {
        scrollMobileTop({ smooth: true });
    } else if (isMobileMode()) {
        scrollMobileTop();
    }

    return true;
}

function handleUIActionClick(event, target) {
    const button = target.closest("[data-ui-action]");

    if (!button || button.disabled) {
        return false;
    }

    const action = button.dataset.uiAction || "";

    switch (action) {
        case "save-report":
            event.preventDefault();
            actionSaveReportFromInput(getInputElement());
            closeMobileReportSheet();
            render();
            return true;

        case "clear-input":
            event.preventDefault();
            actionClearInput(getInputElement());
            return true;

        case "clear-runs":
            event.preventDefault();
            actionClearRuns();
            render();
            return true;

        case "open-command":
            event.preventDefault();
            actionSelectDashboardTab("command");
            render();
            return true;

        case "open-history":
            event.preventDefault();
            actionSelectDashboardTab("history");
            render();
            return true;

        case "open-compare-section":
            event.preventDefault();
            actionOpenCompareSection(button.dataset.sectionTarget || "");
            render();
            scrollCompareSection(button.dataset.sectionTarget || "");
            return true;

        case "toggle-debug":
            event.preventDefault();
            actionToggleDebug();
            render();
            syncRuntimeClasses();
            return true;

        case "toggle-display-mode":
            event.preventDefault();
            actionToggleDisplayMode();
            syncRuntimeClasses();
            render();
            syncRuntimeClasses();
            return true;

        case "history-import":
            event.preventDefault();
            openHistoryImportPicker();
            return true;

        case "history-export":
            event.preventDefault();
            exportHistory();
            return true;

        default:
            return false;
    }
}

function handleSystemTileClick(event, target) {
    const tile = target.closest("[data-section]");

    if (!tile || tile.disabled) {
        return false;
    }

    event.preventDefault();

    const selected = actionSelectSection(tile.dataset.section || "");
    render();

    if (selected && isMobileMode()) {
        scrollElementIntoView(".wa-drillgrid", {
            fallbackSelector: '[data-dashboard-panel="systems"]',
            offset: 14,
            smooth: false
        });
    }

    return true;
}

function handleLegacyViewClick(event, target) {
    const button = target.closest("[data-view]");

    if (!button || button.disabled) {
        return false;
    }

    event.preventDefault();
    actionSelectDashboardTab(button.dataset.view || "overview");
    render();
    return true;
}

/* --------------------------------------------------
   HISTORY CLICKS
-------------------------------------------------- */

function handleHistoryClick(event, target) {
    const loadButton = target.closest("[data-history-index][data-history-slot]");

    if (loadButton && !loadButton.disabled) {
        event.preventDefault();
        actionLoadHistoryRun(loadButton.dataset.historyIndex, loadButton.dataset.historySlot || "runA");
        render();
        return true;
    }

    const statsButton = target.closest("[data-history-stats-index]");

    if (statsButton && !statsButton.disabled) {
        event.preventDefault();
        openHistoryStatsModalFromButton(statsButton);
        return true;
    }

    const editButton = target.closest("[data-history-edit-index]");

    if (editButton && !editButton.disabled) {
        event.preventDefault();
        openHistoryEditModalFromButton(editButton);
        return true;
    }

    const archiveButton = target.closest("[data-archive-history-index]");

    if (archiveButton && !archiveButton.disabled) {
        event.preventDefault();
        actionArchiveHistoryRun(archiveButton.dataset.archiveHistoryIndex);
        render();
        return true;
    }

    const restoreButton = target.closest("[data-restore-history-index]");

    if (restoreButton && !restoreButton.disabled) {
        event.preventDefault();
        actionRestoreHistoryRun(restoreButton.dataset.restoreHistoryIndex);
        render();
        return true;
    }

    const deleteButton = target.closest("[data-delete-history-index]");

    if (deleteButton && !deleteButton.disabled) {
        event.preventDefault();
        const index = Number(deleteButton.dataset.deleteHistoryIndex);
        openHistoryConfirmModal({
            action: "delete-run",
            index,
            title: `Delete Run ${Number.isInteger(index) ? index + 1 : ""}?`,
            message: "This will permanently remove this saved run from Battle History Trace.",
            finalTitle: "Delete This Run",
            finalMessage: "This saved run will be removed from this browser. If it is loaded in A or B, that slot will be cleared.",
            buttonText: "Delete This Run",
            requiredPhrase: "DELETE"
        });
        return true;
    }

    const swapButton = target.closest("[data-swap-history-slots]");

    if (swapButton && !swapButton.disabled) {
        event.preventDefault();
        actionSwapHistorySlots();
        render();
        return true;
    }

    const clearSelectionButton = target.closest("[data-clear-history-selection]");

    if (clearSelectionButton && !clearSelectionButton.disabled) {
        event.preventDefault();
        actionClearHistorySelection();
        render();
        return true;
    }

    const exportButton = target.closest("[data-export-history]");

    if (exportButton && !exportButton.disabled) {
        event.preventDefault();
        exportHistory();
        return true;
    }

    const deleteLastButton = target.closest("[data-delete-last-history]");

    if (deleteLastButton && !deleteLastButton.disabled) {
        event.preventDefault();
        openHistoryConfirmModal({
            action: "delete-last",
            title: "Delete Latest Saved Run?",
            message: "This will permanently remove only the latest saved run from Battle History Trace.",
            finalTitle: "Delete Latest Run",
            finalMessage: "Only the latest saved run will be deleted. Current A/B slots will be repaired if needed.",
            buttonText: "Delete Latest Run",
            requiredPhrase: "LAST"
        });
        return true;
    }

    const deleteAllButton = target.closest("[data-delete-all-history]");

    if (deleteAllButton && !deleteAllButton.disabled) {
        event.preventDefault();
        openHistoryConfirmModal({
            action: "delete-all",
            title: "Delete All Battle History?",
            message: "This will permanently remove every saved battle report from this browser and clear Run A / Run B.",
            finalTitle: "Final Warning",
            finalMessage: "All saved battle history will be permanently deleted from this browser.",
            buttonText: "Yes, Delete Everything",
            requiredPhrase: "DELETE ALL"
        });
        return true;
    }

    const resetButton = target.closest("[data-history-filter-reset]");

    if (resetButton && !resetButton.disabled) {
        event.preventDefault();
        actionResetHistoryFilters();
        render();
        return true;
    }

    const toggleArchived = target.closest("[data-history-filter-value='showArchived']");

    if (toggleArchived && !toggleArchived.disabled) {
        event.preventDefault();
        const option = toggleArchived.dataset.historyFilterOption === "true";
        actionSetHistoryFilters({ showArchived: option });
        render();
        return true;
    }

    return false;
}

/* --------------------------------------------------
   CHANGE / INPUT DELEGATES
-------------------------------------------------- */

function handleDocumentChange(event) {
    const target = event.target;

    if (!target || typeof target.matches !== "function") {
        return;
    }

    if (target.matches("[data-import-history-input]")) {
        handleHistoryImportInput(target);
        return;
    }

    if (target.matches("[data-history-filter-sort]")) {
        actionSetHistoryFilters({ sort: target.value || "newest" });
        render();
        return;
    }

    if (target.matches("[data-history-filter-build]")) {
        actionSetHistoryFilters({ build: target.value || "all" });
        render();
        return;
    }

    if (target.matches("[data-history-filter-tag]")) {
        actionSetHistoryFilters({ tag: target.value || "all" });
        render();
        return;
    }

    if (target.matches("[data-history-filter-archived]")) {
        actionSetHistoryFilters({ showArchived: Boolean(target.checked) });
        render();
        return;
    }

}

function handleDocumentInput(event) {
    const target = event.target;

    if (!target || typeof target.matches !== "function") {
        return;
    }

    if (target.matches("[data-history-filter-query]")) {
        const value = target.value || "";
        const scrollPosition = { x: window.scrollX || 0, y: window.scrollY || 0 };

        clearTimeout(historySearchTimer);
        historySearchTimer = window.setTimeout(() => {
            actionSetHistoryFilters({ query: value });
            render();
            restoreHistorySearchFocus(value, scrollPosition);
        }, 160);
        return;
    }

    if (target.matches("[data-confirm-input]")) {
        updateConfirmContinueState();
        return;
    }

    if (target.matches("[data-history-stats-section-search]")) {
        filterHistoryStatsSections(target.value || "");
    }
}

function handleDocumentToggle(event) {
    const drawer = event.target;

    if (!drawer?.matches?.("[data-history-drawer]")) {
        return;
    }

    const name = drawer.dataset.historyDrawer || "drawer";

    try {
        window.sessionStorage?.setItem(
            `tbi.history.drawer.${name}`,
            drawer.open ? "open" : "closed"
        );
    } catch {
        // sessionStorage may be unavailable.
    }
}

function handleDocumentKeydown(event) {
    const target = event.target;

    if (
        (event.key === "Enter" || event.key === " ") &&
        target?.closest?.(".history-import-label[for]")
    ) {
        event.preventDefault();
        const label = target.closest(".history-import-label[for]");
        const input = document.getElementById(label.getAttribute("for"));
        input?.click?.();
        return;
    }

    if (event.key !== "Escape") {
        return;
    }

    if (document.getElementById("historyConfirmModal")?.classList.contains("active")) {
        event.preventDefault();
        closeHistoryConfirmModal();
        return;
    }

    if (document.getElementById("historyStatsModal")) {
        event.preventDefault();
        closeHistoryStatsModal();
        return;
    }

    if (document.getElementById("historyEditModal")) {
        event.preventDefault();
        closeHistoryEditModal();
    }
}

/* --------------------------------------------------
   HISTORY IMPORT / EXPORT
-------------------------------------------------- */

function openHistoryImportPicker() {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "application/json,.json";
    input.setAttribute("aria-label", "Import Battle History JSON");
    input.dataset.importHistoryInput = "true";

    Object.assign(input.style, {
        position: "fixed",
        left: "-9999px",
        top: "0",
        width: "1px",
        height: "1px",
        opacity: "0"
    });

    input.addEventListener("change", () => {
        handleHistoryImportInput(input, { removeAfter: true });
    }, { once: true });

    document.body.appendChild(input);
    input.click();

    window.addEventListener("focus", () => {
        window.setTimeout(() => {
            if (input.isConnected && !input.files?.length) {
                input.remove();
            }
        }, 800);
    }, { once: true });
}

async function handleHistoryImportInput(input, { removeAfter = false } = {}) {
    const file = input?.files?.[0];

    if (!file) {
        if (removeAfter) input?.remove?.();
        return;
    }

    try {
        const text = await file.text();
        actionImportHistoryText(text);
        render();
    } catch (error) {
        console.warn("[Tower Battle Intel] Failed to import history:", error);
    } finally {
        if (input) input.value = "";
        if (removeAfter) input?.remove?.();
    }
}

function exportHistory() {
    downloadTextFile(
        actionExportHistoryJSON(),
        buildHistoryExportFilename(),
        "application/json;charset=utf-8"
    );
}

/* --------------------------------------------------
   CONFIRM MODAL
-------------------------------------------------- */

function handleConfirmClick(event, target) {
    const cancel = target.closest("[data-confirm-cancel]");

    if (cancel) {
        event.preventDefault();
        closeHistoryConfirmModal();
        return true;
    }

    const continueButton = target.closest("[data-confirm-continue]");

    if (continueButton && !continueButton.disabled) {
        event.preventDefault();
        showHistoryConfirmFinalStep();
        return true;
    }

    const accept = target.closest("[data-confirm-accept]");

    if (accept) {
        event.preventDefault();
        runConfirmedHistoryAction();
        return true;
    }

    const modal = document.getElementById("historyConfirmModal");

    if (modal && target === modal) {
        event.preventDefault();
        closeHistoryConfirmModal();
        return true;
    }

    return false;
}

function openHistoryConfirmModal({
    action = "",
    index = null,
    title = "Confirm Action",
    message = "This action needs confirmation.",
    finalTitle = "Final Warning",
    finalMessage = "This action cannot be undone.",
    buttonText = "Confirm",
    requiredPhrase = "DELETE"
} = {}) {
    const modal = document.getElementById("historyConfirmModal");
    const input = modal?.querySelector("[data-confirm-input]");

    if (!modal) {
        return;
    }

    modal.dataset.confirmAction = action;
    modal.dataset.confirmIndex = index == null ? "" : String(index);
    modal.dataset.confirmPhrase = String(requiredPhrase || "DELETE").trim().toUpperCase();

    setModalText(modal, "[data-confirm-title]", title);
    setModalText(modal, "[data-confirm-message]", message);
    setModalText(modal, "[data-confirm-final-title]", finalTitle);
    setModalText(modal, "[data-confirm-final-message]", finalMessage);
    setModalText(modal, "[data-confirm-accept]", buttonText);
    setModalText(modal, "[data-confirm-required-phrase]", modal.dataset.confirmPhrase);

    if (input) {
        input.value = "";
        input.placeholder = `Type ${modal.dataset.confirmPhrase}`;
        input.setAttribute("aria-label", `Type ${modal.dataset.confirmPhrase} to confirm`);
    }

    modal.hidden = false;
    modal.inert = false;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    showHistoryConfirmTypeStep();
    updateConfirmContinueState();

    window.setTimeout(() => input?.focus?.(), 25);
}

function closeHistoryConfirmModal() {
    const modal = document.getElementById("historyConfirmModal");
    const input = modal?.querySelector("[data-confirm-input]");

    if (!modal) {
        return;
    }

    if (modal.contains(document.activeElement)) {
        document.activeElement?.blur?.();
    }

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    modal.inert = true;
    modal.hidden = true;
    modal.dataset.confirmAction = "";
    modal.dataset.confirmIndex = "";
    modal.dataset.confirmPhrase = "DELETE";

    if (input) {
        input.value = "";
        input.placeholder = "Type DELETE";
    }

    showHistoryConfirmTypeStep();
    updateConfirmContinueState();
}

function updateConfirmContinueState() {
    const modal = document.getElementById("historyConfirmModal");
    const input = modal?.querySelector("[data-confirm-input]");
    const button = modal?.querySelector("[data-confirm-continue]");

    if (!modal || !button) {
        return;
    }

    const typed = String(input?.value || "").trim().toUpperCase();
    const required = String(modal.dataset.confirmPhrase || "DELETE").trim().toUpperCase();

    button.disabled = typed !== required;
}

function showHistoryConfirmTypeStep() {
    const modal = document.getElementById("historyConfirmModal");
    modal?.querySelector("[data-confirm-step='type']")?.classList.remove("hidden");
    modal?.querySelector("[data-confirm-step='final']")?.classList.add("hidden");
}

function showHistoryConfirmFinalStep() {
    const modal = document.getElementById("historyConfirmModal");
    modal?.querySelector("[data-confirm-step='type']")?.classList.add("hidden");
    modal?.querySelector("[data-confirm-step='final']")?.classList.remove("hidden");
}

function runConfirmedHistoryAction() {
    const modal = document.getElementById("historyConfirmModal");

    if (!modal) {
        return;
    }

    const action = modal.dataset.confirmAction || "";
    const index = Number(modal.dataset.confirmIndex);

    if (action === "delete-run") {
        actionDeleteHistoryRun(index);
    }

    if (action === "delete-last") {
        actionDeleteLastRun();
    }

    if (action === "delete-all") {
        actionClearHistory();
    }

    closeHistoryConfirmModal();
    render();
}

/* --------------------------------------------------
   HISTORY STATS MODAL
-------------------------------------------------- */

function handleHistoryStatsClick(event, target) {
    const close = target.closest("[data-history-stats-close]");

    if (close) {
        event.preventDefault();
        closeHistoryStatsModal();
        return true;
    }

    const tab = target.closest("[data-history-stats-tab]");

    if (tab) {
        event.preventDefault();
        setHistoryStatsTab(tab.dataset.historyStatsTab || "overview");
        return true;
    }

    const slot = target.closest("[data-history-modal-slot]");

    if (slot) {
        event.preventDefault();
        actionLoadHistoryRun(slot.dataset.historyModalIndex, slot.dataset.historyModalSlot || "runA");
        closeHistoryStatsModal();
        render();
        return true;
    }

    const copy = target.closest("[data-history-stats-copy]");

    if (copy) {
        event.preventDefault();
        copyHistoryStatsJSON();
        return true;
    }

    const download = target.closest("[data-history-stats-download]");

    if (download) {
        event.preventDefault();
        downloadHistoryStatsJSON();
        return true;
    }

    const modal = document.getElementById("historyStatsModal");

    if (modal && target === modal) {
        event.preventDefault();
        closeHistoryStatsModal();
        return true;
    }

    return false;
}

function openHistoryStatsModalFromButton(button) {
    const index = Number(button?.dataset?.historyStatsIndex);

    if (!Number.isInteger(index)) {
        return;
    }

    const state = getState();
    const history = Array.isArray(state.history) ? state.history : [];
    const run = history[index];

    if (!run) {
        return;
    }

    const mount = document.getElementById("historyStatsModalMount");

    if (!mount) {
        return;
    }

    const displayIndex = Number(button?.dataset?.historyDisplayIndex);

    mount.innerHTML = buildHistoryStatsModal({
        run,
        index,
        displayIndex: Number.isInteger(displayIndex) ? displayIndex : index,
        history,
        visibleHistory: getVisibleHistoryRunsFromDOM(history),
        runA: state.runA,
        runB: state.runB
    });

    document.body.classList.add("history-stats-open");
    window.setTimeout(() => mount.querySelector("[data-history-stats-close]")?.focus?.(), 25);
}

function getVisibleHistoryRunsFromDOM(history = []) {
    const indexes = Array.from(document.querySelectorAll("[data-history-stats-index]"))
        .map(button => Number(button.dataset.historyStatsIndex))
        .filter(Number.isInteger);

    return indexes.length ? indexes.map(index => history[index]).filter(Boolean) : history;
}

function closeHistoryStatsModal() {
    const mount = document.getElementById("historyStatsModalMount");
    if (mount) mount.innerHTML = "";
    document.body.classList.remove("history-stats-open");
}

function setHistoryStatsTab(view = "overview") {
    const modal = document.getElementById("historyStatsModal");
    const targetView = String(view || "overview");

    if (!modal) {
        return;
    }

    modal.querySelectorAll("[data-history-stats-tab]").forEach(button => {
        const active = button.dataset.historyStatsTab === targetView;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    modal.querySelectorAll("[data-history-stats-view]").forEach(panel => {
        panel.classList.toggle("active", panel.dataset.historyStatsView === targetView);
    });
}

function filterHistoryStatsSections(query = "") {
    const modal = document.getElementById("historyStatsModal");

    if (!modal) {
        return;
    }

    const needle = String(query || "").trim().toLowerCase();
    let shown = 0;

    modal.querySelectorAll("[data-history-stats-section]").forEach(section => {
        const haystack = String(section.dataset.sectionSearch || "").toLowerCase();
        const sectionVisible = !needle || haystack.includes(needle);
        let matchedRows = 0;

        section.querySelectorAll("[data-history-stats-row]").forEach(row => {
            const rowHaystack = String(row.dataset.historyStatsRowSearch || "").toLowerCase();
            const rowMatches = Boolean(needle && rowHaystack.includes(needle));
            row.classList.toggle("search-match", rowMatches);
            if (rowMatches) matchedRows++;
        });

        const visible = sectionVisible || matchedRows > 0;
        section.hidden = !visible;
        section.classList.toggle("search-row-match", matchedRows > 0);
        if (visible) shown++;

        const pill = section.querySelector("[data-history-stats-match-pill]");
        if (pill) {
            pill.hidden = !needle;
            pill.textContent = matchedRows ? `Matched ${matchedRows}` : "Section match";
        }
    });

    const empty = modal.querySelector("[data-history-stats-no-results]");
    if (empty) empty.hidden = shown !== 0;
}

function getHistoryStatsModalRun() {
    const modal = document.getElementById("historyStatsModal");
    const index = Number(modal?.dataset?.historyStatsIndex);
    const history = Array.isArray(getState().history) ? getState().history : [];
    return Number.isInteger(index) ? history[index] || null : null;
}

async function copyHistoryStatsJSON() {
    const run = getHistoryStatsModalRun();
    if (!run) return;
    await copyTextToClipboard(JSON.stringify(run, null, 2));
    flashButtonText("[data-history-stats-copy]", "Copied", "Copy JSON");
}

function downloadHistoryStatsJSON() {
    const run = getHistoryStatsModalRun();
    if (!run) return;
    const reportId = String(run?.meta?.reportId || "history-run").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
    downloadTextFile(JSON.stringify(run, null, 2), `tower-battle-intel-${reportId}.json`, "application/json;charset=utf-8");
}

/* --------------------------------------------------
   HISTORY EDIT MODAL
-------------------------------------------------- */

function handleHistoryEditClick(event, target) {
    const close = target.closest("[data-history-edit-close]");

    if (close) {
        event.preventDefault();
        closeHistoryEditModal();
        return true;
    }

    const buildChoice = target.closest("[data-history-edit-build-choice]");

    if (buildChoice) {
        event.preventDefault();
        setHistoryEditBuild(buildChoice);
        return true;
    }

    const save = target.closest("[data-history-edit-save]");

    if (save) {
        event.preventDefault();
        saveHistoryEditModal();
        return true;
    }

    const modal = document.getElementById("historyEditModal");

    if (modal && target === modal) {
        event.preventDefault();
        closeHistoryEditModal();
        return true;
    }

    return false;
}

function openHistoryEditModalFromButton(button) {
    const index = Number(button?.dataset?.historyEditIndex);

    if (!Number.isInteger(index)) {
        return;
    }

    const state = getState();
    const history = Array.isArray(state.history) ? state.history : [];
    const run = history[index];

    if (!run) {
        return;
    }

    const mount = document.getElementById("historyEditModalMount");

    if (!mount) {
        return;
    }

    const displayIndex = Number(button?.dataset?.historyDisplayIndex);

    mount.innerHTML = buildHistoryEditModal({
        run,
        index,
        displayIndex: Number.isInteger(displayIndex) ? displayIndex : index
    });

    document.body.classList.add("history-edit-open");
    window.setTimeout(() => mount.querySelector("[data-history-edit-notes]")?.focus?.(), 25);
}

function setHistoryEditBuild(button) {
    const modal = document.getElementById("historyEditModal");

    if (!modal || !button) {
        return;
    }

    const value = button.dataset.historyEditBuildChoice || "unknown";
    const input = modal.querySelector("[data-history-edit-build]");

    if (input) input.value = value;

    modal.querySelectorAll("[data-history-edit-build-choice]").forEach(choice => {
        const active = choice === button;
        choice.classList.toggle("active", active);
        choice.setAttribute("aria-pressed", active ? "true" : "false");
    });
}

function saveHistoryEditModal() {
    const modal = document.getElementById("historyEditModal");
    const index = Number(modal?.dataset?.historyEditIndex);

    if (!modal || !Number.isInteger(index)) {
        return;
    }

    actionUpdateHistoryRunMeta(index, {
        notes: modal.querySelector("[data-history-edit-notes]")?.value || "",
        tags: modal.querySelector("[data-history-edit-tags]")?.value || "",
        buildStyle: modal.querySelector("[data-history-edit-build]")?.value || "unknown"
    });

    closeHistoryEditModal();
    render();
}

function closeHistoryEditModal() {
    const mount = document.getElementById("historyEditModalMount");
    if (mount) mount.innerHTML = "";
    document.body.classList.remove("history-edit-open");
}

/* --------------------------------------------------
   UTILS
-------------------------------------------------- */

function getInputElement() {
    return document.getElementById("input");
}

function restoreHistorySearchFocus(value = "", scrollPosition = null) {
    window.requestAnimationFrame(() => {
        if (scrollPosition) window.scrollTo(scrollPosition.x, scrollPosition.y);

        const input = document.querySelector("[data-history-filter-query]");
        if (!input) return;

        input.focus({ preventScroll: true });
        const caret = String(value || "").length;
        try { input.setSelectionRange(caret, caret); } catch {}

        if (scrollPosition) {
            window.requestAnimationFrame(() => window.scrollTo(scrollPosition.x, scrollPosition.y));
        }
    });
}

function syncRuntimeClasses() {
    const state = getState();
    const debugOpen = Boolean(state?.ui?.debug);
    const quiet = Boolean(state?.ui?.quietDisplay);

    document.body.classList.toggle("debug-open", debugOpen);
    document.documentElement.classList.toggle("debug-open", debugOpen);
    document.body.classList.toggle("tbi-quiet-display", quiet);
    document.documentElement.classList.toggle("tbi-quiet-display", quiet);
}

function closeMobileReportSheet() {
    document.body.classList.remove("mobile-report-open");
    document.documentElement.classList.remove("mobile-scroll-locked");
    document.body.classList.remove("mobile-scroll-locked");
    document.getElementById("mobileReportFab")?.setAttribute("aria-expanded", "false");
}

function scrollMobileTop({ smooth = false } = {}) {
    if (!isMobileMode()) return;
    scrollElementIntoView("[data-mobile-quick-strip]", {
        fallbackSelector: "[data-dashboard-shell]",
        offset: 8,
        smooth
    });
}

function scrollCompareSection(section = "") {
    const key = String(section || "").trim();
    if (!key) return;
    window.requestAnimationFrame(() => {
        scrollElementIntoView(`[data-compare-section="${cssEscape(key)}"]`, { offset: 16, smooth: true });
    });
}

function scrollElementIntoView(selector, { fallbackSelector = null, offset = 12, smooth = false } = {}) {
    window.requestAnimationFrame(() => {
        const target = document.querySelector(selector) || (fallbackSelector ? document.querySelector(fallbackSelector) : null);
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const top = Math.max(0, window.scrollY + rect.top - offset);
        window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
    });
}

function isMobileMode() {
    return document.documentElement?.getAttribute("data-device-mode") === "mobile";
}

function setModalText(modal, selector, value = "") {
    const element = modal?.querySelector(selector);
    if (element) element.textContent = String(value || "");
}

function downloadTextFile(text = "", filename = "download.txt", type = "text/plain") {
    const blob = new Blob([String(text || "")], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => URL.revokeObjectURL(url), 250);
}

function buildHistoryExportFilename() {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "-").slice(0, 19);
    return `tower-battle-intel-history-${stamp}.json`;
}

async function copyTextToClipboard(text = "") {
    const value = String(text || "");

    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);
            return;
        }
    } catch {
        // fallback below
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try { document.execCommand("copy"); } catch {}
    textarea.remove();
}

function flashButtonText(selector, text = "Done", fallback = "") {
    const button = document.querySelector(selector);
    if (!button) return;
    const old = button.textContent;
    button.textContent = text;
    window.setTimeout(() => { button.textContent = old || fallback; }, 900);
}

function cssEscape(value = "") {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(value);
    }
    return String(value).replace(/"/g, "\\\"");
}

export const bindEvents = bindUIEvents;
export default bindUIEvents;
