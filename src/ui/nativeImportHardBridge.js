"use strict";

/**
 * NATIVE IMPORT HARD BRIDGE v4.10q
 *
 * Purpose:
 * - History Import click reaches the file input, but Chrome is not opening the picker.
 * - This bridge captures the trusted user click before normal dashboard handlers can re-render.
 * - It opens the picker with input.showPicker() first, then input.click() only as fallback.
 */

const HARD_IMPORT_FLAG = "__TowerBattleIntelNativeImportHardBridgeBound";
const PICKER_RECENT_MS = 650;

const VERSION = "v4.10q";

const VISIBLE_INPUT_SELECTOR = [
    "#historyImportInput",
    ".history-native-import-input",
    "[data-history-visible-import-input]",
    "[data-history-import-input]",
    "[data-import-history-input]",
    "#historyImportFallbackInput",
    "[data-history-import-fallback-input]"
].join(", ");

const CONTROL_SELECTOR = [
    ".history-native-import-control",
    "[data-native-history-import-control]",
    "[data-native-history-import-label]",
    "[data-history-import-trigger]",
    "[data-import-history-trigger]",
    "[data-import-history-button]",
    "[data-import-history-label]",
    "[data-ui-action='import-history']"
].join(", ");

let lastPickerAttempt = 0;
let syntheticClickInProgress = false;
let lastImportResult = null;
let lastImportError = null;
let activePollTimer = null;
let activeFocusHandler = null;
let activeInput = null;
let lastCommitKey = null;
let lastCommitAt = 0;

export function bindNativeImportHardBridge() {
    if (typeof document === "undefined") return false;
    if (window[HARD_IMPORT_FLAG]) return true;

    window[HARD_IMPORT_FLAG] = true;

    document.addEventListener("click", handleTrustedImportClick, true);
    document.addEventListener("keydown", handleTrustedImportKeydown, true);
    document.addEventListener("change", handleTrustedImportChange, true);
    document.addEventListener("input", handleTrustedImportChange, true);

    installConsoleHooks();

    return true;
}

function handleTrustedImportClick(event) {
    const target = event.target;
    if (!isElement(target)) return;

    const inputTarget = target.matches(VISIBLE_INPUT_SELECTOR) ? target : null;
    const controlTarget = target.closest(CONTROL_SELECTOR);

    if (!inputTarget && !controlTarget) return;

    // If this click was created by our own fallback input.click(), allow it through.
    if (syntheticClickInProgress && inputTarget) {
        return;
    }

    const input = resolveImportInput(controlTarget || target);
    if (!input) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    openPickerFromTrustedEvent(input, "trusted-click");
}

function handleTrustedImportKeydown(event) {
    const target = event.target;
    if (!isElement(target)) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    const controlTarget = target.closest(CONTROL_SELECTOR);
    if (!controlTarget) return;

    const input = resolveImportInput(controlTarget);
    if (!input) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    openPickerFromTrustedEvent(input, "trusted-keydown");
}

async function handleTrustedImportChange(event) {
    const target = event.target;
    if (!isElement(target)) return;
    if (!target.matches(VISIBLE_INPUT_SELECTOR)) return;

    // Record this for PulseGraph/runtime observer checks.
    document.documentElement.dataset.historyImportPickerChangedAt = new Date().toISOString();

    await commitSelectedImportFile(target);
}

function resolveImportInput(origin) {
    if (isElement(origin) && origin.matches(VISIBLE_INPUT_SELECTOR) && origin.type === "file") {
        return origin;
    }

    const root = isElement(origin) ? origin.closest(CONTROL_SELECTOR) : null;

    const scoped = root?.querySelector?.("input[type='file']");
    if (scoped) return scoped;

    const visible = document.querySelector("#historyImportInput.history-native-import-input, #historyImportInput[data-history-visible-import-input], .history-native-import-input[data-history-visible-import-input]");
    if (visible) return visible;

    const fallback = document.getElementById("historyImportFallbackInput") || document.getElementById("historyImportInput");
    if (fallback) return fallback;

    return createFallbackInput();
}

function createFallbackInput() {
    const input = document.createElement("input");
    input.id = "historyImportFallbackInput";
    input.type = "file";
    input.accept = "application/json,.json";
    input.className = "native-file-input";
    input.dataset.historyImportFallbackInput = "true";
    input.setAttribute("aria-label", "Fallback Import Battle History JSON");
    document.body.appendChild(input);
    return input;
}

function openPickerFromTrustedEvent(input, reason = "trusted") {
    const now = Date.now();
    if (now - lastPickerAttempt < PICKER_RECENT_MS) {
        return input;
    }

    lastPickerAttempt = now;
    document.documentElement.dataset.historyImportPickerAttempt = reason;
    document.documentElement.dataset.historyImportPickerAttemptAt = new Date().toISOString();

    bindInputDirectly(input);

    try {
        input.value = "";
    } catch (error) {
        // Some browsers may block resetting; harmless.
    }

    scheduleSelectedFileWatch(input, reason);

    try {
        if (typeof input.showPicker === "function") {
            input.showPicker();
            document.documentElement.dataset.historyImportPickerMethod = "showPicker";
            return input;
        }
    } catch (error) {
        document.documentElement.dataset.historyImportPickerShowPickerError = String(error?.message || error);
    }

    try {
        syntheticClickInProgress = true;
        input.click();
        document.documentElement.dataset.historyImportPickerMethod = "click";
    } catch (error) {
        document.documentElement.dataset.historyImportPickerClickError = String(error?.message || error);
        console.error("[Tower Battle Intel] Native import picker failed", error);
    } finally {
        window.setTimeout(() => {
            syntheticClickInProgress = false;
        }, 0);
    }

    return input;
}


function bindInputDirectly(input) {
    if (!input || input.dataset.hardBridgeDirectBound === "true") {
        return input;
    }

    input.dataset.hardBridgeDirectBound = "true";
    input.addEventListener("change", handleDirectInputFileEvent, true);
    input.addEventListener("input", handleDirectInputFileEvent, true);
    input.onchange = handleDirectInputFileEvent;

    return input;
}

function handleDirectInputFileEvent(event) {
    const input = event?.target;
    if (!input || input.type !== "file") return;

    document.documentElement.dataset.historyImportDirectEventAt = new Date().toISOString();
    commitSelectedImportFile(input);
}

function scheduleSelectedFileWatch(input, reason = "watch") {
    if (!input || input.type !== "file") return;

    activeInput = input;
    document.documentElement.dataset.historyImportWatchStartedAt = new Date().toISOString();
    document.documentElement.dataset.historyImportWatchReason = reason;

    clearSelectedFileWatch();

    const started = Date.now();
    activePollTimer = window.setInterval(() => {
        document.documentElement.dataset.historyImportLastPollAt = new Date().toISOString();

        if (input.files && input.files.length) {
            document.documentElement.dataset.historyImportFileObservedAt = new Date().toISOString();
            clearSelectedFileWatch();
            commitSelectedImportFile(input);
            return;
        }

        if (Date.now() - started > 30000) {
            clearSelectedFileWatch();
        }
    }, 150);

    activeFocusHandler = () => {
        window.setTimeout(() => {
            document.documentElement.dataset.historyImportFocusReturnedAt = new Date().toISOString();

            if (input.files && input.files.length) {
                document.documentElement.dataset.historyImportFileObservedAt = new Date().toISOString();
                clearSelectedFileWatch();
                commitSelectedImportFile(input);
            }
        }, 120);
    };

    window.addEventListener("focus", activeFocusHandler, true);
}

function clearSelectedFileWatch() {
    if (activePollTimer) {
        window.clearInterval(activePollTimer);
        activePollTimer = null;
    }

    if (activeFocusHandler) {
        window.removeEventListener("focus", activeFocusHandler, true);
        activeFocusHandler = null;
    }
}

function getFileCommitKey(file) {
    if (!file) return "";
    return [file.name, file.size, file.lastModified].join("|");
}

async function commitSelectedImportFile(input) {
    const file = input?.files?.[0];
    if (!file) return null;

    const key = getFileCommitKey(file);
    const now = Date.now();
    if (key && key === lastCommitKey && now - lastCommitAt < 2500) {
        return lastImportResult;
    }
    lastCommitKey = key;
    lastCommitAt = now;

    document.documentElement.dataset.historyImportPickerChangedAt = new Date().toISOString();
    document.documentElement.dataset.historyImportCommitStartedAt = new Date().toISOString();

    const before = getHistoryCount();
    const result = {
        bridge: "nativeImportHardBridge",
        version: VERSION,
        fileName: file.name,
        before,
        incoming: 0,
        after: before,
        added: 0,
        duplicateOrIgnored: 0,
        ok: false,
        error: null,
        at: new Date().toISOString()
    };

    try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const incoming = extractImportedRuns(parsed);
        result.incoming = incoming.length;

        if (!incoming.length) {
            throw new Error("No history array was found in the selected JSON file.");
        }

        const actions = window.TowerBattleIntelActions || null;

        if (actions && typeof actions.importHistoryText === "function") {
            actions.importHistoryText(text);
        } else if (actions && typeof actions.perform === "function") {
            actions.perform("import-history-text", { text });
        } else {
            mergeHistoryIntoStorage(incoming);
        }

        let after = getHistoryCount();

        // Safety fallback: if the app action did not change state, merge directly into the runtime state.
        if (after <= before && incoming.length) {
            mergeHistoryIntoRuntimeState(incoming);
            after = getHistoryCount();
        }

        result.after = after;
        result.added = Math.max(0, after - before);
        result.duplicateOrIgnored = Math.max(0, incoming.length - result.added);
        result.ok = result.added > 0 || incoming.length > 0;

        lastImportResult = result;
        lastImportError = null;
        window.__TowerBattleIntelLastImportResult = result;
        writeImportDataset(result);
        showImportToast(result.added > 0
            ? `Imported ${result.added} history run${result.added === 1 ? "" : "s"}.`
            : `Import read ${incoming.length} run${incoming.length === 1 ? "" : "s"}, but none were added.`);
        renderApp();

        return result;
    } catch (error) {
        result.error = String(error?.message || error);
        result.ok = false;
        lastImportResult = result;
        lastImportError = result.error;
        window.__TowerBattleIntelLastImportResult = result;
        window.__TowerBattleIntelLastImportError = result.error;
        writeImportDataset(result);
        showImportToast(`Import failed: ${result.error}`, "bad");
        console.error("[Tower Battle Intel] Native import commit failed", error);
        return result;
    } finally {
        try { input.value = ""; } catch { /* ignore */ }
    }
}

function extractImportedRuns(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (Array.isArray(value?.history)) return value.history.filter(Boolean);
    if (Array.isArray(value?.runs)) return value.runs.filter(Boolean);
    return [];
}

function getHistoryCount() {
    const history = getRuntimeHistory();
    return Array.isArray(history) ? history.length : 0;
}

function getRuntimeHistory() {
    try {
        const state = window.TowerBattleIntelActions?.getState?.() || window.TowerBattleIntel?.state?.() || null;
        if (Array.isArray(state?.history)) return state.history;
    } catch { /* ignore */ }

    try {
        const stored = JSON.parse(localStorage.getItem("battle_analyser_state") || "{}");
        if (Array.isArray(stored?.history)) return stored.history;
    } catch { /* ignore */ }

    return [];
}

function mergeHistoryIntoRuntimeState(incoming = []) {
    const actions = window.TowerBattleIntelActions || null;
    const state = actions?.getState?.() || window.TowerBattleIntel?.state?.() || null;

    if (state && typeof state === "object") {
        const current = Array.isArray(state.history) ? state.history : [];
        state.history = mergeHistory(current, incoming);
        mergeHistoryIntoStorage(state.history, state);
        return state.history;
    }

    return mergeHistoryIntoStorage(incoming);
}

function mergeHistoryIntoStorage(incoming = [], knownState = null) {
    const state = knownState || readStoredState();
    const current = Array.isArray(state.history) ? state.history : [];
    state.history = mergeHistory(current, incoming);
    try {
        localStorage.setItem("battle_analyser_state", JSON.stringify(state));
    } catch (error) {
        console.warn("[Tower Battle Intel] Failed to save imported history fallback", error);
    }
    return state.history;
}

function mergeHistory(current = [], incoming = []) {
    const output = Array.isArray(current) ? [...current] : [];
    for (const run of incoming) {
        if (!run) continue;
        const id = run?.meta?.reportId || run?.reportId || null;
        const duplicate = output.some(item => {
            const otherId = item?.meta?.reportId || item?.reportId || null;
            if (id && otherId) return id === otherId;
            return item?.core?.battleDate === run?.core?.battleDate
                && Number(item?.core?.tier) === Number(run?.core?.tier)
                && Number(item?.core?.wave) === Number(run?.core?.wave);
        });
        if (!duplicate) output.push(run);
    }
    return output;
}

function readStoredState() {
    try { return JSON.parse(localStorage.getItem("battle_analyser_state") || "{}"); }
    catch { return {}; }
}

function writeImportDataset(result) {
    try {
        document.documentElement.dataset.historyImportResult = JSON.stringify(result);
        document.documentElement.dataset.historyImportResultAt = result.at || new Date().toISOString();
    } catch { /* ignore */ }
}

function showImportToast(message, tone = "good") {
    let toast = document.getElementById("historyImportToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "historyImportToast";
        toast.style.position = "fixed";
        toast.style.right = "18px";
        toast.style.bottom = "18px";
        toast.style.zIndex = "1000004";
        toast.style.maxWidth = "360px";
        toast.style.padding = "12px 14px";
        toast.style.borderRadius = "12px";
        toast.style.border = "1px solid rgba(29,231,255,.35)";
        toast.style.background = "rgba(4,12,24,.96)";
        toast.style.color = "#eef8ff";
        toast.style.font = "12px/1.35 system-ui, sans-serif";
        toast.style.boxShadow = "0 18px 50px rgba(0,0,0,.45)";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.dataset.tone = tone;
    window.clearTimeout(showImportToast.timer);
    showImportToast.timer = window.setTimeout(() => { toast.remove(); }, 4200);
}

function renderApp() {
    try {
        if (window.TowerBattleIntel?.render) {
            window.TowerBattleIntel.render();
        }
    } catch (error) {
        console.warn("[Tower Battle Intel] Render after import failed", error);
    }
}

function installConsoleHooks() {
    const previous = window.TowerBattleIntelNativeControls || {};

    window.TowerBattleIntelNativeControls = {
        ...previous,

        status() {
            const prior = typeof previous.status === "function" ? previous.status() : {};
            return {
                ...prior,
                hardBridgeBound: Boolean(window[HARD_IMPORT_FLAG]),
                hardBridgeVersion: VERSION,
                visibleImportInputExists: Boolean(document.querySelector("#historyImportInput.history-native-import-input, #historyImportInput[data-history-visible-import-input], .history-native-import-input[data-history-visible-import-input]")),
                fallbackImportInputExists: Boolean(document.getElementById("historyImportFallbackInput")),
                importPickerAttempt: document.documentElement.dataset.historyImportPickerAttempt || null,
                importPickerMethod: document.documentElement.dataset.historyImportPickerMethod || null,
                selectedFileChangedAt: document.documentElement.dataset.historyImportPickerChangedAt || null,
                directInputEventAt: document.documentElement.dataset.historyImportDirectEventAt || null,
                watchStartedAt: document.documentElement.dataset.historyImportWatchStartedAt || null,
                watchReason: document.documentElement.dataset.historyImportWatchReason || null,
                focusReturnedAt: document.documentElement.dataset.historyImportFocusReturnedAt || null,
                fileObservedAt: document.documentElement.dataset.historyImportFileObservedAt || null,
                lastPollAt: document.documentElement.dataset.historyImportLastPollAt || null,
                pollActive: Boolean(activePollTimer),
                activeInputId: activeInput?.id || null,
                lastImportResult: lastImportResult || window.__TowerBattleIntelLastImportResult || readImportResultDataset(),
                lastImportError,
                showPickerSupported: Boolean(document.querySelector(VISIBLE_INPUT_SELECTOR)?.showPicker)
            };
        },

        openImportPickerHard() {
            const input = resolveImportInput(document.activeElement || document.body);
            return openPickerFromTrustedEvent(input, "console-hard");
        }
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

function isElement(value) {
    return Boolean(value && value.nodeType === 1 && typeof value.matches === "function");
}

// Safe auto-bind when this module is imported directly.
bindNativeImportHardBridge();

export default {
    bindNativeImportHardBridge
};
