import fs from "node:fs";
import assert from "node:assert/strict";

const css = fs.readFileSync("desktop.css", "utf8");
const mobile = fs.readFileSync("mobile.css", "utf8");
const statPanels = fs.readFileSync("src/ui/sections/statPanels.js", "utf8");
const sectionUtils = fs.readFileSync("src/ui/sections/sectionUtils.js", "utf8");
const sideIntel = fs.readFileSync("src/ui/sections/sideIntel.js", "utf8");

assert.match(css, /v4\.11q Desktop Card Hierarchy \+ Art Consistency Polish/);
assert.match(css, /tbi-metric-title-row/);
assert.match(css, /display:\s*none !important/);
assert.match(css, /Sharper VS: integrated tech divider/);
assert.match(css, /Quick Actions: command console tiles/);
assert.match(statPanels, /tbi-card-heading tbi-metric-title-row/);
assert.match(statPanels, /buildMetricRows\(section, \{ limit, showHeader: true, diffToggle: true \}\)/);
assert.doesNotMatch(statPanels, /<strong>\$\{escapeHTML\(formatDelta\(total, \{ compact: true \}\)\)\}<\/strong>/);
assert.match(sectionUtils, /<span>Metric<\/span><span>Run A<\/span><span>Run B<\/span><span>Diff<\/span>/);
assert.match(sideIntel, /actionButton\("open-command", "Paste Report", "paste"\)/);
assert.equal(mobile.includes("v4.11q Desktop Card Hierarchy"), false);

console.log("current-v4.11q-card-hierarchy-polish.test.mjs passed");
