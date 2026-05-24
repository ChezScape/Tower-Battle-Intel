import fs from "node:fs";
import assert from "node:assert/strict";

const css = fs.readFileSync("desktop.css", "utf8");
const sideIntel = fs.readFileSync("src/ui/sections/sideIntel.js", "utf8");
const mobile = fs.readFileSync("mobile.css", "utf8");

assert.match(css, /v4\.11q Desktop Concept Finish Polish/);
assert.match(css, /concept-quality polish layer/);
assert.match(css, /VS: concept-style angular neon core/);
assert.match(css, /Quick Actions: concept-matched command console panel/);
assert.match(css, /\.tbi-target-reticle/);
assert.match(sideIntel, /function actionIcon/);
assert.match(sideIntel, /tbi-action-icon/);
assert.match(sideIntel, /<svg viewBox="0 0 32 32">/);
assert.match(sideIntel, /actionButton\("open-command", "Paste Report", "paste"\)/);
assert.match(sideIntel, /actionButton\("toggle-debug", "Health Scan", "health", "wide"\)/);
assert.equal(mobile.includes("v4.11q Desktop Concept Finish Polish"), false);

console.log("current-v4.11q-concept-finish-polish.test.mjs passed");
