import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(file, "utf8");

const config = read("config/appConfig.js");
const uiLoader = read("src/ui/events.js");
const uiIndex = read("src/ui/events/index.js");
const tabEvents = read("src/ui/events/tabEvents.js");
const workspaceEvents = read("src/ui/events/workspaceEvents.js");
const mobileEvents = read("src/ui/events/mobileShellEvents.js");
const coreLoader = read("src/core/events.js");
const coreIndex = read("src/core/events/index.js");
const bootstrap = read("bootstrap.js");

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));

assert.ok(uiLoader.includes("UI EVENT MODULE LOADER v4.11z52w29"));
assert.ok(uiLoader.includes("./events/index.js"));
assert.ok(uiIndex.includes("UI EVENT ROOT v4.11z52w29"));
assert.ok(uiIndex.includes("handleTabClick"));
assert.ok(uiIndex.includes("handleMobileShellClick"));
assert.ok(uiIndex.includes("handleWorkspaceClick"));
assert.ok(uiIndex.includes("oldParkedCatchAllActive: false"));
assert.equal(uiIndex.includes("handleParkedActionClick"), false, "old parked catch-all must not be active");
assert.ok(uiIndex.includes("realWorkspaceActionsActive: true"), "real workspace actions are active after hard rebuild");

assert.ok(tabEvents.includes("TAB EVENTS v4.11z52w12"));
assert.ok(workspaceEvents.includes("REBUILT WORKSPACE EVENTS v4.11z52w29"));
assert.ok(mobileEvents.includes("MOBILE SHELL EVENTS v4.11z52w12"));
assert.equal(fs.existsSync("src/ui/events/parkedActionEvents.js"), false);
assert.equal(fs.existsSync("src/ui/events/commandDeckEvents.js"), false);
assert.equal(fs.existsSync("src/ui/events/historyEvents.js"), false);
assert.equal(fs.existsSync("src/ui/events/dashboardEvents.js"), false);
assert.ok(fs.existsSync("src/ui/events/importExportEvents.js"));

assert.ok(coreLoader.includes("CORE EVENT MODULE LOADER v4.11z52w12"));
assert.ok(coreLoader.includes("./events/index.js"));
assert.ok(coreIndex.includes("CORE EVENT MODULE FOUNDATION v4.11z52w12"));
assert.ok(coreIndex.includes("domBridgeActive: false"));
assert.equal(coreIndex.includes("document.getElementById"), false, "core event foundation must not touch DOM");
assert.equal(coreIndex.includes("performUIAction"), false, "core event foundation must not call UI actions");
assert.equal(coreIndex.includes("render"), false, "core event foundation must not render UI");

assert.equal(bootstrap.includes("bindCoreEvents"), false, "bootstrap should not bind core events during shell phase");
assert.equal(bootstrap.includes("systemsKnowledgeBridge"), false);
assert.equal(bootstrap.includes("metricTableDiffToggleBridge"), false);

console.log("v4.11z52w29 hard event module rebuild test passed");
