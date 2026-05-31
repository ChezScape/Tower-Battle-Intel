import assert from "node:assert/strict";
import fs from "node:fs";

const actions = fs.readFileSync("src/actions/index.js", "utf8");
const commandReportActions = fs.readFileSync("src/actions/commandDeckReportActions.js", "utf8");
const events = fs.readFileSync("src/ui/events/index.js", "utf8");
const workspaceEvents = fs.readFileSync("src/ui/events/workspaceEvents.js", "utf8");
const desktopView = fs.readFileSync("src/ui/views/desktopView.js", "utf8");

assert.ok(actions.includes("save-report"), "report actions remain active in source");
assert.ok(commandReportActions.includes("lastCommandFeedback"));
assert.ok(desktopView.includes("buildCommandDeckView"), "visible Command Deck is the real rebuilt view");
assert.ok(workspaceEvents.includes("handleCommandClick"), "rebuilt workspace owner catches Command Deck buttons");
assert.ok(events.includes("oldParkedCatchAllActive: false"), "old parked catch-all must not catch real Command Deck buttons");
assert.equal(fs.existsSync("src/ui/events/parkedActionEvents.js"), false, "old parked action event file is removed from project");

console.log("v4.11z40 Command Deck single action feedback test passed for hard event-owner rebuild.");
