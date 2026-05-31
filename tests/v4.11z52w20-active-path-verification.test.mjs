import assert from "node:assert/strict";
import fs from "node:fs";

import { resetState, getState } from "../src/core/state.js";
import { buildDesktopWorkspace } from "../src/ui/views/desktopView.js";
import { buildMobileWorkspace } from "../src/ui/views/mobileView.js";
import { actionSaveReportFromInput } from "../src/actions/commandDeckActions.js";
import { actionLoadHistoryRun } from "../src/actions/historyActions.js";
import { actionExportHistoryJSON, getImportExportActionStatus } from "../src/actions/importExportActions.js";
import { getWorkspaceEventStatus } from "../src/ui/events/workspaceEvents.js";
import { getImportExportEventStatus } from "../src/ui/events/importExportEvents.js";
import { getActionFoundationStatus, ACTION_FOUNDATION_VERSION } from "../src/actions/index.js";
import { clearStorage } from "../src/storage/localStore.js";

class LocalStorageMock {
    constructor() { this.store = new Map(); }
    get length() { return this.store.size; }
    key(index) { return Array.from(this.store.keys())[index] || null; }
    getItem(key) { return this.store.has(key) ? this.store.get(key) : null; }
    setItem(key, value) { this.store.set(key, String(value)); }
    removeItem(key) { this.store.delete(key); }
    clear() { this.store.clear(); }
}

global.localStorage = new LocalStorageMock();

const config = fs.readFileSync(new URL("../config/appConfig.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const desktopView = fs.readFileSync(new URL("../src/ui/views/desktopView.js", import.meta.url), "utf8");
const eventIndex = fs.readFileSync(new URL("../src/ui/events/index.js", import.meta.url), "utf8");
const workspaceEvents = fs.readFileSync(new URL("../src/ui/events/workspaceEvents.js", import.meta.url), "utf8");
const importExportEvents = fs.readFileSync(new URL("../src/ui/events/importExportEvents.js", import.meta.url), "utf8");
const appInit = fs.readFileSync(new URL("../src/app/init.js", import.meta.url), "utf8");
const dashboardVisualShell = fs.readFileSync(new URL("../src/ui/views/dashboardVisualShell.js", import.meta.url), "utf8");

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.ok(index.includes('data-app-shell="v4.11z52w29"'));
assert.equal(ACTION_FOUNDATION_VERSION, "v4.11z52w29");

const emptyState = {
    history: [],
    rawArchive: { reports: [] },
    ui: { dashboardTab: "history", historyFilters: { mode: "normal" } }
};

const commandHTML = buildDesktopWorkspace("command", emptyState);
assert.ok(commandHTML.includes("tbi-command-clean-view"), "Command Deck must mount the real clean view");
assert.ok(commandHTML.includes('data-ui-action="save-report"'), "Command Deck must expose Save Report through data-ui-action");
assert.ok(commandHTML.includes('data-ui-action="validate-report"'), "Command Deck must expose Validate through data-ui-action");
assert.ok(!commandHTML.includes('data-workspace-reset="command"'), "Desktop Command Deck must not be the parked shell");

const historyHTML = buildDesktopWorkspace("history", emptyState);
assert.ok(historyHTML.includes('data-history-view-rebuild="v4.11z52w29"'), "Desktop History must mount the rebuilt History view");
assert.ok(historyHTML.includes("Report Management Hub"));
assert.ok(historyHTML.includes('data-ui-action="import-history"'));
assert.ok(historyHTML.includes('data-export-history="true"'));
assert.ok(!historyHTML.includes("History wiring disconnected"));
assert.ok(!historyHTML.includes("Saved-run shell parked"));

const dashboardHTML = buildDesktopWorkspace("overview", emptyState);
assert.ok(dashboardHTML.includes('data-dashboard-visual-shell="v4.11z52w7"'), "Dashboard must stay on the protected visual shell");
assert.ok(dashboardHTML.includes("Dashboard visual shell is parked for clean rewiring"));
assert.ok(!dashboardHTML.includes('data-workspace-reset="overview"'), "Desktop Dashboard must not route through generic parked shell");

for (const tab of ["compare", "coach", "systems", "anomalies", "settings"]) {
    const html = buildDesktopWorkspace(tab, emptyState);
    assert.ok(html.includes(`data-workspace-reset="${tab}"`), `${tab} should remain deliberately parked until rebuilt`);
}

const mobileHistory = buildMobileWorkspace("history", emptyState);
assert.ok(mobileHistory.includes('data-ui-shell-reset="v4.11z52w12"'), "Mobile shell should remain untouched in this desktop phase");
assert.ok(mobileHistory.includes("Saved-run shell parked until desktop History is clean."));

assert.ok(desktopView.includes('import { buildCommandDeckView } from "../sections/commandDeckView.js";'));
assert.ok(desktopView.includes('import { buildHistoryView } from "../sections/historyView.js";'));
assert.ok(desktopView.includes("return buildCommandDeckView(state);"));
assert.ok(desktopView.includes("return buildHistoryView(state);"));
assert.ok(desktopView.includes("buildWorkspaceShell"), "Parked workspaces should still use the safe reset shell");
assert.ok(dashboardVisualShell.includes("data-dashboard-visual-shell=\"v4.11z52w7\""), "Dashboard shell marker should remain protected");

assert.ok(appInit.includes("bindUIEvents(() => renderApp"), "Startup must bind the modular UI event owner after render");
assert.ok(eventIndex.includes("handleWorkspaceClick"));
assert.ok(eventIndex.includes("oldParkedCatchAllActive: false"));
assert.equal(eventIndex.includes("handleParkedActionClick"), false, "old parked catch-all must be removed from active event root");
assert.ok(eventIndex.includes("getWorkspaceEventStatus()"), "UI shell status must include rebuilt workspace owner");
assert.ok(eventIndex.includes("getImportExportEventStatus()"), "UI shell status must include active import/export helper");

assert.ok(workspaceEvents.includes('from "./importExportEvents.js"'), "Workspace events should delegate import/export browser IO");
assert.ok(workspaceEvents.includes("handleCommandClick"), "Workspace events own Command Deck clicks");
assert.ok(workspaceEvents.includes("handleHistoryClick"), "Workspace events own History clicks");
assert.equal(fs.existsSync(new URL("../src/ui/events/commandDeckEvents.js", import.meta.url)), false, "old Command Deck handler file should be removed");
assert.equal(fs.existsSync(new URL("../src/ui/events/historyEvents.js", import.meta.url)), false, "old History handler file should be removed");
assert.equal(fs.existsSync(new URL("../src/ui/events/parkedActionEvents.js", import.meta.url)), false, "old parked handler file should be removed");
assert.ok(importExportEvents.includes("function pickHistoryFileText"), "Shared importExportEvents must be the only History JSON file-picker helper");
assert.ok(importExportEvents.includes("function buildHistoryExportFilename"), "Shared importExportEvents must own export filename creation");

assert.equal(getWorkspaceEventStatus().active, true);
assert.equal(getWorkspaceEventStatus().oldParkedCatchAllActive, false);
assert.equal(getImportExportEventStatus().active, true);
assert.equal(getImportExportEventStatus().phase, "shared-import-export-rewire");
assert.equal(getImportExportActionStatus().activeInShell, true);
assert.equal(getActionFoundationStatus().realUIWiringActive, true);

resetState();
clearStorage();

const rawA = fs.readFileSync(new URL("./fixtures/Battle_Report_T11.txt", import.meta.url), "utf8");
const saveFeedback = actionSaveReportFromInput({ value: rawA });
assert.equal(saveFeedback.status, "saved");
assert.equal(getState().history.length, 1, "Command Deck save should create parsed History cache");
assert.equal(getState().rawArchive.reportCount, 1, "Command Deck save should create raw archive source record first");
assert.ok(getState().history[0].meta.reportId, "Saved History cache should carry stable reportId");
assert.equal(getState().history[0].meta.reportId, getState().rawArchive.reports[0].reportId, "Parsed History ID should match raw archive ID");

const duplicateFeedback = actionSaveReportFromInput({ value: rawA });
assert.equal(duplicateFeedback.status, "duplicate", "Duplicate report should be blocked before another parsed History entry is written");
assert.equal(getState().history.length, 1);
assert.equal(getState().rawArchive.reportCount, 1);

actionLoadHistoryRun(0, "runA");
assert.ok(getState().runA, "History Set A path should load runA");
actionLoadHistoryRun(0, "runB");
assert.ok(getState().runB, "History Set B path should load runB");
assert.ok(!getState().runA || getState().runA.meta.reportId !== getState().runB.meta.reportId, "Run A/B duplicate guard must not keep the same report in both slots");

const exportPayload = JSON.parse(actionExportHistoryJSON());
assert.equal(exportPayload.version, "v4.11z52w29", "History export should report the active build/action checkpoint");
assert.equal(exportPayload.history.length, 1);
assert.equal(exportPayload.rawArchive.reportCount, 1);

console.log("v4.11z52w29 active path verification test passed");
