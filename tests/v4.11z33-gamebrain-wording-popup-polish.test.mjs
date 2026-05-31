import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { parser } from "../src/pipeline/parser.js";
import { buildDashboardGameBrainStrip } from "../src/ui/sections/dashboardGameBrainStrip.js";
import { formatGameBrainSaveSummary } from "../src/game/gameBrainRuntimeFeedback.js";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const sample = fs.readFileSync(path.join(root, "tests/fixtures/Battle_Report_T11.txt"), "utf8");
const parsed = parser(sample);
const feedback = parsed?.meta?.gameBrainFeedback;
const saveSummary = formatGameBrainSaveSummary(feedback);
const stripHtml = buildDashboardGameBrainStrip({ runA: parsed, runB: parsed });
const events = fs.readFileSync(path.join(root, "src/ui/events.js"), "utf8");

assert.ok(saveSummary?.headline?.includes("Game Brain recognised"));
assert.ok(stripHtml.includes("Labels"));
assert.ok(stripHtml.includes("Mapping polish"));
assert.equal(stripHtml.includes("Unknown labels"), false);
assert.equal(fs.existsSync(path.join(root, "src/ui/universalDownloadBridge.js")), false);
assert.ok(events.includes("UI EVENT MODULE LOADER v4.11z52w29"), "active event loader should be the rebuilt module loader");
assert.equal(events.includes("downloadTextFile"), false, "old direct download bridge should stay removed");

console.log("v4.11z33 Game Brain wording compatibility test passed for shell reset.");
