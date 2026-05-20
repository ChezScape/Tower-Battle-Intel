"use strict";

/**
 * UI EVENTS
 * Dashboard-only event bindings.
 */

import {
    render
} from "./render.js";

import {
    getState,
    setState
} from "../core/state.js";

import {
    saveStorage
} from "../storage/localStore.js";

import {
    refreshAnalysis
} from "../core/update.js";

import {
    loadHistoryRun,
    deleteHistoryRun,
    deleteLastHistory,
    clearHistory,
    swapHistorySlots,
    clearHistorySelection,
    archiveHistoryRun,
    restoreHistoryRun,
    updateHistoryRunMeta,
    setHistoryFilters,
    exportHistoryJSON,
    importHistoryRuns
} from "../core/history.js";

import {
    buildHistoryStatsModal
} from "./layouts/historyStatsModal.js";

import {
    buildHistoryEditModal
} from "./layouts/historyEditModal.js";

/* --------------------------------------------------
   BIND UI EVENTS
-------------------------------------------------- */

export function bindUIEvents() {

    bindDashboardTabEvents();

    bindHeatmapEvents();

    bindHistoryLoadEvents();

    bindHistoryFilterEvents();

    bindHistoryControlEvents();

    bindHistoryStatsEvents();

    bindHistoryEditEvents();

    bindHistoryConfirmModal();

    bindViewEvents();
}


/* --------------------------------------------------
   DASHBOARD TABS + SUBSYSTEM MATRIX
-------------------------------------------------- */

function bindDashboardTabEvents() {

    if (document.body?.dataset?.dashboardTabDelegatesBound === "true") {
        return;
    }

    if (document.body?.dataset) {
        document.body.dataset.dashboardTabDelegatesBound = "true";
    }

    let lastHandled = 0;

    document.addEventListener("pointerup", event => {
        handleDashboardTabEvent(event, lastHandledStamp => {
            lastHandled = lastHandledStamp;
        }, lastHandled);
    }, true);

    document.addEventListener("click", event => {
        handleDashboardTabEvent(event, lastHandledStamp => {
            lastHandled = lastHandledStamp;
        }, lastHandled);
    }, true);
}

function handleDashboardTabEvent(event, setLastHandled, lastHandled = 0) {

    const tab =
        event.target?.closest?.("[data-dashboard-tab]");

    if (!tab) {
        return;
    }

    const stamp =
        Number(event.timeStamp || Date.now());

    if (Math.abs(stamp - lastHandled) < 120) {
        event.preventDefault();
        return;
    }

    setLastHandled?.(stamp);

    event.preventDefault();
    event.stopPropagation();

    activateDashboardTab(tab.dataset.dashboardTab || "overview");
}

function activateDashboardTab(dashboardTab = "overview") {

    const state =
        getState();

    const currentTab =
        state.ui?.dashboardTab || "overview";

    document.body.dataset.dashboardTab = dashboardTab;
    document.documentElement.dataset.dashboardTab = dashboardTab;

    if (dashboardTab === currentTab) {
        scrollMobileDashboardToTop({ smooth: true });
        return;
    }

    setState({
        ui: {
            ...(state.ui || {}),
            dashboardTab
        }
    });

    saveStorage(getState());

    withMobileTabSwitch(() => {
        render();
    });

    scrollMobileDashboardToTop();
}

function withMobileTabSwitch(callback) {

    if (!isMobileMode()) {
        callback?.();
        return;
    }

    document.documentElement.classList.add("mobile-tab-changing");

    try {
        callback?.();
    } finally {
        window.requestAnimationFrame(() => {
            window.setTimeout(() => {
                document.documentElement.classList.remove("mobile-tab-changing");
            }, 90);
        });
    }
}

function scrollMobileDashboardToTop({ smooth = false } = {}) {

    if (!isMobileMode()) {
        return;
    }

    scrollMobileElementIntoView(".tbi-header", {
        fallbackSelector: "[data-dashboard-shell]",
        offset: 0,
        smooth
    });
}

function scrollMobileElementIntoView(selector, {
    fallbackSelector = null,
    offset = 8,
    smooth = false
} = {}) {

    if (!isMobileMode()) {
        return;
    }

    window.requestAnimationFrame(() => {
        const target =
            document.querySelector(selector) ||
            (fallbackSelector ? document.querySelector(fallbackSelector) : null) ||
            document.getElementById("dashboard");

        if (!target) {
            return;
        }

        const rect =
            target.getBoundingClientRect();

        const top =
            Math.max(0, window.scrollY + rect.top - offset);

        window.scrollTo({
            top,
            behavior: smooth ? "smooth" : "auto"
        });
    });
}

function lockMobilePageScroll(force = true) {

    if (!isMobileMode()) {
        return;
    }

    document.documentElement.classList.toggle("mobile-scroll-locked", Boolean(force));
    document.body.classList.toggle("mobile-scroll-locked", Boolean(force));
}

function bindHeatmapEvents() {

    if (document.body?.dataset?.heatmapDelegatesBound === "true") {
        return;
    }

    if (document.body?.dataset) {
        document.body.dataset.heatmapDelegatesBound = "true";
    }

    document.addEventListener("click", event => {

        const tile =
            event.target?.closest?.("[data-section]");

        if (!tile) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const section =
            tile.dataset.section;

        if (!section) {
            return;
        }

        const before =
            captureViewport();

        const state =
            getState();

        const currentSection = state.ui?.selectedSection || null;

        setState({
            ui: {
                ...(state.ui || {}),
                selectedSection: currentSection === section ? null : section
            }
        });

        saveStorage(getState());

        withMobileTabSwitch(() => {
            render();
        });

        restoreViewport(before);
    }, true);
}

/* --------------------------------------------------
   HISTORY LOAD BUTTONS
-------------------------------------------------- */

function bindHistoryLoadEvents() {

    const buttons =
        document.querySelectorAll("[data-history-index][data-history-slot]");

    buttons.forEach(button => {

        if (button.dataset.bound === "true") {
            return;
        }

        button.dataset.bound = "true";

        button.addEventListener("click", () => {

            const index =
                Number(button.dataset.historyIndex);

            const slot =
                button.dataset.historySlot || "runA";

            if (!Number.isFinite(index)) {
                return;
            }

            loadHistoryRun(
                index,
                slot
            );

            refreshAnalysis({
                reason: "load_history_run",
                historyIndex: index,
                targetSlot: slot
            });

            saveStorage(getState());

            render();
        });
    });
}

/* --------------------------------------------------
   HISTORY FILTERS
   Single delegated filter system. No legacy filter fighting.
-------------------------------------------------- */

let historySearchTimer = null;
let pendingHistorySearch = null;

function bindHistoryFilterEvents() {

    if (document.body?.dataset?.historyFilterDelegatesBound === "true") {
        return;
    }

    if (document.body?.dataset) {
        document.body.dataset.historyFilterDelegatesBound = "true";
    }

    document.addEventListener("input", handleHistoryFilterInput, true);
    document.addEventListener("search", handleHistoryFilterInput, true);
    document.addEventListener("click", handleHistoryFilterClick, true);
    document.addEventListener("toggle", handleHistoryChoiceToggle, true);
}

function handleHistoryFilterInput(event) {

    const target =
        event?.target;

    if (!target?.matches?.("[data-history-filter-query]")) {
        return;
    }

    queueHistorySearchUpdate(target.value || "");
}

function handleHistoryFilterClick(event) {

    const target =
        event?.target;

    if (!target?.closest) {
        return;
    }

    const reset =
        target.closest("[data-history-filter-reset]");

    if (reset) {
        event.preventDefault();
        event.stopPropagation();
        resetHistoryFilters();
        return;
    }

    const choice =
        target.closest("[data-history-filter-value]");

    if (choice) {
        event.preventDefault();
        event.stopPropagation();
        applyHistoryChoice(choice);
    }
}

function handleHistoryChoiceToggle(event) {

    const menu =
        event.target?.matches?.("[data-history-choice-menu]")
            ? event.target
            : null;

    if (!menu || !menu.open) {
        return;
    }

    const menuName =
        menu.dataset.historyChoiceMenu;

    document
        .querySelectorAll("[data-history-choice-menu][open]")
        .forEach(other => {
            if (other !== menu && other.dataset.historyChoiceMenu !== menuName) {
                other.removeAttribute("open");
            }
        });
}

function applyHistoryChoice(choice) {

    const kind =
        choice.dataset.historyFilterKind ||
        choice.dataset.historyFilterValue ||
        "";

    const option =
        choice.dataset.historyFilterOption ||
        "";

    const patch =
        buildHistoryFilterPatchFromChoice(kind, option);

    if (!patch) {
        return;
    }

    applyHistoryFilterPatch(patch, {
        preserveFocus: false,
        closeChoiceMenus: true
    });
}

function buildHistoryFilterPatchFromChoice(kind = "", option = "") {

    switch (kind) {

        case "sort":
            return {
                sort: option || "newest"
            };

        case "build":
            return {
                build: option || "all"
            };

        case "tag":
            return {
                tag: option || "all"
            };

        case "showArchived":
            return {
                showArchived:
                    option === "true"
            };

        default:
            return null;
    }
}

function queueHistorySearchUpdate(query = "") {

    clearTimeout(historySearchTimer);

    pendingHistorySearch = {
        query,
        viewport: captureViewport(),
        openDrawers: captureOpenHistoryDrawers(),
        caret: getActiveSearchCaret()
    };

    historySearchTimer =
        setTimeout(() => {
            applyHistoryFilterPatch({
                query:
                    pendingHistorySearch?.query || ""
            }, {
                preserveFocus: true,
                viewport: pendingHistorySearch?.viewport || null,
                openDrawers: pendingHistorySearch?.openDrawers || [],
                caret: pendingHistorySearch?.caret || null,
                closeChoiceMenus: false
            });
        }, 180);
}

function resetHistoryFilters() {

    applyHistoryFilterPatch({
        query: "",
        sort: "newest",
        build: "all",
        tag: "all",
        showArchived: false
    }, {
        preserveFocus: false,
        closeChoiceMenus: true
    });
}

function applyHistoryFilterPatch(patch = {}, {
    preserveFocus = false,
    viewport = null,
    openDrawers = null,
    caret = null,
    closeChoiceMenus = true
} = {}) {

    const uiSnapshot = {
        viewport:
            viewport || captureViewport(),
        openDrawers:
            Array.isArray(openDrawers)
                ? openDrawers
                : captureOpenHistoryDrawers(),
        searchFocused:
            preserveFocus && document.activeElement?.matches?.("[data-history-filter-query]"),
        query:
            String(patch.query ?? document.querySelector("[data-history-filter-query]")?.value ?? ""),
        caret:
            caret || getActiveSearchCaret()
    };

    setHistoryFilters(patch);

    saveStorage(getState());

    render();

    restoreHistoryFilterUi(uiSnapshot, {
        closeChoiceMenus
    });
}

function captureOpenHistoryDrawers() {

    return Array.from(
        document.querySelectorAll(".history-collapsible[open], [data-history-choice-menu][open]")
    ).map(element => ({
        selector:
            element.dataset.historyChoiceMenu
                ? `[data-history-choice-menu=\"${cssEscape(element.dataset.historyChoiceMenu)}\"]`
                : classSelector(element)
    })).filter(item => item.selector);
}

function restoreHistoryFilterUi(snapshot = {}, {
    closeChoiceMenus = true
} = {}) {

    requestAnimationFrame(() => {

        (snapshot.openDrawers || []).forEach(item => {
            if (closeChoiceMenus && item.selector?.includes("data-history-choice-menu")) {
                return;
            }

            document.querySelector(item.selector)?.setAttribute("open", "");
        });

        const input =
            document.querySelector("[data-history-filter-query]");

        if (input && snapshot.searchFocused) {
            input.focus({
                preventScroll: true
            });

            const position =
                Number.isInteger(snapshot.caret?.start)
                    ? snapshot.caret.start
                    : String(snapshot.query || "").length;

            try {
                input.setSelectionRange(position, position);
            } catch {
                // Ignore search input implementations without range support.
            }
        }

        restoreViewport(snapshot.viewport);

        requestAnimationFrame(() => {
            restoreViewport(snapshot.viewport);
        });
    });
}

function getActiveSearchCaret() {

    const input =
        document.activeElement?.matches?.("[data-history-filter-query]")
            ? document.activeElement
            : null;

    if (!input) {
        return null;
    }

    return {
        start:
            Number.isInteger(input.selectionStart)
                ? input.selectionStart
                : String(input.value || "").length,
        end:
            Number.isInteger(input.selectionEnd)
                ? input.selectionEnd
                : String(input.value || "").length
    };
}

function classSelector(element) {

    if (!element?.classList?.length) {
        return "";
    }

    return Array.from(element.classList)
        .filter(Boolean)
        .slice(0, 2)
        .map(className => `.${cssEscape(className)}`)
        .join("");
}

function cssEscape(value = "") {

    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(String(value));
    }

    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function captureViewport() {

    return {
        x: window.scrollX || 0,
        y: window.scrollY || 0
    };
}

function restoreViewport(viewport = null) {

    if (!viewport) {
        return;
    }

    window.scrollTo({
        left: viewport.x || 0,
        top: viewport.y || 0,
        behavior: "auto"
    });
}

/* --------------------------------------------------
   HISTORY CONTROLS
-------------------------------------------------- */

function bindHistoryControlEvents() {

    bindConfirmOpenButtons();

    const swap =
        document.querySelector("[data-swap-history-slots]");

    if (swap && swap.dataset.bound !== "true") {

        swap.dataset.bound = "true";

        swap.addEventListener("click", () => {

            swapHistorySlots();

            refreshAnalysis({
                reason: "swap_history_slots"
            });

            saveStorage(getState());

            render();
        });
    }

    const clearSelection =
        document.querySelector("[data-clear-history-selection]");

    if (
        clearSelection &&
        clearSelection.dataset.bound !== "true"
    ) {

        clearSelection.dataset.bound = "true";

        clearSelection.addEventListener("click", () => {

            clearHistorySelection();

            refreshAnalysis({
                reason: "clear_history_selection"
            });

            saveStorage(getState());

            render();
        });
    }

    bindHistoryArchiveButtons();

    bindHistoryImportExportButtons();
}

function bindHistoryArchiveButtons() {

    const archiveButtons =
        document.querySelectorAll("[data-archive-history-index]");

    archiveButtons.forEach(button => {

        if (button.dataset.bound === "true") {
            return;
        }

        button.dataset.bound = "true";

        button.addEventListener("click", () => {

            const index =
                Number(button.dataset.archiveHistoryIndex);

            if (!Number.isInteger(index)) {
                return;
            }

            archiveHistoryRun(index);

            refreshAnalysis({
                reason: "archive_history_run",
                historyIndex: index
            });

            saveStorage(getState());

            render();
        });
    });

    const restoreButtons =
        document.querySelectorAll("[data-restore-history-index]");

    restoreButtons.forEach(button => {

        if (button.dataset.bound === "true") {
            return;
        }

        button.dataset.bound = "true";

        button.addEventListener("click", () => {

            const index =
                Number(button.dataset.restoreHistoryIndex);

            if (!Number.isInteger(index)) {
                return;
            }

            restoreHistoryRun(index);

            saveStorage(getState());

            render();
        });
    });
}

function bindHistoryImportExportButtons() {

    const exportButton =
        document.querySelector("[data-export-history]");

    if (exportButton && exportButton.dataset.bound !== "true") {

        exportButton.dataset.bound = "true";

        exportButton.addEventListener("click", () => {
            downloadTextFile(
                exportHistoryJSON(),
                buildHistoryExportFilename(),
                "application/json;charset=utf-8"
            );
        });
    }

    const importButton =
        document.querySelector("[data-import-history-button]");

    const importInput =
        document.querySelector("[data-import-history-input]");

    if (importButton && importButton.dataset.bound !== "true") {

        importButton.dataset.bound = "true";

        importButton.addEventListener("click", () => {
            importInput?.click();
        });
    }

    if (importInput && importInput.dataset.bound !== "true") {

        importInput.dataset.bound = "true";

        importInput.addEventListener("change", async () => {

            const file =
                importInput.files?.[0];

            if (!file) {
                return;
            }

            try {

                const text =
                    await file.text();

                importHistoryRuns(text);

                saveStorage(getState());

                render();

            } catch (error) {

                console.warn(
                    "[Tower Battle Intel] Failed to import history:",
                    error
                );

            } finally {
                importInput.value = "";
            }
        });
    }
}

function bindConfirmOpenButtons() {

    const deleteLast =
        document.querySelector("[data-delete-last-history]");

    if (
        deleteLast &&
        deleteLast.dataset.bound !== "true"
    ) {

        deleteLast.dataset.bound = "true";

        deleteLast.addEventListener("click", () => {
            openHistoryConfirmModal({
                action: "delete-last",
                title: "Delete Latest Saved Run?",
                message: "This will permanently remove the latest saved run from Battle History Trace.",
                finalTitle: "Delete Latest Run",
                finalMessage: "The latest saved run will be removed from this browser. If it is loaded in A or B, that slot will be cleared.",
                buttonText: "Delete Latest Run"
            });
        });
    }

    const deleteAll =
        document.querySelector("[data-delete-all-history]");

    if (
        deleteAll &&
        deleteAll.dataset.bound !== "true"
    ) {

        deleteAll.dataset.bound = "true";

        deleteAll.addEventListener("click", () => {
            openHistoryConfirmModal({
                action: "delete-all",
                title: "Delete All Battle History?",
                message: "This will permanently remove all saved battle reports from this browser. It will also clear Run A and Run B.",
                finalTitle: "Final Warning",
                finalMessage: "All saved battle history will be permanently deleted from this browser. Run A and Run B will also be cleared.",
                buttonText: "Yes, Delete Everything"
            });
        });
    }

    const deleteRunButtons =
        document.querySelectorAll("[data-delete-history-index]");

    deleteRunButtons.forEach(button => {

        if (button.dataset.bound === "true") {
            return;
        }

        button.dataset.bound = "true";

        button.addEventListener("click", () => {

            const index =
                Number(button.dataset.deleteHistoryIndex);

            if (!Number.isInteger(index)) {
                return;
            }

            openHistoryConfirmModal({
                action: "delete-run",
                index,
                title: `Delete Run ${index + 1}?`,
                message: "This will permanently remove this saved run from Battle History Trace.",
                finalTitle: `Delete Run ${index + 1}`,
                finalMessage: "This saved run will be removed from this browser. If it is loaded in A or B, that slot will be cleared.",
                buttonText: "Delete This Run"
            });
        });
    });
}

/* --------------------------------------------------
   HISTORY STATS MODAL
-------------------------------------------------- */

let historyStatsKeydownBound = false;

function bindHistoryStatsEvents() {

    const buttons =
        document.querySelectorAll("[data-history-stats-index]");

    buttons.forEach(button => {

        if (button.dataset.bound === "true") {
            return;
        }

        button.dataset.bound = "true";

        button.addEventListener("click", () => {
            openHistoryStatsModalFromButton(button);
        });
    });
}

function openHistoryStatsModalFromButton(button) {

    const index =
        Number(button?.dataset?.historyStatsIndex);

    if (!Number.isInteger(index)) {
        return;
    }

    const state =
        getState();

    const history =
        Array.isArray(state.history)
            ? state.history
            : [];

    const run =
        history[index];

    if (!run) {
        return;
    }

    const mount =
        document.getElementById("historyStatsModalMount");

    if (!mount) {
        return;
    }

    const displayIndex =
        Number(button?.dataset?.historyDisplayIndex);

    mount.innerHTML =
        buildHistoryStatsModal({
            run,
            index,
            displayIndex: Number.isInteger(displayIndex) ? displayIndex : index,
            history,
            visibleHistory: getVisibleHistoryRunsFromDOM(history),
            runA: state.runA,
            runB: state.runB
        });

    document.body.classList.add("history-stats-open");

    bindOpenHistoryStatsModal();
}

function getVisibleHistoryRunsFromDOM(history = []) {

    const indexes =
        Array.from(document.querySelectorAll("[data-history-stats-index]"))
            .map(button => Number(button.dataset.historyStatsIndex))
            .filter(Number.isInteger);

    if (!indexes.length) {
        return history;
    }

    return indexes
        .map(index => history[index])
        .filter(Boolean);
}

function bindOpenHistoryStatsModal() {

    const modal =
        document.getElementById("historyStatsModal");

    if (!modal || modal.dataset.bound === "true") {
        return;
    }

    modal.dataset.bound = "true";

    const closeButtons =
        modal.querySelectorAll("[data-history-stats-close]");

    closeButtons.forEach(button => {
        button.addEventListener("click", closeHistoryStatsModal);
    });

    modal.querySelectorAll("[data-history-stats-tab]").forEach(button => {
        button.addEventListener("click", () => {
            setHistoryStatsTab(button.dataset.historyStatsTab || "overview");
        });
    });

    modal.querySelector("[data-history-stats-section-search]")?.addEventListener("input", event => {
        filterHistoryStatsSections(event.target?.value || "");
    });

    modal.querySelector("[data-history-stats-copy]")?.addEventListener("click", () => {
        copyHistoryStatsJSON();
    });

    modal.querySelector("[data-history-stats-download]")?.addEventListener("click", () => {
        downloadHistoryStatsJSON();
    });

    modal.querySelectorAll("[data-history-modal-slot]").forEach(button => {
        button.addEventListener("click", () => {
            loadHistoryRunFromStatsModal(button);
        });
    });

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeHistoryStatsModal();
        }
    });

    bindHistoryStatsKeydown();

    setTimeout(() => {
        modal.querySelector("[data-history-stats-close]")?.focus?.();
    }, 25);
}

function bindHistoryStatsKeydown() {

    if (historyStatsKeydownBound) {
        return;
    }

    historyStatsKeydownBound = true;

    document.addEventListener("keydown", event => {

        const modal =
            document.getElementById("historyStatsModal");

        if (!modal) {
            return;
        }

        if (event.key === "Escape") {
            closeHistoryStatsModal();
        }
    });
}

function setHistoryStatsTab(view = "overview") {

    const modal =
        document.getElementById("historyStatsModal");

    if (!modal) {
        return;
    }

    const targetView =
        String(view || "overview");

    modal.querySelectorAll("[data-history-stats-tab]").forEach(button => {

        const active =
            button.dataset.historyStatsTab === targetView;

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    modal.querySelectorAll("[data-history-stats-view]").forEach(panel => {

        const active =
            panel.dataset.historyStatsView === targetView;

        panel.classList.toggle("active", active);
    });
}

function filterHistoryStatsSections(query = "") {

    const modal =
        document.getElementById("historyStatsModal");

    if (!modal) {
        return;
    }

    const needle =
        String(query || "")
            .trim()
            .toLowerCase();

    let shown = 0;

    modal.querySelectorAll("[data-history-stats-section]").forEach(section => {

        const haystack =
            String(section.dataset.sectionSearch || "")
                .toLowerCase();

        const visible =
            !needle || haystack.includes(needle);

        let matchedRows = 0;

        section.querySelectorAll("[data-history-stats-row]").forEach(row => {

            const rowHaystack =
                String(row.dataset.historyStatsRowSearch || "")
                    .toLowerCase();

            const rowMatches =
                Boolean(needle && rowHaystack.includes(needle));

            row.classList.toggle("search-match", rowMatches);

            if (rowMatches) {
                matchedRows++;
            }
        });

        const sectionMatches =
            Boolean(needle && visible);

        section.classList.toggle("search-section-match", sectionMatches);
        section.classList.toggle("search-row-match", matchedRows > 0);

        const matchPill =
            section.querySelector("[data-history-stats-match-pill]");

        if (matchPill) {
            matchPill.hidden =
                !sectionMatches;

            matchPill.textContent =
                matchedRows > 0
                    ? `Matched ${matchedRows}`
                    : "Section match";
        }

        section.hidden =
            !visible;

        if (visible) {
            shown++;
        }
    });

    const empty =
        modal.querySelector("[data-history-stats-no-results]");

    if (empty) {
        empty.hidden = shown !== 0;
    }
}

function loadHistoryRunFromStatsModal(button) {

    const index =
        Number(button?.dataset?.historyModalIndex);

    const slot =
        button?.dataset?.historyModalSlot || "runA";

    if (!Number.isInteger(index)) {
        return;
    }

    loadHistoryRun(index, slot);

    refreshAnalysis({
        reason: "load_history_run_from_stats_modal",
        historyIndex: index,
        targetSlot: slot
    });

    saveStorage(getState());

    closeHistoryStatsModal();

    render();
}

function copyHistoryStatsJSON() {

    const run =
        getHistoryStatsModalRun();

    if (!run) {
        return;
    }

    copyTextToClipboard(
        JSON.stringify(run, null, 2)
    );
}

function downloadHistoryStatsJSON() {

    const run =
        getHistoryStatsModalRun();

    if (!run) {
        return;
    }

    const reportId =
        String(run?.meta?.reportId || "history-run")
            .replace(/[^a-z0-9_-]/gi, "-")
            .toLowerCase();

    downloadTextFile(
        JSON.stringify(run, null, 2),
        `tower-battle-intel-${reportId}.json`,
        "application/json;charset=utf-8"
    );
}

function getHistoryStatsModalRun() {

    const modal =
        document.getElementById("historyStatsModal");

    const index =
        Number(modal?.dataset?.historyStatsIndex);

    if (!Number.isInteger(index)) {
        return null;
    }

    const history =
        Array.isArray(getState().history)
            ? getState().history
            : [];

    return history[index] || null;
}

async function copyTextToClipboard(text = "") {

    const value =
        String(text || "");

    try {
        if (
            typeof navigator !== "undefined" &&
            navigator?.clipboard &&
            typeof navigator.clipboard.writeText === "function"
        ) {
            await navigator.clipboard.writeText(value);
            flashHistoryStatsCopyStatus("Copied");
            return;
        }
    } catch {
        // fallback below
    }

    const textarea =
        document.createElement("textarea");

    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";

    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand("copy");
    } catch {
        // ignore copy fallback failure
    }

    document.body.removeChild(textarea);

    flashHistoryStatsCopyStatus("Copied");
}

function flashHistoryStatsCopyStatus(message = "Copied") {

    const button =
        document.querySelector("[data-history-stats-copy]");

    if (!button) {
        return;
    }

    const old =
        button.textContent;

    button.textContent =
        message;

    setTimeout(() => {
        button.textContent = old || "Copy JSON";
    }, 900);
}

function closeHistoryStatsModal() {

    const mount =
        document.getElementById("historyStatsModalMount");

    if (mount) {
        mount.innerHTML = "";
    }

    document.body.classList.remove("history-stats-open");
}


/* --------------------------------------------------
   HISTORY EDIT MODAL
-------------------------------------------------- */

let historyEditKeydownBound = false;

function bindHistoryEditEvents() {

    const buttons =
        document.querySelectorAll("[data-history-edit-index]");

    buttons.forEach(button => {

        if (button.dataset.bound === "true") {
            return;
        }

        button.dataset.bound = "true";

        button.addEventListener("click", () => {
            openHistoryEditModalFromButton(button);
        });
    });
}

function openHistoryEditModalFromButton(button) {

    const index =
        Number(button?.dataset?.historyEditIndex);

    if (!Number.isInteger(index)) {
        return;
    }

    const state =
        getState();

    const history =
        Array.isArray(state.history)
            ? state.history
            : [];

    const run =
        history[index];

    if (!run) {
        return;
    }

    const mount =
        document.getElementById("historyEditModalMount");

    if (!mount) {
        return;
    }

    const displayIndex =
        Number(button?.dataset?.historyDisplayIndex);

    mount.innerHTML =
        buildHistoryEditModal({
            run,
            index,
            displayIndex: Number.isInteger(displayIndex) ? displayIndex : index
        });

    document.body.classList.add("history-edit-open");

    bindOpenHistoryEditModal();
}

function bindOpenHistoryEditModal() {

    const modal =
        document.getElementById("historyEditModal");

    if (!modal || modal.dataset.bound === "true") {
        return;
    }

    modal.dataset.bound = "true";

    modal.querySelectorAll("[data-history-edit-close]").forEach(button => {
        button.addEventListener("click", closeHistoryEditModal);
    });

    modal.querySelectorAll("[data-history-edit-build-choice]").forEach(button => {
        button.addEventListener("click", () => {
            setHistoryEditBuild(button);
        });
    });

    modal.querySelector("[data-history-edit-save]")?.addEventListener("click", () => {
        saveHistoryEditModal();
    });

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeHistoryEditModal();
        }
    });

    bindHistoryEditKeydown();

    setTimeout(() => {
        modal.querySelector("[data-history-edit-notes]")?.focus?.();
    }, 25);
}

function bindHistoryEditKeydown() {

    if (historyEditKeydownBound) {
        return;
    }

    historyEditKeydownBound = true;

    document.addEventListener("keydown", event => {

        const modal =
            document.getElementById("historyEditModal");

        if (!modal) {
            return;
        }

        if (event.key === "Escape") {
            closeHistoryEditModal();
        }
    });
}

function setHistoryEditBuild(button) {

    const modal =
        document.getElementById("historyEditModal");

    if (!modal || !button) {
        return;
    }

    const value =
        button.dataset.historyEditBuildChoice || "unknown";

    const input =
        modal.querySelector("[data-history-edit-build]");

    if (input) {
        input.value = value;
    }

    modal.querySelectorAll("[data-history-edit-build-choice]").forEach(choice => {

        const active =
            choice === button;

        choice.classList.toggle("active", active);
        choice.setAttribute("aria-pressed", active ? "true" : "false");
    });
}

function saveHistoryEditModal() {

    const modal =
        document.getElementById("historyEditModal");

    if (!modal) {
        return;
    }

    const index =
        Number(modal.dataset.historyEditIndex);

    if (!Number.isInteger(index)) {
        return;
    }

    const notes =
        modal.querySelector("[data-history-edit-notes]")?.value || "";

    const tags =
        modal.querySelector("[data-history-edit-tags]")?.value || "";

    const buildStyle =
        modal.querySelector("[data-history-edit-build]")?.value || "unknown";

    updateHistoryRunMeta(index, {
        notes,
        tags,
        buildStyle
    });

    saveStorage(getState());

    closeHistoryEditModal();

    render();
}

function closeHistoryEditModal() {

    const mount =
        document.getElementById("historyEditModalMount");

    if (mount) {
        mount.innerHTML = "";
    }

    document.body.classList.remove("history-edit-open");
}

/* --------------------------------------------------
   HISTORY CONFIRM MODAL
-------------------------------------------------- */

let historyConfirmReturnFocus = null;

function safeFocusAfterHistoryConfirmClose(modal) {

    const activeElement =
        document.activeElement;

    if (!modal || !activeElement || !modal.contains(activeElement)) {
        return;
    }

    if (typeof activeElement.blur === "function") {
        activeElement.blur();
    }

    const preferredTarget =
        historyConfirmReturnFocus &&
        historyConfirmReturnFocus.isConnected &&
        !modal.contains(historyConfirmReturnFocus)
            ? historyConfirmReturnFocus
            : document.querySelector("[data-history-panel]") ||
              document.getElementById("dashboard") ||
              document.body;

    if (!preferredTarget || typeof preferredTarget.focus !== "function") {
        return;
    }

    const hadTabIndex =
        preferredTarget.hasAttribute("tabindex");

    if (!hadTabIndex) {
        preferredTarget.setAttribute("tabindex", "-1");
    }

    try {
        preferredTarget.focus({
            preventScroll: true
        });
    } catch (error) {
        preferredTarget.focus();
    }

    if (!hadTabIndex) {
        preferredTarget.removeAttribute("tabindex");
    }
}

function bindHistoryConfirmModal() {

    const modal =
        document.getElementById("historyConfirmModal");

    if (!modal || modal.dataset.bound === "true") {
        return;
    }

    modal.dataset.bound = "true";

    const input =
        document.getElementById("historyConfirmInput");

    const continueBtn =
        modal.querySelector("[data-confirm-continue]");

    const acceptBtn =
        modal.querySelector("[data-confirm-accept]");

    const cancelButtons =
        modal.querySelectorAll("[data-confirm-cancel]");

    input?.addEventListener("input", () => {

        const typed =
            String(input.value || "")
                .trim()
                .toUpperCase();

        if (continueBtn) {
            continueBtn.disabled =
                typed !== "DELETE";
        }
    });

    continueBtn?.addEventListener("click", () => {

        const typed =
            String(input?.value || "")
                .trim()
                .toUpperCase();

        if (typed !== "DELETE") {
            return;
        }

        showHistoryConfirmFinalStep();
    });

    acceptBtn?.addEventListener("click", () => {
        runConfirmedHistoryAction();
    });

    cancelButtons.forEach(button => {
        button.addEventListener("click", () => {
            closeHistoryConfirmModal();
        });
    });

    modal.addEventListener("click", event => {

        if (event.target === modal) {
            closeHistoryConfirmModal();
        }
    });
}

function openHistoryConfirmModal({
    action = "",
    index = null,
    title = "Confirm Action",
    message = "This action needs confirmation.",
    finalTitle = "Final Warning",
    finalMessage = "This action cannot be undone.",
    buttonText = "Confirm"
} = {}) {

    const modal =
        document.getElementById("historyConfirmModal");

    const input =
        document.getElementById("historyConfirmInput");

    if (!modal) {
        return;
    }

    modal.dataset.confirmAction =
        action;

    modal.dataset.confirmIndex =
        index == null
            ? ""
            : String(index);

    setModalText(modal, "[data-confirm-title]", title);
    setModalText(modal, "[data-confirm-message]", message);
    setModalText(modal, "[data-confirm-final-title]", finalTitle);
    setModalText(modal, "[data-confirm-final-message]", finalMessage);
    setModalText(modal, "[data-confirm-accept]", buttonText);

    historyConfirmReturnFocus =
        document.activeElement;

    modal.classList.remove("hidden");
    modal.classList.add("active");
    modal.removeAttribute("inert");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("history-confirm-open");

    showHistoryConfirmTypeStep();

    if (input) {
        input.value = "";

        setTimeout(() => {
            try {
                input.focus({
                    preventScroll: true
                });
            } catch (error) {
                input.focus();
            }
        }, 50);
    }
}

function closeHistoryConfirmModal() {

    const modal =
        document.getElementById("historyConfirmModal");

    const input =
        document.getElementById("historyConfirmInput");

    const continueBtn =
        modal?.querySelector("[data-confirm-continue]");

    if (!modal) {
        return;
    }

    safeFocusAfterHistoryConfirmClose(modal);

    modal.classList.remove("active");
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("inert", "");
    document.body.classList.remove("history-confirm-open");

    modal.dataset.confirmAction = "";
    modal.dataset.confirmIndex = "";

    if (input) {
        input.value = "";
    }

    if (continueBtn) {
        continueBtn.disabled = true;
    }

    showHistoryConfirmTypeStep();

    historyConfirmReturnFocus = null;
}

function showHistoryConfirmTypeStep() {

    const modal =
        document.getElementById("historyConfirmModal");

    if (!modal) {
        return;
    }

    const typeStep =
        modal.querySelector("[data-confirm-step='type']");

    const finalStep =
        modal.querySelector("[data-confirm-step='final']");

    typeStep?.classList.remove("hidden");
    finalStep?.classList.add("hidden");
}

function showHistoryConfirmFinalStep() {

    const modal =
        document.getElementById("historyConfirmModal");

    if (!modal) {
        return;
    }

    const typeStep =
        modal.querySelector("[data-confirm-step='type']");

    const finalStep =
        modal.querySelector("[data-confirm-step='final']");

    typeStep?.classList.add("hidden");
    finalStep?.classList.remove("hidden");
}

function runConfirmedHistoryAction() {

    const modal =
        document.getElementById("historyConfirmModal");

    if (!modal) {
        return;
    }

    const action =
        modal.dataset.confirmAction || "";

    const index =
        Number(modal.dataset.confirmIndex);

    if (action === "delete-run") {
        deleteHistoryRun(index);
    }

    if (action === "delete-last") {
        deleteLastHistory();
    }

    if (action === "delete-all") {
        clearHistory();
    }

    refreshAnalysis({
        reason: action || "history_confirm_action",
        historyIndex:
            Number.isInteger(index)
                ? index
                : null
    });

    saveStorage(getState());

    closeHistoryConfirmModal();

    render();
}

function setModalText(modal, selector, value = "") {

    const element =
        modal.querySelector(selector);

    if (element) {
        element.textContent =
            String(value || "");
    }
}

/* --------------------------------------------------
   DEVICE MODE HELPER
-------------------------------------------------- */

function isMobileMode() {

    return (
        typeof document !== "undefined" &&
        document.documentElement?.getAttribute("data-device-mode") === "mobile"
    );
}

/* --------------------------------------------------
   OPTIONAL VIEW BUTTONS
-------------------------------------------------- */

function bindViewEvents() {

    const buttons =
        document.querySelectorAll("[data-view]");

    buttons.forEach(button => {

        if (button.dataset.bound === "true") {
            return;
        }

        button.dataset.bound = "true";

        button.addEventListener("click", () => {

            const view =
                button.dataset.view || "dashboard";

            import("../core/state.js").then(module => {

                const state =
                    getState();

                module.setState({
                    ui: {
                        ...(state.ui || {}),
                        activeView: view
                    }
                });

                saveStorage(getState());

                render();
            });
        });
    });
}

/* --------------------------------------------------
   DOWNLOAD HELPERS
-------------------------------------------------- */

function downloadTextFile(text = "", filename = "download.txt", type = "text/plain") {

    const blob =
        new Blob(
            [String(text || "")],
            { type }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 250);
}

function buildHistoryExportFilename() {

    const stamp =
        new Date()
            .toISOString()
            .replace(/[:.]/g, "-")
            .replace("T", "-")
            .slice(0, 19);

    return `tower-battle-intel-history-${stamp}.json`;
}

/* --------------------------------------------------
   COMPATIBILITY EXPORTS
-------------------------------------------------- */

export const bindEvents = bindUIEvents;
export default bindUIEvents;
