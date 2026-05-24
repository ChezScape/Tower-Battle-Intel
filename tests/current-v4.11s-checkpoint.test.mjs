import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = readFileSync("./config/appConfig.js", "utf8");
const app = readFileSync("./app.js", "utf8");
const bootstrap = readFileSync("./bootstrap.js", "utf8");
const desktop = readFileSync("./desktop.css", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");
const report = readFileSync("./docs/BUILD_REPORT_v4.11s.md", "utf8");

assert.match(config, /version:\s*"v4\.11s"/);
assert.match(app, /APP ENTRY v4\.11s/);
assert.match(bootstrap, /BOOTSTRAP v4\.11s/);
assert.match(desktop, /v4\.11s Desktop Gap \+ Quick Actions Polish/);
assert.match(report, /Tower Battle Intel v4\.11s/);
assert.equal(mobile.includes("v4.11s Desktop Gap + Quick Actions Polish"), false);

console.log("current-v4.11s-checkpoint.test.mjs passed");
