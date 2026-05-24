import fs from "node:fs";
import assert from "node:assert/strict";

const read = file => fs.readFileSync(file, "utf8");
const app = read("./app.js");
const bootstrap = read("./bootstrap.js");
const config = read("./config/appConfig.js");
const desktopCss = read("./desktop.css");

assert.match(config, /version:\s*"v4\.11q"/);
assert.match(app, /APP ENTRY v4\.11q/);
assert.match(bootstrap, /BOOTSTRAP v4\.11q/);
assert.match(bootstrap, /metricTableDiffToggleBridge\.js/);
assert.match(desktopCss, /v4\.11q Desktop Diff Details Modal/);
assert.match(desktopCss, /v4\.11q Desktop Fine Adjustment Polish/);

console.log("current-v4.11q-checkpoint.test.mjs passed");
