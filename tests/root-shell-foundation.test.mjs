import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync("./app.js", "utf8");
const bootstrap = fs.readFileSync("./bootstrap.js", "utf8");
const index = fs.readFileSync("./index.html", "utf8");
const config = fs.readFileSync("./config/appConfig.js", "utf8");

assert.match(config, /version:\s*"v4\.10l"/);
assert.match(index, /historyImportFallbackInput/);
assert.match(index, /towerBattleIntelNativeControlBackbone/);
assert.match(index, /script type="module" src="\.\/app\.js"/);
assert.match(app, /bootstrap\.js/);
assert.match(bootstrap, /bindStaticControlBridge/);
assert.match(bootstrap, /bindLiveInteractionBridge/);

console.log("root-shell-foundation.test.mjs passed");
