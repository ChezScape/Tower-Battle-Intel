import assert from "node:assert/strict";
import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const historyLayout = fs.readFileSync("src/ui/layouts/historyLayout.js", "utf8");
const actions = fs.readFileSync("src/actions/actions.js", "utf8");
const desktop = fs.readFileSync("desktop.css", "utf8");
const mobile = fs.readFileSync("mobile.css", "utf8");

assert.match(index, /id="historyImportInput"/);
assert.match(index, /towerBattleIntelNativeControlBackbone/);
assert.match(index, /TowerBattleIntelNativeControls/);
assert.match(historyLayout, /data-native-history-import-label="true"/);
assert.doesNotMatch(historyLayout, /data-ui-action="import-history"/);
assert.match(actions, /window\.TowerBattleIntelActions\s*=\s*api/);
assert.match(actions, /exportHistoryJSON\(\)/);
assert.match(actions, /importHistoryText\(text\)/);
assert.match(desktop, /v4\.10j Native Control Backbone/);
assert.match(mobile, /v4\.10j Native Control Backbone/);

console.log("native-control-backbone.test.mjs passed");
