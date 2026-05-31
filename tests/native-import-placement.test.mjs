import fs from "node:fs";
import assert from "node:assert/strict";

const events = fs.readFileSync("./src/ui/events.js", "utf8");
const bootstrap = fs.readFileSync("./bootstrap.js", "utf8");
const index = fs.readFileSync("./index.html", "utf8");

assert.equal(fs.existsSync("./src/ui/staticControlBridge.js"), false);
assert.equal(fs.existsSync("./src/ui/nativeImportHardBridge.js"), false);
assert.equal(fs.existsSync("./src/ui/liveInteractionBridge.js"), false);
assert.equal(index.includes("historyImportFallbackInput"), false);
assert.equal(bootstrap.includes("nativeImportHardBridge"), false);
assert.equal(bootstrap.includes("bindStaticControlBridge"), false);

assert.match(events, /UI EVENT MODULE LOADER v4\.11z52w29/);
assert.equal(events.includes("openHistoryImportPicker"), false, "import picker is intentionally parked during shell reset");
assert.equal(events.includes("handleHistoryImportInput"), false, "history import handler is intentionally parked during shell reset");
assert.ok(events.includes("workspaceEvents.js"), "active workspace events should own rebuilt buttons");

console.log("native-import-placement.test.mjs passed for v4.11z52w12 shell reset");
