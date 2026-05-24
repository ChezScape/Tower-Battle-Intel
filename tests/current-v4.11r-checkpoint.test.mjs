import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = readFileSync("./config/appConfig.js", "utf8");
const desktop = readFileSync("./desktop.css", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");

assert.match(config, /version:\s*"v4\.11r"/);
assert.match(desktop, /v4\.11r Desktop Quick Actions Mockup Rematch/);
assert.equal(mobile.includes("v4.11r Desktop Quick Actions Mockup Rematch"), false);

console.log("current-v4.11r-checkpoint.test.mjs passed");
