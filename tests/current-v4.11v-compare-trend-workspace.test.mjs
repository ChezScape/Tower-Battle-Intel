import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const config = readFileSync("./config/appConfig.js", "utf8");
const compareView = readFileSync("./src/ui/sections/compareView.js", "utf8");
const trendView = readFileSync("./src/ui/sections/compareTrendView.js", "utf8");
const desktop = readFileSync("./desktop.css", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11v"/);
assert.match(compareView, /tbi-compare-workspace/);
assert.match(compareView, /buildCompareTrendMonitor/);
assert.match(compareView, /Compare Workspace/);
assert.match(compareView, /Category Breakdown/);
assert.match(trendView, /COMPARE TREND MONITOR v4\.11v/);
assert.match(trendView, /Single Report \+ History Signals/);
assert.match(trendView, /Need 2\+ saved reports/);
assert.match(desktop, /v4\.11v Compare \+ Trend Workspace/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\]/);
assert.match(desktop, /tbi-trend-sparkline/);
assert.equal(mobile.includes("v4.11v Compare + Trend Workspace"), false);

console.log("current-v4.11v-compare-trend-workspace.test.mjs passed");
