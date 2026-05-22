"use strict";

/**
 * UI EVENTS v4.10f
 * One delegated UI bridge. No per-render rebinding for visible buttons.
 */

import {
    performUIAction,
    actionGetState,
    actionSetHistoryFilters,
    actionUpdateHistoryRunMeta,
    actionImportHistoryText,
    actionExportHistoryJSON
} from "../actions/actions.js";

import {
    buildHistoryStatsModal
} from "./layouts/historyStatsModal.js";

import {
    buildHistoryEditModal
} from "./layouts/historyEditModal.js";

let bound = false;
let renderNow = null;
let historySearchTimer = null;
let statsKeydownBound = false;
let editKeydownBound = false;
let confirmKeydownBound = false;

/* --------------------------------------------------
   BIND ONCE
-------------------------------------------------- */

export function bindUIEvents(renderCallback = null) {

    if (typeof renderCallback === "function") {
        renderNow = renderCallback;
    }

    if (bound) {
        syncRuntimeClasses();
        return;
    }

    bound = true;

    document.addEventListener("click", handleDocumentClick, true);
    document.addEventListener("input", handleDocumentInput, true);
    document.addEventListener("change", handleDocumentChange, true);
    document.addEventListener("toggle", handleDocumentToggle, true);
    document.addEventListener("keydown", handleGlobalKeydown, true);

    syncRuntimeClasses();
}

/* --------------------------------------------------
   CLICK BRIDGE
-------------------------------------------------- */

function handleDocumentClick(event) {

    const target = event.target;

    if (!target || typeof target.closest !== "function") {
        return;
    }

    if (handleConfirmClick(event, target)) return;
    if (handleHistoryStatsClick(event, target)) return;
    if (handleHistoryEditClick(event, target)) return;

    const uiAction = target.closest("[data-ui-action]");

    if (uiAction && !uiAction.disabled) {
        event.preventDefault();
        event.stopPropagation();
        handleUIActionButton(uiAction);
        return;
    }

    const dashboardTab = target.closest("[data-dashboard-tab]");

    if (dashboardTab && !dashboardTab.disabled) {
        event.preventDefault();
        event.stopPropagation();
        runAction("set-dashboard-tab", {
            tab: dashboardTab.dataset.dashboardTab || "overview"
        });
        return;
    }

    const systemTile = target.closest("[data-section]");

    if (systemTile && !systemTile.disabled) {
        event.preventDefault();
        event.stopPropagation();
        runAction("select-section", {
            section: systemTile.dataset.section || ""
        });
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

    if (handleHistoryButton(event, target)) return;
    if (handleHistoryFilterClick(event, target)) return;
}

function handleUIActionButton(button) {

    const action = button.dataset.uiAction || "";

    const payload = buildActionPayload(button);

    if (action === "import-history") {
        openHistoryImportPicker();
        return;
    }

    if (action === "export-history") {
        downloadTextFile(
            actionExportHistoryJSON(),
            buildHistoryExportFilename(),
            "application/json;charset=utf-8"
        );
        return;
    }

    if (action === "delete-history-run") {
        openHistoryConfirmModal({
            action: "history-delete-run",
            index: button.dataset.deleteHistoryIndex || button.dataset.index,
            title: `Delete Run ${Number(button.dataset.historyDisplayIndex || button.dataset.deleteHistoryIndex || 0) + 1}?`,
            message: "This will permanently remove this saved run from Battle History Trace.",
            finalTitle: "Delete Saved Run",
            finalMessage: "This saved run will be removed from this browser. If it is loaded in A or B, that slot will be cleared.",
            buttonText: "Delete This Run",
            requiredPhrase: "DELETE"
        });
        return;
    }

    if (action === "delete-last-history") {
        openHistoryConfirmModal({
            action: "history-delete-last",
            title: "Delete Latest Saved Run?",
            message: "This will permanently remove the latest saved run from Battle History Trace.",
            finalTitle: "Delete Latest Run",
            finalMessage: "The latest saved run will be removed from this browser. If it is loaded in A or B, that slot will be cleared.",
            buttonText: "Delete Latest Run",
            requiredPhrase: "LAST"
        });
        return;
    }

    if (action === "delete-all-history") {
        openHistoryConfirmModal({
            action: "history-delete-all",
            title: "Delete All Battle History?",
            message: "This will permanently remove all saved battle reports from this browser. It also clears Run A and Run B.",
            finalTitle: "Final Warning",
            finalMessage: "All saved battle history will be permanently deleted from this browser. Run A and Run B will also be cleared.",
            buttonText: "Yes, Delete Everything",
            requiredPhrase: "DELETE ALL"
        });
        return;
    }

    if (action === "open-history-stats") {
        openHistoryStatsModal(Number(button.dataset.historyStatsIndex), button);
        return;
    }

    if (action === "open-history-edit") {
        openHistoryEditModal(Number(button.dataset.historyEditIndex), button);
        return;
    }

    runAction(action, payload);
}


function buildActionPayload(button) {

    const index = firstDefined(
        button.dataset.index,
        button.dataset.historyIndex,
        button.dataset.deleteHistoryIndex,
        button.dataset.archiveHistoryIndex,
        button.dataset.restoreHistoryIndex,
        button.dataset.historyStatsIndex,
        button.dataset.historyEditIndex,
        button.dataset.historyModalIndex
    );

    return {
        tab: button.dataset.dashboardTab,
        section: firstDefined(button.dataset.section, button.dataset.compareSection),
        compareSection: button.dataset.compareSection,
        value: button.dataset.value,
        buildStyle: button.dataset.buildStyle,
        slot: button.dataset.historySlot || button.dataset.historyModalSlot,
        index,
        filters: readFilterDataset(button),
        input: document.getElementById("input")
    };
}

function readFilterDataset(button) {
    const kind = button.dataset.historyFilterKind || button.dataset.historyFilterValue;
    const option = button.dataset.historyFilterOption;

    if (!kind) {
        return null;
    }

    return buildHistoryFilterPatch(kind, option) || null;
}

function firstDefined(...values) {
    return values.find(value => value !== undefined && value !== null && String(value) !== "");
}

/* --------------------------------------------------
   HISTORY BUTTON COMPATIBILITY
-------------------------------------------------- */

function handleHistoryButton(event, target) {

    const button = target.closest(`
        [data-history-stats-index],
        [data-history-edit-index],
        [data-archive-history-index],
        [data-restore-history-index],
        [data-delete-history-index],
        [data-swap-history-slots],
        [data-clear-history-selection],
        [data-export-history],
        [data-import-history-button],
        [data-import-history-label],
        [data-delete-last-history],
        [data-delete-all-history]
    `);

    if (!button || button.disabled) {
        return false;
    }

    event.preventDefault();
    event.stopPropagation();

    if (button.matches("[data-history-stats-index]")) {
        openHistoryStatsModal(Number(button.dataset.historyStatsIndex), button);
        return true;
    }

    if (button.matches("[data-history-edit-index]")) {
        openHistoryEditModal(Number(button.dataset.historyEditIndex), button);
        return true;
    }

    if (button.matches("[data-archive-history-index]")) {
        runAction("history-archive-run", { index: button.dataset.archiveHistoryIndex });
        return true;
    }

    if (button.matches("[data-restore-history-index]")) {
        runAction("history-restore-run", { index: button.dataset.restoreHistoryIndex });
        return true;
    }

    if (button.matches("[data-delete-history-index]")) {
        openHistoryConfirmModal({
            action: "history-delete-run",
            index: button.dataset.deleteHistoryIndex,
            title: `Delete Run ${Number(button.dataset.historyDisplayIndex || button.dataset.deleteHistoryIndex || 0) + 1}?`,
            message: "This will permanently remove this saved run from Battle History Trace.",
            finalTitle: "Delete Saved Run",
            finalMessage: "This saved run will be removed from this browser. If it is loaded in A or B, that slot will be cleared.",
            buttonText: "Delete This Run",
            requiredPhrase: "DELETE"
        });
        return true;
    }

    if (button.matches("[data-swap-history-slots]")) {
        runAction("history-swap-slots");
        return true;
    }

    if (button.matches("[data-clear-history-selection]")) {
        runAction("history-clear-selection");
        return true;
    }

    if (button.matches("[data-export-history]")) {
        downloadTextFile(
            actionExportHistoryJSON(),
            buildHistoryExportFilename(),
            "application/json;charset=utf-8"
        );
        return true;
    }

    if (button.matches("[data-import-history-button], [data-import-history-label]")) {
        openHistoryImportPicker();
        return true;
    }

    if (button.matches("[data-delete-last-history]")) {
        openHistoryConfirmModal({
            action: "history-delete-last",
            title: "Delete Latest Saved Run?",
            message: "This will permanently remove the latest saved run from Battle History Trace.",
            finalTitle: "Delete Latest Run",
            finalMessage: "The latest saved run will be removed from this browser. If it is loaded in A or B, that slot will be cleared.",
            buttonText: "Delete Latest Run",
            requiredPhrase: "LAST"
        });
        return true;
    }

    if (button.matches("[data-delete-all-history]")) {
        openHistoryConfirmModal({
            action: "history-delete-all",
            title: "Delete All Battle History?",
            message: "This will permanently remove all saved battle reports from this browser. It also clears Run A and Run B.",
            finalTitle: "Final Warning",
            finalMessage: "All saved battle history will be permanently deleted from this browser. Run A and Run B will also be cleared.",
            buttonText: "Yes, Delete Everything",
            requiredPhrase: "DELETE ALL"
        });
        return true;
    }

    return false;
}

/* --------------------------------------------------
   INPUT / CHANGE
-------------------------------------------------- */

function handleDocumentInput(event) {

    const target = event.target;

    if (!target || typeof target.matches !== "function") {
        return;
    }

    if (target.matches("[data-history-filter-query]")) {
        queueHistorySearchUpdate(target.value || "");
        return;
    }

    if (target.matches("[data-confirm-input]")) {
        updateConfirmContinueState(target.closest("[data-confirm-modal]") || document.getElementById("historyConfirmModal"));
        return;
    }

    if (target.matches("[data-history-stats-section-search]")) {
        filterHistoryStatsSections(target.value || "");
    }
}

function handleDocumentChange(event) {

    const target = event.target;

    if (!target || typeof target.matches !== "function") {
        return;
    }

    if (target.matches("#buildStyleSelect")) {
        runAction("set-build-style", { buildStyle: target.value || "unknown" });
        return;
    }

    if (target.matches("[data-history-filter-sort]")) {
        applyHistoryFilterPatch({ sort: target.value || "newest" });
        return;
    }

    if (target.matches("[data-history-filter-build]")) {
        applyHistoryFilterPatch({ build: target.value || "all" });
        return;
    }

    if (target.matches("[data-history-filter-tag]")) {
        applyHistoryFilterPatch({ tag: target.value || "all" });
        return;
    }

    if (target.matches("[data-history-filter-archived]")) {
        applyHistoryFilterPatch({ showArchived: Boolean(target.checked) });
        return;
    }

    if (target.matches("[data-import-history-input]")) {
        handleHistoryImportInput(target);
    }
}

function handleHistoryFilterClick(event, target) {

    const reset = target.closest("[data-history-filter-reset]");

    if (reset && !reset.disabled) {
        event.preventDefault();
        event.stopPropagation();
        applyHistoryFilterPatch({
            query: "",
            sort: "newest",
            build: "all",
            tag: "all",
            showArchived: false
        });
        return true;
    }

    const choice = target.closest("[data-history-filter-value]");

    if (choice && !choice.disabled) {
        event.preventDefault();
        event.stopPropagation();
        const kind = choice.dataset.historyFilterKind || choice.dataset.historyFilterValue || "";
        const option = choice.dataset.historyFilterOption || "";
        const patch = buildHistoryFilterPatch(kind, option);
        if (patch) applyHistoryFilterPatch(patch);
        return true;
    }

    return false;
}

function buildHistoryFilterPatch(kind = "", option = "") {
    switch (kind) {
        case "sort": return { sort: option || "newest" };
        case "build": return { build: option || "all" };
        case "tag": return { tag: option || "all" };
        case "showArchived": return { showArchived: option === "true" };
        default: return null;
    }
}

function queueHistorySearchUpdate(query = "") {
    clearTimeout(historySearchTimer);
    historySearchTimer = setTimeout(() => {
        applyHistoryFilterPatch({ query });
    }, 180);
}

function applyHistoryFilterPatch(patch = {}) {

    const shouldRestoreSearch = Object.prototype.hasOwnProperty.call(patch, "query") &&
        document.activeElement?.matches?.("[data-history-filter-query]");

    const searchValue = String(patch.query ?? "");
    const scroll = shouldRestoreSearch ? { x: window.scrollX || 0, y: window.scrollY || 0 } : null;

    const openDetails = captureOpenDetails();

    actionSetHistoryFilters(patch);
    renderApp();
    restoreOpenDetails(openDetails);

    if (shouldRestoreSearch) {
        requestAnimationFrame(() => {
            if (scroll) window.scrollTo(scroll.x, scroll.y);
            const input = document.querySelector("[data-history-filter-query]");
            if (input) {
                input.focus({ preventScroll: true });
                const caret = String(searchValue || "").length;
                try { input.setSelectionRange(caret, caret); } catch { /* ignore */ }
            }
            if (scroll) requestAnimationFrame(() => window.scrollTo(scroll.x, scroll.y));
        });
    }
}

/* --------------------------------------------------
   DETAILS / DRAWERS
-------------------------------------------------- */

function handleDocumentToggle(event) {
    const drawer = event.target;

    if (!drawer?.matches?.("[data-history-drawer]")) {
        return;
    }

    try {
        window.sessionStorage?.setItem(
            `tbi.history.drawer.${drawer.dataset.historyDrawer || "drawer"}`,
            drawer.open ? "open" : "closed"
        );
    } catch {
        // ignore unavailable sessionStorage
    }
}

function captureOpenDetails() {
    return Array.from(document.querySelectorAll("details[open]"))
        .map(detail => detail.dataset.historyDrawer || detail.dataset.historyChoiceMenu || detail.className || "")
        .filter(Boolean);
}

function restoreOpenDetails(tokens = []) {
    if (!tokens.length) return;
    requestAnimationFrame(() => {
        tokens.forEach(token => {
            const safe = cssEscape(token);
            document.querySelector(`[data-history-drawer="${safe}"]`)?.setAttribute("open", "");
            document.querySelector(`[data-history-choice-menu="${safe}"]`)?.setAttribute("open", "");
        });
    });
}

/* --------------------------------------------------
   CONFIRM MODAL
-------------------------------------------------- */

function handleConfirmClick(event, target) {

    const modal = target.closest("[data-confirm-modal]") || document.getElementById("historyConfirmModal");

    if (!modal) {
        return false;
    }

    const cancel = target.closest("[data-confirm-cancel]");
    if (cancel) {
        event.preventDefault();
        closeHistoryConfirmModal();
        return true;
    }

    const cont = target.closest("[data-confirm-continue]");
    if (cont) {
        event.preventDefault();
        if (cont.disabled) return true;
        showHistoryConfirmFinalStep(modal);
        return true;
    }

    const accept = target.closest("[data-confirm-accept]");
    if (accept) {
        event.preventDefault();
        runConfirmedHistoryAction(modal);
        return true;
    }

    if (target === modal && modal.classList.contains("active")) {
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
    const input = document.getElementById("historyConfirmInput") || modal?.querySelector("[data-confirm-input]");

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

    showHistoryConfirmTypeStep(modal);
    updateConfirmContinueState(modal);

    bindConfirmKeydown();

    setTimeout(() => input?.focus?.(), 25);
}

function closeHistoryConfirmModal() {

    const modal = document.getElementById("historyConfirmModal");
    const input = document.getElementById("historyConfirmInput") || modal?.querySelector("[data-confirm-input]");

    if (!modal) return;

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

    if (input) input.value = "";

    showHistoryConfirmTypeStep(modal);
}

function updateConfirmContinueState(modal = null) {

    const root = modal || document.getElementById("historyConfirmModal");
    if (!root) return;

    const input = document.getElementById("historyConfirmInput") || root.querySelector("[data-confirm-input]");
    const cont = root.querySelector("[data-confirm-continue]");

    if (!cont) return;

    const typed = String(input?.value || "").trim().toUpperCase();
    const phrase = String(root.dataset.confirmPhrase || "DELETE").trim().toUpperCase();

    cont.disabled = typed !== phrase;
}

function showHistoryConfirmTypeStep(modal = null) {
    const root = modal || document.getElementById("historyConfirmModal");
    root?.querySelector("[data-confirm-step='type']")?.classList.remove("hidden");
    root?.querySelector("[data-confirm-step='final']")?.classList.add("hidden");
}

function showHistoryConfirmFinalStep(modal = null) {
    const root = modal || document.getElementById("historyConfirmModal");
    root?.querySelector("[data-confirm-step='type']")?.classList.add("hidden");
    root?.querySelector("[data-confirm-step='final']")?.classList.remove("hidden");
}

function runConfirmedHistoryAction(modal = null) {

    const root = modal || document.getElementById("historyConfirmModal");
    if (!root) return;

    const action = root.dataset.confirmAction || "";
    const index = root.dataset.confirmIndex;

    closeHistoryConfirmModal();
    runAction(action, { index });
}

function bindConfirmKeydown() {
    if (confirmKeydownBound) return;
    confirmKeydownBound = true;

    document.addEventListener("keydown", event => {
        const modal = document.getElementById("historyConfirmModal");
        if (!modal || modal.hidden) return;
        if (event.key === "Escape") closeHistoryConfirmModal();
    }, true);
}

/* --------------------------------------------------
   HISTORY STATS MODAL
-------------------------------------------------- */

function openHistoryStatsModal(index = -1, button = null) {

    if (!Number.isInteger(index) || index < 0) return;

    const state = actionGetState();
    const history = Array.isArray(state.history) ? state.history : [];
    const run = history[index];
    const mount = document.getElementById("historyStatsModalMount");

    if (!run || !mount) return;

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
    bindStatsKeydown();
    setTimeout(() => document.querySelector("[data-history-stats-close]")?.focus?.(), 25);
}

function handleHistoryStatsClick(event, target) {

    const modal = target.closest("#historyStatsModal");
    if (!modal) return false;

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

    const slot = target.closest("[data-history-modal-slot]");
    if (slot) {
        event.preventDefault();
        runAction("history-load-run", {
            index: slot.dataset.historyModalIndex,
            slot: slot.dataset.historyModalSlot || "runA"
        });
        closeHistoryStatsModal();
        return true;
    }

    if (target === modal) {
        closeHistoryStatsModal();
        return true;
    }

    return false;
}

function setHistoryStatsTab(view = "overview") {
    const modal = document.getElementById("historyStatsModal");
    if (!modal) return;

    modal.querySelectorAll("[data-history-stats-tab]").forEach(button => {
        const active = button.dataset.historyStatsTab === view;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    modal.querySelectorAll("[data-history-stats-view]").forEach(panel => {
        panel.classList.toggle("active", panel.dataset.historyStatsView === view);
    });
}

function getVisibleHistoryRunsFromDOM(history = []) {
    const indexes = Array.from(document.querySelectorAll("[data-history-stats-index]"))
        .map(button => Number(button.dataset.historyStatsIndex))
        .filter(Number.isInteger);

    return indexes.length ? indexes.map(index => history[index]).filter(Boolean) : history;
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
        const visible = !needle || haystack.includes(needle);
        let matchedRows = 0;

        section.querySelectorAll("[data-history-stats-row]").forEach(row => {
            const rowHaystack = String(row.dataset.historyStatsRowSearch || "").toLowerCase();
            const rowMatches = Boolean(needle && rowHaystack.includes(needle));
            row.classList.toggle("search-match", rowMatches);
            if (rowMatches) matchedRows++;
        });

        const matchPill = section.querySelector("[data-history-stats-match-pill]");

        if (matchPill) {
            matchPill.hidden = !(needle && visible);
            matchPill.textContent = matchedRows > 0 ? `Matched ${matchedRows}` : "Section match";
        }

        section.hidden = !visible;

        if (visible) shown++;
    });

    const empty = modal.querySelector("[data-history-stats-no-results]");
    if (empty) empty.hidden = shown !== 0;
}

function closeHistoryStatsModal() {
    const mount = document.getElementById("historyStatsModalMount");
    if (mount) mount.innerHTML = "";
    document.body.classList.remove("history-stats-open");
}

function bindStatsKeydown() {
    if (statsKeydownBound) return;
    statsKeydownBound = true;
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && document.getElementById("historyStatsModal")) {
            closeHistoryStatsModal();
        }
    }, true);
}

function copyHistoryStatsJSON() {
    const run = getHistoryStatsModalRun();
    if (!run) return;
    copyTextToClipboard(JSON.stringify(run, null, 2));
}

function downloadHistoryStatsJSON() {
    const run = getHistoryStatsModalRun();
    if (!run) return;
    const id = String(run?.meta?.reportId || "history-run").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
    downloadTextFile(JSON.stringify(run, null, 2), `tower-battle-intel-${id}.json`, "application/json;charset=utf-8");
}

function getHistoryStatsModalRun() {
    const modal = document.getElementById("historyStatsModal");
    const index = Number(modal?.dataset?.historyStatsIndex);
    if (!Number.isInteger(index)) return null;
    const history = Array.isArray(actionGetState().history) ? actionGetState().history : [];
    return history[index] || null;
}

/* --------------------------------------------------
   HISTORY EDIT MODAL
-------------------------------------------------- */

function openHistoryEditModal(index = -1, button = null) {

    if (!Number.isInteger(index) || index < 0) return;

    const state = actionGetState();
    const history = Array.isArray(state.history) ? state.history : [];
    const run = history[index];
    const mount = document.getElementById("historyEditModalMount");

    if (!run || !mount) return;

    const displayIndex = Number(button?.dataset?.historyDisplayIndex);

    mount.innerHTML = buildHistoryEditModal({
        run,
        index,
        displayIndex: Number.isInteger(displayIndex) ? displayIndex : index
    });

    document.body.classList.add("history-edit-open");
    bindEditKeydown();
    setTimeout(() => document.querySelector("[data-history-edit-notes]")?.focus?.(), 25);
}

function handleHistoryEditClick(event, target) {

    const modal = target.closest("#historyEditModal");
    if (!modal) return false;

    const close = target.closest("[data-history-edit-close]");
    if (close) {
        event.preventDefault();
        closeHistoryEditModal();
        return true;
    }

    const build = target.closest("[data-history-edit-build-choice]");
    if (build) {
        event.preventDefault();
        setHistoryEditBuild(build);
        return true;
    }

    const save = target.closest("[data-history-edit-save]");
    if (save) {
        event.preventDefault();
        saveHistoryEditModal();
        return true;
    }

    if (target === modal) {
        closeHistoryEditModal();
        return true;
    }

    return false;
}

function setHistoryEditBuild(button) {
    const modal = document.getElementById("historyEditModal");
    if (!modal) return;
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
    if (!modal) return;

    const index = Number(modal.dataset.historyEditIndex);
    if (!Number.isInteger(index)) return;

    actionUpdateHistoryRunMeta(index, {
        notes: modal.querySelector("[data-history-edit-notes]")?.value || "",
        tags: modal.querySelector("[data-history-edit-tags]")?.value || "",
        buildStyle: modal.querySelector("[data-history-edit-build]")?.value || "unknown"
    });

    closeHistoryEditModal();
    renderApp();
}

function closeHistoryEditModal() {
    const mount = document.getElementById("historyEditModalMount");
    if (mount) mount.innerHTML = "";
    document.body.classList.remove("history-edit-open");
}

function bindEditKeydown() {
    if (editKeydownBound) return;
    editKeydownBound = true;
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && document.getElementById("historyEditModal")) {
            closeHistoryEditModal();
        }
    }, true);
}

/* --------------------------------------------------
   IMPORT / DOWNLOAD / CLIPBOARD
-------------------------------------------------- */

function openHistoryImportPicker() {

    const existing = document.getElementById("historyImportInput");

    if (existing) {
        existing.value = "";
        existing.click();
        return existing;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.id = "historyImportInput";
    input.dataset.importHistoryInput = "true";
    input.setAttribute("aria-label", "Import Battle History JSON");

    Object.assign(input.style, {
        position: "fixed",
        left: "-9999px",
        top: "0",
        width: "1px",
        height: "1px",
        opacity: "0"
    });

    input.addEventListener("change", () => {
        handleHistoryImportInput(input, { removeAfter: false });
    });

    document.body.appendChild(input);
    input.click();

    return input;
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
        renderApp();
    } catch (error) {
        console.warn("[Tower Battle Intel] Failed to import history:", error);
    } finally {
        if (input) input.value = "";
        if (removeAfter) input?.remove?.();
    }
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
    setTimeout(() => URL.revokeObjectURL(url), 250);
}

function buildHistoryExportFilename() {
    return `tower-battle-intel-history-${new Date().toISOString().replace(/[:.]/g, "-").replace("T", "-").slice(0, 19)}.json`;
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
    try { document.execCommand("copy"); } catch { /* ignore */ }
    textarea.remove();
}

/* --------------------------------------------------
   KEYBOARD / MOBILE / RUNTIME HELPERS
-------------------------------------------------- */

function handleGlobalKeydown(event) {

    if (event.key !== "Escape") {
        return;
    }

    closeMobileReportSheet();
    closeMobileCommandRail();
}

function runAction(action, payload = {}) {
    const result = performUIAction(action, payload || {});
    syncRuntimeClasses();
    renderApp();
    return result;
}

function renderApp() {
    if (typeof renderNow === "function") {
        renderNow();
    }
    syncRuntimeClasses();
}

function syncRuntimeClasses() {
    const state = actionGetState();
    const debug = Boolean(state?.ui?.debug);
    const quiet = Boolean(state?.ui?.quietDisplay);
    document.body?.classList?.toggle("debug-open", debug);
    document.documentElement?.classList?.toggle("debug-open", debug);
    document.body?.classList?.toggle("tbi-quiet-display", quiet);
    document.documentElement?.classList?.toggle("tbi-quiet-display", quiet);
}

function closeMobileReportSheet() {
    document.body?.classList?.remove("mobile-report-open");
    if (!document.body?.classList?.contains("debug-open")) {
        document.documentElement?.classList?.remove("mobile-scroll-locked");
        document.body?.classList?.remove("mobile-scroll-locked");
    }
    document.getElementById("mobileReportFab")?.setAttribute("aria-expanded", "false");
}

function closeMobileCommandRail() {
    document.body?.classList?.remove("mobile-command-rail-open");
    if (!document.body?.classList?.contains("debug-open")) {
        document.documentElement?.classList?.remove("mobile-scroll-locked");
        document.body?.classList?.remove("mobile-scroll-locked");
    }
}

function setModalText(modal, selector, value = "") {
    const element = modal?.querySelector?.(selector);
    if (element) element.textContent = String(value || "");
}

function cssEscape(value = "") {
    if (typeof CSS !== "undefined" && CSS.escape) {
        return CSS.escape(String(value || ""));
    }
    return String(value || "").replace(/"/g, "\\\"");
}

/* --------------------------------------------------
   COMPATIBILITY EXPORTS
-------------------------------------------------- */

export const bindEvents = bindUIEvents;
export default bindUIEvents;
