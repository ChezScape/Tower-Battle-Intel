import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const config = readFileSync("./config/appConfig.js", "utf8");
const compareView = readFileSync("./src/ui/sections/compareView.js", "utf8");
const trendView = readFileSync("./src/ui/sections/compareTrendView.js", "utf8");
const desktop = readFileSync("./desktop.css", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11y"/);
assert.match(compareView, /Full Datasheet/);
assert.match(compareView, /Complete A \/ B Comparison/);
assert.match(compareView, /const datasheetLimit = 999/);
assert.match(compareView, /id="tbi-compare-datasheet"/);
assert.match(compareView, /totalMetricRows/);
assert.match(compareView, /Jump to Full Datasheet/);
assert.doesNotMatch(compareView, /data-ui-action="open-compare-section"/);
assert.doesNotMatch(compareView, /tbi-card-footer-action/);

assert.match(trendView, /COMPARE TREND MONITOR v4\.11y/);
assert.match(trendView, /Growth Charts \+ Single Report Signals/);
assert.match(trendView, /GROWTH_TREND_METRICS/);
assert.match(trendView, /tbi-growth-chart-grid/);
assert.match(trendView, /damageOutput/);
assert.match(trendView, /utilityTotal/);

assert.match(desktop, /v4\.11y Compare Datasheet \+ Growth Trends/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-growth-chart-grid/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-compare-datasheet-grid/);
assert.equal(mobile.includes("v4.11y Compare Datasheet"), false);

console.log("current-v4.11y-compare-datasheet-growth-trends.test.mjs passed");
