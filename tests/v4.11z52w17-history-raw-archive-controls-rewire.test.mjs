import assert from "node:assert/strict";
import fs from "node:fs";

import { resetState, setState, getState } from "../src/core/state.js";
import {
    actionArchiveHistoryRun,
    actionRestoreHistoryRun,
    actionUpdateHistoryRunMeta,
    getHistoryActionStatus
} from "../src/actions/historyActions.js";
import { actionExportHistoryJSON } from "../src/actions/importExportActions.js";
import { getWorkspaceEventStatus } from "../src/ui/events/workspaceEvents.js";
import { buildHistoryView } from "../src/ui/sections/historyView.js";
import {
    createRawReportRecord,
    patchRawReportRecordUserMeta
} from "../src/storage/rawReportArchiveStore.js";

class LocalStorageMock {
    constructor() { this.store = new Map(); }
    get length() { return this.store.size; }
    key(index) { return Array.from(this.store.keys())[index] || null; }
    getItem(key) { return this.store.has(key) ? this.store.get(key) : null; }
    setItem(key, value) { this.store.set(key, String(value)); }
    removeItem(key) { this.store.delete(key); }
    clear() { this.store.clear(); }
}

global.localStorage = new LocalStorageMock();

const raw = fs.readFileSync(new URL("./fixtures/Battle_Report_T11.txt", import.meta.url), "utf8");
const record = createRawReportRecord({ rawText: raw }, { rawText: raw, createdAt: "2026-05-30T00:00:00.000Z" });
const run = {
    core: {
        battleDate: record.summary.battleDate,
        tier: record.summary.tier,
        wave: record.summary.wave,
        killedBy: record.summary.killedBy,
        coins: 1000,
        cells: 10,
        time: 120
    },
    stats: {
        coinsPerHour: 30000,
        cellsPerHour: 300
    },
    sections: {},
    raw: { reportText: raw },
    meta: {
        reportId: record.reportId,
        fingerprint: record.fingerprint,
        savedAt: "2026-05-30T00:00:00.000Z",
        buildStyle: "unknown",
        tags: []
    }
};

resetState();
setState({
    history: [run],
    rawArchive: {
        schema: record.schema,
        version: "v4.11z52w29",
        reportCount: 1,
        reports: [record]
    },
    ui: { dashboardTab: "history", activeView: "history" }
});

const eventStatus = getWorkspaceEventStatus();
assert.equal(eventStatus.active, true, "Workspace event owner should be active in w21");
assert.equal(eventStatus.phase, "hard-event-owner-rebuild");
assert.ok(eventStatus.owns.includes("History cards/search/filter/modals"));
assert.equal(eventStatus.oldParkedCatchAllActive, false);

const actionStatus = getHistoryActionStatus();
assert.equal(actionStatus.activeInShell, true, "History actions should no longer be parked");
assert.ok(actionStatus.owns.includes("raw archive user metadata sync"));

const patched = patchRawReportRecordUserMeta(getState().rawArchive, run, {
    notes: "manual patch",
    tags: "farm, raw",
    buildStyle: "hybrid"
});
assert.equal(patched.reports[0].userMeta.notes, "manual patch");
assert.deepEqual(patched.reports[0].userMeta.tags, ["farm", "raw"]);
assert.equal(patched.reports[0].userMeta.buildStyle, "hybrid");

const archivedHistory = actionArchiveHistoryRun(0);
assert.equal(archivedHistory[0].meta.archived, true);
assert.equal(getState().rawArchive.reports[0].userMeta.archived, true, "Archive action should sync into raw archive metadata");
assert.ok(getState().rawArchive.reports[0].userMeta.archivedAt);

const restoredHistory = actionRestoreHistoryRun(0);
assert.equal(restoredHistory[0].meta.archived, false);
assert.equal(getState().rawArchive.reports[0].userMeta.archived, false, "Restore action should sync into raw archive metadata");

const updated = actionUpdateHistoryRunMeta(0, {
    notes: "tested from History edit",
    tags: "coin farm",
    buildStyle: "hybrid"
});
assert.equal(updated.meta.notes, "tested from History edit");
assert.equal(getState().rawArchive.reports[0].userMeta.notes, "tested from History edit");
assert.deepEqual(getState().rawArchive.reports[0].userMeta.tags, ["coin", "farm"]);
assert.equal(getState().rawArchive.reports[0].userMeta.buildStyle, "hybrid");

const exportPayload = JSON.parse(actionExportHistoryJSON());
assert.equal(exportPayload.rawArchive.reportCount, 1, "History export should carry rawArchive alongside parsed History");

const historyHTML = buildHistoryView(getState());
assert.ok(historyHTML.includes("Raw archive"));
assert.ok(historyHTML.includes("Source: raw archive"));
assert.ok(historyHTML.includes("data-history-raw-archive-controls=\"v4.11z52w29\""));

const eventIndex = fs.readFileSync(new URL("../src/ui/events/index.js", import.meta.url), "utf8");
assert.ok(eventIndex.includes("handleWorkspaceClick"));
assert.ok(eventIndex.includes("handleWorkspaceChange"));
assert.ok(eventIndex.includes("handleWorkspaceInput"));
assert.equal(eventIndex.includes("handleParkedActionClick"), false, "old parked fallback should be removed");

const config = fs.readFileSync(new URL("../config/appConfig.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.ok(index.includes('data-app-shell="v4.11z52w29"'));

console.log("v4.11z52w29 History raw archive controls rewire test passed");
