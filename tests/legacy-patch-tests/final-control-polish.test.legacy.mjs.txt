import fs from "node:fs";
import assert from "node:assert/strict";

const bridge = fs.readFileSync("./src/ui/finalControlPolishBridge.js", "utf8");
const bootstrap = fs.readFileSync("./bootstrap.js", "utf8");
const config = fs.readFileSync("./config/appConfig.js", "utf8");
const desktop = fs.existsSync("./desktop.css") ? fs.readFileSync("./desktop.css", "utf8") : "";

assert.match(config, /version:\s*"v4\.10u"/);
assert.match(bootstrap, /finalControlPolishBridge\.js/);
assert.match(bridge, /bindFinalControlPolishBridge/);
assert.match(bridge, /data-history-stats-download/);
assert.match(bridge, /data-history-edit-build-choice/);
assert.match(bridge, /debugDownloadHealth/);
assert.match(bridge, /debugDownloadFull/);
assert.match(bridge, /toggleQuietDisplay/);
assert.match(bridge, /link\.click\(\)/);
assert.match(desktop, /v4\.10u Final Control Polish/);

console.log("final-control-polish.test.mjs passed");
