import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const config = readFileSync("./config/appConfig.js", "utf8");
const compareView = readFileSync("./src/ui/sections/compareView.js", "utf8");
const trendView = readFileSync("./src/ui/sections/compareTrendView.js", "utf8");
const diffBridge = readFileSync("./src/ui/metricTableDiffToggleBridge.js", "utf8");
const desktop = readFileSync("./desktop.css", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11w"/);
assert.match(compareView, /tbi-compare-lead-badges/);
assert.match(compareView, /Cleaner top movers first/);
assert.match(compareView, /tbi-compare-diff-pill/);
assert.match(compareView, /diffToggle:\s*false/);
assert.match(compareView, /function leadAmount/);
assert.match(compareView, /plainLabel\(block\.label\)/);
assert.doesNotMatch(compareView, /Open DIFF\+ for a full no-squash table/);
assert.match(trendView, /COMPARE TREND MONITOR v4\.11w/);
assert.match(trendView, /History Trend \+ Single Report Signals/);
assert.match(diffBridge, /button\.closest\("\.tbi-metric-card"\)\?\.querySelector\?\.\("\[data-metric-table\]"\)/);
assert.match(desktop, /v4\.11w Compare Workspace Refinement/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-compare-diff-pill/);
assert.match(desktop, /body\[data-dashboard-tab="compare"\] \.tbi-metric-table\.lead-a/);
assert.equal(mobile.includes("v4.11w Compare Workspace Refinement"), false);

console.log("current-v4.11w-compare-workspace-refinement.test.mjs passed");
