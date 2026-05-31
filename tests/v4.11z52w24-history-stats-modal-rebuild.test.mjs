import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildHistoryStatsModal, HISTORY_STATS_MODAL_REBUILD_VERSION } from "../src/ui/sections/history/historyStatsModal.js";
import { getWorkspaceEventStatus } from "../src/ui/events/workspaceEvents.js";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const exists = rel => fs.existsSync(path.join(root, rel));

const config = read("config/appConfig.js");
const desktopCss = read("desktop.css");
const workspaceEvents = read("src/ui/events/workspaceEvents.js");
const statsCss = read("styles/desktop/04-history-stats-modal.css");
const rulebook = read("docs/ARCHITECTURE_OWNERSHIP_RULES.md");

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.equal(HISTORY_STATS_MODAL_REBUILD_VERSION, "v4.11z52w29");

assert.equal(exists("src/ui/layouts/historyStatsModal.js"), false, "old active History Stats modal layout file should be deleted");
assert.ok(exists("src/ui/sections/history/historyStatsModal.js"), "rebuilt History-owned Stats modal should exist");
assert.equal(exists("styles/desktop/04-history-stats-polish.css"), false, "old History stats polish CSS module should be deleted");
assert.ok(workspaceEvents.includes('from "../sections/history/historyStatsModal.js"'), "workspaceEvents must import the rebuilt modal");
assert.equal(workspaceEvents.includes('../layouts/historyStatsModal.js'), false, "workspaceEvents must not import the old layout modal");
assert.ok(workspaceEvents.includes('.tbi-history2-stats-modal'), "workspaceEvents must route modal clicks through the rebuilt modal root");

assert.ok(desktopCss.includes('04-history-stats-modal.css'), "desktop CSS should import the rebuilt stats modal CSS owner");
assert.equal(desktopCss.includes('04-history-stats-polish.css'), false, "desktop CSS should not import the old stats polish module as the active stats modal owner");
assert.ok(statsCss.includes('.tbi-history2-stats-modal'), "new CSS should be scoped to the rebuilt modal namespace");

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
        currencies: {
            coinsEarned: 82.87e12,
            cellsEarned: 136.85e3
        },
        enemies_destroyed_by: {
            deathRay: 1234,
            thorns: 5678
        }
    },
    meta: {
        reportId: "tbi-report-test-ray-7609",
        fingerprint: "fp-test",
        buildStyle: "hybrid",
        tags: ["farm", "ray"]
    },
    raw: {
        reportText: "Battle Report\nBattle Date\tMay 07, 2026 17:09\nTier\t11\nWave\t7609\nKilled By\tRay"
    }
};

const html = buildHistoryStatsModal({
    run: sampleRun,
    index: 0,
    displayIndex: 30,
    history: [sampleRun],
    visibleHistory: [sampleRun],
    runA: null,
    runB: null
});

assert.ok(html.includes('class="tbi-history2-stats-modal active"'), "rebuilt modal class should render");
assert.ok(html.includes('data-history-stats-modal="v4.11z52w29"'), "modal should expose the rebuild marker");
assert.ok(html.includes('Run 31'), "modal should use display index for readable run number");
assert.ok(html.includes('T11 / Wave 7609'), "modal should keep exact Wave digits");
assert.ok(html.includes('Raw Archive Verified'), "modal should show raw archive proof");
assert.ok(html.includes('data-history-stats-tab="summary"'), "summary tab should exist");
assert.ok(html.includes('data-history-stats-tab="sections"'), "sections tab should exist");
assert.ok(html.includes('data-history-stats-tab="raw"'), "raw source tab should exist");
assert.ok(html.includes('data-history-modal-slot="runA"'), "modal Set Run A action should be preserved");
assert.ok(html.includes('data-history-modal-slot="runB"'), "modal Set Run B action should be preserved");
assert.ok(html.includes('data-history-stats-json="true"'), "copy/download JSON hook should be preserved");
assert.equal(html.includes('history-stats-card phase3'), false, "old phase3 modal card class must not render");
assert.equal(html.includes('class="history-stats-modal'), false, "old modal root class must not render");

const status = getWorkspaceEventStatus();
assert.equal(status.active, true);
assert.equal(status.version, "v4.11z52w29");

assert.ok(rulebook.includes("v4.11z52w29 History Stats Modal Ownership"), "RULE book should document the rebuilt stats modal ownership");

console.log("v4.11z52w29 History Stats modal rebuild current-version regression test passed");
