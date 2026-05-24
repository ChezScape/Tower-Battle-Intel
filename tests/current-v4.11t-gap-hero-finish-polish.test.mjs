import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("./desktop.css", "utf8");
const gapRadar = readFileSync("./src/ui/sections/gapRadar.js", "utf8");
const radarChart = readFileSync("./src/ui/components/radarChart.js", "utf8");
const statPanels = readFileSync("./src/ui/sections/statPanels.js", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");

assert.match(gapRadar, /valueLabel:\s*formatDelta/);
assert.match(gapRadar, /<b>Gap<\/b><small>B - A<\/small>/);
assert.match(radarChart, /radar-value-top/);
assert.match(radarChart, /radar-value-right/);
assert.match(radarChart, /radar-value-bottom/);
assert.match(radarChart, /radar-value-left/);
assert.match(radarChart, /valueTone\(scores, "economy"\)/);
assert.match(statPanels, /Run B Leads/);
assert.match(statPanels, /Run A Leads/);
assert.match(css, /Gap in Numbers: mockup-inspired compact hero card with actual numbers/);
assert.match(css, /\.radar-value\.good/);
assert.match(css, /tbi-gap-formula b/);
assert.match(css, /Maximised\/right-rail Quick Actions/);
assert.equal(mobile.includes("v4.11t Desktop Gap Hero"), false);

console.log("current-v4.11t-gap-hero-finish-polish.test.mjs passed");
