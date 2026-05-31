import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const commandReportActions = readFileSync("src/actions/commandDeckReportActions.js", "utf8");
const commandActions = readFileSync("src/actions/commandDeckActions.js", "utf8");
const workspaceEvents = readFileSync("src/ui/events/workspaceEvents.js", "utf8");
const desktopView = readFileSync("src/ui/views/desktopView.js", "utf8");

assert.ok(commandReportActions.includes("cacheCommandInputDraft"));
assert.ok(commandReportActions.includes("TowerBattleIntelCommandInputDraft"));
assert.ok(commandActions.includes("actionCacheCommandInputDraft"));
assert.ok(desktopView.includes("buildCommandDeckView"));
assert.ok(workspaceEvents.includes("actionCacheCommandInputDraft(input.value"));

console.log("v4.11z39 Command Deck draft retention test passed for rebuilt active workspace events.");
