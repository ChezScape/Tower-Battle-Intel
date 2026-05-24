import fs from "node:fs";
import assert from "node:assert/strict";

const bridge = fs.readFileSync("./src/ui/actionAuditBridge.js", "utf8");
const bootstrap = fs.existsSync("./bootstrap.js") ? fs.readFileSync("./bootstrap.js", "utf8") : "";
const config = fs.existsSync("./config/appConfig.js") ? fs.readFileSync("./config/appConfig.js", "utf8") : "";

assert.match(bridge, /ACTION AUDIT BRIDGE v4\.10n/);
assert.match(bridge, /document\.addEventListener\("click", handleClick, true\)/);
assert.match(bridge, /document\.addEventListener\("change", handleChange, true\)/);
assert.match(bridge, /importHistoryFile/);
assert.match(bridge, /actionImportHistoryText/);
assert.match(bridge, /actionAuditBridgeBound/);
assert.match(bridge, /TowerBattleIntelActionAudit/);
assert.match(bridge, /lastImportResult/);
assert.match(bridge, /data-ui-action/);
assert.match(bridge, /data-history-stats-index/);
assert.match(bridge, /data-history-filter/);

if (bootstrap) {
  assert.match(bootstrap, /actionAuditBridge/);
}

if (config) {
  assert.match(config, /version:\s*"v4\.10n"/);
}

console.log("action-audit-bridge.test.mjs passed");
