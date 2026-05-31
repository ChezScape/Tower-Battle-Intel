import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(file, "utf8");

const config = read("config/appConfig.js");
const appEntry = read("app.js");
const bootstrap = read("bootstrap.js");
const appInit = read("src/app/init.js");
const appRender = read("src/app/render.js");
const appTabs = read("src/app/tabs.js");
const appVersion = read("src/app/version.js");
const uiRender = read("src/ui/render.js");
const dashboard = read("src/ui/dashboard.js");
const tabEvents = read("src/ui/events/tabEvents.js");
const eventIndex = read("src/ui/events/index.js");

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));

assert.ok(fs.existsSync("src/app/init.js"));
assert.ok(fs.existsSync("src/app/render.js"));
assert.ok(fs.existsSync("src/app/tabs.js"));
assert.ok(fs.existsSync("src/app/version.js"));

assert.ok(appEntry.includes("APP ENTRY v4.11z52w12"));
assert.ok(appEntry.includes("startTowerBattleIntel"));
assert.equal(appEntry.includes("initDeviceMode"), false, "entry point must not duplicate init ownership");
assert.equal(appEntry.includes("bootstrap"), false, "entry point should not import root bootstrap compatibility loader");

assert.ok(bootstrap.includes("BOOTSTRAP COMPATIBILITY LOADER v4.11z52w12"));
assert.ok(bootstrap.includes("./src/app/init.js"));
assert.equal(bootstrap.includes("loadStorage"), false, "root bootstrap must not own storage hydration anymore");
assert.equal(bootstrap.includes("bindUIEvents"), false, "root bootstrap must not own UI event binding anymore");

assert.ok(appInit.includes("APP INIT FOUNDATION v4.11z52w12"));
assert.ok(appInit.includes("renderApp(null, { reason: \"startup\" })"));
assert.ok(appInit.includes("bindUIEvents(() => renderApp(null, { reason: \"ui-event\" }))"));
assert.ok(appInit.includes("hydrateFromStorage"));
assert.ok(appInit.includes("TowerBattleIntelApp"));

assert.ok(appRender.includes("APP RENDER FOUNDATION v4.11z52w12"));
assert.ok(appRender.includes("renderDashboard"));
assert.ok(appRender.includes("stampAppTabRuntime"));
assert.equal(appRender.includes("bindUIEvents"), false, "render must not bind events");
assert.equal(appRender.includes("document.addEventListener"), false, "render must not own DOM listeners");

assert.ok(appTabs.includes("APP TAB FOUNDATION v4.11z52w12"));
assert.ok(appTabs.includes("activateAppTab"));
assert.ok(appTabs.includes("setUIState"));
assert.ok(appTabs.includes("setState"));

assert.ok(appVersion.includes("APP VERSION FOUNDATION v4.11z52w12"));
assert.ok(appVersion.includes("stampAppVersionRuntime"));

assert.ok(uiRender.includes("UI RENDER COMPATIBILITY LOADER v4.11z52w12"));
assert.ok(uiRender.includes("../app/render.js"));

assert.ok(dashboard.includes("DASHBOARD SHELL RENDERER v4.11z52w12"));
assert.ok(dashboard.includes("getActiveAppTab"));
assert.ok(dashboard.includes("stampAppTabRuntime"));

assert.ok(tabEvents.includes("TAB EVENTS v4.11z52w12"));
assert.ok(tabEvents.includes("activateAppTab"));
assert.equal(tabEvents.includes("setState({"), false, "tabEvents should delegate state ownership to app/tabs");

assert.ok(eventIndex.includes("UI EVENT ROOT v4.11z52w29"));
assert.ok(eventIndex.includes("workspaceEvents"), "real workspace actions should be routed through rebuilt workspaceEvents");

console.log("v4.11z52w12 app/render/tabs foundation test passed");
