import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildHistoryStatsModal, HISTORY_STATS_MODAL_REBUILD_VERSION } from "../src/ui/sections/history/historyStatsModal.js";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const workspaceEvents = read("src/ui/events/workspaceEvents.js");
const modalSource = read("src/ui/sections/history/historyStatsModal.js");

assert.equal(HISTORY_STATS_MODAL_REBUILD_VERSION, "v4.11z52w29");

assert.ok(workspaceEvents.includes("function handleStatsModalControlClick"), "workspace events must have a modal-first control handler");
assert.ok(workspaceEvents.includes("if (handleStatsModalControlClick(event, target, context)) return true"), "modal controls must be checked before broad History controls");
assert.ok(workspaceEvents.includes("closeStatsModal(modal)"), "Close must clear the specific modal/mount, not rely only on generic History routing");
assert.ok(workspaceEvents.includes("setStatsModalTab(view, modal)"), "Stats tabs must target the active modal directly");
assert.ok(workspaceEvents.includes("normaliseStatsTab"), "Stats tab names must be normalised for Summary/Sections/Raw clicks");
assert.ok(workspaceEvents.includes("downloadStatsJSON(modal.ownerDocument || document, modal)"), "Download JSON must use the active modal root as its source");

assert.ok(modalSource.includes('data-ui-action="history-stats-close"'), "Close button should expose a specific action for the click truth probe");
assert.ok(modalSource.includes('data-ui-action="history-stats-tab-${escapeAttr(view)}"'), "Stats tab buttons should expose specific actions for the click truth probe");
assert.ok(modalSource.includes('data-ui-action="history-stats-copy"'), "Copy JSON should expose a specific action for the click truth probe");
assert.ok(modalSource.includes('data-ui-action="history-stats-download"'), "Download JSON should expose a specific action for the click truth probe");

const sampleRun = {
    core: {
        battleDate: "May 07, 2026 17:09",
        tier: 11,
        wave: 7609,
        killedBy: "Ray",
        coins: 82.87e12,
        cells: 136.85e3,
        realTime: 36395
    },
    stats: {
        coinsPerHour: 8.2e12,
        cellsPerHour: 13.54e3
    },
    sections: {
        economy: { "Coins Earned": 82.87e12 },
        records: { "Largest Wave Skip": 5 }
    },
    meta: {
        reportId: "tbi-report-test-ray-7609",
        fingerprint: "fp-test"
    },
    raw: {
        reportText: "Battle Report\nBattle Date\tMay 07, 2026 17:09\nTier\t11\nWave\t7609\nKilled By\tRay"
    }
};

const modalHtml = buildHistoryStatsModal({ run: sampleRun, index: 0, displayIndex: 0, history: [sampleRun], visibleHistory: [sampleRun] });
assert.ok(modalHtml.includes('data-history-stats-close="true"'), "modal must render the rebuilt close control");
assert.ok(modalHtml.includes('data-history-stats-tab="summary"'), "modal must render Summary tab control");
assert.ok(modalHtml.includes('data-history-stats-tab="sections"'), "modal must render Sections tab control");
assert.ok(modalHtml.includes('data-history-stats-tab="raw"'), "modal must render Raw Source tab control");
assert.ok(modalHtml.includes('data-history-stats-download="true"'), "modal must render Download JSON control");
assert.ok(modalHtml.includes('data-history-stats-json="true"'), "modal must include parsed JSON source for copy/download");

console.log("v4.11z52w29 History Stats modal control routing test passed");
