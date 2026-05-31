"use strict";

/**
 * REBUILT WORKSPACE EVENTS v4.11z52w47
 *
 * Single active desktop workspace event owner for the rebuilt path.
 * This replaces the old commandDeckEvents/historyEvents/parkedActionEvents
 * chain so broad parked fallback handlers cannot swallow real buttons.
 */

import {
    performUIAction,
    actionCacheCommandInputDraft,
    actionGetState
} from "../../actions/index.js";
import {
    getVisibleHistoryEntries,
    normaliseHistoryFilters
} from "../../history/historyFilters.js";
import { buildHistoryStatsModal } from "../sections/history/historyStatsModal.js";
import { buildHistoryEditModal } from "../sections/history/historyEditModal.js";
import { closestEnabled, consumeEvent, UI_EVENT_FOUNDATION_VERSION } from "./shellEventUtils.js";
import { runHistoryJSONExport, startHistoryJSONImport, triggerTextDownload } from "./importExportEvents.js";

const COMMAND_ROOT_SELECTOR = ".tbi-command-clean-view";
const COMMAND_ACTION_SELECTOR = `${COMMAND_ROOT_SELECTOR} [data-ui-action]`;
const COMMAND_ACTIONS = new Set([
    "validate-report",
    "save-report",
    "save-load-dashboard",
    "clear-input",
    "open-dashboard",
    "open-history",
    "open-compare",
    "import-history",
    "export-history"
]);
const COMMAND_INPUT_SELECTOR = `${COMMAND_ROOT_SELECTOR} textarea[data-command-report-input='true']`;
const COMMAND_BUILD_STYLE_SELECTOR = `${COMMAND_ROOT_SELECTOR} [data-build-style-select='true']`;

const HISTORY_ROOT_SELECTOR = ".tbi-history-clean-view, .tbi-history2-stats-modal, .history-edit-modal";

let workspaceClicks = 0;
let workspaceChanges = 0;
let workspaceInputs = 0;
let commandClicks = 0;
let historyClicks = 0;
let lastAction = "";

export function handleWorkspaceClick(event, context = {}) {
    if (handleCommandClick(event, context)) return true;
    if (handleHistoryClick(event, context)) return true;
    return false;
}

export function handleWorkspaceChange(event, context = {}) {
    if (handleCommandChange(event, context)) return true;
    if (handleHistoryChange(event, context)) return true;
    return false;
}

export function handleWorkspaceInput(event, context = {}) {
    if (handleCommandInput(event, context)) return true;
    if (handleHistoryInput(event, context)) return true;
    return false;
}

export function handleWorkspaceKeydown(event, context = {}) {
    if (handleHistoryKeydown(event, context)) return true;
    return false;
}

function handleCommandClick(event, context = {}) {
    const button = findCommandActionButton(event?.target);
    if (!button) return false;

    const action = String(button.dataset.uiAction || "").trim();
    if (!action) return false;

    consumeEvent(event);
    remember("command", action);

    const doc = button.ownerDocument || document;

    if (action === "import-history") {
        startHistoryImport(doc, context, "command");
        return true;
    }

    if (action === "export-history") {
        runHistoryExport(doc, context, "command");
        return true;
    }

    const input = findCommandInput(doc);
    performUIAction(action, { input });
    render(context);
    return true;
}

function handleCommandChange(event, context = {}) {
    const select = closestEnabled(event?.target, COMMAND_BUILD_STYLE_SELECTOR);
    if (!select) return false;

    consumeEvent(event);
    workspaceChanges += 1;
    lastAction = "command:set-build-style-no-render";

    const doc = context?.document || select.ownerDocument || document;
    const input = findCommandInput(doc);
    if (input) {
        actionCacheCommandInputDraft(readCommandInputValue(input));
    }

    const selected = performUIAction("set-build-style", { buildStyle: select.value || "unknown" });
    updateVisibleCommandBuildStyle(doc, selected || select.value || "unknown");
    return true;
}

function handleCommandInput(event) {
    const input = closestEnabled(event?.target, COMMAND_INPUT_SELECTOR);
    if (!input) return false;

    workspaceInputs += 1;
    lastAction = "command:draft-input";
    actionCacheCommandInputDraft(input.value || "");
    return true;
}


function readCommandInputValue(input = null) {
    if (!input) return "";
    const value = typeof input.value === "string" ? input.value : "";
    if (value) return value;
    const textContent = typeof input.textContent === "string" ? input.textContent : "";
    if (textContent) return textContent;
    const defaultValue = typeof input.defaultValue === "string" ? input.defaultValue : "";
    if (defaultValue) return defaultValue;
    return "";
}

function updateVisibleCommandBuildStyle(doc = document, buildStyle = "unknown") {
    const label = formatCommandBuildStyle(buildStyle);
    const stat = doc?.querySelector?.("[data-command-side-stat='build-style'] strong") || null;
    if (stat) stat.textContent = label;

    const currentPanel = doc?.querySelector?.(".tbi-command-current-card") || null;
    if (currentPanel) currentPanel.dataset.buildStyle = String(buildStyle || "unknown");
}

function formatCommandBuildStyle(buildStyle = "unknown") {
    const labels = {
        unknown: "Unknown",
        health_ehp: "Health / EHP",
        blender: "Blender",
        devo: "Devo",
        orb_devo: "Orb Devo",
        glass_cannon: "Glass Cannon",
        hybrid: "Hybrid"
    };
    return labels[String(buildStyle || "unknown").trim().toLowerCase()] || "Unknown";
}

function handleHistoryClick(event, context = {}) {
    const root = event?.target?.closest?.(HISTORY_ROOT_SELECTOR) || null;
    if (!root) return false;

    const target = event.target;

    // Modal controls are handled first. In w25 the modal click was seen,
    // but broad History routing made the probe show only `history` and some
    // modal controls did not visibly change. Keep Run A/B modal slot handling
    // below because those intentionally render and close the modal.
    if (handleStatsModalControlClick(event, target, context)) return true;
    if (handleEditModalControlClick(event, target, context)) return true;

    const slotButton = closestEnabled(target, "[data-history-index][data-history-slot]");
    if (slotButton) {
        consumeEvent(event);
        remember("history", "history-load-run");
        performUIAction("history-load-run", {
            index: slotButton.dataset.historyIndex,
            slot: slotButton.dataset.historySlot
        });
        render(context);
        return true;
    }

    const statsButton = closestEnabled(target, "[data-history-stats-index]");
    if (statsButton) {
        consumeEvent(event);
        remember("history", "open-history-stats");
        openStatsModal(statsButton.dataset.historyStatsIndex, statsButton.dataset.historyDisplayIndex);
        return true;
    }

    const editButton = closestEnabled(target, "[data-history-edit-index]");
    if (editButton) {
        consumeEvent(event);
        remember("history", "open-history-edit");
        openEditModal(editButton.dataset.historyEditIndex, editButton.dataset.historyDisplayIndex);
        return true;
    }

    if (closestEnabled(target, "[data-history-stats-close]")) {
        consumeEvent(event);
        remember("history", "close-history-stats");
        closeStatsModal();
        return true;
    }

    const statsTab = closestEnabled(target, "[data-history-stats-tab]");
    if (statsTab) {
        consumeEvent(event);
        remember("history", "history-stats-tab");
        setStatsModalTab(statsTab.dataset.historyStatsTab || "overview");
        return true;
    }

    const statsCopy = closestEnabled(target, "[data-history-stats-copy]");
    if (statsCopy) {
        consumeEvent(event);
        remember("history", "history-stats-copy");
        copyStatsJSON(root);
        return true;
    }

    const statsDownload = closestEnabled(target, "[data-history-stats-download]");
    if (statsDownload) {
        consumeEvent(event);
        remember("history", "history-stats-download");
        downloadStatsJSON(root.ownerDocument || document, root);
        return true;
    }

    const statsSearchClear = closestEnabled(target, "[data-global-search-clear='history-stats']");
    if (statsSearchClear) {
        consumeEvent(event);
        remember("history", "history-stats-search-clear");
        const modal = statsSearchClear.closest(".tbi-history2-stats-modal");
        const input = modal?.querySelector?.("[data-history-stats-section-search]");
        if (input) input.value = "";
        applyStatsSectionSearch(modal, "");
        return true;
    }

    const pageTargetButton = closestEnabled(target, "[data-history-page-target]");
    if (pageTargetButton) {
        consumeEvent(event);
        remember("history", "history-page-change");
        updateHistoryFilter("page", pageTargetButton.dataset.historyPageTarget || "1", context);
        return true;
    }

    const pageJumpButton = closestEnabled(target, "[data-history-page-jump-go]");
    if (pageJumpButton) {
        consumeEvent(event);
        remember("history", "history-page-jump");
        jumpHistoryPage(pageJumpButton.closest("[data-history-pager]"), context, { deferRender: true });
        return true;
    }

    const archivePageButton = closestEnabled(target, "[data-history-page-archive]");
    if (archivePageButton) {
        consumeEvent(event);
        remember("history", "history-archive-page");
        archiveVisiblePage(archivePageButton.closest(HISTORY_ROOT_SELECTOR), context);
        return true;
    }

    const restorePageButton = closestEnabled(target, "[data-history-page-restore]");
    if (restorePageButton) {
        consumeEvent(event);
        remember("history", "history-restore-page");
        restoreVisiblePage(restorePageButton.closest(HISTORY_ROOT_SELECTOR), context);
        return true;
    }

    const archiveButton = closestEnabled(target, "[data-archive-history-index]");
    if (archiveButton) {
        consumeEvent(event);
        remember("history", "archive-history-run");
        performUIAction("history-archive-run", { index: archiveButton.dataset.archiveHistoryIndex });
        render(context);
        return true;
    }

    const restoreButton = closestEnabled(target, "[data-restore-history-index]");
    if (restoreButton) {
        consumeEvent(event);
        remember("history", "restore-history-run");
        performUIAction("history-restore-run", { index: restoreButton.dataset.restoreHistoryIndex });
        render(context);
        return true;
    }

    const deleteButton = closestEnabled(target, "[data-delete-history-index]");
    if (deleteButton) {
        consumeEvent(event);
        remember("history", "delete-history-run");
        if (confirmDanger("Delete this parsed History cache entry? The raw archive source is kept for future rebuilds.")) {
            performUIAction("history-delete-run", { index: deleteButton.dataset.deleteHistoryIndex });
            render(context);
        }
        return true;
    }

    if (closestEnabled(target, "[data-delete-last-history]")) {
        consumeEvent(event);
        remember("history", "delete-latest-history");
        if (confirmDanger("Delete the latest parsed History cache entry? Raw archive records are kept.")) {
            performUIAction("history-delete-last");
            render(context);
        }
        return true;
    }

    if (closestEnabled(target, "[data-delete-all-history]")) {
        consumeEvent(event);
        remember("history", "delete-all-history");
        if (confirmDanger("Delete all parsed History cache entries? Raw archive records are kept.")) {
            performUIAction("history-delete-all");
            render(context);
        }
        return true;
    }

    if (closestEnabled(target, "[data-clear-history-selection]")) {
        consumeEvent(event);
        remember("history", "clear-history-selection");
        performUIAction("history-clear-selection");
        render(context);
        return true;
    }

    if (closestEnabled(target, "[data-swap-history-slots]")) {
        consumeEvent(event);
        remember("history", "swap-history-slots");
        performUIAction("history-swap-slots");
        render(context);
        return true;
    }

    if (closestEnabled(target, "[data-history-filter-reset]")) {
        consumeEvent(event);
        remember("history", "history-reset-filters");
        performUIAction("history-reset-filters");
        render(context);
        return true;
    }

    const filterButton = closestEnabled(target, "[data-history-filter-kind][data-history-filter-option]");
    if (filterButton) {
        consumeEvent(event);
        remember("history", "history-filter-button");
        updateHistoryFilter(filterButton.dataset.historyFilterKind, filterButton.dataset.historyFilterOption, context);
        return true;
    }

    const historyImport = closestEnabled(target, ".tbi-history-clean-view [data-ui-action='import-history']");
    if (historyImport) {
        consumeEvent(event);
        remember("history", "history-import-json");
        startHistoryImport(historyImport.ownerDocument || document, context, "history");
        return true;
    }

    const historyExport = closestEnabled(target, ".tbi-history-clean-view [data-export-history]");
    if (historyExport) {
        consumeEvent(event);
        remember("history", "history-export-json");
        runHistoryExport(historyExport.ownerDocument || document, context, "history");
        return true;
    }

    const card = target?.closest?.("[data-history-select-index]") || null;
    if (card && !target?.closest?.("button, a, input, textarea, select, label")) {
        consumeEvent(event);
        remember("history", "history-select-card");
        updateHistoryFilter("selectedIndex", card.dataset.historySelectIndex || card.dataset.historyIndexCard || "0", context, { keepPage: true });
        return true;
    }

    return false;
}


function handleStatsModalControlClick(event, target, context = {}) {
    const modal = target?.closest?.(".tbi-history2-stats-modal") || null;
    if (!modal) return false;

    const closeButton = closestEnabled(target, "[data-history-stats-close]");
    if (closeButton) {
        consumeEvent(event);
        remember("history", "close-history-stats");
        closeStatsModal(modal);
        return true;
    }

    const tabButton = closestEnabled(target, "[data-history-stats-tab]");
    if (tabButton) {
        consumeEvent(event);
        const view = tabButton.dataset.historyStatsTab || inferStatsTabFromText(tabButton.textContent);
        remember("history", `history-stats-tab:${view}`);
        setStatsModalTab(view, modal);
        return true;
    }

    const copyButton = closestEnabled(target, "[data-history-stats-copy]");
    if (copyButton) {
        consumeEvent(event);
        remember("history", "history-stats-copy");
        copyStatsJSON(modal);
        return true;
    }

    const downloadButton = closestEnabled(target, "[data-history-stats-download]");
    if (downloadButton) {
        consumeEvent(event);
        remember("history", "history-stats-download");
        downloadStatsJSON(modal.ownerDocument || document, modal);
        return true;
    }

    const statsSearchClear = closestEnabled(target, "[data-global-search-clear='history-stats']");
    if (statsSearchClear) {
        consumeEvent(event);
        remember("history", "history-stats-search-clear");
        const input = modal.querySelector?.("[data-history-stats-section-search]");
        if (input) input.value = "";
        applyStatsSectionSearch(modal, "");
        return true;
    }

    const editButton = closestEnabled(target, "[data-history-edit-index]");
    if (editButton) {
        consumeEvent(event);
        remember("history", "history-stats-edit-metadata");
        closeStatsModal(modal);
        openEditModal(editButton.dataset.historyEditIndex, editButton.dataset.historyDisplayIndex);
        return true;
    }

    const modalSlotButton = closestEnabled(target, "[data-history-modal-index][data-history-modal-slot]");
    if (modalSlotButton) {
        consumeEvent(event);
        remember("history", "history-load-run-from-modal");
        performUIAction("history-load-run", {
            index: modalSlotButton.dataset.historyModalIndex,
            slot: modalSlotButton.dataset.historyModalSlot
        });
        closeStatsModal(modal);
        render(context);
        return true;
    }

    if (target?.closest?.("input, textarea, select, label")) {
        // Plain clicks into modal fields must not fall through to broad History
        // card routing, but must keep normal browser focus/caret behaviour.
        remember("history", "history-stats-field-focus");
        return true;
    }

    // Empty-space clicks inside the stats modal are absorbed by the modal so
    // they do not reach the History card layer underneath or reset the tab.
    remember("history", "history-stats-passive-click");
    return true;
}

function handleEditModalControlClick(event, target, context = {}) {
    const modal = target?.closest?.("[data-history-edit-modal]") || null;
    if (!modal) return false;

    const closeButton = closestEnabled(target, "[data-history-edit-close]");
    if (closeButton) {
        consumeEvent(event);
        remember("history", "history-edit-close");
        closeEditModal(modal);
        return true;
    }

    const buildChoice = closestEnabled(target, "[data-history-edit-build-choice]");
    if (buildChoice) {
        consumeEvent(event);
        remember("history", "history-edit-build-choice");
        setEditBuildChoice(buildChoice);
        return true;
    }

    const runTypeChoice = closestEnabled(target, "[data-history-edit-run-type-choice]");
    if (runTypeChoice) {
        consumeEvent(event);
        remember("history", "history-edit-run-type-choice");
        setEditRunTypeChoice(runTypeChoice);
        return true;
    }

    const saveButton = closestEnabled(target, "[data-history-edit-save]");
    if (saveButton) {
        consumeEvent(event);
        remember("history", "history-edit-save");
        saveEditModal(context, modal);
        return true;
    }

    if (target?.closest?.("input, textarea, select, label")) {
        // Plain clicks into edit fields must not fall through into the broad
        // History route. Do not preventDefault here or the browser can drop
        // focus/caret placement inside notes/tags.
        remember("history", "history-edit-field-focus");
        return true;
    }

    // Clicks on empty modal/card space are intentionally absorbed so they do
    // not hit rebuilt History card routes behind the overlay or trigger a
    // parent render that clears typed notes/tags.
    remember("history", "history-edit-passive-click");
    return true;
}

function handleHistoryChange(event, context = {}) {
    const root = event?.target?.closest?.(HISTORY_ROOT_SELECTOR) || null;
    if (!root) return false;

    const sort = closestEnabled(event.target, "[data-history-filter-sort]");
    if (sort) {
        consumeEvent(event);
        workspaceChanges += 1;
        lastAction = "history:sort";
        updateHistoryFilter("sort", sort.value || "newest", context);
        return true;
    }

    const build = closestEnabled(event.target, "[data-history-filter-build]");
    if (build) {
        consumeEvent(event);
        workspaceChanges += 1;
        lastAction = "history:build";
        updateHistoryFilter("build", build.value || "all", context);
        return true;
    }

    const tag = closestEnabled(event.target, "[data-history-filter-tag]");
    if (tag) {
        consumeEvent(event);
        workspaceChanges += 1;
        lastAction = "history:tag";
        updateHistoryFilter("tag", tag.value || "all", context);
        return true;
    }

    const runType = closestEnabled(event.target, "[data-history-filter-run-type]");
    if (runType) {
        consumeEvent(event);
        workspaceChanges += 1;
        lastAction = "history:run-type";
        updateHistoryFilter("runType", runType.value || "all", context);
        return true;
    }

    return false;
}

function handleHistoryInput(event, context = {}) {
    const root = event?.target?.closest?.(HISTORY_ROOT_SELECTOR) || null;
    if (!root) return false;

    const editField = event.target?.closest?.("[data-history-edit-modal] [data-history-edit-notes], [data-history-edit-modal] [data-history-edit-tags]") || null;
    if (editField) {
        workspaceInputs += 1;
        lastAction = "history:edit-field-input";
        return true;
    }

    const search = event.target?.closest?.("[data-history-filter-query]") || null;
    if (search) {
        workspaceInputs += 1;
        lastAction = "history:search-library-render";
        const query = search.value || "";
        const start = typeof search.selectionStart === "number" ? search.selectionStart : query.length;
        const end = typeof search.selectionEnd === "number" ? search.selectionEnd : start;
        performUIAction("history-set-filters", { query, page: 1, selectedIndex: null });
        scheduleHistorySearchRender(context, { query, start, end });
        return true;
    }

    const statsSearch = event.target?.closest?.("[data-history-stats-section-search]") || null;
    if (statsSearch) {
        workspaceInputs += 1;
        lastAction = "history:stats-section-search";
        applyStatsSectionSearch(statsSearch.closest(".tbi-history2-stats-modal"), statsSearch.value || "");
        return true;
    }

    return false;
}

export function getWorkspaceEventStatus() {
    return {
        module: "workspaceEvents",
        version: "v4.11z52w47",
        captureTruthProbe: true,
        commandFallbackActions: Array.from(COMMAND_ACTIONS),
        foundationVersion: UI_EVENT_FOUNDATION_VERSION,
        active: true,
        phase: "hard-event-owner-rebuild",
        oldParkedCatchAllActive: false,
        owns: [
            "Command Deck clicks/input/change",
            "History cards/search/filter/modals",
            "Run A/B loading from History",
            "Shared import/export calls from rebuilt workspaces"
        ],
        clicks: workspaceClicks,
        commandClicks,
        historyClicks,
        changes: workspaceChanges,
        inputs: workspaceInputs,
        lastAction
    };
}

function remember(scope = "workspace", action = "workspace") {
    workspaceClicks += 1;
    lastAction = `${scope}:${action}`;
    if (scope === "command") commandClicks += 1;
    if (scope === "history") historyClicks += 1;
}

function render(context = {}) {
    if (typeof context.renderApp === "function") context.renderApp();
}

function updateHistoryFilter(kind = "", value = "", context = {}, options = {}) {
    const state = actionGetState();
    const current = normaliseHistoryFilters(state.ui?.historyFilters || {});
    const next = { ...current };
    const key = String(kind || "");

    switch (key) {
        case "mode":
            next.mode = value === "deep" ? "deep" : "normal";
            break;
        case "showArchived":
            next.showArchived = String(value) === "true";
            break;
        case "sort":
            next.sort = value || "newest";
            break;
        case "build":
            next.build = value || "all";
            break;
        case "tag":
            next.tag = value || "all";
            break;
        case "runType":
            next.runType = value || "all";
            break;
        case "page":
            next.page = Math.max(1, Number.parseInt(String(value || 1), 10) || 1);
            break;
        case "selectedIndex":
            next.selectedIndex = Number.parseInt(String(value || 0), 10);
            break;
        default:
            next[key] = value;
            break;
    }

    if (!options.keepPage && key !== "page" && key !== "selectedIndex") {
        next.page = 1;
    }

    performUIAction("history-set-filters", next);

    if (options.deferRender) {
        scheduleHistoryRender(context);
        return;
    }

    render(context);
}

let scheduledHistorySearchRender = 0;

function scheduleHistorySearchRender(context = {}, cursor = {}) {
    if (typeof window === "undefined") {
        render(context);
        return;
    }

    window.clearTimeout(scheduledHistorySearchRender);
    scheduledHistorySearchRender = window.setTimeout(() => {
        render(context);
        restoreHistorySearchFocus(cursor);
    }, 0);
}

function restoreHistorySearchFocus(cursor = {}) {
    if (typeof document === "undefined") return;
    const input = document.querySelector("[data-history-filter-query]");
    if (!input || !input.isConnected) return;

    try {
        input.focus({ preventScroll: true });
        const start = Number.isFinite(Number(cursor.start)) ? Number(cursor.start) : String(cursor.query || input.value || "").length;
        const end = Number.isFinite(Number(cursor.end)) ? Number(cursor.end) : start;
        if (typeof input.setSelectionRange === "function") input.setSelectionRange(start, end);
    } catch (_error) {
        // Focus restore is a comfort guard only; search state has already been saved and rendered.
    }
}

let scheduledHistoryRender = 0;

function scheduleHistoryRender(context = {}) {
    if (typeof window === "undefined") {
        render(context);
        return;
    }

    window.clearTimeout(scheduledHistoryRender);
    scheduledHistoryRender = window.setTimeout(() => {
        render(context);
    }, 0);
}

function handleHistoryKeydown(event, context = {}) {
    const root = event?.target?.closest?.(HISTORY_ROOT_SELECTOR) || null;
    if (!root) return false;

    const pageJump = event.target?.closest?.("[data-history-page-jump]") || null;
    if (pageJump && event.key === "Enter") {
        consumeEvent(event);
        remember("history", "history-page-jump-enter");
        jumpHistoryPage(pageJump.closest("[data-history-pager]"), context, { deferRender: true });
        return true;
    }

    return false;
}

function jumpHistoryPage(pager = null, context = {}, options = {}) {
    const input = pager?.isConnected ? pager.querySelector?.("[data-history-page-jump]") : null;
    const max = Number.parseInt(String(input?.max || "1"), 10) || 1;
    const raw = Number.parseInt(String(input?.value || "1"), 10) || 1;
    const value = Math.min(max, Math.max(1, raw));

    if (input && input.isConnected) {
        input.value = String(value);
    }

    updateHistoryFilter("page", value, context, { keepPage: true, deferRender: Boolean(options.deferRender) });
}

function getVisiblePageHistoryIndices(root = null) {
    return Array.from(root?.querySelectorAll?.("[data-history-index-card]") || [])
        .filter(card => !card.hidden)
        .map(card => Number.parseInt(String(card.dataset.historyIndexCard), 10))
        .filter(index => Number.isFinite(index) && index >= 0);
}

function archiveVisiblePage(root = null, context = {}) {
    const indices = getVisiblePageHistoryIndices(root);
    if (!indices.length) return;
    if (!confirmDanger(`Archive ${indices.length} visible report card(s) on this page?`)) return;
    indices.forEach(index => performUIAction("history-archive-run", { index }));
    render(context);
}

function restoreVisiblePage(root = null, context = {}) {
    const indices = getVisiblePageHistoryIndices(root);
    if (!indices.length) return;
    indices.forEach(index => performUIAction("history-restore-run", { index }));
    render(context);
}

function getHistoryModalContext(index = -1, displayIndex = null) {
    const state = actionGetState();
    const history = Array.isArray(state.history) ? state.history.filter(Boolean) : [];
    const filters = normaliseHistoryFilters(state.ui?.historyFilters || {});
    const visibleEntries = getVisibleHistoryEntries(history, filters, null);
    const safeIndex = Number(index);
    const entry = Number.isInteger(safeIndex)
        ? ({ run: history[safeIndex] || null, originalIndex: safeIndex, visibleIndex: Number(displayIndex ?? safeIndex) })
        : null;

    return {
        state,
        history,
        visibleEntries,
        entry,
        index: Number.isInteger(safeIndex) ? safeIndex : 0,
        displayIndex: Number.isInteger(Number(displayIndex)) ? Number(displayIndex) : (entry?.visibleIndex || 0)
    };
}

function openStatsModal(index = -1, displayIndex = null) {
    const { state, history, visibleEntries, entry } = getHistoryModalContext(index, displayIndex);
    const mount = document.getElementById("historyStatsModalMount");
    if (!mount || !entry?.run) return;

    mount.innerHTML = buildHistoryStatsModal({
        run: entry.run,
        index: entry.originalIndex,
        displayIndex: entry.visibleIndex,
        history,
        visibleHistory: visibleEntries.map(item => item.run).filter(Boolean),
        runA: state.runA,
        runB: state.runB
    });
}

function closeStatsModal(modal = null) {
    const mount = modal?.closest?.("#historyStatsModalMount") || document.getElementById("historyStatsModalMount");
    if (mount) {
        mount.innerHTML = "";
        return;
    }

    // Defensive fallback if the modal was rendered outside the expected mount.
    modal?.remove?.();
    document.querySelectorAll(".tbi-history2-stats-modal").forEach(item => item.remove());
}

function openEditModal(index = -1, displayIndex = null) {
    const { entry } = getHistoryModalContext(index, displayIndex);
    const mount = document.getElementById("historyEditModalMount");
    if (!mount || !entry?.run) return;

    mount.innerHTML = buildHistoryEditModal({
        run: entry.run,
        index: entry.originalIndex,
        displayIndex: entry.visibleIndex
    });
}

function closeEditModal(modal = null) {
    const mount = modal?.closest?.("#historyEditModalMount") || document.getElementById("historyEditModalMount");
    if (mount) {
        mount.innerHTML = "";
        return;
    }

    modal?.remove?.();
    document.querySelectorAll("[data-history-edit-modal]").forEach(item => item.remove());
}

function setEditBuildChoice(button) {
    const modal = button.closest("[data-history-edit-modal]");
    const value = button.dataset.historyEditBuildChoice || "unknown";
    const hidden = modal?.querySelector?.("[data-history-edit-build]");
    if (hidden) hidden.value = value;

    modal?.querySelectorAll?.("[data-history-edit-build-choice]").forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
    });
}

function setEditRunTypeChoice(button) {
    const modal = button.closest("[data-history-edit-modal]");
    const value = button.dataset.historyEditRunTypeChoice || "normal";
    const hidden = modal?.querySelector?.("[data-history-edit-run-type]");
    if (hidden) hidden.value = value;

    modal?.querySelectorAll?.("[data-history-edit-run-type-choice]").forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
    });
}

function saveEditModal(context = {}, modalRoot = null) {
    const modal = modalRoot || document.querySelector("[data-history-edit-modal]");
    if (!modal) return;

    const index = modal.dataset.historyEditIndex;
    const notes = modal.querySelector("[data-history-edit-notes]")?.value || "";
    const tags = modal.querySelector("[data-history-edit-tags]")?.value || "";
    const buildStyle = modal.querySelector("[data-history-edit-build]")?.value || "unknown";
    const runType = modal.querySelector("[data-history-edit-run-type]")?.value || "normal";

    performUIAction("history-update-meta", {
        index,
        meta: { notes, tags, buildStyle, runType }
    });

    closeEditModal(modal);
    render(context);
}

function setStatsModalTab(view = "summary", modalRoot = null) {
    const modal = modalRoot || document.querySelector(".tbi-history2-stats-modal");
    if (!modal) return;

    const selected = normaliseStatsTab(view);
    modal.querySelectorAll("[data-history-stats-tab]").forEach(button => {
        const active = button.dataset.historyStatsTab === selected;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    modal.querySelectorAll("[data-history-stats-view]").forEach(panel => {
        panel.classList.toggle("active", panel.dataset.historyStatsView === selected);
    });
}


function normaliseStatsTab(view = "summary") {
    const value = String(view || "summary").trim().toLowerCase();
    if (value.includes("section")) return "sections";
    if (value.includes("raw")) return "raw";
    return "summary";
}

function inferStatsTabFromText(text = "") {
    return normaliseStatsTab(text);
}

function applyStatsSectionSearch(modal, query = "") {
    if (!modal) return;
    const needle = String(query || "").trim().toLowerCase();
    const sections = Array.from(modal.querySelectorAll("[data-history-stats-section]"));
    let visible = 0;

    sections.forEach(section => {
        const rows = Array.from(section.querySelectorAll("[data-history-stats-row]"));
        const sectionText = String(section.dataset.sectionSearch || "").toLowerCase();
        let matchedRows = 0;

        rows.forEach(row => {
            const matches = !needle || String(row.dataset.historyStatsRowSearch || "").toLowerCase().includes(needle);
            row.hidden = !matches;
            if (matches) matchedRows += 1;
        });

        const sectionMatches = !needle || sectionText.includes(needle) || matchedRows > 0;
        section.hidden = !sectionMatches;
        section.querySelector("[data-history-stats-match-pill]")?.toggleAttribute("hidden", !needle || !sectionMatches);
        if (sectionMatches) visible += 1;
    });

    const empty = modal.querySelector("[data-history-stats-no-results]");
    if (empty) empty.hidden = visible !== 0;
}

function applyHistorySearchDom(input = null) {
    const root = input?.closest?.(".tbi-history-clean-view");
    if (!root) return;

    const state = actionGetState();
    const filters = normaliseHistoryFilters(state.ui?.historyFilters || {});
    const needle = String(input.value || "").trim().toLowerCase();
    const deep = filters.mode === "deep";
    const cards = Array.from(root.querySelectorAll("[data-history-card]"));
    let visible = 0;

    cards.forEach(card => {
        const haystack = String(deep
            ? card.dataset.historyDeepSearchText || card.dataset.historySearchText || ""
            : card.dataset.historySearchText || ""
        ).toLowerCase();
        const matches = !needle || haystack.includes(needle);
        card.hidden = !matches;
        card.classList.toggle("is-search-hidden", !matches);
        if (matches) visible += 1;
    });

    const count = root.querySelector("[data-history-search-visible-count]");
    if (count) count.textContent = String(visible);

    const total = root.querySelector("[data-history-search-total-count]");
    if (total) total.textContent = `visible of ${cards.length} shown`;

    const status = root.querySelector("[data-history-global-search-status]");
    if (status) {
        status.textContent = needle
            ? `Search: ${input.value || ""}`
            : "Normal search avoids raw-label noise. Use Deep report search only when you need raw Battle Report evidence.";
    }

    root.classList.toggle("tbi-history-search-empty", visible === 0);

    const empty = root.querySelector("[data-history-search-empty-message]");
    if (empty) empty.hidden = visible !== 0;

    const listCount = root.querySelector("[data-history-list-visible-count]");
    if (listCount) listCount.textContent = `${visible} visible`;
}


function getStatsJSON(modalRoot = null) {
    const json = modalRoot?.querySelector?.("[data-history-stats-json]")?.textContent || "";
    return json.trim();
}

function copyStatsJSON(modalRoot = null) {
    const text = getStatsJSON(modalRoot);
    if (!text) return;
    navigator.clipboard?.writeText?.(text).catch(() => {});
}

function downloadStatsJSON(doc = document, modalRoot = null) {
    const text = getStatsJSON(modalRoot);
    if (!text) return;
    triggerTextDownload(doc, text, "tower-battle-intel-history-run.json", "application/json");
}

function startHistoryImport(doc, context = {}, source = "history") {
    startHistoryJSONImport({
        doc,
        context,
        source,
        getInputDraft: () => source === "command"
            ? findCommandInput(doc)?.value || ""
            : String(actionGetState().lastInput || "")
    });
}

function runHistoryExport(doc, context = {}, source = "history") {
    runHistoryJSONExport({
        doc,
        context,
        source,
        getInputDraft: () => source === "command"
            ? findCommandInput(doc)?.value || ""
            : String(actionGetState().lastInput || "")
    });
}

function findCommandActionButton(target) {
    const scoped = closestEnabled(target, COMMAND_ACTION_SELECTOR);
    if (scoped) return scoped;

    const generic = closestEnabled(target, "[data-ui-action]");
    const action = String(generic?.dataset?.uiAction || "").trim();
    return COMMAND_ACTIONS.has(action) ? generic : null;
}

function findCommandInput(doc = document) {
    return doc?.querySelector?.(COMMAND_INPUT_SELECTOR) || null;
}

function confirmDanger(message = "Continue?") {
    if (typeof window === "undefined" || typeof window.confirm !== "function") return true;
    return window.confirm(message);
}

export default {
    handleWorkspaceClick,
    handleWorkspaceChange,
    handleWorkspaceInput,
    getWorkspaceEventStatus
};
