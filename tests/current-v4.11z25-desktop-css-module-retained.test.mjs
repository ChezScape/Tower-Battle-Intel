import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const desktop = fs.readFileSync(path.join(root, "desktop.css"), "utf8");
const mobile = fs.readFileSync(path.join(root, "mobile.css"), "utf8");
const config = fs.readFileSync(path.join(root, "config/appConfig.js"), "utf8");
const modulesDir = path.join(root, "styles/desktop");
const moduleMap = fs.readFileSync(path.join(root, "docs/CSS_MODULE_MAP_CURRENT.md"), "utf8");

assert.match(config, /version:\s*"v4\.11z52"/);
assert.ok(fs.existsSync(modulesDir), "styles/desktop folder should exist");
assert.match(desktop, /v4\.11z52b tab-ordered module loader/);
assert.doesNotMatch(desktop, /body\s*\{/);
assert.doesNotMatch(desktop, /\.tbi-card\s*\{/);

const imports = [...desktop.matchAll(/@import\s+"\.\/styles\/desktop\/([^"]+)"/g)].map(match => match[1]);
assert.ok(imports.length >= 17, "desktop.css should import the desktop modules");

const required = [
  "00-core.css",
  "01-header-nav.css",
  "03-dashboard-base.css",
  "03-dashboard-locked.css",
  "05-compare.css",
  "07-systems.css",
  "06-coach.css",
  "04-history-base.css",
  "04-history-main.css",
  "08-anomalies.css",
  "02-command-deck.css",
  "10-responsive-foundation.css"
];

for (const file of required) {
  assert.ok(imports.includes(file), `desktop.css should import ${file}`);
  assert.ok(fs.existsSync(path.join(modulesDir, file)), `${file} should exist`);
  assert.match(moduleMap, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

const dashboard = fs.readFileSync(path.join(modulesDir, "03-dashboard-locked.css"), "utf8");
const compare = fs.readFileSync(path.join(modulesDir, "05-compare.css"), "utf8");
const command = fs.readFileSync(path.join(modulesDir, "02-command-deck.css"), "utf8");
const history = fs.readFileSync(path.join(modulesDir, "04-history-main.css"), "utf8");

assert.match(dashboard, /body\[data-dashboard-tab="overview"\]/);
assert.match(dashboard, /tbi-metric-footer-action-row/);
assert.match(dashboard, /tbi-card-footer-action/);
assert.match(compare, /Compare bare restart foundation/);
assert.match(compare, /tbi-compare-workspace/);
assert.match(command, /desktop-command-layout-a5/);
assert.match(history, /history-panel-header/);
assert.match(mobile, /v4\.11z52b tab-ordered blank mobile module loader/);

const forbiddenActive = [
  "tbi-growth-focus-radio",
  "compareGrowthControlsBridge",
  "PulseGraph",
  "Architecture Observatory"
];
const allModules = imports.map(file => fs.readFileSync(path.join(modulesDir, file), "utf8")).join("\n");
for (const token of forbiddenActive) {
  assert.equal(allModules.includes(token), false, `${token} should not be present in desktop CSS modules`);
}

console.log("current-v4.11z25-desktop-css-module-split.test.mjs passed");
