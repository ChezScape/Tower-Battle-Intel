import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const commandReportActions = readFileSync("src/actions/commandDeckReportActions.js", "utf8");
const commandActions = readFileSync("src/actions/commandDeckActions.js", "utf8");
const workspaceEvents = readFileSync("src/ui/events/workspaceEvents.js", "utf8");

assert.ok(commandReportActions.includes("keepInput"));
assert.ok(commandActions.includes("actionRememberCommandFeedback"));
assert.ok(workspaceEvents.includes("import-history"));
assert.ok(workspaceEvents.includes("export-history"));

console.log("v4.11z43 Command Deck input retention polish test passed for rebuilt workspace events.");
