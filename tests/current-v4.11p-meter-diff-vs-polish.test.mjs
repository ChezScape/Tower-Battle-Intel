import assert from "node:assert/strict";
import fs from "node:fs";

const desktop = fs.readFileSync("./desktop.css", "utf8");
const statPanels = fs.readFileSync("./src/ui/sections/statPanels.js", "utf8");
const mobile = fs.readFileSync("./mobile.css", "utf8");

assert.match(desktop, /v4\.11q Desktop Meter, DIFF\+ and VS Fit Polish/);
assert.match(desktop, /tbi-meter-label[\s\S]*display:\s*none !important/);
assert.match(desktop, /@media \(min-width:\s*1041px\)[\s\S]*\.tbi-vs-core[\s\S]*grid-template-rows:\s*auto auto !important/);
assert.match(desktop, /@media \(max-width:\s*1040px\) and \(min-width:\s*860px\)[\s\S]*\.tbi-vs-core[\s\S]*min-height:\s*38px !important/);
assert.match(desktop, /tbi-metric-table-toggle[\s\S]*min-width:\s*46px/);
assert.match(statPanels, /const directionLabel = value > 0 \? "A → B"/);
assert.equal(mobile.includes("v4.11q Desktop Meter"), false);

console.log("current-v4.11q-meter-diff-vs-polish.test.mjs passed");
