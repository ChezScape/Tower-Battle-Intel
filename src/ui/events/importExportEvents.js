"use strict";

/**
 * IMPORT / EXPORT EVENTS v4.11z52w47
 *
 * Shared active browser helper for History JSON import/export controls.
 * Workspace-specific handlers still decide which visible button was clicked;
 * this module owns the file picker, download creation, feedback wording, and
 * rawArchive-aware import/export action calls so Command Deck and History do
 * not duplicate browser IO code.
 */

import {
    performUIAction,
    actionGetState,
    actionRememberCommandFeedback
} from "../../actions/index.js";
import { UI_EVENT_FOUNDATION_VERSION } from "./shellEventUtils.js";

let importRuns = 0;
let exportRuns = 0;
let lastAction = "";
let lastSource = "";

export function startHistoryJSONImport({ doc = document, context = {}, source = "history", getInputDraft = null } = {}) {
    importRuns += 1;
    lastAction = "import-history-json";
    lastSource = source;

    pickHistoryFileText(doc)
        .then(text => {
            if (typeof text !== "string") return;

            const beforeCount = Array.isArray(actionGetState().history) ? actionGetState().history.length : 0;
            const imported = performUIAction("import-history-json", { text });
            const afterState = actionGetState();
            const afterCount = Array.isArray(afterState.history) ? afterState.history.length : 0;
            const addedCount = Math.max(0, afterCount - beforeCount);
            const rawCount = Array.isArray(afterState.rawArchive?.reports) ? afterState.rawArchive.reports.length : 0;
            const inputDraft = resolveInputDraft(getInputDraft, afterState);

            actionRememberCommandFeedback({
                action: source === "command" ? "import-history" : "history-import",
                status: addedCount > 0 ? "saved" : "duplicate",
                loaded: addedCount > 0,
                title: source === "command" ? "Import History" : "History Import",
                message: buildImportMessage({ addedCount, imported, rawCount }),
                keepInput: true,
                inputDraft
            });

            render(context);
        })
        .catch(error => {
            console.error("[Tower Battle Intel] History import failed:", error);
            const state = actionGetState();
            actionRememberCommandFeedback({
                action: source === "command" ? "import-history" : "history-import",
                status: "failed",
                loaded: false,
                title: source === "command" ? "Import History" : "History Import",
                message: "Import failed. I could not read that History JSON file.",
                keepInput: true,
                inputDraft: resolveInputDraft(getInputDraft, state)
            });
            render(context);
        });
}

export function runHistoryJSONExport({ doc = document, context = {}, source = "history", getInputDraft = null } = {}) {
    exportRuns += 1;
    lastAction = "export-history-json";
    lastSource = source;

    try {
        const json = performUIAction("export-history-json") || "";
        const state = actionGetState();
        const historyCount = Array.isArray(state.history) ? state.history.length : 0;
        const rawCount = Array.isArray(state.rawArchive?.reports) ? state.rawArchive.reports.length : 0;

        triggerTextDownload(doc, json, buildHistoryExportFilename(), "application/json");

        actionRememberCommandFeedback({
            action: source === "command" ? "export-history" : "history-export",
            status: historyCount || rawCount ? "saved" : "checked",
            loaded: false,
            title: source === "command" ? "Export History" : "History Export",
            message: buildExportMessage({ historyCount, rawCount }),
            keepInput: true,
            inputDraft: resolveInputDraft(getInputDraft, state)
        });

        render(context);
    } catch (error) {
        console.error("[Tower Battle Intel] History export failed:", error);
        const state = actionGetState();
        actionRememberCommandFeedback({
            action: source === "command" ? "export-history" : "history-export",
            status: "failed",
            loaded: false,
            title: source === "command" ? "Export History" : "History Export",
            message: "Export failed. I could not create the History JSON download.",
            keepInput: true,
            inputDraft: resolveInputDraft(getInputDraft, state)
        });
        render(context);
    }
}

export function triggerTextDownload(doc = document, text = "", fileName = "tower-battle-intel-history.json", mime = "text/plain") {
    const blob = new Blob([String(text || "")], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = doc.createElement("a");
    link.href = url;
    link.download = fileName;
    link.hidden = true;
    doc.body?.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function getImportExportEventStatus() {
    return {
        module: "importExportEvents",
        version: "v4.11z52w47",
        foundationVersion: UI_EVENT_FOUNDATION_VERSION,
        active: true,
        phase: "shared-import-export-rewire",
        owns: [
            "History JSON file picker",
            "History JSON browser download",
            "rawArchive-aware import/export action calls",
            "shared Command Deck + History import/export feedback"
        ],
        delegatedFrom: ["workspaceEvents"],
        importRuns,
        exportRuns,
        lastAction,
        lastSource
    };
}

function buildImportMessage({ addedCount = 0, imported = null, rawCount = 0 } = {}) {
    if (addedCount > 0) {
        return `Imported ${addedCount} saved ${addedCount === 1 ? "run" : "runs"} into History. Raw archive now holds ${rawCount} source ${rawCount === 1 ? "record" : "records"}.`;
    }

    if (Array.isArray(imported) && imported.length) {
        return "Import finished, but every parsed run was already in History. Raw archive records were still checked safely.";
    }

    return "Import finished, but no new History runs were added.";
}

function buildExportMessage({ historyCount = 0, rawCount = 0 } = {}) {
    if (historyCount || rawCount) {
        return `Downloaded History JSON with ${historyCount} parsed ${historyCount === 1 ? "run" : "runs"} and ${rawCount} raw source ${rawCount === 1 ? "record" : "records"}.`;
    }

    return "Downloaded empty History JSON shell.";
}

function pickHistoryFileText(doc = document) {
    return new Promise((resolve, reject) => {
        const input = doc.createElement("input");
        input.type = "file";
        input.accept = "application/json,.json";
        input.hidden = true;

        input.addEventListener("change", async () => {
            try {
                const file = input.files && input.files[0];
                input.remove();
                resolve(file ? await file.text() : null);
            } catch (error) {
                input.remove();
                reject(error);
            }
        }, { once: true });

        doc.body?.appendChild(input);
        input.click();
    });
}

function buildHistoryExportFilename() {
    const now = new Date();
    const pad = value => String(value).padStart(2, "0");
    return `tower-battle-intel-history-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;
}

function resolveInputDraft(getInputDraft = null, state = actionGetState()) {
    if (typeof getInputDraft === "function") {
        try {
            return String(getInputDraft() || "");
        } catch {
            return String(state.lastInput || "");
        }
    }

    return String(state.lastInput || "");
}

function render(context = {}) {
    if (typeof context.renderApp === "function") context.renderApp();
}

export default {
    startHistoryJSONImport,
    runHistoryJSONExport,
    triggerTextDownload,
    getImportExportEventStatus
};
