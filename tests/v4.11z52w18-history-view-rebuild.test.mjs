import assert from "node:assert/strict";
import fs from "node:fs";

import { buildDesktopWorkspace } from "../src/ui/views/desktopView.js";
import { buildHistoryView } from "../src/ui/sections/historyView.js";
import { createRawReportRecord } from "../src/storage/rawReportArchiveStore.js";

const raw = fs.readFileSync(new URL("./fixtures/Battle_Report_T11.txt", import.meta.url), "utf8");
const record = createRawReportRecord({ rawText: raw }, { rawText: raw, createdAt: "2026-05-30T00:00:00.000Z" });
const run = {
    core: {
        battleDate: record.summary.battleDate,
        tier: record.summary.tier,
        wave: record.summary.wave,
        killedBy: record.summary.killedBy,
        coins: 82870000000000,
        cells: 136850,
        time: 36395
    },
    stats: {
        coinsPerHour: 8200000000000,
        cellsPerHour: 13540
    },
    sections: {},
    raw: { reportText: raw },
    meta: {
        reportId: record.reportId,
        fingerprint: record.fingerprint,
        savedAt: "2026-05-30T00:00:00.000Z",
        buildStyle: "hybrid",
        tags: ["farm", "ray"],
        notes: "test note"
    }
};

const state = {
    history: [run],
    rawArchive: {
        schema: record.schema,
        version: "v4.11z52w29",
        reportCount: 1,
        reports: [record]
    },
    runA: run,
    ui: { dashboardTab: "history", activeView: "history", historyFilters: { mode: "normal" } }
};

const historyHTML = buildHistoryView(state);
assert.ok(historyHTML.includes('data-history-view-rebuild="v4.11z52w29"'), "History view should expose the w18 rebuild marker");
assert.ok(historyHTML.includes('class="tbi-view-stack tbi-history-clean-view tbi-history2"'), "History should render the new root class");
assert.ok(historyHTML.includes("Report Management Hub"), "History should show the rebuilt hub copy");
assert.ok(historyHTML.includes("Saved report cards"), "History should render the rebuilt card list");
assert.ok(historyHTML.includes("Selected Report"), "History should render the inspector");
assert.ok(historyHTML.includes("Set A"));
assert.ok(historyHTML.includes("Set B"));
assert.ok(historyHTML.includes("Open Stats"));
assert.ok(historyHTML.includes("Wave 12147"), "Exact wave digits should be visible, not compact K formatting");
assert.ok(!historyHTML.includes("W12.15K"), "History must not compact exact waves into K notation");
assert.ok(!historyHTML.includes("History wiring disconnected"), "Rebuilt History should not show parked-shell wording");

const desktopHTML = buildDesktopWorkspace("history", state);
assert.ok(desktopHTML.includes('data-ui-shell-reset="v4.11z52w29"'), "Desktop shell should expose the w18 shell marker");
assert.ok(desktopHTML.includes('data-dashboard-panel="history"'), "Desktop should still own a history panel");
assert.ok(desktopHTML.includes('data-history-view-rebuild="v4.11z52w29"'), "Desktop History panel must mount the real rebuilt History view");
assert.ok(!desktopHTML.includes("Saved-run shell"), "Desktop History panel must not mount the old parked shell");

const expectedFiles = [
    "src/ui/sections/history/historyView.js",
    "src/ui/sections/history/historyHeader.js",
    "src/ui/sections/history/historyToolbar.js",
    "src/ui/sections/history/historyRunList.js",
    "src/ui/sections/history/historyRunCard.js",
    "src/ui/sections/history/historyInspector.js",
    "src/ui/sections/history/historyEmptyState.js",
    "src/ui/sections/history/historyModalMounts.js",
    "src/ui/sections/history/historyShared.js",
    "styles/desktop/04-history-rebuild.css"
];

for (const file of expectedFiles) {
    assert.ok(fs.existsSync(new URL(`../${file}`, import.meta.url)), `${file} should exist for the modular History rebuild`);
}

const desktopCss = fs.readFileSync(new URL("../desktop.css", import.meta.url), "utf8");
assert.ok(desktopCss.includes("04-history-rebuild.css"), "desktop.css should import the w18 History rebuild stylesheet");

const desktopView = fs.readFileSync(new URL("../src/ui/views/desktopView.js", import.meta.url), "utf8");
assert.ok(desktopView.includes('import { buildHistoryView } from "../sections/historyView.js";'));
assert.ok(desktopView.includes("return buildHistoryView(state);"));

const config = fs.readFileSync(new URL("../config/appConfig.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.ok(index.includes('data-app-shell="v4.11z52w29"'));

console.log("v4.11z52w29 History view rebuild test passed");
