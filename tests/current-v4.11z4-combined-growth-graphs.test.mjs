import assert from "node:assert/strict";
import fs from "node:fs";

const config = fs.readFileSync("config/appConfig.js", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const trendView = fs.readFileSync("src/ui/sections/compareTrendView.js", "utf8");
const desktop = fs.readFileSync("desktop.css", "utf8");
const mobile = fs.readFileSync("mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11z4"/);
assert.match(app, /APP ENTRY v4\.11z4/);
assert.match(trendView, /COMPARE TREND MONITOR v4\.11z4/);
assert.match(trendView, /Combined Growth Graphs/);
assert.match(trendView, /buildCombinedFamilyChart/);
assert.match(trendView, /buildCombinedFamilyLegend/);
assert.match(trendView, /buildCombinedMetricCalc/);
assert.match(trendView, /Family Overlay Charts/);
assert.match(trendView, /Normalised lines · real calculations below/);
assert.match(desktop, /v4\.11z4 Combined Growth Graphs/);
assert.match(desktop, /tbi-combined-family-chart/);
assert.match(desktop, /family-overlay-line/);
assert.match(desktop, /tbi-combined-calc-row/);
assert.equal(mobile.includes("v4.11z4 Combined Growth Graphs"), false);
assert.equal(mobile.includes("tbi-combined-family-chart"), false);

console.log("current-v4.11z4-combined-growth-graphs.test.mjs passed");
