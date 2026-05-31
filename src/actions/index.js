"use strict";

/**
 * ACTION MODULE FOUNDATION v4.11z52w13
 * Public action API. UI remains shell-parked, but action ownership now has
 * single-purpose modules instead of one large action file.
 */

import { normaliseActionKey, installGlobalActionBridge, ACTION_FOUNDATION_VERSION } from "./actionUtils.js";
import {
    actionReset,
    actionClearRuns,
    actionSetDashboardTab,
    actionOpenCompare,
    actionSelectSection,
    actionSetBuildStyle,
    actionGetState,
    getAppActionStatus
} from "./appActions.js";
import {
    actionParseInput,
    actionValidateReportFromInput,
    actionSaveReportFromInput,
    actionSaveAndLoadDashboard,
    actionClearInput,
    actionCacheCommandInputDraft,
    actionRememberCommandFeedback,
    resolveReportInput,
    getInputText,
    getCommandDeckActionStatus
} from "./commandDeckActions.js";
import {
    actionLoadHistoryRun,
    actionSwapHistorySlots,
    actionClearHistorySelection,
    actionArchiveHistoryRun,
    actionRestoreHistoryRun,
    actionDeleteHistoryRun,
    actionDeleteLastRun,
    actionClearHistory,
    actionSetHistoryFilters,
    actionResetHistoryFilters,
    actionUpdateHistoryRunMeta,
    getHistoryActionStatus
} from "./historyActions.js";
import {
    actionExportHistoryJSON,
    actionImportHistoryText,
    getImportExportActionStatus
} from "./importExportActions.js";

export { ACTION_FOUNDATION_VERSION } from "./actionUtils.js";
export {
    actionReset,
    actionClearRuns,
    actionSetDashboardTab,
    actionOpenCompare,
    actionSelectSection,
    actionSetBuildStyle,
    actionGetState
} from "./appActions.js";
export {
    actionParseInput,
    actionValidateReportFromInput,
    actionSaveReportFromInput,
    actionSaveAndLoadDashboard,
    actionClearInput,
    actionCacheCommandInputDraft,
    actionRememberCommandFeedback,
    resolveReportInput,
    getInputText
} from "./commandDeckActions.js";
export {
    actionLoadHistoryRun,
    actionSwapHistorySlots,
    actionClearHistorySelection,
    actionArchiveHistoryRun,
    actionRestoreHistoryRun,
    actionDeleteHistoryRun,
    actionDeleteLastRun,
    actionClearHistory,
    actionSetHistoryFilters,
    actionResetHistoryFilters,
    actionUpdateHistoryRunMeta
} from "./historyActions.js";
export {
    actionExportHistoryJSON,
    actionImportHistoryText
} from "./importExportActions.js";

export function performUIAction(action = "", payload = {}) {
    const key = normaliseActionKey(action);

    switch (key) {
        case "save-report":
        case "save-report-to-history":
            return actionSaveReportFromInput(resolveReportInput(payload.input));

        case "validate-report":
            return actionValidateReportFromInput(resolveReportInput(payload.input));

        case "save-load-dashboard":
            return actionSaveAndLoadDashboard(resolveReportInput(payload.input));

        case "save-run-a":
            return actionParseInput(getInputText(payload.input), "runA");

        case "save-run-b":
            return actionParseInput(getInputText(payload.input), "runB");

        case "clear-input":
            return actionClearInput(resolveReportInput(payload.input));

        case "clear-runs":
            return actionClearRuns();

        case "reset":
        case "reset-all":
            return actionReset();

        case "set-dashboard-tab":
            return actionSetDashboardTab(payload.tab || payload.dashboardTab || "overview");

        case "open-command":
            return actionSetDashboardTab("command");

        case "open-history":
            return actionSetDashboardTab("history");

        case "open-settings":
            return actionSetDashboardTab("settings");

        case "open-anomalies":
            return actionSetDashboardTab("anomalies");

        case "open-compare":
        case "open-compare-section":
            return actionOpenCompare(payload.section || payload.compareSection || null);

        case "select-section":
        case "toggle-section":
            return actionSelectSection(payload.section || null);

        case "set-build-style":
            return actionSetBuildStyle(payload.buildStyle || payload.value || "unknown");

        case "history-load-run":
            return actionLoadHistoryRun(payload.index, payload.slot || "runA");

        case "history-swap-slots":
            return actionSwapHistorySlots();

        case "history-clear-selection":
            return actionClearHistorySelection();

        case "history-archive-run":
        case "archive-history-run":
            return actionArchiveHistoryRun(payload.index);

        case "history-restore-run":
        case "restore-history-run":
            return actionRestoreHistoryRun(payload.index);

        case "history-delete-run":
        case "delete-history-run":
            return actionDeleteHistoryRun(payload.index);

        case "history-delete-last":
        case "delete-last-history":
            return actionDeleteLastRun();

        case "history-delete-all":
        case "history-clear-all":
        case "delete-all-history":
        case "clear-all-history":
            return actionClearHistory();

        case "history-set-filters":
            return actionSetHistoryFilters(payload.filters || payload);

        case "history-reset-filters":
            return actionResetHistoryFilters();

        case "history-update-meta":
            return actionUpdateHistoryRunMeta(payload.index, payload.meta || {});

        case "history-import-text":
        case "history-import-json":
        case "import-history-text":
        case "import-history-json":
            return actionImportHistoryText(payload.text || payload.json || "");

        case "history-export-json":
        case "history-export":
        case "export-history":
        case "export-history-json":
            return actionExportHistoryJSON();

        case "open-dashboard":
            return actionSetDashboardTab("overview");

        case "open-systems":
            return actionSetDashboardTab("systems");

        case "open-coach":
            return actionSetDashboardTab("coach");

        case "open-more":
            return actionSetDashboardTab("more");

        default:
            console.warn("[Tower Battle Intel] Unknown UI action:", action, payload);
            return null;
    }
}

export function getActionFoundationStatus() {
    return {
        version: ACTION_FOUNDATION_VERSION,
        owner: "src/actions/index.js",
        realUIWiringActive: true,
        modules: [
            getAppActionStatus(),
            getCommandDeckActionStatus(),
            getHistoryActionStatus(),
            getImportExportActionStatus()
        ]
    };
}

const ACTION_API = Object.freeze({
    version: ACTION_FOUNDATION_VERSION,
    performUIAction,
    getActionFoundationStatus,
    actionParseInput,
    actionValidateReportFromInput,
    actionSaveReportFromInput,
    actionSaveAndLoadDashboard,
    actionClearInput,
    actionCacheCommandInputDraft,
    actionRememberCommandFeedback,
    actionReset,
    actionClearRuns,
    actionSetDashboardTab,
    actionOpenCompare,
    actionSelectSection,
    actionSetBuildStyle,
    actionLoadHistoryRun,
    actionSwapHistorySlots,
    actionClearHistorySelection,
    actionArchiveHistoryRun,
    actionRestoreHistoryRun,
    actionDeleteHistoryRun,
    actionDeleteLastRun,
    actionClearHistory,
    actionSetHistoryFilters,
    actionResetHistoryFilters,
    actionUpdateHistoryRunMeta,
    actionExportHistoryJSON,
    actionImportHistoryText,
    actionGetState,

    // Browser fallback aliases used by older console/debug snippets.
    perform(action, payload) {
        return performUIAction(action, payload);
    },

    exportHistoryJSON() {
        return actionExportHistoryJSON();
    },

    importHistoryText(text) {
        return actionImportHistoryText(text);
    },

    getState() {
        return actionGetState();
    }
});

installGlobalActionBridge(ACTION_API);

export default ACTION_API;
