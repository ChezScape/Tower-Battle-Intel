import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = file => readFileSync(file, "utf8");

const config = read("config/appConfig.js");
const desktop = read("desktop.css");
const mobile = read("mobile.css");
const topNav = read("src/ui/components/topNav.js");
const desktopView = read("src/ui/views/desktopView.js");
const mobileView = read("src/ui/views/mobileView.js");
const events = read("src/ui/events.js");
const bootstrap = read("bootstrap.js");
const index = read("index.html");
const buildReport = read("docs/BUILD_REPORT_v4.11z52w15.md");

assert.ok(config.includes('version: "v4.11z52"'));
assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.ok(topNav.includes('title="Visible test build"'));
assert.ok(buildReport.includes("Command Deck"));
assert.ok(existsSync("docs/BUILD_HISTORY_INDEX.md"));

assert.ok(desktopView.includes("buildDashboardVisualShell"));
assert.ok(desktopView.includes("buildCommandDeckView"));
assert.ok(desktopView.includes("buildHistoryShell"));
assert.ok(desktopView.includes("buildHistoryView"));
assert.equal(desktopView.includes("buildHistoryView"), true);
assert.equal(desktopView.includes("buildSystemsMatrix"), false);
assert.ok(mobileView.includes("data-mobile-dashboard-visual-shell"));

assert.ok(events.includes("UI EVENT MODULE LOADER v4.11z52w29"));
assert.equal(bootstrap.includes("bindCoreEvents"), false);
assert.equal(bootstrap.includes("systemsKnowledgeBridge"), false);
assert.equal(bootstrap.includes("metricTableDiffToggleBridge"), false);
assert.equal(index.includes("platformIsolationGuard.js"), false);
assert.equal(index.includes("desktopPolishGuard.js"), false);

const desktopImports = [...desktop.matchAll(/@import "\.\/styles\/desktop\/([^"]+\.css)"/g)].map(match => match[1]);
const mobileImports = [...mobile.matchAll(/@import "\.\/styles\/mobile\/([^"]+\.css)"/g)].map(match => match[1]);
assert.equal(desktopImports.includes("11-workspace-reset.css"), true);
assert.deepEqual(mobileImports, [
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
]);
assert.ok(mobile.includes("v4.11z52b tab-ordered blank mobile module loader"));

console.log("v4.11z52 current rollback branch shell reset test passed.");
