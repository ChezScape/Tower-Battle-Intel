import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const config = readFileSync("./config/appConfig.js", "utf8");
const compareView = readFileSync("./src/ui/sections/compareView.js", "utf8");
const trendView = readFileSync("./src/ui/sections/compareTrendView.js", "utf8");
const diffBridge = readFileSync("./src/ui/metricTableDiffToggleBridge.js", "utf8");
const desktop = readFileSync("./desktop.css", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11x"/);
assert.match(compareView, /const detailLimit = options\.mobile \? 6 : 5/);
assert.match(compareView, /Jump to Trend Monitor/);
assert.match(compareView, /tbi-compare-verdict-facts/);
assert.match(compareView, /Top movers shown here/);
assert.match(compareView, /data-metric-full-rows/);
assert.match(compareView, /findTradeoffBlock/);
assert.match(compareView, /Run B is ahead/);
assert.doesNotMatch(compareView, /Gold column is ahead/);
assert.doesNotMatch(compareView, /Cyan column is ahead/);
assert.match(trendView, /COMPARE TREND MONITOR v4\.11x/);
assert.match(trendView, /id="tbi-compare-trend-monitor"/);
assert.match(diffBridge, /readFullRowsFromCard/);
assert.match(diffBridge, /metricFullRows/);
assert.match(desktop, /v4\.11x Compare Readability \+ Trend Lift/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-compare-trend-jump/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-compare-verdict-facts/);
assert.equal(mobile.includes("v4.11x Compare Readability"), false);

console.log("current-v4.11x-compare-readability-trend-lift.test.mjs passed");
