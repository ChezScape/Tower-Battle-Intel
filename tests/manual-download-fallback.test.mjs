import fs from "node:fs";
import assert from "node:assert/strict";

const config = fs.readFileSync("./config/appConfig.js", "utf8");
const index = fs.readFileSync("./index.html", "utf8");
const bridge = fs.readFileSync("./src/ui/universalDownloadBridge.js", "utf8");
const desktop = fs.readFileSync("./desktop.css", "utf8");

assert.match(config, /version:\s*"v4\.10w"/);
assert.match(index, /universalDownloadBridge\.js/);
assert.match(bridge, /const VERSION = "v4\.10w"/);
assert.match(bridge, /showManualDownloadShelf/);
assert.match(bridge, /universal-download-manual-link/);
assert.match(bridge, /manualLinkAvailable:\s*true/);
assert.match(desktop, /v4\.10w Manual Download Fallback/);

console.log("manual-download-fallback.test.mjs passed");
