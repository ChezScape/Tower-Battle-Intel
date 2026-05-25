import assert from "node:assert/strict";
import fs from "node:fs";

const desktop = fs.readFileSync("desktop.css", "utf8");
const mobile = fs.readFileSync("mobile.css", "utf8");
const sectionUtils = fs.readFileSync("src/ui/sections/sectionUtils.js", "utf8");
const config = fs.readFileSync("config/appConfig.js", "utf8");
const compareView = fs.readFileSync("src/ui/sections/compareView.js", "utf8");

assert.match(config, /version:\s*"v4\.11x1"/);
assert.match(desktop, /v4\.11x1 Dashboard Grid Lock Repair/);
assert.match(sectionUtils, /tbi-metric-diff-action-row/);
assert.match(sectionUtils, /data-metric-diff-toggle="true"/);

assert.match(desktop, /body\[data-dashboard-tab="overview"\] \.tbi-metric-diff-action-row/);
assert.match(desktop, /body\[data-dashboard-tab="overview"\] \.tbi-metric-table \.tbi-metric-row\.header\s*\{[\s\S]*?padding-right:\s*8px !important/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-compare-trend-jump/);
assert.match(compareView, /Top movers shown here/);

assert.equal(mobile.includes("v4.11x1 Dashboard Grid Lock Repair"), false);
assert.equal(mobile.includes("tbi-metric-diff-action-row"), false);

console.log("current-v4.11x1-dashboard-grid-lock-repair.test.mjs passed");
