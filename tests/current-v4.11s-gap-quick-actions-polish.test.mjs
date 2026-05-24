import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("./desktop.css", "utf8");
const statPanels = readFileSync("./src/ui/sections/statPanels.js", "utf8");
const gapRadar = readFileSync("./src/ui/sections/gapRadar.js", "utf8");
const radarChart = readFileSync("./src/ui/components/radarChart.js", "utf8");
const sideIntel = readFileSync("./src/ui/sections/sideIntel.js", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");

assert.match(statPanels, /const label = value > 0 \? "Run B ahead"/);
assert.match(statPanels, /const directionLabel = value > 0 \? "Better for B"/);
assert.match(statPanels, /tbi-advantage-meter/);
assert.match(gapRadar, /tbi-gap-icon/);
assert.match(gapRadar, /Gap = B - A/);
assert.match(radarChart, /viewBox="0 0 360 285"/);
assert.match(radarChart, /radar-label-right/);
assert.match(css, /Shared optical icon frame/);
assert.match(css, /tbi-side-column \.tbi-quick-actions/);
assert.match(css, /tbi-action-icon-paste svg/);
assert.match(css, /tbi-gap-legend/);
assert.match(css, /tbi-panel-delta-strip\.side-b > span::after/);
assert.match(css, /tbi-chart-icon[\s\S]*transform:\s*scale\(\.88\) !important/);
assert.match(sideIntel, /buildQuickActionsPanel/);
assert.equal(mobile.includes("v4.11s Desktop Gap"), false);

console.log("current-v4.11s-gap-quick-actions-polish.test.mjs passed");
