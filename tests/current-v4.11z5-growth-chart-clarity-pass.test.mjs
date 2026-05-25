import assert from "node:assert/strict";
import fs from "node:fs";

const config = fs.readFileSync("config/appConfig.js", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const trendView = fs.readFileSync("src/ui/sections/compareTrendView.js", "utf8");
const desktop = fs.readFileSync("desktop.css", "utf8");
const mobile = fs.readFileSync("mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11z5"/);
assert.match(app, /APP ENTRY v4\.11z5/);
assert.match(trendView, /COMPARE TREND MONITOR v4\.11z5/);
assert.match(trendView, /Growth Chart Clarity Pass/);
assert.match(trendView, /tone: "economy"/);
assert.match(trendView, /tone: "coins-rate"/);
assert.match(trendView, /primary: true/);
assert.match(trendView, /primary-line/);
assert.match(trendView, /dash-line/);
assert.match(trendView, /status = change > 0 \? "Improving"/);
assert.match(desktop, /v4\.11z5 Growth Chart Clarity Pass/);
assert.match(desktop, /\.tone-coins-rate/);
assert.match(desktop, /\.family-overlay-line\.primary-line/);
assert.match(desktop, /\.family-overlay-line\.dash-line/);
assert.match(desktop, /\.tbi-combined-family-legend span\.primary-metric/);
assert.equal(mobile.includes("v4.11z5 Growth Chart Clarity Pass"), false);
assert.equal(mobile.includes("tone-coins-rate"), false);

console.log("current-v4.11z5-growth-chart-clarity-pass.test.mjs passed");
