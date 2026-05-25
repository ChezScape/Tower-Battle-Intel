import assert from "node:assert/strict";
import fs from "node:fs";

const config = fs.readFileSync("config/appConfig.js", "utf8");
const statPanels = fs.readFileSync("src/ui/sections/statPanels.js", "utf8");
const sectionUtils = fs.readFileSync("src/ui/sections/sectionUtils.js", "utf8");
const desktop = fs.readFileSync("desktop.css", "utf8");
const mobile = fs.readFileSync("mobile.css", "utf8");
const compareView = fs.readFileSync("src/ui/sections/compareView.js", "utf8");

assert.match(config, /version:\s*"v4\.11x2"/);
assert.match(statPanels, /tbi-metric-footer-action-row/);
assert.match(statPanels, /tbi-metric-footer-diff-button/);
assert.match(statPanels, /diffToggle:\s*false/);
assert.match(statPanels, /data-metric-full-rows/);
assert.match(statPanels, /buildFullRowsData/);
assert.match(sectionUtils, /tbi-metric-diff-action-row/);
assert.match(desktop, /v4\.11x2 Dashboard Footer DIFF Placement/);
assert.match(desktop, /body\[data-dashboard-tab="overview"\] \.tbi-metric-footer-action-row/);
assert.match(desktop, /body\[data-dashboard-tab="overview"\] \.tbi-metric-footer-action-row \.tbi-metric-footer-diff-button/);
assert.match(desktop, /@media \(max-width: 1480px\)[\s\S]*?tbi-metric-footer-diff-button[\s\S]*?display: inline-flex !important/);
assert.match(compareView, /Top movers shown here/);
assert.equal(mobile.includes("v4.11x2 Dashboard Footer DIFF Placement"), false);
assert.equal(mobile.includes("tbi-metric-footer-action-row"), false);

console.log("current-v4.11x2-dashboard-footer-diff-placement.test.mjs passed");
