import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildHistoryView } from "../src/ui/sections/history/historyView.js";
import { buildHistoryStatsModal, HISTORY_STATS_MODAL_REBUILD_VERSION } from "../src/ui/sections/history/historyStatsModal.js";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const config = read("config/appConfig.js");
const indexHtml = read("index.html");
const statsCss = read("styles/desktop/04-history-stats-modal.css");
const desktopCss = read("desktop.css");
const workspaceEvents = read("src/ui/events/workspaceEvents.js");

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.ok(indexHtml.includes('data-app-shell="v4.11z52w29"'));
assert.equal(HISTORY_STATS_MODAL_REBUILD_VERSION, "v4.11z52w29");

assert.ok(desktopCss.includes("04-history-stats-modal.css"), "desktop CSS must import the rebuilt stats modal CSS");
assert.ok(statsCss.includes(':where(html.desktop-polish, html.device-desktop, html[data-device-mode="desktop"]) .tbi-history2-stats-modal'), "stats modal CSS must apply when index.html only adds device-desktop/data-device-mode");
assert.ok(statsCss.includes("position: fixed"), "stats modal root must be a fixed overlay, not inline under a run card");
assert.ok(statsCss.includes("place-items: center"), "stats modal overlay must centre the modal card");
assert.ok(statsCss.includes("z-index: 90"), "stats modal overlay must sit above the History card area");
assert.equal(statsCss.includes("html.desktop-polish .tbi-history2-stats-modal"), false, "stats modal CSS must not depend only on the unloaded desktopPolishGuard class");

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
    meta: {
        reportId: "tbi-report-test-ray-7609",
        fingerprint: "fp-test"
    },
    raw: {
        reportText: "Battle Report\nBattle Date\tMay 07, 2026 17:09\nTier\t11\nWave\t7609\nKilled By\tRay"
    }
};

const historyHtml = buildHistoryView({ history: [sampleRun] });
assert.ok(historyHtml.includes('id="historyStatsModalMount"'), "rebuilt History view must include the stats modal mount once");
assert.ok(historyHtml.indexOf('id="historyStatsModalMount"') > historyHtml.indexOf('tbi-history2-workspace'), "modal mount should sit after the main History workspace, not inside a run-card body");

const modalHtml = buildHistoryStatsModal({ run: sampleRun, index: 0, displayIndex: 0, history: [sampleRun], visibleHistory: [sampleRun] });
assert.ok(modalHtml.includes('class="tbi-history2-stats-modal active"'));
assert.ok(modalHtml.includes('data-history-stats-modal="v4.11z52w29"'));
assert.equal(modalHtml.includes('history-stats-card phase3'), false, "old inline/phase3 modal class must not render");
assert.equal(modalHtml.includes('class="history-stats-modal'), false, "old stats modal root class must not render");

assert.ok(workspaceEvents.includes('document.getElementById("historyStatsModalMount")'), "workspace events must render stats into the dedicated modal mount");
assert.ok(workspaceEvents.includes('buildHistoryStatsModal'), "workspace events must call the rebuilt History-owned stats modal");

console.log("v4.11z52w29 History Stats modal mount repair test passed");
