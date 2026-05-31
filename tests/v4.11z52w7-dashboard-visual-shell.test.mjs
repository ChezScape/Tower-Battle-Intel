import assert from "node:assert/strict";
import fs from "node:fs";

const desktopView = fs.readFileSync("src/ui/views/desktopView.js", "utf8");
const shell = fs.readFileSync("src/ui/views/dashboardVisualShell.js", "utf8");
const config = fs.readFileSync("config/appConfig.js", "utf8");
const mobileCss = fs.readFileSync("mobile.css", "utf8");

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));

assert.ok(desktopView.includes('import { buildDashboardVisualShell } from "./dashboardVisualShell.js";'));
for (const removedImport of [
    "buildRunHeader",
    "buildDashboardGameBrainStrip",
    "buildPrimaryStatGrid",
    "buildSecondaryStatGrid",
    "buildGapPanel",
    "buildSideIntel",
    "buildSystemsMatrix"
]) {
    assert.equal(desktopView.includes(removedImport), false, `${removedImport} should not be imported by active desktop shell path`);
}

assert.ok(shell.includes("DASHBOARD VISUAL SHELL v4.11z52w7"));
assert.equal(shell.includes("../../game/gameBrainRuntimeFeedback.js"), false);
assert.equal(shell.includes('data-ui-action="'), false);
assert.ok(shell.includes('data-dashboard-action-inactive="true"')); 
assert.ok(shell.includes('data-dashboard-visual-shell="v4.11z52w7"'));
assert.ok(shell.includes("Live Dashboard buttons are intentionally disconnected"));

assert.ok(desktopView.includes('data-ui-shell-reset="v4.11z52w29"'));
assert.ok(mobileCss.includes("v4.11z52b tab-ordered blank mobile module loader"));

console.log("v4.11z52w7 Dashboard visual shell density refactor test passed for active shell map");
