import assert from "node:assert/strict";
import fs from "node:fs";

const desktopView = fs.readFileSync("src/ui/views/desktopView.js", "utf8");
const mobileView = fs.readFileSync("src/ui/views/mobileView.js", "utf8");
const workspaceShell = fs.readFileSync("src/ui/sections/workspaceResetView.js", "utf8");
const events = fs.readFileSync("src/ui/events.js", "utf8");
const bootstrap = fs.readFileSync("bootstrap.js", "utf8");
const index = fs.readFileSync("index.html", "utf8");
const config = fs.readFileSync("config/appConfig.js", "utf8");

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(desktopView.includes('data-ui-shell-reset="v4.11z52w29"'));
assert.ok(desktopView.includes("buildCommandShell"));
assert.ok(desktopView.includes("buildHistoryShell"));
assert.ok(desktopView.includes("../sections/commandDeckView.js"));
assert.equal(desktopView.includes("../sections/historyView.js"), true);
assert.equal(desktopView.includes("../sections/systemsMatrix.js"), false);
assert.ok(mobileView.includes("MOBILE VIEW v4.11z52w12"));
assert.ok(mobileView.includes('data-mobile-dashboard-visual-shell="v4.11z52w12"'));
assert.ok(workspaceShell.includes("UI VISUAL SHELLS v4.11z52w12"));
assert.ok(workspaceShell.includes('data-workspace-action-inactive='));
assert.ok(events.includes("UI EVENT MODULE LOADER v4.11z52w29"));
assert.ok(events.includes("activateTab"));
assert.equal(bootstrap.includes("bindCoreEvents"), false);
assert.equal(bootstrap.includes("systemsKnowledgeBridge"), false);
assert.equal(bootstrap.includes("metricTableDiffToggleBridge"), false);
assert.equal(index.includes("platformIsolationGuard.js"), false);
assert.equal(index.includes("desktopPolishGuard.js"), false);

console.log("v4.11z52w12 UI visual shell reset test passed");
