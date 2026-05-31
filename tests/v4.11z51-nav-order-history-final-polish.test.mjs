import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const config = readFileSync(join(root, "config/appConfig.js"), "utf8");
const topNav = readFileSync(join(root, "src/ui/components/topNav.js"), "utf8");
const historyView = readFileSync(join(root, "src/ui/sections/historyView.js"), "utf8");
const historyCss = readFileSync(join(root, "styles/desktop/04-history-rebuild.css"), "utf8");

assert.ok(config.includes('version: "v4.11z52"'), "app version should be v4.11z52");

const order = [
    '["command", "Command Deck"]',
    '["overview", "Dashboard"]',
    '["history", "History"]',
    '["compare", "Compare"]',
    '["coach", "Coach"]',
    '["systems", "Systems"]',
    '["anomalies", "Anomalies"]',
    '["settings", "Settings"]'
];
let last = -1;
for (const item of order) {
    const index = topNav.indexOf(item);
    assert.ok(index > last, `nav item should appear in workflow order: ${item}`);
    last = index;
}

assert.ok(readFileSync(join(root, "src/ui/sections/history/historyInspector.js"), "utf8").includes("buildLibraryIntel"), "History should use a useful Library Intel helper");
assert.ok(readFileSync(join(root, "src/ui/sections/history/historyInspector.js"), "utf8").includes("Library Intel"), "History Library Intel should show useful visible-run pattern text");
assert.ok(historyCss.includes("v4.11z52w29 proper History visual rebuild"), "w18 History polish CSS marker should exist");

console.log("v4.11z52 nav order + History final polish test passed.");
