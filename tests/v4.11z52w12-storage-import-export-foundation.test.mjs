import assert from "node:assert/strict";
import fs from "node:fs";

import {
    STORAGE_KEY,
    BACKUP_KEY,
    LEGACY_KEYS,
    getStorageKeyStatus
} from "../src/storage/storageKeys.js";
import {
    saveStorage,
    loadStorage,
    clearStorage,
    exportStorage,
    importStorage,
    readRawStorageSnapshot,
    readSavedHistoryCandidates,
    inspectStorageExportSources,
    getLocalStoreStatus,
    getStorageKey
} from "../src/storage/localStore.js";
import { parseImportJSON } from "../src/storage/importStore.js";
import { createExportJSONString, pickBestHistoryCandidate } from "../src/storage/exportStore.js";
import { normaliseHistoryFilters, normaliseHistoryRuns } from "../src/storage/historyStore.js";
import { normaliseComparisonSlotsForStorage } from "../src/storage/runSlotStore.js";

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

const index = fs.readFileSync("index.html", "utf8");
const config = fs.readFileSync("config/appConfig.js", "utf8");
const localStore = fs.readFileSync("src/storage/localStore.js", "utf8");
const appInit = fs.readFileSync("src/app/init.js", "utf8");
const buildReport = fs.readFileSync("docs/BUILD_REPORT_v4.11z52w12.md", "utf8");

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.ok(index.includes('<link rel="icon" href="data:,">'), "index should stop favicon.ico 404 noise");
assert.ok(index.includes('data-app-shell="v4.11z52w29"'), "index should expose the shell checkpoint");
assert.equal(index.includes('id="input"'), false, "static Command Deck input should not remain in index shell");
assert.equal(index.includes('id="saveReport"'), false, "static Command Deck buttons should not remain in index shell");
assert.equal(index.includes('mobileCommandRail'), false, "old mobile rail controls should be removed from static index shell");
assert.ok(index.includes('./app.js'), "index should remain a module entry shell");

for (const file of [
    "src/storage/storageKeys.js",
    "src/storage/storageUtils.js",
    "src/storage/historyStore.js",
    "src/storage/runSlotStore.js",
    "src/storage/importStore.js",
    "src/storage/exportStore.js"
]) {
    assert.ok(fs.existsSync(file), `${file} should exist after storage split`);
}

assert.ok(localStore.includes("LOCAL STORE COMPATIBILITY WRAPPER v4.11z52w12"));
assert.ok(localStore.includes("./storageKeys.js"));
assert.ok(localStore.includes("./historyStore.js"));
assert.ok(localStore.includes("./runSlotStore.js"));
assert.ok(localStore.includes("./importStore.js"));
assert.ok(localStore.includes("./exportStore.js"));
assert.ok(appInit.includes("storedLastInput"), "app init should preserve stored draft text while input is parked");
assert.ok(buildReport.includes("storage/import/export foundation"));

assert.equal(STORAGE_KEY, "towerBattleIntel.state.v1");
assert.equal(BACKUP_KEY, "towerBattleIntel.state.backup.v1");
assert.ok(LEGACY_KEYS.includes("towerBattleIntel.state"));
assert.equal(getStorageKey(), STORAGE_KEY);
assert.equal(getStorageKeyStatus().schema, 1);

const runA = {
    meta: { reportId: "same-run", tags: "#Farm cells Farm", build: "Hybrid" },
    core: { battleDate: "May 07, 2026 17:09", tier: 11, wave: 7609, coins: 82.87, cells: 136.85, killedBy: "Ray" }
};
const runB = structuredClone(runA);

const slotPayload = normaliseComparisonSlotsForStorage({ runA, runB, currentRun: runB }, "runB");
assert.equal(slotPayload.runA, null, "duplicate Run A/B values should be cleaned by split runSlotStore");
assert.equal(slotPayload.runB.meta.reportId, "same-run");

assert.equal(normaliseHistoryFilters({ searchMode: "deep" }).mode, "deep");
assert.deepEqual(normaliseHistoryRuns([runA])[0].meta.tags, ["farm", "cells"]);
assert.equal(normaliseHistoryRuns([runA])[0].meta.buildStyle, "hybrid");

clearStorage();
const savedState = {
    runA,
    runB,
    currentRun: runB,
    history: [runA],
    ui: { historyFilters: { query: "ray", mode: "deep", showArchived: true }, buildStyle: "hybrid" },
    lastInput: "Battle Report draft should survive shell index cleanup"
};
assert.equal(saveStorage(savedState), true);
const loaded = loadStorage();
assert.equal(loaded.runA, null);
assert.equal(loaded.runB.meta.reportId, "same-run");
assert.equal(loaded.history.length, 1);
assert.equal(loaded.ui.historyFilters.mode, "deep");
assert.equal(loaded.lastInput, "Battle Report draft should survive shell index cleanup");

const raw = readRawStorageSnapshot();
assert.equal(raw.storageKey, STORAGE_KEY);
assert.equal(raw.backupKey, BACKUP_KEY);
assert.ok(raw.primary);

const candidates = readSavedHistoryCandidates();
assert.equal(candidates.length, 1, "primary history candidate should not duplicate itself");
assert.equal(candidates[0].source, STORAGE_KEY);
assert.equal(candidates[0].history[0].meta.reportId, "same-run");

const sourceSummary = inspectStorageExportSources();
assert.equal(sourceSummary.bestCandidateSource, STORAGE_KEY);
assert.equal(sourceSummary.bestCandidateHistoryCount, 1);
assert.equal(sourceSummary.rawPrimaryPresent, true);

const exported = JSON.parse(exportStorage());
assert.equal(exported.history.length, 1);
assert.equal(exported.ui.historyFilters.mode, "deep");
assert.equal(createExportJSONString({ ok: true }), '{\n  "ok": true\n}');
assert.equal(pickBestHistoryCandidate([{ source: "a", history: [] }, { source: "b", history: [runA] }]).source, "b");

assert.equal(parseImportJSON("{}").ok, true);
assert.equal(parseImportJSON("not json").ok, false);
assert.equal(importStorage(JSON.stringify(savedState)), true);
assert.equal(getLocalStoreStatus().role, "compatibility-wrapper");

console.log("v4.11z52w12 storage/import/export foundation test passed");
