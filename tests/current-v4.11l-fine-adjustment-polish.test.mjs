import fs from "node:fs";
import assert from "node:assert/strict";

const css = fs.readFileSync("desktop.css", "utf8");
const config = fs.readFileSync("config/appConfig.js", "utf8");
const mobile = fs.readFileSync("mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11q"/);
assert.match(css, /v4\.11q Desktop Fine Adjustment Polish/);
assert.match(css, /unified metric-card headers/);
assert.match(css, /--tbi-card-header-height/);
assert.match(css, /--tbi-card-icon-size/);
assert.match(css, /\.tbi-card-heading\.tbi-metric-title-row h3 > span/);
assert.match(css, /Quick Actions fine adjustment/);
assert.equal(mobile.includes("v4.11q Desktop Fine Adjustment Polish"), false);

console.log("current-v4.11q-fine-adjustment-polish.test.mjs passed");
