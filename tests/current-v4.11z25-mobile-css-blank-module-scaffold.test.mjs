import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const config = fs.readFileSync(path.join(root, "config/appConfig.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const desktop = fs.readFileSync(path.join(root, "desktop.css"), "utf8");
const mobile = fs.readFileSync(path.join(root, "mobile.css"), "utf8");
const desktopModules = fs.readdirSync(path.join(root, "styles/desktop")).filter(name => name.endsWith(".css"));
const mobileModules = fs.readdirSync(path.join(root, "styles/mobile")).filter(name => name.endsWith(".css")).sort();

assert.match(config, /version:\s*"v4\.11z52"/);
assert.match(app, /APP ENTRY v4\.11z52/);
assert.match(desktop, /v4\.11z24 module loader|desktop\.css/);
assert.match(desktop, /styles\/desktop\/03-dashboard-locked\.css/);
assert.match(desktop, /styles\/desktop\/05-compare\.css/);
assert.equal(desktopModules.length >= 10, true, "desktop modules should still exist");

assert.match(mobile, /v4\.11z52b tab-ordered blank mobile module loader/);
assert.match(mobile, /styles\/mobile\/00-mobile-core\.css/);
assert.match(mobile, /styles\/mobile\/10-mobile-responsive-foundation\.css/);
assert.equal(mobile.includes("tbi-card"), false, "mobile.css should not contain old active styling");
assert.equal(mobile.includes("mobile-report-fab"), false, "mobile.css should not contain old active mobile UI styling");

const expected = [
  "00-mobile-core.css",
  "01-mobile-shell.css",
  "02-mobile-command-deck.css",
  "03-mobile-dashboard.css",
  "04-mobile-history.css",
  "05-mobile-compare.css",
  "06-mobile-coach.css",
  "07-mobile-systems.css",
  "08-mobile-anomalies.css",
  "09-mobile-settings-debug.css",
  "10-mobile-responsive-foundation.css"
];
assert.deepEqual(mobileModules, expected);
for (const file of expected) {
  const text = fs.readFileSync(path.join(root, "styles/mobile", file), "utf8");
  assert.match(text, /Intentionally empty in v4\.11z25/);
}

console.log("current-v4.11z25-mobile-css-blank-module-scaffold.test.mjs passed");
