import assert from "node:assert/strict";
import fs, { existsSync } from "node:fs";
import path from "node:path";

import { getGameBrainKnowledgeBaseStatus } from "../src/game/gameBrainKnowledgeBase.js";
import { buildTimeInfo } from "../src/diagnostics/systemHealthScan.js";
import { parser } from "../src/pipeline/parser.js";
import { getVisibleHistoryEntries, historyEntryMatchesQuery, buildHistoryEntrySearchText } from "../src/history/historyFilters.js";

const root = path.resolve(".");
const status = getGameBrainKnowledgeBaseStatus();
assert.equal(status.version, "v4.11z52w");
assert.equal(status.catalogueVersion, "v28.2-knowledge-base");
assert.ok(status.entryCount >= 215);

const events = fs.readFileSync(path.join(root, "src", "ui", "events.js"), "utf8");
assert.ok(events.includes("UI EVENT MODULE LOADER v4.11z52w29"));
assert.equal(events.includes("handleHistoryRootClick"), false, "old History root click bridge should stay removed");
assert.equal(events.includes("queueHistorySearchUpdate"), false, "old History search queue should stay removed");
assert.equal(events.includes("downloadTextFile"), false, "old direct export bridge should stay removed");

for (const removed of [
    "src/ui/globalSearchBridge.js",
    "src/ui/historySearchFocusGuard.js",
    "src/ui/nativeImportHardBridge.js",
    "src/ui/universalDownloadBridge.js",
    "src/ui/actionAuditBridge.js",
    "src/ui/liveInteractionBridge.js",
    "src/ui/finalControlPolishBridge.js",
    "src/ui/dev/inspectionPanel.js"
]) {
    assert.equal(existsSync(path.join(root, removed)), false, `${removed} should be removed`);
}

const time = buildTimeInfo(new Date("2026-05-28T11:20:50.948Z"));
assert.ok(time.exportedAtUTC);
assert.ok(time.exportedAtLocal);
assert.equal(Object.prototype.hasOwnProperty.call(time, "exportedAtUK"), false);

const sample = fs.readFileSync(path.join(root, "tests", "fixtures", "Battle_Report_T11.txt"), "utf8");
const parsedRun = parser(sample);
const visibleScatter = getVisibleHistoryEntries([parsedRun], { query: "scatter", sort: "newest", build: "all", tag: "all", showArchived: false });
const visibleWave = getVisibleHistoryEntries([parsedRun], { query: "12147", sort: "newest", build: "all", tag: "all", showArchived: false });
const rayRun = { ...parsedRun, core: { ...(parsedRun.core || {}), killedBy: "Ray" } };
const normalSearchText = buildHistoryEntrySearchText(parsedRun, 0, { mode: "normal" });
const deepSearchText = buildHistoryEntrySearchText(parsedRun, 0, { mode: "deep" });
assert.equal(visibleScatter.length, 1);
assert.equal(visibleWave.length, 1);
assert.equal(historyEntryMatchesQuery(rayRun, "ray", 0), true);
assert.equal(historyEntryMatchesQuery(parsedRun, "ray", 0), false);
assert.equal(historyEntryMatchesQuery(parsedRun, "ray", 0, { mode: "deep" }), true);
assert.equal(normalSearchText.includes("Death Ray"), false);
assert.equal(deepSearchText.includes("Death Ray") || deepSearchText.includes("Rays"), true);

const config = fs.readFileSync(path.join(root, "config", "appConfig.js"), "utf8");
assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));

console.log("v4.11z52w history/search bones compatibility test passed for shell reset.");
