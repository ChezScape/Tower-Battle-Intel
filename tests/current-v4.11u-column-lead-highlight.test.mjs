import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const statPanels = readFileSync("./src/ui/sections/statPanels.js", "utf8");
const sectionUtils = readFileSync("./src/ui/sections/sectionUtils.js", "utf8");
const diffOverview = readFileSync("./src/ui/sections/differenceOverview.js", "utf8");
const desktop = readFileSync("./desktop.css", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");
const config = readFileSync("./config/appConfig.js", "utf8");

assert.match(config, /version:\s*"v4\.11u"/);
assert.match(statPanels, /tbi-column-lead-strip/);
assert.doesNotMatch(statPanels, /tbi-advantage-meter/);
assert.match(sectionUtils, /leadSide/);
assert.match(sectionUtils, /lead-cell/);
assert.match(diffOverview, /Run A Leads/);
assert.match(diffOverview, /Run B Leads/);
assert.match(desktop, /v4\.11u Desktop Column Lead Highlight/);
assert.match(desktop, /tbi-column-lead-strip/);
assert.match(desktop, /tbi-metric-table\.lead-a/);
assert.match(desktop, /tbi-metric-table\.lead-b/);
assert.equal(mobile.includes("v4.11u Desktop Column Lead Highlight"), false);

console.log("current-v4.11u-column-lead-highlight.test.mjs passed");
