import assert from "node:assert/strict";
import fs from "node:fs";

const config = fs.readFileSync("config/appConfig.js", "utf8");
const compareTrend = fs.readFileSync("src/ui/sections/compareTrendView.js", "utf8");
const bridge = fs.readFileSync("src/ui/growthLineFocusBridge.js", "utf8");
const bootstrap = fs.readFileSync("bootstrap.js", "utf8");
const desktop = fs.readFileSync("desktop.css", "utf8");
const mobile = fs.readFileSync("mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11z6"/);
assert.match(compareTrend, /COMPARE TREND MONITOR v4\.11z6/);
assert.match(compareTrend, /data-growth-family-card/);
assert.match(compareTrend, /data-growth-line-key/);
assert.match(compareTrend, /data-growth-metric-focus/);
assert.match(compareTrend, /data-growth-line-clear/);
assert.match(compareTrend, /Click a legend chip, graph line, or calculation row/);
assert.match(bridge, /GROWTH LINE FOCUS BRIDGE v4\.11z6/);
assert.match(bridge, /focusMetric/);
assert.match(bridge, /clearCardFocus/);
assert.match(bootstrap, /growthLineFocusBridge\.js/);
assert.match(desktop, /v4\.11z6 Growth Line Focus/);
assert.match(desktop, /\.family-overlay-line\.is-focused/);
assert.match(desktop, /\.family-overlay-line\.is-dimmed/);
assert.equal(mobile.includes("Growth Line Focus"), false);

console.log("current-v4.11z6-growth-line-focus.test.mjs passed");
