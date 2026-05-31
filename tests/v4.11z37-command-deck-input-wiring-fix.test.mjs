import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const actions = readFileSync("src/actions/commandDeckActions.js", "utf8");
const commandReportActions = readFileSync("src/actions/commandDeckReportActions.js", "utf8");
const events = readFileSync("src/ui/events/index.js", "utf8");
const workspaceEvents = readFileSync("src/ui/events/workspaceEvents.js", "utf8");
const config = readFileSync("config/appConfig.js", "utf8");
const desktopView = readFileSync("src/ui/views/desktopView.js", "utf8");

assert.ok(config.includes('version: "v4.11z52"'));
assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(actions.includes("commandDeckReportActions.js"));
assert.ok(actions.includes("actionCacheCommandInputDraft"));
assert.ok(actions.includes("actionRememberCommandFeedback"));
assert.ok(commandReportActions.includes("findCommandReportInput"));
assert.ok(commandReportActions.includes("lastCommandFeedback"));
assert.ok(desktopView.includes("buildCommandDeckView"));
assert.ok(events.includes("handleWorkspaceChange"));
assert.ok(workspaceEvents.includes("data-command-report-input"));
assert.ok(workspaceEvents.includes("actionCacheCommandInputDraft(input.value"));

console.log("v4.11z37 command deck input wiring test passed for rebuilt workspaceEvents phase.");
