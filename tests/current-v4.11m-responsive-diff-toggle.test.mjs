import fs from "node:fs";
import assert from "node:assert/strict";

const read = file => fs.readFileSync(file, "utf8");
const config = read("config/appConfig.js");
const bootstrap = read("bootstrap.js");
const sectionUtils = read("src/ui/sections/sectionUtils.js");
const statPanels = read("src/ui/sections/statPanels.js");
const bridge = read("src/ui/metricTableDiffToggleBridge.js");
const css = read("desktop.css");
const mobile = read("mobile.css");

assert.match(config, /version:\s*"v4\.11q"/);
assert.match(bootstrap, /metricTableDiffToggleBridge\.js/);
assert.match(sectionUtils, /DIFF\+/);
assert.match(sectionUtils, /aria-label="Open full Diff details"/);
assert.match(statPanels, /data-metric-detail-title/);
assert.match(bridge, /METRIC TABLE DIFF DETAILS MODAL BRIDGE v4\.11q/);
assert.match(bridge, /openMetricDiffModal/);
assert.match(bridge, /tbi-diff-modal-backdrop/);
assert.match(bridge, /Metric[\s\S]*Run A[\s\S]*Run B[\s\S]*Diff/);
assert.doesNotMatch(bridge, /tbi-diff-view/);
assert.match(css, /v4\.11q Desktop Diff Details Modal/);
assert.match(css, /tbi-diff-modal-backdrop/);
assert.match(css, /tbi-diff-modal-table/);
assert.match(css, /DIFF\+ opens a full comparison modal/);
assert.equal(mobile.includes("v4.11q Desktop Diff Details Modal"), false);

console.log("current-v4.11q-diff-details-modal.test.mjs passed");
