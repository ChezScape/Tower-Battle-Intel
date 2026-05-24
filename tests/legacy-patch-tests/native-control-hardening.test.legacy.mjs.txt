import fs from "node:fs";
import assert from "node:assert/strict";

const historyLayout = fs.readFileSync("./src/ui/layouts/historyLayout.js", "utf8");
const desktop = fs.readFileSync("./desktop.css", "utf8");
const mobile = fs.readFileSync("./mobile.css", "utf8");
const index = fs.readFileSync("./index.html", "utf8");
const config = fs.readFileSync("./config/appConfig.js", "utf8");

assert.match(config, /version:\s*"v4\.10l"/);
assert.match(index, /v4\.10l/);
assert.match(index, /historyImportFallbackInput/);
assert.doesNotMatch(index, /id="historyImportInput"[\s\S]*?class="native-file-input"/);

assert.match(historyLayout, /<label[\s\S]*history-native-import-control/);
assert.match(historyLayout, /for="historyImportInput"/);
assert.match(historyLayout, /id="historyImportInput"/);
assert.match(historyLayout, /data-history-visible-import-input/);
assert.match(historyLayout, /class="history-native-import-input"/);

assert.match(desktop, /v4\.10l Native Import Placement Fix/);
assert.match(desktop, /#historyImportFallbackInput\.native-file-input/);
assert.match(desktop, /history-native-import-control #historyImportInput/);
assert.match(desktop, /font-size:\s*120px/);
assert.match(mobile, /v4\.10l Native Import Placement Fix/);

console.log("native-control-hardening.test.mjs passed");
