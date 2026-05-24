import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = readFileSync("./config/appConfig.js", "utf8");
const app = readFileSync("./app.js", "utf8");
const bootstrap = readFileSync("./bootstrap.js", "utf8");
const desktop = readFileSync("./desktop.css", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");
const report = readFileSync("./docs/BUILD_REPORT_v4.11t.md", "utf8");

assert.match(config, /version:\s*"v4\.11t"/);
assert.match(app, /APP ENTRY v4\.11t/);
assert.match(bootstrap, /BOOTSTRAP v4\.11t/);
assert.match(desktop, /v4\.11t Desktop Gap Hero \+ Finish Polish/);
assert.match(report, /Tower Battle Intel v4\.11t/);
assert.equal(mobile.includes("v4.11t Desktop Gap Hero"), false);

console.log("current-v4.11t-checkpoint.test.mjs passed");
