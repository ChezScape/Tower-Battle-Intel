import fs from "node:fs";
import assert from "node:assert/strict";

const read = file => fs.readFileSync(file, "utf8");
const config = read("config/appConfig.js");
const statPanels = read("src/ui/sections/statPanels.js");
const css = read("desktop.css");
const mobile = read("mobile.css");

assert.match(config, /version:\s*"v4\.11q"/);
assert.match(statPanels, /tbi-advantage-meter/);
assert.match(statPanels, /side-b/);
assert.match(statPanels, /side-a/);
assert.match(statPanels, /--tbi-meter/);
assert.doesNotMatch(statPanels, /style="width:\$\{width\.toFixed/);
assert.match(css, /v4\.11q Desktop Advantage Meter/);
assert.match(css, /centre-split/);
assert.match(css, /tbi-advantage-meter\.side-b i/);
assert.match(css, /tbi-advantage-meter\.side-a i/);
assert.equal(mobile.includes("v4.11q Desktop Advantage Meter"), false);

console.log("current-v4.11q-advantage-meter.test.mjs passed");
