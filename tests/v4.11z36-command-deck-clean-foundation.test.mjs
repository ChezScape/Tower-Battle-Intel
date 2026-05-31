import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const desktopView = readFileSync("src/ui/views/desktopView.js", "utf8");
const commandDeck = readFileSync("src/ui/sections/commandDeckView.js", "utf8");
const actions = readFileSync("src/actions/index.js", "utf8");
const events = readFileSync("src/ui/events/index.js", "utf8");
const workspaceEvents = readFileSync("src/ui/events/workspaceEvents.js", "utf8");

assert.ok(commandDeck.includes("COMMAND DECK PANEL HIERARCHY REBUILD v4.11z52w29"));
assert.ok(actions.includes("validate-report"));
assert.ok(actions.includes("save-load-dashboard"));
assert.ok(desktopView.includes("buildCommandShell"));
assert.ok(desktopView.includes("buildCommandDeckView"));
assert.equal(desktopView.includes("Input / report shell"), false, "parked Command Deck shell should be replaced by the active Command Deck view");
assert.ok(events.includes("handleWorkspaceClick"));
assert.ok(events.includes("handleWorkspaceInput"));
assert.ok(workspaceEvents.includes("COMMAND_ACTION_SELECTOR"));
assert.ok(workspaceEvents.includes("actionCacheCommandInputDraft(input.value"));
assert.ok(events.includes("realWorkspaceActionsActive: true"));

console.log("v4.11z36 command deck foundation test passed for rebuilt workspace event owner.");
