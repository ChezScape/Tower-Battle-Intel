import fs from "node:fs";
import assert from "node:assert/strict";

const historyLayout = fs.readFileSync("./src/ui/layouts/historyLayout.js", "utf8");
const staticBridge = fs.readFileSync("./src/ui/staticControlBridge.js", "utf8");
const liveBridge = fs.readFileSync("./src/ui/liveInteractionBridge.js", "utf8");
const index = fs.readFileSync("./index.html", "utf8");
const desktop = fs.readFileSync("./desktop.css", "utf8");

assert.match(historyLayout, /id="historyImportInput"/);
assert.match(historyLayout, /data-history-visible-import-input/);
assert.match(historyLayout, /history-native-import-control/);
assert.match(index, /id="historyImportFallbackInput"/);

assert.match(staticBridge, /getVisibleHistoryImportInput/);
assert.match(staticBridge, /#historyImportFallbackInput/);
assert.match(staticBridge, /target\.matches\("#historyImportInput/);
assert.match(liveBridge, /getVisibleImportInput/);
assert.match(liveBridge, /#historyImportFallbackInput/);
assert.match(liveBridge, /target\.matches\("#historyImportInput/);

assert.match(desktop, /history-native-import-control #historyImportInput/);
assert.match(desktop, /width:\s*100% !important/);
assert.match(desktop, /height:\s*100% !important/);
assert.match(desktop, /#historyImportFallbackInput\.native-file-input/);

console.log("native-import-placement.test.mjs passed");
