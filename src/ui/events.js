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
    actionSetDashboardTab,
    actionOpenCompareSection,
    actionOpenSystemSection,
    actionToggleDisplayMode,
    actionLoadHistoryRun,
    actionArchiveHistoryRun,
    actionRestoreHistoryRun,
    actionSwapHistorySlots,
    actionClearHistorySelection,
    actionDeleteHistoryRun,
    actionDeleteLastRun,
    actionClearHistory,
    actionImportHistoryRuns,
    actionExportHistoryJSON
} from "../actions/actions.js";

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

    applyDisplayModeFromState();

    bindDashboardTabEvents();

    bindUniversalActionEvents();

    bindHistoryActionDelegates();

    bindHeatmapEvents();

    bindHistoryLoadEvents();

    bindHistoryFilterEvents();

    bindHistoryDrawerStateEvents();

    bindHistoryControlEvents();

    bindHistoryStatsEvents();

    bindHistoryEditEvents();

    bindHistoryConfirmModal();

    bindViewEvents();
}



/* --------------------------------------------------
   UNIVERSAL ACTION DELEGATE
   Covers all rebuilt mock-up buttons that should do something.
-------------------------------------------------- */

function bindUniversalActionEvents() {

    if (document.body?.dataset?.universalActionDelegatesBound === "true") {
        return;
    }

    if (document.body?.dataset) {
        document.body.dataset.universalActionDelegatesBound = "true";
    }

    document.addEventListener("click", handleUniversalActionClick, true);
    document.addEventListener("keydown", handleUniversalActionKeydown, true);
}

function handleUniversalActionKeydown(event) {

    const target =
        event?.target;

    if (!target || typeof target.closest !== "function") {
        return;
    }

    const actionTarget =
        target.closest("[data-ui-action], .history-import-label");

    if (!actionTarget) {
        return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }

    event.preventDefault();

    if (actionTarget.matches?.(".history-import-label")) {
        openHistoryImportPicker();
        return;
    }

    runUniversalAction(actionTarget);
}

function handleUniversalActionClick(event) {

    const target =
        event?.target;

    if (!target || typeof target.closest !== "function") {
        return;
    }

    const actionTarget =
        target.closest("[data-ui-action]");

    if (!actionTarget || actionTarget.disabled) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();

    runUniversalAction(actionTarget);
}

function runUniversalAction(actionTarget) {

    const action =
        actionTarget?.dataset?.uiAction || "";

    switch (action) {

        case "open-command":
        case "paste-report":
        case "open-report-console":
            activateDashboardTab("command");
            focusReportInput({ select: false });
            return;

        case "save-report":
            document.getElementById("saveReport")?.click();
            return;

        case "clear-input":
            document.getElementById("clearInput")?.click();
            focusReportInput({ select: false });
            return;

        case "clear-runs":
            document.getElementById("clearRuns")?.click();
            return;

        case "open-history":
            activateDashboardTab("history");
            return;

        case "open-settings":
            activateDashboardTab("settings");
            return;

        case "open-anomalies":
            activateDashboardTab("anomalies");
            return;

        case "open-compare-section":
            openCompareSection(actionTarget.dataset.sectionTarget || "damage");
            return;

        case "open-system-section":
            openSystemSection(actionTarget.dataset.sectionTarget || actionTarget.dataset.section || "core");
            return;

        case "toggle-debug":
            document.getElementById("toggleDebug")?.click();
            return;

        case "toggle-display-mode":
            toggleDisplayMode();
            return;

        default:
            return;
    }
}

function openCompareSection(sectionTarget = "damage") {

    actionOpenCompareSection(sectionTarget);

    withMobileTabSwitch(() => {
        render();
    });

    scrollToStatPanel(sectionTarget);
}

function openSystemSection(sectionTarget = "core") {

    const selectedSection =
        actionOpenSystemSection(sectionTarget);

    withMobileTabSwitch(() => {
        render();
    });

    if (isMobileMode() && selectedSection) {
        scrollMobileElementIntoView(".tbi-system-detail", {
            fallbackSelector: '[data-dashboard-panel="systems"]',
            offset: 14
        });
    }
}

function scrollToStatPanel(sectionTarget = "") {

    const selector =
        `[data-stat-panel-section="${cssEscape(normaliseActionSection(sectionTarget))}"]`;

    window.requestAnimationFrame(() => {
        const target =
            document.querySelector(selector);

        if (!target) {
            return;
        }

        const rect =
            target.getBoundingClientRect();

        const top =
            Math.max(0, window.scrollY + rect.top - 18);

        window.scrollTo({
            top,
            behavior: "smooth"
        });
    });
}

function focusReportInput({ select = false } = {}) {

    window.requestAnimationFrame(() => {
        const input =
            document.getElementById("input");

        if (!input) {
            return;
        }

        try {
            input.focus({ preventScroll: false });

            if (select) {
                input.select?.();
            }
        } catch {
            input.focus?.();
        }
    });
}

function toggleDisplayMode() {

    actionToggleDisplayMode();

    applyDisplayModeFromState();
}

function applyDisplayModeFromState() {

    const state =
        getState();

    const mode =
        state.ui?.displayMode || "normal";

    document.documentElement.classList.toggle("tbi-display-quiet", mode === "quiet");
    document.body?.classList?.toggle("tbi-display-quiet", mode === "quiet");
}

function normaliseActionSection(value = "") {

    const key =
        String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[%:/()]/g, "")
            .replace(/\s*\/\s*/g, "_")
            .replace(/\s+/g, "_")
            .replace(/__+/g, "_")
            .replace(/^_+|_+$/g, "");

    const aliases = {
        defense: "damage_taken",
        survival: "damage_taken",
        economy: "coins",
        effects: "killed_with_effect_active",
        enemies: "enemies_hit_by"
    };

    return aliases[key] || key || "damage";
}

function cssEscape(value = "") {

    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(String(value || ""));
    }

    return String(value || "").replace(/"/g, "\\\"");
}

/* --------------------------------------------------
   HISTORY ACTION DELEGATES
   Stable handler for buttons inside rebuilt History cards.
   This avoids actions failing after rerender or inside details/menus.
-------------------------------------------------- */

function bindHistoryActionDelegates() {

    if (document.body?.dataset?.historyActionDelegatesBound === "true") {
        return;
    }

    if (document.body?.dataset) {
        document.body.dataset.historyActionDelegatesBound = "true";
    }

    document.addEventListener("click", handleHistoryActionClick, true);
}

function handleHistoryActionClick(event) {

    const target =
        event?.target;

    if (!target || typeof target.closest !== "function") {
        return;
    }

    const button =
        target.closest(`
            [data-history-stats-index],
            [data-history-edit-index],
            [data-archive-history-index],
            [data-restore-history-index],
            [data-delete-history-index],
            [data-swap-history-slots],
            [data-clear-history-selection],
            [data-export-history],
            [data-import-history-button],
            [data-delete-last-history],
            [data-delete-all-history]
        `);

    if (!button || button.disabled) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();

    if (button.matches("[data-history-stats-index]")) {
        openHistoryStatsModalFromButton(button);
        return;
    }

    if (button.matches("[data-history-edit-index]")) {
        openHistoryEditModalFromButton(button);
        return;
    }

    if (button.matches("[data-archive-history-index]")) {
        const index = Number(button.dataset.archiveHistoryIndex);

        if (!Number.isInteger(index)) {
            return;
        }

        actionArchiveHistoryRun(index);
        render();
        return;
    }

    if (button.matches("[data-restore-history-index]")) {
        const index = Number(button.dataset.restoreHistoryIndex);

        if (!Number.isInteger(index)) {
            return;
        }

        actionRestoreHistoryRun(index);
        render();
        return;
    }

    if (button.matches("[data-delete-history-index]")) {
        const index = Number(button.dataset.deleteHistoryIndex);

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
            buttonText: "Delete This Run",
            requiredPhrase: "DELETE"
        });
        return;
    }

    if (button.matches("[data-swap-history-slots]")) {
        actionSwapHistorySlots();
        render();
        return;
    }

    if (button.matches("[data-clear-history-selection]")) {
        actionClearHistorySelection();
        render();
        return;
    }

    if (button.matches("[data-export-history]")) {
        downloadTextFile(
            actionExportHistoryJSON(),
            buildHistoryExportFilename(),
            "application/json;charset=utf-8"
        );
        return;
    }

    if (
        button.matches("[data-import-history-button]")
    ) {
        openHistoryImportPicker();
        return;
    }

    if (button.matches("[data-delete-last-history]")) {
        openHistoryConfirmModal({
            action: "delete-last",
            title: "Delete Latest Saved Run?",
            message: "This will permanently remove the latest saved run from Battle History Trace.",
            finalTitle: "Delete Latest Run",
            finalMessage: "The latest saved run will be removed from this browser. If it is loaded in A or B, that slot will be cleared.",
            buttonText: "Delete Latest Run",
            requiredPhrase: "LAST"
        });
        return;
    }

    if (button.matches("[data-delete-all-history]")) {
        openHistoryConfirmModal({
            action: "delete-all",
            title: "Delete All Battle History?",
            message: "This will permanently remove all saved battle reports from this browser. It will also clear Run A and Run B.",
            finalTitle: "Final Warning",
            finalMessage: "All saved battle history will be permanently deleted from this browser. Run A and Run B will also be cleared.",
            buttonText: "Yes, Delete Everything",
            requiredPhrase: "DELETE ALL"
        });
    }
}

/* --------------------------------------------------
   MOBILE DASHBOARD TABS
-------------------------------------------------- */

function bindDashboardTabEvents() {

    if (document.body?.dataset?.dashboardTabDelegatesBound === "true") {
        return;
    }

    if (document.body?.dataset) {
        document.body.dataset.dashboardTabDelegatesBound = "true";
    }

    let lastHandledStamp = 0;

    function handleDashboardTabEvent(event) {

        const tab =
            event.target?.closest?.("[data-dashboard-tab]");

        if (!tab) {
            return;
        }

        const stamp =
            Number(event.timeStamp || Date.now());

        if (Math.abs(stamp - lastHandledStamp) < 80) {
            event.preventDefault();
            return;
        }

        lastHandledStamp = stamp;

        event.preventDefault();
        event.stopPropagation();

        activateDashboardTab(tab.dataset.dashboardTab || "overview");
    }

    document.addEventListener("pointerup", handleDashboardTabEvent, true);
    document.addEventListener("touchend", handleDashboardTabEvent, true);
    document.addEventListener("click", handleDashboardTabEvent, true);
}

function activateDashboardTab(dashboardTab = "overview") {

    const state =
        getState();

    const currentTab =
        state.ui?.dashboardTab || "overview";

    if (dashboardTab === currentTab) {
        scrollMobileDashboardToTop({ smooth: true });
        return;
    }

    actionSetDashboardTab(dashboardTab);

    withMobileTabSwitch(() => {
        render();
    });

    scrollMobileDashboardToTop();
}


/* --------------------------------------------------
   MOBILE SCROLL / PANEL STABILISATION
-------------------------------------------------- */

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

    scrollMobileElementIntoView("[data-mobile-quick-strip]", {
        fallbackSelector: "[data-dashboard-shell]",
        offset: 8,
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

/* --------------------------------------------------
   HEATMAP / DRILLDOWN
-------------------------------------------------- */

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

        const section =
            tile.dataset.section;

        if (!section) {
            return;
        }

        const state =
            getState();

        const selectedSection =
            state.ui?.selectedSection === section
                ? null
                : section;

        setState({
            ui: {
                ...(state.ui || {}),
                selectedSection
            }
        });

        saveStorage(getState());

        withMobileTabSwitch(() => {
            render();
        });

        if (isMobileMode() && selectedSection) {
            scrollMobileElementIntoView(".tbi-system-detail", {
                fallbackSelector: '[data-dashboard-panel="systems"]',
                offset: 14
            });
        }
    });
}

function scrollElementIntoView(selector, { offset = 12 } = {}) {

    window.requestAnimationFrame(() => {
        const target =
            document.querySelector(selector);

        if (!target) {
            return;
        }

        const rect =
            target.getBoundingClientRect();

        const top =
            Math.max(0, window.scrollY + rect.top - offset);

        window.scrollTo({
            top,
            behavior: "smooth"
        });
    });
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

            actionLoadHistoryRun(index, slot);

            render();
        });
    });
}

/* --------------------------------------------------
   HISTORY FILTERS
-------------------------------------------------- */

let historySearchTimer = null;

function bindHistoryFilterEvents() {

    bindHistoryFilterDelegates();

    bindHistoryFilterElementEvents();
}

function bindHistoryFilterDelegates() {

    if (document.body?.dataset?.historyFilterDelegatesBound === "true") {
        return;
    }

    if (document.body?.dataset) {
        document.body.dataset.historyFilterDelegatesBound = "true";
    }

    document.addEventListener(
        "input",
        handleHistoryFilterInput,
        true
    );

    document.addEventListener(
        "change",
        handleHistoryFilterChange,
        true
    );

    document.addEventListener(
        "click",
        handleHistoryFilterClick,
        true
    );
}

function bindHistoryFilterElementEvents() {

    const queryInputs =
        document.querySelectorAll("[data-history-filter-query]");

    queryInputs.forEach(input => {

        if (input.dataset.historyQueryBound === "true") {
            return;
        }

        input.dataset.historyQueryBound = "true";

        input.addEventListener("input", event => {
            queueHistorySearchUpdate(event.target?.value || "");
        });

        input.addEventListener("search", event => {
            applyHistoryFilterPatch({
                query: event.target?.value || ""
            });
        });
    });

    const choiceButtons =
        document.querySelectorAll("[data-history-filter-value]");

    choiceButtons.forEach(button => {

        if (button.dataset.historyChoiceBound === "true") {
            return;
        }

        button.dataset.historyChoiceBound = "true";

        button.addEventListener("click", event => {
            handleHistoryChoiceElement(event, button);
        });

        button.addEventListener("pointerup", event => {
            handleHistoryChoiceElement(event, button);
        });
    });

    const resetButtons =
        document.querySelectorAll("[data-history-filter-reset]");

    resetButtons.forEach(button => {

        if (button.dataset.historyResetBound === "true") {
            return;
        }

        button.dataset.historyResetBound = "true";

        button.addEventListener("click", event => {
            event.preventDefault();
            resetHistoryFilters();
        });
    });

    bindLegacyHistoryFilterControls();
}

function bindLegacyHistoryFilterControls() {

    const legacyControls =
        document.querySelectorAll(`
            [data-history-filter-sort],
            [data-history-filter-build],
            [data-history-filter-tag],
            [data-history-filter-archived]
        `);

    legacyControls.forEach(control => {

        if (control.dataset.historyLegacyFilterBound === "true") {
            return;
        }

        control.dataset.historyLegacyFilterBound = "true";

        control.addEventListener("change", event => {
            applyHistoryLegacyFilterPatch(event.target);
        });

        control.addEventListener("click", event => {
            if (event.target?.matches?.("[data-history-filter-archived]")) {
                applyHistoryLegacyFilterPatch(event.target);
            }
        });
    });
}

function handleHistoryFilterInput(event) {

    const target =
        event?.target;

    if (!target || typeof target.matches !== "function") {
        return;
    }

    if (!target.matches("[data-history-filter-query]")) {
        return;
    }

    queueHistorySearchUpdate(target.value || "");
}

function handleHistoryFilterChange(event) {

    const target =
        event?.target;

    if (!target || typeof target.matches !== "function") {
        return;
    }

    if (
        target.matches("[data-history-filter-sort]") ||
        target.matches("[data-history-filter-build]") ||
        target.matches("[data-history-filter-tag]") ||
        target.matches("[data-history-filter-archived]")
    ) {
        applyHistoryLegacyFilterPatch(target);
    }
}

function handleHistoryFilterClick(event) {

    const target =
        event?.target;

    if (!target || typeof target.closest !== "function") {
        return;
    }

    const reset =
        target.closest("[data-history-filter-reset]");

    if (reset) {

        event.preventDefault();

        resetHistoryFilters();

        return;
    }

    const choice =
        target.closest("[data-history-filter-value]");

    if (!choice) {
        return;
    }

    handleHistoryChoiceElement(event, choice);
}

function handleHistoryChoiceElement(event, choice) {

    if (!choice) {
        return;
    }

    const stamp =
        Date.now();

    const lastStamp =
        Number(choice.dataset.historyLastTap || 0);

    if (stamp - lastStamp < 120) {
        return;
    }

    choice.dataset.historyLastTap =
        String(stamp);

    event?.preventDefault?.();

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

    applyHistoryFilterPatch(patch);
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

function applyHistoryLegacyFilterPatch(target) {

    if (!target || typeof target.matches !== "function") {
        return;
    }

    if (target.matches("[data-history-filter-sort]")) {
        applyHistoryFilterPatch({
            sort: target.value || "newest"
        });
        return;
    }

    if (target.matches("[data-history-filter-build]")) {
        applyHistoryFilterPatch({
            build: target.value || "all"
        });
        return;
    }

    if (target.matches("[data-history-filter-tag]")) {
        applyHistoryFilterPatch({
            tag: target.value || "all"
        });
        return;
    }

    if (target.matches("[data-history-filter-archived]")) {
        applyHistoryFilterPatch({
            showArchived: Boolean(target.checked)
        });
    }
}

function queueHistorySearchUpdate(query = "") {

    clearTimeout(historySearchTimer);

    historySearchTimer =
        setTimeout(() => {
            applyHistoryFilterPatch({
                query
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
    });
}

function applyHistoryFilterPatch(patch = {}) {

    const shouldRestoreSearchFocus =
        Object.prototype.hasOwnProperty.call(patch, "query") &&
        document?.activeElement?.matches?.("[data-history-filter-query]");

    const searchValue =
        String(patch?.query ?? "");

    const restoreScroll =
        shouldRestoreSearchFocus
            ? {
                x: window.scrollX || 0,
                y: window.scrollY || 0
            }
            : null;

    const activeMenus =
        shouldRestoreSearchFocus
            ? captureOpenHistoryMenus()
            : [];

    setHistoryFilters(patch);

    saveStorage(getState());

    render();

    restoreOpenHistoryMenus(activeMenus);

    if (shouldRestoreSearchFocus) {
        restoreHistorySearchFocus(searchValue, restoreScroll);
    }
}

function restoreHistorySearchFocus(value = "", scrollPosition = null) {

    requestAnimationFrame(() => {

        if (scrollPosition) {
            window.scrollTo(scrollPosition.x, scrollPosition.y);
        }

        const input =
            document.querySelector("[data-history-filter-query]");

        if (!input) {
            return;
        }

        input.focus({
            preventScroll: true
        });

        const caret =
            String(value || "").length;

        try {
            input.setSelectionRange(caret, caret);
        } catch {
            // Some input types do not support selection ranges.
        }

        if (scrollPosition) {
            requestAnimationFrame(() => {
                window.scrollTo(scrollPosition.x, scrollPosition.y);
            });
        }
    });
}

function captureOpenHistoryMenus() {

    return Array.from(
        document.querySelectorAll("[data-history-choice-menu][open]")
    ).map(menu => menu.dataset.historyChoiceMenu).filter(Boolean);
}

function restoreOpenHistoryMenus(openMenus = []) {

    if (!openMenus.length) {
        return;
    }

    requestAnimationFrame(() => {
        openMenus.forEach(name => {
            document
                .querySelector(`[data-history-choice-menu="${CSS.escape(name)}"]`)
                ?.setAttribute("open", "");
        });
    });
}


/* --------------------------------------------------
   HISTORY DRAWER STATE
-------------------------------------------------- */

function bindHistoryDrawerStateEvents() {

    if (document.body?.dataset?.historyDrawerStateBound === "true") {
        return;
    }

    if (document.body?.dataset) {
        document.body.dataset.historyDrawerStateBound = "true";
    }

    document.addEventListener("toggle", event => {

        const drawer =
            event.target;

        if (!drawer?.matches?.("[data-history-drawer]")) {
            return;
        }

        const name =
            drawer.dataset.historyDrawer || "drawer";

        try {
            window.sessionStorage?.setItem(
                `tbi.history.drawer.${name}`,
                drawer.open ? "open" : "closed"
            );
        } catch {
            // Ignore unavailable sessionStorage.
        }
    }, true);
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
                actionExportHistoryJSON(),
                buildHistoryExportFilename(),
                "application/json;charset=utf-8"
            );
        });
    }

    document
        .querySelectorAll("[data-import-history-button], [data-import-history-label]")
        .forEach(importButton => {

            if (importButton.dataset.bound === "true") {
                return;
            }

            importButton.dataset.bound = "true";

            importButton.addEventListener("click", event => {
                event.preventDefault();
                openHistoryImportPicker();
            });

            importButton.addEventListener("keydown", event => {

                if (event.key !== "Enter" && event.key !== " ") {
                    return;
                }

                event.preventDefault();
                openHistoryImportPicker();
            });
        });

    document
        .querySelectorAll("[data-import-history-input]")
        .forEach(importInput => {

            if (importInput.dataset.bound === "true") {
                return;
            }

            importInput.dataset.bound = "true";

            importInput.addEventListener("change", () => {
                handleHistoryImportInput(importInput);
            });
        });
}

function openHistoryImportPicker() {

    const existingInput =
        document.getElementById("historyImportFile") ||
        document.querySelector("[data-import-history-input]");

    if (existingInput) {
        existingInput.value = "";
        existingInput.click();
        return;
    }

    const input =
        document.createElement("input");

    input.type = "file";
    input.accept = "application/json,.json";
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
        handleHistoryImportInput(input, {
            removeAfter: true
        });
    });

    document.body.appendChild(input);

    // Must be synchronous inside the user's click/pointer gesture.
    // Browsers can block file pickers if input.click() runs after setTimeout.
    input.click();

    window.addEventListener(
        "focus",
        () => {
            window.setTimeout(() => {
                if (input.isConnected && !input.files?.length) {
                    input.remove();
                }
            }, 1000);
        },
        { once: true }
    );
}

async function handleHistoryImportInput(importInput, { removeAfter = false } = {}) {

    const file =
        importInput.files?.[0];

    if (!file) {
        if (removeAfter) {
            importInput.remove();
        }
        return;
    }

    try {

        const text =
            await file.text();

        actionImportHistoryRuns(text);

        render();

    } catch (error) {

        console.warn(
            "[Tower Battle Intel] Failed to import history:",
            error
        );

    } finally {
        importInput.value = "";

        if (removeAfter) {
            importInput.remove();
        }
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
                buttonText: "Delete Latest Run",
                requiredPhrase: "LAST"
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
                buttonText: "Yes, Delete Everything",
                requiredPhrase: "DELETE ALL"
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
                buttonText: "Delete This Run",
                requiredPhrase: "DELETE"
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

        const requiredPhrase =
            String(modal.dataset.confirmPhrase || "DELETE")
                .trim()
                .toUpperCase();

        if (continueBtn) {
            continueBtn.disabled =
                typed !== requiredPhrase;
        }
    });

    continueBtn?.addEventListener("click", () => {

        const typed =
            String(input?.value || "")
                .trim()
                .toUpperCase();

        const requiredPhrase =
            String(modal.dataset.confirmPhrase || "DELETE")
                .trim()
                .toUpperCase();

        if (typed !== requiredPhrase) {
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

    modal.addEventListener("keydown", event => {
        if (event.key === "Escape") {
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
    buttonText = "Confirm",
    requiredPhrase = "DELETE"
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

    modal.dataset.confirmPhrase =
        String(requiredPhrase || "DELETE")
            .trim()
            .toUpperCase();

    setModalText(modal, "[data-confirm-title]", title);
    setModalText(modal, "[data-confirm-message]", message);
    setModalText(modal, "[data-confirm-final-title]", finalTitle);
    setModalText(modal, "[data-confirm-final-message]", finalMessage);
    setModalText(modal, "[data-confirm-accept]", buttonText);
    setModalText(modal, "[data-confirm-required-phrase]", modal.dataset.confirmPhrase || "DELETE");

    if (input) {
        input.placeholder = `Type ${modal.dataset.confirmPhrase || "DELETE"}`;
        input.setAttribute("aria-label", `Type ${modal.dataset.confirmPhrase || "DELETE"} to confirm`);
    }

    modal.hidden = false;
    modal.inert = false;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    showHistoryConfirmTypeStep();

    if (input) {
        input.value = "";

        setTimeout(() => {
            input.focus();
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
        input.setAttribute("aria-label", "Type DELETE to confirm");
    }

    if (continueBtn) {
        continueBtn.disabled = true;
    }

    showHistoryConfirmTypeStep();
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
