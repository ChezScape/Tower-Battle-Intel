import assert from "node:assert/strict";
import fs from "node:fs";

const config = fs.readFileSync("./config/appConfig.js", "utf8");
const desktop = fs.readFileSync("./desktop.css", "utf8");
const app = fs.readFileSync("./app.js", "utf8");
const bootstrap = fs.readFileSync("./bootstrap.js", "utf8");

assert.match(config, /version:\s*"v4\.11q"/);
assert.match(app, /APP ENTRY v4\.11q/);
assert.match(bootstrap, /BOOTSTRAP v4\.11q/);
assert.match(desktop, /v4\.11q Desktop Compact VS Removal/);

console.log("current-v4.11q-checkpoint.test.mjs passed");
