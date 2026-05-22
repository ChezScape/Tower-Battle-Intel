import fs from "node:fs";
import assert from "node:assert/strict";

const config = fs.readFileSync("./config/appConfig.js", "utf8");
const index = fs.readFileSync("./index.html", "utf8");
const bridge = fs.readFileSync("./src/ui/universalDownloadBridge.js", "utf8");
const desktop = fs.readFileSync("./desktop.css", "utf8");

assert.match(config, /version:\s*"v4\.10x"/);
assert.match(index, /universalDownloadBridge\.js/);
assert.match(bridge, /const VERSION = "v4\.10x"/);
assert.match(bridge, /showSaveFilePicker/);
assert.match(bridge, /saveWithPicker/);
assert.match(bridge, /savePickerSupported/);
assert.match(bridge, /universal-download-save-as/);
assert.match(desktop, /v4\.10x Save As Download Fix/);

console.log("save-as-download-fix.test.mjs passed");
