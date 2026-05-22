import fs from "node:fs";
import assert from "node:assert/strict";

const bridge = fs.readFileSync("./src/ui/actionAuditBridge.js", "utf8");

assert.match(bridge, /ACTION AUDIT BRIDGE v4\.10o/);
assert.match(bridge, /const VERSION = "v4\.10o"/);
assert.match(bridge, /let previousNativeStatus = null/);
assert.match(bridge, /previousNative\.status !== status/);
assert.match(bridge, /previousNativeStatus = previousNative\.status\.bind\(previousNative\)/);
assert.doesNotMatch(bridge, /const nativeStatus = window\.TowerBattleIntelNativeControls\?\.status\?\.\(\) \|\| \{\};/);

console.log("action-audit-status-fix.test.mjs passed");
