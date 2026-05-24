"use strict";

/**
 * ACTION AUDIT BRIDGE v4.11q
 *
 * Purpose:
 * - Top tabs work, but inner buttons/selects/modals are unreliable.
 * - This bridge owns the active in-panel controls with one capture-phase path.
 * - Import file picker opening is handled by nativeImportHardBridge; this file owns the selected-file/change import result.
 */

import {
    performUIAction,
    actionGetState,
    actionImportHistoryText,
    actionExportHistoryJSON,
    actionSetHistoryFilters,
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

const BRIDGE_FLAG = "__TowerBattleIntelActionAuditBridgeBound";
const VERSION = "v4.11q";

const FILE_INPUT_SELECTOR = [
    "#historyImportInput",
    "#historyImportFallbackInput",
    ".history-native-import-input",
    "[data-history-visible-import-input]",
    "[data-history-import-input]",
    "[data-import-history-input]",
    "[data-history-import-fallback-input]"
].join(", ");

let renderNow = null;
let searchTimer = null;
let lastAction = null;
let lastImportResult = null;
let lastError = null;
let previousNativeStatus = null;

export function bindActionAuditBridge(renderCallback = null) {
    if (typeof renderCallback === "function") {
        renderNow = renderCallback;
    }

    if (typeof document === "undefined") {
        return false;
    }

    if (window[BRIDGE_FLAG]) {
        installConsoleHooks();
        return true;
    }

    window[BRIDGE_FLAG] = true;

    document.addEventListener("pointerdown", handleNativePointerDown, true);
    document.addEventListener("mousedown", handleNativePointerDown, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("change", handleChange, true);
    document.addEventListener("input", handleInput, true);
    document.addEventListener("keydown", handleKeydown, true);

    installConsoleHooks();
    console.log("[Tower Battle Intel] Action audit bridge bound", VERSION);

    return true;
}

function handleNativePointerDown(event) {
    const target = event.target;
    if (!isElement(target)) return;

    // v4.11q: native select/dropdown controls must be left completely native.
    // Stopping pointer/mouse events here made Chrome open then instantly close dropdowns.
    if (isNativeSelectControl(target)) {
        lastAction = { action: "native-select-pointer", at: new Date().toISOString() };
        stampAction(lastAction);
        return;
    }

    if (isTextEditingControl(target)) {
        // Text inputs keep browser focus behaviour. Do not prevent default.
        lastAction = { action: "native-text-pointer", at: new Date().toISOString() };
        stampAction(lastAction);
    }
}

function handleSummaryToggle(event, target) {
    const summary = target.closest("summary");
    if (!summary) return false;

    const details = summary.closest("details");
    if (!details) return false;

    // v4.11q: let the browser's native <details>/<summary> toggle happen.
    // The old bridge prevented default and toggled manually; some summaries then fought
    // with render/rebuild paths and appeared dead.
    const wasOpen = Boolean(details.open);
    event.stopImmediatePropagation();

    window.setTimeout(() => {
        if (!document.contains(details)) return;

        // Browser should have toggled by now. If something older blocked it,
        // fallback-toggle once so the user click still works.
        if (details.open === wasOpen) {
            details.open = !wasOpen;
        }

        lastAction = {
            action: "toggle-collapsible",
            payload: { open: Boolean(details.open), text: summary.textContent?.trim()?.slice(0, 80) || "details" },
            at: new Date().toISOString()
        };
        stampAction(lastAction);
    }, 0);

    return true;
}

function handleClick(event) {
    const target = event.target;
    if (!isElement(target)) return;

    if (handleDebugClick(event, target)) return;
    if (handleStatsModalClick(event, target)) return;
    if (handleEditModalClick(event, target)) return;
    if (handleConfirmModalClick(event, target)) return;

    if (handleSummaryToggle(event, target)) return;

    // Keep native browser behaviours alive. Select/dropdown controls must not be captured;
    // otherwise Chrome dropdowns open only while holding the mouse button.
    if (isNativeSelectControl(target)) {
        lastAction = { action: "native-select-click", at: new Date().toISOString() };
        stampAction(lastAction);
        return;
    }

    if (isTextEditingControl(target)) {
        lastAction = { action: "native-text-click", at: new Date().toISOString() };
        stampAction(lastAction);
        return;
    }
    if (target.matches(FILE_INPUT_SELECTOR)) return;

    if (handleRootCommandButton(event, target)) return;
    if (handleDisplayModeToggle(event, target)) return;

    const dashboardTab = target.closest("[data-dashboard-tab]");
    if (dashboardTab && !dashboardTab.disabled) {
        capture(event);
        runAction("set-dashboard-tab", { tab: dashboardTab.dataset.dashboardTab || "overview" });
        return;
    }

    const uiAction = target.closest("[data-ui-action]");
    if (uiAction && !uiAction.disabled) {
        capture(event);
        handleUIAction(uiAction);
        return;
    }

    const historyLoad = target.closest("[data-history-index][data-history-slot]");
    if (historyLoad && !historyLoad.disabled) {
        capture(event);
        runAction("history-load-run", {
            index: historyLoad.dataset.historyIndex,
            slot: historyLoad.dataset.historySlot || "runA"
        });
        return;
    }

    if (handleHistoryButton(event, target)) return;
    if (handleHistoryFilterButton(event, target)) return;

    const section = target.closest("[data-section]");
    if (section && !section.disabled && !section.closest("[data-history-stats-section], [data-history-stats-row]")) {
        capture(event);
        const sectionKey = section.dataset.section || "";
        runAction("select-section", { section: sectionKey });
        window.setTimeout(() => ensureSystemDetail(sectionKey), 0);
    }
}

function handleUIAction(button) {
    const action = String(button.dataset.uiAction || "").trim();
    const payload = payloadFromButton(button);

    switch (action) {
        case "toggle-display-mode":
        case "toggle-quiet-display":
            toggleDisplayMode();
            return;

        case "import-history":
            openImportPickerViaNativeControls();
            return;

        case "export-history":
        case "history-export-json":
            downloadHistory();
            return;

        case "open-history-stats":
            openStatsModal(Number(payload.index), button);
            return;

        case "open-history-edit":
            openEditModal(Number(payload.index), button);
            return;

        case "delete-history-run":
            openConfirm({
                title: "Delete saved run?",
                message: "This saved run will be removed from Battle History Trace.",
                acceptText: "Delete Run",
                action: "history-delete-run",
                payload
            });
            return;

        case "delete-last-history":
            openConfirm({
                title: "Delete latest saved run?",
                message: "This removes the latest saved run only.",
                acceptText: "Delete Latest",
                action: "history-delete-last",
                payload: {}
            });
            return;

        case "delete-all-history":
            openConfirm({
                title: "Delete all Battle History?",
                message: "This removes every saved run from this browser.",
                acceptText: "Delete All",
                action: "history-delete-all",
                payload: {}
            });
            return;

        default:
            runAction(action, payload);
    }
}

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
        [data-delete-last-history],
        [data-delete-all-history]
    `);

    if (!button || button.disabled) return false;

    capture(event);

    if (button.matches("[data-history-stats-index]")) {
        openStatsModal(Number(button.dataset.historyStatsIndex), button);
        return true;
    }

    if (button.matches("[data-history-edit-index]")) {
        openEditModal(Number(button.dataset.historyEditIndex), button);
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
        openConfirm({
            title: "Delete saved run?",
            message: "This saved run will be removed from Battle History Trace.",
            acceptText: "Delete Run",
            action: "history-delete-run",
            payload: { index: button.dataset.deleteHistoryIndex }
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
        downloadHistory();
        return true;
    }

    if (button.matches("[data-delete-last-history]")) {
        openConfirm({ title: "Delete latest saved run?", message: "This removes the latest saved run only.", acceptText: "Delete Latest", action: "history-delete-last", payload: {} });
        return true;
    }

    if (button.matches("[data-delete-all-history]")) {
        openConfirm({ title: "Delete all Battle History?", message: "This removes every saved run from this browser.", acceptText: "Delete All", action: "history-delete-all", payload: {} });
        return true;
    }

    return false;
}

function handleHistoryFilterButton(event, target) {
    const filterButton = target.closest("[data-history-filter-value], [data-history-filter-reset]");
    if (!filterButton || filterButton.disabled) return false;

    capture(event);

    if (filterButton.matches("[data-history-filter-reset]")) {
        runAction("history-reset-filters", {});
        return true;
    }

    const kind = filterButton.dataset.historyFilterKind || filterButton.dataset.historyFilterValue;
    const option = filterButton.dataset.historyFilterOption;
    const patch = buildFilterPatch(kind, option);

    if (patch) {
        runAction("history-set-filters", { filters: patch }, { preserveScroll: true });
    }

    return true;
}

function handleChange(event) {
    const target = event.target;
    if (!isElement(target)) return;

    if (target.matches(FILE_INPUT_SELECTOR)) {
        importHistoryFile(target);
        return;
    }

    if (target.matches("#buildStyleSelect")) {
        runAction("set-build-style", { buildStyle: target.value || "unknown" });
        return;
    }

    if (target.matches("[data-history-filter-sort]")) {
        runAction("history-set-filters", { filters: { sort: target.value || "newest" } }, { preserveScroll: true });
        return;
    }

    if (target.matches("[data-history-filter-build]")) {
        runAction("history-set-filters", { filters: { build: target.value || "all" } }, { preserveScroll: true });
        return;
    }

    if (target.matches("[data-history-filter-tag]")) {
        runAction("history-set-filters", { filters: { tag: target.value || "all" } }, { preserveScroll: true });
        return;
    }

    if (target.matches("[data-history-filter-archived]")) {
        runAction("history-set-filters", { filters: { showArchived: Boolean(target.checked) } }, { preserveScroll: true });
    }
}

function handleInput(event) {
    const target = event.target;
    if (!isElement(target)) return;

    if (target.matches("[data-history-filter-query]")) {
        const query = target.value || "";
        clearTimeout(searchTimer);
        searchTimer = window.setTimeout(() => {
            runAction("history-set-filters", { filters: { query } }, { preserveScroll: true });
        }, 140);
        return;
    }

    if (target.matches("[data-history-stats-section-search]")) {
        filterStatsSections(target);
        return;
    }

    if (target.matches("[data-confirm-input]")) {
        updateConfirm(target.closest("[data-action-audit-confirm]"));
    }
}

function handleKeydown(event) {
    const target = event.target;

    if ((event.key === "Enter" || event.key === " ") && isElement(target) && target.closest("summary")) {
        handleSummaryToggle(event, target);
        return;
    }

    if (event.key !== "Escape") return;

    const confirm = document.querySelector("[data-action-audit-confirm]");
    if (confirm) {
        closeConfirm(confirm);
        return;
    }

    const stats = document.getElementById("historyStatsModalMount");
    if (stats?.innerHTML) {
        stats.innerHTML = "";
        return;
    }

    const edit = document.getElementById("historyEditModalMount");
    if (edit?.innerHTML) {
        edit.innerHTML = "";
        return;
    }
}

/* --------------------------------------------------
   IMPORT / EXPORT
-------------------------------------------------- */

async function importHistoryFile(input) {
    const file = input?.files?.[0];
    if (!file) return null;

    const before = getHistoryCount();
    const result = {
        fileName: file.name,
        before,
        after: before,
        added: 0,
        duplicateOrIgnored: 0,
        ok: false,
        error: null
    };

    try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const incoming = extractImportedRuns(parsed);

        actionImportHistoryText(text);

        const after = getHistoryCount();
        result.after = after;
        result.added = Math.max(0, after - before);
        result.duplicateOrIgnored = Math.max(0, incoming.length - result.added);
        result.ok = after > before || incoming.length > 0;
        lastImportResult = result;

        stampImportResult(result);
        showToast(result.added > 0
            ? `Imported ${result.added} history run${result.added === 1 ? "" : "s"}.`
            : `Import read ${incoming.length} run${incoming.length === 1 ? "" : "s"}, but none were added. They may already exist.`);

        renderApp();
        return result;
    } catch (error) {
        result.error = String(error?.message || error);
        lastImportResult = result;
        lastError = result.error;
        stampImportResult(result);
        showToast(`Import failed: ${result.error}`, "bad");
        console.error("[Tower Battle Intel] History import failed", error);
        return result;
    } finally {
        try { input.value = ""; } catch { /* ignore */ }
    }
}

function downloadHistory() {
    const text = buildHistoryExportText();
    const filename = `tower-battle-intel-history-${new Date().toISOString().replace(/[:.]/g, "-").replace("T", "-").slice(0, 19)}.json`;
    const ok = downloadTextFile(text, filename, "application/json;charset=utf-8");
    lastAction = { action: "export-history", at: new Date().toISOString(), filename, ok };
    stampAction(lastAction);
    showToast(ok ? "History export downloaded." : "History export was prepared, but the browser did not confirm the download.", ok ? "good" : "warn");
}

function buildHistoryExportText() {
    try {
        const direct = actionExportHistoryJSON();
        if (direct && String(direct).trim().length > 2) return direct;
    } catch {
        // fallback below
    }

    const state = actionGetState();
    return JSON.stringify({
        app: "Tower Battle Intel",
        exportType: "history-export",
        exportedAt: new Date().toISOString(),
        history: Array.isArray(state.history) ? state.history : []
    }, null, 2);
}

function extractImportedRuns(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (Array.isArray(value?.history)) return value.history.filter(Boolean);
    if (Array.isArray(value?.runs)) return value.runs.filter(Boolean);
    return [];
}

/* --------------------------------------------------
   DEBUG
-------------------------------------------------- */

function handleDebugClick(event, target) {
    const panel = target.closest("#debugPanel");
    if (!panel || !panel.classList.contains("active")) return false;

    if (target.closest("#debugClose, [data-debug-close]")) {
        capture(event);
        closeDebugPanel();
        return true;
    }

    if (target.closest("#debugDownloadHealth, [data-debug-download-health]")) {
        capture(event);
        const filename = `tower-battle-intel-health-scan-${buildUKFilenameTimestamp()}.json`;
        const ok = downloadTextFile(JSON.stringify(runSystemHealthScan(actionGetState()), null, 2), filename, "application/json;charset=utf-8");
        lastAction = { action: "debug-download-health", at: new Date().toISOString(), filename, ok };
        stampAction(lastAction);
        return true;
    }

    if (target.closest("#debugDownloadFull, [data-debug-download-full]")) {
        capture(event);
        const filename = `tower-battle-intel-debug-export-${buildUKFilenameTimestamp()}.json`;
        const ok = downloadTextFile(JSON.stringify(buildFullDebugPayload(), null, 2), filename, "application/json;charset=utf-8");
        lastAction = { action: "debug-download-full", at: new Date().toISOString(), filename, ok };
        stampAction(lastAction);
        return true;
    }

    if (target.closest("#debugCopyHealth, [data-debug-copy-health]")) {
        capture(event);
        copyText(JSON.stringify(runSystemHealthScan(actionGetState()), null, 2));
        return true;
    }

    if (target.closest("#debugCopyFull, [data-debug-copy-full]")) {
        capture(event);
        copyText(JSON.stringify(buildFullDebugPayload(), null, 2));
        return true;
    }

    if (target.closest("#debugCopy, [data-debug-copy-shown]")) {
        capture(event);
        copyText(document.getElementById("debugOutput")?.textContent || "");
        return true;
    }

    return false;
}

function closeDebugPanel() {
    try {
        performUIAction("toggle-debug", { force: false });
    } catch {
        // DOM fallback below
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

function buildFullDebugPayload() {
    return {
        app: "Tower Battle Intel",
        exportType: "full-debug-export",
        exportedAt: new Date().toISOString(),
        time: buildTimeInfo(),
        healthScan: runSystemHealthScan(actionGetState()),
        state: actionGetState(),
        actionAudit: auditControls()
    };
}

/* --------------------------------------------------
   HISTORY STATS / EDIT
-------------------------------------------------- */

function openStatsModal(index, button = null) {
    const safeIndex = Number(index);
    const state = actionGetState();
    const history = Array.isArray(state.history) ? state.history : [];
    const run = Number.isInteger(safeIndex) ? history[safeIndex] : null;

    if (!run) {
        showToast("No saved history run found for Stats.", "bad");
        return;
    }

    const mount = ensureMount("historyStatsModalMount");
    const displayIndex = Number(button?.dataset?.historyDisplayIndex);

    mount.innerHTML = buildHistoryStatsModal({
        run,
        index: safeIndex,
        displayIndex: Number.isInteger(displayIndex) ? displayIndex : safeIndex,
        history,
        visibleHistory: history.filter(item => !item?.meta?.archived),
        runA: state.runA,
        runB: state.runB
    });
}

function handleStatsModalClick(event, target) {
    const modal = target.closest("#historyStatsModal");
    if (!modal) return false;

    if (target.closest("[data-history-stats-close]") || target === modal) {
        capture(event);
        ensureMount("historyStatsModalMount").innerHTML = "";
        return true;
    }

    const tab = target.closest("[data-history-stats-tab]");
    if (tab) {
        capture(event);
        setStatsTab(tab.dataset.historyStatsTab || "overview");
        return true;
    }

    const slot = target.closest("[data-history-modal-slot]");
    if (slot) {
        capture(event);
        runAction("history-load-run", { index: slot.dataset.historyModalIndex, slot: slot.dataset.historyModalSlot || "runA" });
        ensureMount("historyStatsModalMount").innerHTML = "";
        return true;
    }

    if (target.closest("[data-history-stats-copy]")) {
        capture(event);
        copyText(JSON.stringify(getModalRun("historyStatsModal"), null, 2));
        return true;
    }

    if (target.closest("[data-history-stats-download]")) {
        capture(event);
        const filename = `tower-battle-intel-history-run-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.json`;
        const ok = downloadTextFile(JSON.stringify(getModalRun("historyStatsModal"), null, 2), filename, "application/json;charset=utf-8");
        lastAction = { action: "history-stats-download", at: new Date().toISOString(), filename, ok };
        stampAction(lastAction);
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

function filterStatsSections(input) {
    const modal = input.closest("#historyStatsModal");
    if (!modal) return;

    const query = String(input.value || "").trim().toLowerCase();
    let visible = 0;

    modal.querySelectorAll("[data-history-stats-section]").forEach(section => {
        const text = String(section.dataset.sectionSearch || section.textContent || "").toLowerCase();
        const show = !query || text.includes(query);
        let matchedRows = 0;

        section.querySelectorAll("[data-history-stats-row]").forEach(row => {
            const rowText = String(row.dataset.historyStatsRowSearch || row.textContent || "").toLowerCase();
            const rowMatches = Boolean(query && rowText.includes(query));
            row.classList.toggle("search-match", rowMatches);
            if (rowMatches) matchedRows += 1;
        });

        section.classList.toggle("search-match", Boolean(query && show));
        section.classList.toggle("row-search-match", matchedRows > 0);
        section.dataset.matchCount = query && show ? String(matchedRows) : "0";

        const matchPill = section.querySelector("[data-history-stats-match-pill]");
        if (matchPill) {
            matchPill.hidden = !(query && show);
            matchPill.textContent = matchedRows > 0 ? `Matched ${matchedRows}` : "Section match";
        }

        section.hidden = !show;
        if (show) visible += 1;
    });

    const empty = modal.querySelector("[data-history-stats-no-results]");
    if (empty) empty.hidden = visible !== 0;
}

function openEditModal(index, button = null) {
    const safeIndex = Number(index);
    const state = actionGetState();
    const history = Array.isArray(state.history) ? state.history : [];
    const run = Number.isInteger(safeIndex) ? history[safeIndex] : null;

    if (!run) {
        showToast("No saved history run found for Edit.", "bad");
        return;
    }

    const mount = ensureMount("historyEditModalMount");
    const displayIndex = Number(button?.dataset?.historyDisplayIndex);

    mount.innerHTML = buildHistoryEditModal({
        run,
        index: safeIndex,
        displayIndex: Number.isInteger(displayIndex) ? displayIndex : safeIndex
    });
}

function handleEditModalClick(event, target) {
    const modal = target.closest("#historyEditModal");
    if (!modal) return false;

    if (isNativeSelectControl(target) || isTextEditingControl(target)) {
        // v4.11q: leave modal selects/textareas fully native so dropdowns and typing work.
        return true;
    }

    if (target.closest("[data-history-edit-close]") || target === modal) {
        capture(event);
        ensureMount("historyEditModalMount").innerHTML = "";
        return true;
    }

    const choice = target.closest("[data-history-edit-build-choice]");
    if (choice) {
        capture(event);
        const value = choice.dataset.historyEditBuildChoice || "unknown";
        const input = modal.querySelector("[data-history-edit-build]");
        if (input) input.value = value;
        modal.querySelectorAll("[data-history-edit-build-choice]").forEach(button => {
            const active = button === choice;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", active ? "true" : "false");
        });
        return true;
    }

    if (target.closest("[data-history-edit-save]")) {
        capture(event);
        const index = Number(modal.dataset.historyEditIndex);
        actionUpdateHistoryRunMeta(index, {
            notes: modal.querySelector("[data-history-edit-notes]")?.value || "",
            tags: modal.querySelector("[data-history-edit-tags]")?.value || "",
            buildStyle: modal.querySelector("[data-history-edit-build]")?.value || "unknown"
        });
        ensureMount("historyEditModalMount").innerHTML = "";
        renderApp();
        return true;
    }

    return false;
}

/* --------------------------------------------------
   CONFIRM MODAL
-------------------------------------------------- */

function openConfirm({ title, message, acceptText, action, payload }) {
    const mount = ensureMount("actionAuditConfirmMount");
    const phrase = action === "history-delete-all" ? "DELETE ALL" : "DELETE";

    mount.innerHTML = `
        <div class="action-audit-confirm" data-action-audit-confirm="true" role="dialog" aria-modal="true">
            <div class="action-audit-confirm-card">
                <div class="action-audit-confirm-kicker">Confirm destructive action</div>
                <h3>${escapeHTML(title)}</h3>
                <p>${escapeHTML(message)}</p>
                <p class="action-audit-confirm-warning">Type <strong>${escapeHTML(phrase)}</strong> to continue.</p>
                <input
                    class="action-audit-confirm-input"
                    data-confirm-input="true"
                    autocomplete="off"
                    spellcheck="false"
                    placeholder="Type ${escapeHTML(phrase)}"
                    aria-label="Type ${escapeHTML(phrase)} to confirm"
                >
                <div class="action-audit-confirm-actions">
                    <button type="button" data-confirm-cancel="true">Cancel</button>
                    <button type="button" class="danger" data-confirm-accept="true" disabled>${escapeHTML(acceptText)}</button>
                </div>
            </div>
        </div>
    `;

    mount.firstElementChild.__actionAuditConfirm = { action, payload, phrase };
    window.setTimeout(() => mount.querySelector("[data-confirm-input]")?.focus(), 20);
}

function handleConfirmModalClick(event, target) {
    const modal = target.closest("[data-action-audit-confirm]");
    if (!modal) return false;

    if (isTextEditingControl(target)) {
        event.stopImmediatePropagation();
        return true;
    }

    if (target.closest("[data-confirm-cancel]") || target === modal) {
        capture(event);
        closeConfirm(modal);
        return true;
    }

    const accept = target.closest("[data-confirm-accept]");
    if (accept) {
        capture(event);
        if (accept.disabled) return true;
        const data = modal.__actionAuditConfirm || {};
        closeConfirm(modal);
        runAction(data.action, data.payload || {});
        return true;
    }

    return false;
}

function updateConfirm(modal = null) {
    if (!modal) return;
    const data = modal.__actionAuditConfirm || {};
    const phrase = String(data.phrase || "DELETE").trim().toUpperCase();
    const typed = String(modal.querySelector("[data-confirm-input]")?.value || "").trim().toUpperCase();
    const accept = modal.querySelector("[data-confirm-accept]");
    if (accept) accept.disabled = typed !== phrase;
}

function closeConfirm(modal = null) {
    const target = modal || document.querySelector("[data-action-audit-confirm]");
    if (target?.parentElement) target.parentElement.innerHTML = "";
}

/* --------------------------------------------------
   ACTIVE CONTROL FALLBACKS
-------------------------------------------------- */

function handleRootCommandButton(event, target) {
    const save = target.closest("#saveReport");
    if (save) { capture(event); runAction("save-report", { input: document.getElementById("input") }); return true; }

    const clearInput = target.closest("#clearInput");
    if (clearInput) { capture(event); runAction("clear-input", { input: document.getElementById("input") }); return true; }

    const clearRuns = target.closest("#clearRuns");
    if (clearRuns) { capture(event); runAction("clear-runs"); return true; }

    const mobileClose = target.closest("#mobileInputClose");
    if (mobileClose) {
        capture(event);
        document.body.classList.remove("mobile-report-open", "command-deck-open");
        document.getElementById("mobileReportSheet")?.setAttribute("aria-hidden", "true");
        return true;
    }

    return false;
}

function handleDisplayModeToggle(event, target) {
    const button = target.closest(".tbi-mode-toggle, [data-ui-action='toggle-display-mode'], [data-ui-action='toggle-quiet-display']");
    if (!button || button.disabled) return false;

    capture(event);
    toggleDisplayMode();
    return true;
}

function toggleDisplayMode() {
    let next = null;
    try {
        next = performUIAction("toggle-display-mode", {});
    } catch {
        // DOM fallback below
    }

    if (typeof next !== "boolean") {
        next = !document.documentElement.classList.contains("tbi-quiet-display");
        document.documentElement.classList.toggle("tbi-quiet-display", next);
        document.body?.classList?.toggle("tbi-quiet-display", next);
    }

    lastAction = { action: "toggle-display-mode", at: new Date().toISOString(), quietDisplay: next };
    stampAction(lastAction);
    renderApp();
    document.documentElement.classList.toggle("tbi-quiet-display", next);
    document.body?.classList?.toggle("tbi-quiet-display", next);
    return next;
}

function ensureSystemDetail(sectionKey = "") {
    const key = String(sectionKey || "").trim();
    if (!key) return;

    const detail = document.querySelector(".tbi-system-detail");
    if (!detail) return;

    if (!detail.classList.contains("empty") && !/System detail closed|Select a Subsystem Matrix tile/i.test(detail.textContent || "")) {
        return;
    }

    const state = actionGetState();
    const data = state?.sections?.[key] || state?.runB?.sections?.[key] || state?.runA?.sections?.[key] || null;
    const rows = data && typeof data === "object"
        ? Object.entries(data).slice(0, 30).map(([name, value]) => `<div class="action-audit-system-row"><span>${escapeHTML(name.replace(/_/g, " "))}</span><strong>${escapeHTML(String(value))}</strong></div>`).join("")
        : `<p>No metrics were found for this subsystem yet.</p>`;

    detail.outerHTML = `
        <details class="tbi-card tbi-system-detail action-audit-system-detail" open>
            <summary><span>${escapeHTML(key.replace(/_/g, " "))} Detail</span><em>Collapse / expand</em></summary>
            <div class="action-audit-system-rows">${rows}</div>
        </details>
    `;
}

function isTextEditingControl(target) {
    return Boolean(target?.matches?.("textarea, input:not([type='button']):not([type='submit']):not([type='reset']):not([type='file']), [contenteditable='true']"));
}

function isNativeSelectControl(target) {
    return Boolean(target?.matches?.("select, option") || target?.closest?.("select"));
}

/* --------------------------------------------------
   ACTION HELPERS
-------------------------------------------------- */

function runAction(action, payload = {}, options = {}) {
    const scroll = options.preserveScroll ? { x: window.scrollX || 0, y: window.scrollY || 0 } : null;

    lastAction = {
        action,
        payload: sanitisePayload(payload),
        at: new Date().toISOString()
    };
    stampAction(lastAction);

    const result = performUIAction(action, payload || {});
    renderApp();

    if (scroll) requestAnimationFrame(() => window.scrollTo(scroll.x, scroll.y));
    return result;
}

function payloadFromButton(button) {
    return {
        tab: button.dataset.dashboardTab,
        section: firstDefined(button.dataset.section, button.dataset.compareSection),
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

function buildFilterPatch(kind = "", option = "") {
    const key = String(kind || "").trim();
    if (!key) return null;

    if (key === "showArchived") {
        return { showArchived: String(option) === "true" };
    }

    return { [key]: option };
}

function renderApp() {
    if (typeof renderNow === "function") {
        renderNow();
        return;
    }

    if (window.TowerBattleIntel?.render) {
        window.TowerBattleIntel.render();
    }
}

function getHistoryCount() {
    const state = actionGetState();
    return Array.isArray(state.history) ? state.history.length : 0;
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

function downloadTextFile(text, filename, type = "text/plain;charset=utf-8") {
    try {
        const blob = new Blob([String(text || "")], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.rel = "noopener";
        link.style.position = "fixed";
        link.style.left = "-9999px";
        link.style.top = "0";
        document.body.appendChild(link);
        link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1200);
        document.documentElement.dataset.actionAuditLastDownload = filename;
        document.documentElement.dataset.actionAuditLastDownloadAt = new Date().toISOString();
        return true;
    } catch (error) {
        lastError = String(error?.message || error);
        console.error("[Tower Battle Intel] Download failed", error);
        return false;
    }
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
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand("copy"); } catch { /* ignore */ }
    textarea.remove();
    return true;
}

function showToast(message = "", tone = "good") {
    const mount = ensureMount("actionAuditToastMount");
    mount.innerHTML = `<div class="action-audit-toast ${escapeHTML(tone)}" role="status">${escapeHTML(message)}</div>`;
    setTimeout(() => {
        if (mount.firstElementChild) mount.innerHTML = "";
    }, 4200);
}

function auditControls() {
    const panels = Array.from(document.querySelectorAll("[data-dashboard-panel]")).map(panel => ({
        panel: panel.dataset.dashboardPanel,
        active: panel.classList.contains("active"),
        buttons: panel.querySelectorAll("button, [role='button'], input, select, summary").length,
        uiActions: panel.querySelectorAll("[data-ui-action]").length,
        fileInputs: panel.querySelectorAll("input[type='file']").length
    }));

    return {
        version: VERSION,
        bound: Boolean(window[BRIDGE_FLAG]),
        panels,
        totalButtons: document.querySelectorAll("button, [role='button'], input, select, summary").length,
        uiActions: document.querySelectorAll("[data-ui-action]").length,
        fileInputs: document.querySelectorAll("input[type='file']").length,
        lastAction,
        lastImportResult,
        lastError
    };
}

function status() {
    let nativeStatus = {};

    try {
        nativeStatus = typeof previousNativeStatus === "function" ? previousNativeStatus() : {};
    } catch (error) {
        nativeStatus = {
            nativeStatusError: String(error?.message || error)
        };
    }

    return {
        ...nativeStatus,
        actionAuditBridgeBound: Boolean(window[BRIDGE_FLAG]),
        actionAuditBridgeVersion: VERSION,
        lastAction,
        lastImportResult: lastImportResult || window.__TowerBattleIntelLastImportResult || readImportResultDataset(),
        lastError: lastError || window.__TowerBattleIntelLastImportError || null,
        historyCount: getHistoryCount(),
        controls: auditControls()
    };
}

function readImportResultDataset() {
    try {
        const raw = document.documentElement.dataset.historyImportResult;
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function installConsoleHooks() {
    const previousNative = window.TowerBattleIntelNativeControls || {};

    if (!previousNativeStatus && typeof previousNative.status === "function" && previousNative.status !== status) {
        previousNativeStatus = previousNative.status.bind(previousNative);
    }

    window.TowerBattleIntelActionAudit = Object.freeze({
        status,
        auditControls,
        importLastResult() { return lastImportResult; },
        lastAction() { return lastAction; }
    });

    window.TowerBattleIntelNativeControls = {
        ...previousNative,
        status,
        auditControls
    };
}

function stampAction(action) {
    document.documentElement.dataset.actionAuditLastAction = action.action || "";
    document.documentElement.dataset.actionAuditLastActionAt = action.at || new Date().toISOString();
}

function stampImportResult(result) {
    document.documentElement.dataset.historyImportResult = JSON.stringify(result);
    document.documentElement.dataset.historyImportResultAt = new Date().toISOString();
}

function sanitisePayload(payload) {
    const copy = { ...(payload || {}) };
    if (copy.input) copy.input = "#input";
    return copy;
}

function capture(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
}

function isElement(value) {
    return Boolean(value && value.nodeType === 1 && typeof value.matches === "function");
}

function firstDefined(...values) {
    return values.find(value => value !== undefined && value !== null && String(value) !== "");
}

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// Safe auto-bind when directly imported.
bindActionAuditBridge();

export default {
    bindActionAuditBridge
};
