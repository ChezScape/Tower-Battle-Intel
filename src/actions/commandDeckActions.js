"use strict";

/**
 * COMMAND DECK ACTION FOUNDATION v4.11z52w16
 * Public Command Deck action home. Report intake/save is now routed through
 * Command Deck raw-archive planning before parser/History cache rebuild.
 */

import { update } from "../core/update.js";
import { getState, setState } from "../core/state.js";
import { persistState, normaliseSlot, ACTION_FOUNDATION_VERSION } from "./actionUtils.js";
import {
    cacheCommandInputDraft,
    actionValidateReportFromInput,
    actionSaveReportFromInput,
    actionSaveAndLoadDashboard,
    actionClearInput,
    resolveReportInput,
    getInputText
} from "./commandDeckReportActions.js";
import { getCommandDeckRawIntakeStatus } from "./commandDeckRawIntake.js";

export {
    cacheCommandInputDraft,
    actionValidateReportFromInput,
    actionSaveReportFromInput,
    actionSaveAndLoadDashboard,
    actionClearInput,
    resolveReportInput,
    getInputText
};

export function actionCacheCommandInputDraft(inputOrText = null) {
    const text = cacheCommandInputDraft(inputOrText);
    persistState({ lastInput: text });
    return text;
}

export function actionRememberCommandFeedback(feedback = {}) {
    const safeFeedback = {
        action: feedback.action || "command-deck",
        status: feedback.status || "info",
        loaded: Boolean(feedback.loaded),
        title: feedback.title || "Command Deck",
        message: feedback.message || "Command Deck action finished.",
        reportId: feedback.reportId || null,
        addedIds: Array.isArray(feedback.addedIds) ? feedback.addedIds : [],
        duplicateIds: Array.isArray(feedback.duplicateIds) ? feedback.duplicateIds : [],
        candidateIds: Array.isArray(feedback.candidateIds) ? feedback.candidateIds : [],
        parserFeedback: feedback.parserFeedback || null,
        inputDraft: typeof feedback.inputDraft === "string" ? feedback.inputDraft : String(getState().lastInput || ""),
        keepInput: Boolean(feedback.keepInput),
        createdAt: feedback.createdAt || new Date().toISOString()
    };

    const patch = {
        ui: {
            lastCommandFeedback: safeFeedback
        }
    };

    if (safeFeedback.keepInput) {
        patch.lastInput = safeFeedback.inputDraft;
    }

    setState(patch);
    persistState();

    if (typeof window !== "undefined") {
        window.TowerBattleIntelLastSaveReport = safeFeedback;
    }

    return safeFeedback;
}

export function actionParseInput(rawText, slot = "history") {
    const text = String(rawText || "").trim();
    if (!text) return null;

    const result = update(text, normaliseSlot(slot));
    if (!result) return null;

    persistState();
    return result;
}

export function getCommandDeckActionStatus() {
    return {
        version: "v4.11z52w16",
        owner: "src/actions/commandDeckActions.js",
        activeInShell: true,
        rawIntake: getCommandDeckRawIntakeStatus(),
        owns: [
            "Command Deck action exports",
            "raw report intake bridge",
            "report parse action bridge",
            "Command Deck draft persistence",
            "Command Deck feedback state"
        ]
    };
}

export default {
    actionParseInput,
    getCommandDeckActionStatus
};
