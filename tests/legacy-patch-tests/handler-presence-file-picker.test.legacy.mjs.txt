import fs from "node:fs";
import assert from "node:assert/strict";

const index = fs.readFileSync("./index.html", "utf8");
const bootstrap = fs.readFileSync("./bootstrap.js", "utf8");
const staticBridge = fs.readFileSync("./src/ui/staticControlBridge.js", "utf8");
const liveBridge = fs.readFileSync("./src/ui/liveInteractionBridge.js", "utf8");
const historyLayout = fs.readFileSync("./src/ui/layouts/historyLayout.js", "utf8");

assert.match(index, /id="historyImportInput"/, "index.html must contain persistent History Import file input");
assert.match(index, /type="file"/, "index.html import control must be a native file input");
assert.match(index, /data-history-import-input="true"/, "file input must have history import dataset");

assert.match(bootstrap, /staticControlBridge\.js/, "bootstrap must import staticControlBridge.js");
assert.match(bootstrap, /bindStaticControlBridge\(\(\) => render\(\)\)/, "bootstrap must bind static control bridge");
assert.match(bootstrap, /liveInteractionBridge\.js/, "bootstrap must import liveInteractionBridge.js");
assert.match(bootstrap, /bindLiveInteractionBridge\(\(\) => render\(\)\)/, "bootstrap must bind live interaction bridge");

assert.match(staticBridge, /document\.addEventListener\("click", handleStaticClick, true\)/, "static bridge must own a capture click handler");
assert.match(staticBridge, /openHistoryImportPicker/, "static bridge must expose file picker opener");
assert.match(staticBridge, /TowerBattleIntelHandlers/, "static bridge must expose browser audit helpers");

assert.match(liveBridge, /document\.addEventListener\("click", handleClick, true\)/, "live bridge must own a capture click handler");
assert.match(liveBridge, /openImportPicker/, "live bridge must include import picker fallback");

assert.match(historyLayout, /for="historyImportInput"/, "History Import should have label fallback for native picker");
assert.match(historyLayout, /data-native-history-import-label="true"/, "History Import label should be detectable by the native control backbone");
assert.doesNotMatch(historyLayout, /data-ui-action="import-history"/, "History Import label must not be captured by generic data-ui-action handlers");

console.log("handler-presence-file-picker.test.mjs passed");
