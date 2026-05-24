import fs from "node:fs";
import assert from "node:assert/strict";

const bridge = fs.readFileSync("./src/ui/nativeImportHardBridge.js", "utf8");
const bootstrap = fs.existsSync("./bootstrap.js") ? fs.readFileSync("./bootstrap.js", "utf8") : "";
const config = fs.existsSync("./config/appConfig.js") ? fs.readFileSync("./config/appConfig.js", "utf8") : "";

assert.match(bridge, /NATIVE IMPORT HARD BRIDGE v4\.10m/);
assert.match(bridge, /input\.showPicker\(\)/);
assert.match(bridge, /event\.stopImmediatePropagation\(\)/);
assert.match(bridge, /historyImportPickerAttempt/);
assert.match(bridge, /openImportPickerHard/);

if (bootstrap) {
  assert.match(bootstrap, /nativeImportHardBridge/);
}

if (config) {
  assert.match(config, /version:\s*"v4\.10m"/);
}

console.log("native-import-hard-bridge.test.mjs passed");
