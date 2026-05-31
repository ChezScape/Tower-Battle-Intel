import assert from "node:assert/strict";
import fs from "node:fs";

import {
    ACTION_FOUNDATION_VERSION,
    performUIAction,
    actionGetState,
    actionExportHistoryJSON,
    getActionFoundationStatus
} from "../src/actions/actions.js";

const config = fs.readFileSync("config/appConfig.js", "utf8");
const compatibilityLoader = fs.readFileSync("src/actions/actions.js", "utf8");
const index = fs.readFileSync("src/actions/index.js", "utf8");
const appActions = fs.readFileSync("src/actions/appActions.js", "utf8");
const commandDeckActions = fs.readFileSync("src/actions/commandDeckActions.js", "utf8");
const historyActions = fs.readFileSync("src/actions/historyActions.js", "utf8");
const importExportActions = fs.readFileSync("src/actions/importExportActions.js", "utf8");
const actionUtils = fs.readFileSync("src/actions/actionUtils.js", "utf8");
const uiEvents = fs.readFileSync("src/ui/events/index.js", "utf8");

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.equal(ACTION_FOUNDATION_VERSION, "v4.11z52w29");

for (const file of [
    "src/actions/index.js",
    "src/actions/actionUtils.js",
    "src/actions/appActions.js",
    "src/actions/commandDeckActions.js",
    "src/actions/historyActions.js",
    "src/actions/importExportActions.js"
]) {
    assert.ok(fs.existsSync(file), `${file} should exist after action split`);
}

assert.equal(fs.existsSync("src/actions/parkedActions.js"), false, "old parked action module should be removed after hard rebuild");
assert.ok(compatibilityLoader.includes("ACTION COMPATIBILITY LOADER v4.11z52w13"));
assert.ok(compatibilityLoader.includes('export * from "./index.js"'));
assert.ok(index.includes("ACTION MODULE FOUNDATION v4.11z52w13"));
assert.ok(actionUtils.includes("ACTION UTILS v4.11z52w29"));
assert.ok(appActions.includes("APP ACTION FOUNDATION v4.11z52w13"));
assert.ok(commandDeckActions.includes("COMMAND DECK ACTION FOUNDATION v4.11z52w16"));
assert.ok(commandDeckActions.includes('from "./commandDeckReportActions.js"'));
assert.ok(historyActions.includes("HISTORY ACTION FOUNDATION v4.11z52w13"));
assert.ok(importExportActions.includes("IMPORT / EXPORT ACTION FOUNDATION v4.11z52w13"));

assert.equal(compatibilityLoader.includes("switch (key)"), false, "compatibility loader should not own the action bus anymore");
assert.ok(uiEvents.includes("workspaceEvents"), "UI events should now route active workspace controls through workspaceEvents");

const status = getActionFoundationStatus();
assert.equal(status.version, "v4.11z52w29");
assert.equal(status.realUIWiringActive, true);
assert.ok(status.modules.some(item => item.owner === "src/actions/historyActions.js"));
assert.ok(status.modules.some(item => item.owner === "src/actions/importExportActions.js"));
assert.equal(status.modules.some(item => item.owner === "src/actions/parkedActions.js"), false);

const tab = performUIAction("set-dashboard-tab", { tab: "history" });
assert.equal(tab, "history");
assert.equal(actionGetState().ui.dashboardTab, "history");

const filters = performUIAction("history-set-filters", { query: "ray", mode: "deep", showArchived: true });
assert.equal(filters.query, "ray");
assert.equal(filters.mode, "deep");
assert.equal(filters.showArchived, true);

const exported = JSON.parse(actionExportHistoryJSON());
assert.equal(exported.version, "v4.11z52w29");
assert.equal(exported.exportType, "history-export");
assert.ok(Array.isArray(exported.history));

console.log("v4.11z52w29 actions module foundation test passed");
