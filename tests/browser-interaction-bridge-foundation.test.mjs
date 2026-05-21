import assert from "node:assert/strict";

const bridge = await import("../src/ui/liveInteractionBridge.js");
const inspector = await import("../src/ui/dev/inspectionPanel.js");

assert.equal(typeof bridge.bindLiveInteractionBridge, "function");
assert.equal(typeof inspector.renderInspectionPanel, "function");

console.log("browser-interaction-bridge-foundation.test.mjs passed");
