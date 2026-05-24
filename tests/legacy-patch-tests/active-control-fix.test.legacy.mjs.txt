import fs from "node:fs";
import assert from "node:assert/strict";

const bridge = fs.readFileSync("./src/ui/actionAuditBridge.js", "utf8");

assert.match(bridge, /ACTION AUDIT BRIDGE v4\.10r/);
assert.match(bridge, /const VERSION = "v4\.10r"/);
assert.match(bridge, /handleNativePointerDown/);
assert.match(bridge, /handleSummaryToggle/);
assert.match(bridge, /handleRootCommandButton/);
assert.match(bridge, /handleDisplayModeToggle/);
assert.match(bridge, /toggleDisplayMode/);
assert.match(bridge, /ensureSystemDetail/);
assert.match(bridge, /buildHistoryExportText/);
assert.match(bridge, /data-confirm-input/);
assert.match(bridge, /Type <strong>/);
assert.match(bridge, /downloadTextFile\(text, filename/);
assert.match(bridge, /history-stats-download/);

console.log("active-control-fix.test.mjs passed");
