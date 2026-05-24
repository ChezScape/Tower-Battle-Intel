import fs from "node:fs";
import assert from "node:assert/strict";

const bridge = fs.readFileSync("./src/ui/universalDownloadBridge.js", "utf8");
const index = fs.readFileSync("./index.html", "utf8");
const config = fs.readFileSync("./config/appConfig.js", "utf8");
const desktop = fs.existsSync("./desktop.css") ? fs.readFileSync("./desktop.css", "utf8") : "";

assert.match(config, /version:\s*"v4\.10v"/);
assert.match(index, /universalDownloadBridge\.js/);
assert.match(index, /universalDownloadBridge\.js[\s\S]*app\.js/);
assert.match(bridge, /UNIVERSAL DOWNLOAD BRIDGE v4\.10v/);
assert.match(bridge, /debugDownloadHealth/);
assert.match(bridge, /debugDownloadFull/);
assert.match(bridge, /data-export-history/);
assert.match(bridge, /history-stats-download/);
assert.match(bridge, /link\.click\(\)/);
assert.match(bridge, /TowerBattleIntelUniversalDownloadBridge/);
assert.match(desktop, /v4\.10v Universal Download Fix/);

console.log("universal-download-fix.test.mjs passed");
