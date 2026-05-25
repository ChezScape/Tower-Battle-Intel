import assert from "node:assert/strict";
import fs from "node:fs";

const config = fs.readFileSync("config/appConfig.js", "utf8");
const trend = fs.readFileSync("src/ui/sections/compareTrendView.js", "utf8");
const desktop = fs.readFileSync("desktop.css", "utf8");
const mobile = fs.readFileSync("mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11z2"/);
assert.match(trend, /COMPARE TREND MONITOR v4\.11z2/);
assert.match(trend, /tbi-growth-workspace-v411z2/);
assert.match(trend, /tbi-growth-anchor-nav/);
assert.match(trend, /Range Overview/);
assert.match(trend, /Report Trends/);
assert.match(trend, /Monthly Rollup/);
assert.match(trend, /Best \/ Average Summaries/);
assert.match(trend, /href="#tbi-growth-report-trends"/);
assert.match(trend, /href="#tbi-growth-monthly-rollup"/);
assert.doesNotMatch(trend, /data-growth-range-button/);
assert.doesNotMatch(trend, /data-growth-mode-button/);
assert.doesNotMatch(trend, /tbi-growth-range-button/);
assert.match(desktop, /v4\.11z2 Growth Workspace Rebuild/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-growth-anchor-nav/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-growth-range-card-grid/);
assert.equal(mobile.includes("v4.11z2 Growth Workspace Rebuild"), false);

console.log("current-v4.11z2-growth-workspace-rebuild.test.mjs passed");
