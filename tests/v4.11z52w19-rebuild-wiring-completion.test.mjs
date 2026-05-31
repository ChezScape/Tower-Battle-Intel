import assert from "node:assert/strict";
import fs from "node:fs";

import { buildDesktopWorkspace } from "../src/ui/views/desktopView.js";
import { getImportExportEventStatus } from "../src/ui/events/importExportEvents.js";
import { getWorkspaceEventStatus } from "../src/ui/events/workspaceEvents.js";
import { actionExportHistoryJSON } from "../src/actions/importExportActions.js";
import { ACTION_FOUNDATION_VERSION } from "../src/actions/actionUtils.js";

const config = fs.readFileSync(new URL("../config/appConfig.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const desktopView = fs.readFileSync(new URL("../src/ui/views/desktopView.js", import.meta.url), "utf8");
const eventIndex = fs.readFileSync(new URL("../src/ui/events/index.js", import.meta.url), "utf8");
const workspaceEvents = fs.readFileSync(new URL("../src/ui/events/workspaceEvents.js", import.meta.url), "utf8");
const importExportEvents = fs.readFileSync(new URL("../src/ui/events/importExportEvents.js", import.meta.url), "utf8");

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.ok(index.includes('data-app-shell="v4.11z52w29"'));
assert.equal(ACTION_FOUNDATION_VERSION, "v4.11z52w29");

const historyHTML = buildDesktopWorkspace("history", {
    history: [],
    rawArchive: { reports: [] },
    ui: { dashboardTab: "history", historyFilters: { mode: "normal" } }
});
assert.ok(historyHTML.includes('data-history-view-rebuild="v4.11z52w29"'), "Desktop History must mount the rebuilt History view");
assert.ok(!historyHTML.includes("History wiring disconnected"), "Desktop History must not render the parked History shell");
assert.ok(historyHTML.includes("Report Management Hub"), "History should still be the report-management hub");

const compareHTML = buildDesktopWorkspace("compare", {});
assert.ok(compareHTML.includes('data-workspace-reset="compare"'), "Compare should remain a deliberate parked rebuild shell");
assert.ok(compareHTML.includes("Compare stays as a blank datasheet rebuild shell"));

assert.ok(desktopView.includes('import { buildHistoryView } from "../sections/historyView.js";'));
assert.ok(desktopView.includes("return buildHistoryView(state);"));
assert.ok(desktopView.includes("buildWorkspaceShell"), "Parked workspaces should still use the safe reset shell until rebuilt");

assert.ok(workspaceEvents.includes('from "./importExportEvents.js"'), "Workspace events should use shared import/export browser helper");
assert.equal(fs.existsSync(new URL("../src/ui/events/commandDeckEvents.js", import.meta.url)), false, "old Command Deck event file should be gone");
assert.equal(fs.existsSync(new URL("../src/ui/events/historyEvents.js", import.meta.url)), false, "old History event file should be gone");
assert.ok(importExportEvents.includes("startHistoryJSONImport"));
assert.ok(importExportEvents.includes("runHistoryJSONExport"));
assert.ok(importExportEvents.includes("triggerTextDownload"));

const importExportStatus = getImportExportEventStatus();
assert.equal(importExportStatus.active, true, "Import/export browser helper should remain active");
assert.equal(importExportStatus.phase, "shared-import-export-rewire");
assert.ok(importExportStatus.owns.includes("History JSON file picker"));
assert.deepEqual(importExportStatus.delegatedFrom, ["workspaceEvents"]);

const workspaceStatus = getWorkspaceEventStatus();
assert.equal(workspaceStatus.active, true);
assert.equal(workspaceStatus.oldParkedCatchAllActive, false);
assert.ok(workspaceStatus.owns.includes("Command Deck clicks/input/change"));
assert.ok(workspaceStatus.owns.includes("History cards/search/filter/modals"));
assert.ok(eventIndex.includes("getWorkspaceEventStatus()"), "UI shell status should report the active workspace owner");
assert.equal(eventIndex.includes("handleParkedActionClick"), false);

const exported = JSON.parse(actionExportHistoryJSON());
assert.equal(exported.version, "v4.11z52w29", "History export should report the current action/build checkpoint");
assert.ok(Object.hasOwn(exported, "rawArchive"), "History export should keep rawArchive in the payload");

console.log("v4.11z52w29 rebuild wiring completion test passed");
