import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const config = readFileSync("./config/appConfig.js", "utf8");
const app = readFileSync("./app.js", "utf8");
const compareView = readFileSync("./src/ui/sections/compareView.js", "utf8");
const trendView = readFileSync("./src/ui/sections/compareTrendView.js", "utf8");
const desktop = readFileSync("./desktop.css", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11z"/);
assert.match(app, /APP ENTRY v4\.11z/);
assert.match(compareView, /Jump to Long-Term Growth/);
assert.match(trendView, /COMPARE TREND MONITOR v4\.11z/);
assert.match(trendView, /RANGE_OPTIONS/);
assert.match(trendView, /30 Days/);
assert.match(trendView, /90 Days/);
assert.match(trendView, /6 Months/);
assert.match(trendView, /1 Year/);
assert.match(trendView, /Monthly Rollup/);
assert.match(trendView, /Month-to-Month Charts/);
assert.match(trendView, /buildMonthlyPoints/);
assert.match(trendView, /filterPointsByRange/);
assert.match(trendView, /tbi-growth-range-radio/);
assert.match(desktop, /v4\.11z Compare Long-Term Growth Charts/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-growth-range-console/);
assert.match(desktop, /#tbi-growth-range-6m:checked/);
assert.match(desktop, /#tbi-growth-range-1y:checked/);
assert.equal(mobile.includes("v4.11z Compare Long-Term Growth Charts"), false);
assert.equal(mobile.includes("tbi-growth-range-console"), false);

console.log("current-v4.11z-compare-long-term-growth-charts.test.mjs passed");
