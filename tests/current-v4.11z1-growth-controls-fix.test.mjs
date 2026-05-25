import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const config = readFileSync("./config/appConfig.js", "utf8");
const app = readFileSync("./app.js", "utf8");
const bootstrap = readFileSync("./bootstrap.js", "utf8");
const trendView = readFileSync("./src/ui/sections/compareTrendView.js", "utf8");
const bridge = readFileSync("./src/ui/compareGrowthControlsBridge.js", "utf8");
const desktop = readFileSync("./desktop.css", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11z1"/);
assert.match(app, /APP ENTRY v4\.11z1/);
assert.match(bootstrap, /compareGrowthControlsBridge/);
assert.match(trendView, /COMPARE TREND MONITOR v4\.11z1/);
assert.match(trendView, /data-growth-range-button="true"/);
assert.match(trendView, /data-growth-mode-button="true"/);
assert.match(trendView, /data-growth-mode-target="summary"/);
assert.match(trendView, /data-growth-mode-target="report"/);
assert.match(trendView, /data-growth-mode-target="month"/);
assert.match(trendView, /data-growth-range-panel/);
assert.doesNotMatch(trendView, /tbi-growth-range-radio/);
assert.match(bridge, /COMPARE GROWTH CONTROLS BRIDGE v4\.11z1/);
assert.match(bridge, /activateRange/);
assert.match(bridge, /activateMode/);
assert.match(bridge, /TowerBattleIntelGrowthControls/);
assert.match(desktop, /v4\.11z1 Compare Growth Controls Fix/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-growth-range-labels button/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-growth-mode-strip button/);
assert.match(desktop, /\.tbi-growth-range-panel\[hidden\]/);
assert.equal(mobile.includes("v4.11z1 Compare Growth Controls Fix"), false);
assert.equal(mobile.includes("data-growth-range-button"), false);

console.log("current-v4.11z1-growth-controls-fix.test.mjs passed");
