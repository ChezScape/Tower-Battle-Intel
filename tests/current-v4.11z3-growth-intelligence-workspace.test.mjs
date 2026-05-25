import assert from "node:assert/strict";
import fs from "node:fs";

const config = fs.readFileSync("config/appConfig.js", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const trend = fs.readFileSync("src/ui/sections/compareTrendView.js", "utf8");
const desktop = fs.readFileSync("desktop.css", "utf8");
const mobile = fs.readFileSync("mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11z3"/);
assert.match(app, /APP ENTRY v4\.11z3/);
assert.match(trend, /COMPARE TREND MONITOR v4\.11z3/);
assert.match(trend, /Growth Command Centre/);
assert.match(trend, /buildGrowthVerdictPanel/);
assert.match(trend, /buildMoversSection/);
assert.match(trend, /buildFamilyGroupsSection/);
assert.match(trend, /buildMonthLockedCard/);
assert.match(trend, /Top Gains/);
assert.match(trend, /Top Drops/);
assert.match(trend, /Focus Next/);
assert.match(trend, /tbi-growth-workspace-v411z3/);
assert.doesNotMatch(trend, /range controls|hidden range buttons/i);
assert.match(desktop, /v4\.11z3 Growth Intelligence Workspace/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-growth-workspace-v411z3/);
assert.match(desktop, /tbi-growth-verdict-panel/);
assert.match(desktop, /tbi-growth-main-chart-grid/);
assert.match(desktop, /tbi-growth-family-grid/);
assert.equal(mobile.includes("v4.11z3 Growth Intelligence Workspace"), false);
assert.equal(mobile.includes("tbi-growth-workspace-v411z3"), false);

console.log("current-v4.11z3-growth-intelligence-workspace.test.mjs passed");
