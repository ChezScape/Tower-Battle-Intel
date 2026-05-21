import fs from "node:fs";
import assert from "node:assert/strict";

const read = file => fs.readFileSync(file, "utf8");

const app = read("app.js");
const bootstrap = read("bootstrap.js");
const index = read("index.html");
const desktop = read("desktop.css");
const mobile = read("mobile.css");
const readme = read("README.md");
const style = read("style.css");
const config = read("config/appConfig.js");

assert.match(config, /version:\s*"v4\.10d"/);
assert.match(app, /APP ENTRY v4\.10c/);
assert.match(app, /bootstrap\(\)/);
assert.match(bootstrap, /BOOTSTRAP v4\.10c/);
assert.match(bootstrap, /render\(\);\s*\n\s*bindCoreEvents\(\);/);
assert.match(index, /id="dashboard"/);
assert.match(index, /id="input"/);
assert.match(index, /id="debugPanel"/);
assert.match(index, /type="module" src="\.\/app\.js"/);
assert.doesNotMatch(index, /desktop-topbar/);
assert.match(desktop, /v4\.10c ROOT SHELL REBUILD SUPPORT/);
assert.match(mobile, /v4\.10c ROOT SHELL REBUILD SUPPORT/);
assert.match(readme, /Tower Battle Intel v4\.10c/);
assert.match(style, /intentionally not loaded/);

console.log("root-shell-foundation.test.mjs passed");
