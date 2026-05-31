import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
    getState,
    setState,
    hydrateState,
    resetState,
    normaliseHistoryFilters
} from "../src/core/state.js";

import {
    saveStorage,
    loadStorage,
    clearStorage,
    readSavedHistoryCandidates,
    getStorageKey
} from "../src/storage/localStore.js";

import {
    parser
} from "../src/pipeline/parser.js";

import {
    compute
} from "../src/core/compute.js";

import {
    getVisibleHistoryEntries
} from "../src/history/historyFilters.js";

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

const sampleText = fs.readFileSync("tests/fixtures/Battle_Report_T11.txt", "utf8");
const parsed = parser(sampleText);
const run = compute(parsed);
run.meta = {
    ...(run.meta || {}),
    reportId: parsed.meta.reportId,
    buildStyle: "hybrid",
    tags: ["Farm", "Cells", "farm"]
};

const duplicateRun = structuredClone(run);

// Parser / compute contract: exact raw report values must stay usable by future UI shells.
assert.equal(run.core.tier, 11);
assert.equal(run.core.wave, 12147);
assert.equal(run.core.killedBy, "Scatter");
assert.equal(parsed.meta.reportCount, 1);
assert.ok(parsed.meta.reportId, "parser should produce a stable report id");
assert.ok(run.raw?.parsed, "computed run should retain parsed/raw context for deep report search and Game Brain reconnect");

// State contract: History Normal/Deep mode must survive normalisation, setState, and hydrateState.
assert.equal(normaliseHistoryFilters({ mode: "deep" }).mode, "deep");
assert.equal(normaliseHistoryFilters({ searchMode: "deep" }).mode, "deep");
resetState();
setState({ ui: { historyFilters: { query: "ray", mode: "deep", showArchived: true } } });
assert.equal(getState().ui.historyFilters.mode, "deep");
assert.equal(getState().ui.historyFilters.query, "ray");
hydrateState({ history: [run], ui: { historyFilters: { query: "ray", mode: "deep" } } });
assert.equal(getState().ui.historyFilters.mode, "deep");
assert.equal(getState().history.length, 1);

// Run A/B contract: duplicate saved values are cleaned to one selected slot.
resetState();
setState({ runA: run, runB: duplicateRun, currentRun: duplicateRun });
assert.equal(getState().runA, null, "state should clear duplicate Run A when Run B is the preferred latest slot");
assert.equal(getState().runB.meta.reportId, run.meta.reportId);
assert.equal(getState().currentRun.meta.reportId, run.meta.reportId);

// localStore contract: save/load must preserve history shape, filters, and Run A/B distinctness.
clearStorage();
const storedState = {
    runA: run,
    runB: duplicateRun,
    currentRun: duplicateRun,
    history: [run],
    ui: { historyFilters: { query: "ray", mode: "deep", showArchived: true }, buildStyle: "hybrid" }
};
assert.equal(saveStorage(storedState), true);
const loaded = loadStorage();
assert.equal(loaded.runA, null, "localStore should also clean duplicate Run A when saving/loading");
assert.equal(loaded.runB.meta.reportId, run.meta.reportId);
assert.equal(loaded.history.length, 1);
assert.equal(loaded.history[0].meta.reportId, run.meta.reportId);
assert.equal(loaded.history[0].meta.buildStyle, "hybrid");
assert.deepEqual(loaded.history[0].meta.tags, ["farm", "cells"]);
assert.equal(loaded.ui.historyFilters.mode, "deep");

const candidates = readSavedHistoryCandidates();
assert.equal(candidates.filter(candidate => candidate.source === getStorageKey()).length, 1, "localStore history candidates should not duplicate the primary source");
assert.equal(candidates[0].history[0].meta.reportId, run.meta.reportId);

// History search contract: normal search should not match raw labels such as Death Ray unless visible facts match; deep can use raw report evidence.
const rayKilledRun = structuredClone(run);
rayKilledRun.core.killedBy = "Ray";
rayKilledRun.meta.reportId = "visible-ray-kill";
const nonRayRun = structuredClone(run);
nonRayRun.core.killedBy = "Boss";
nonRayRun.meta.reportId = "raw-labels-only";
nonRayRun.raw = { reportText: "Records\nDeath Ray Kills\t123", originalText: "Records\nDeath Ray Kills\t123" };
assert.equal(getVisibleHistoryEntries([nonRayRun], { query: "ray", mode: "normal" }).length, 0);
assert.equal(getVisibleHistoryEntries([nonRayRun], { query: "ray", mode: "deep" }).length, 1);
assert.equal(getVisibleHistoryEntries([rayKilledRun], { query: "ray", mode: "normal" }).length, 1);

// Catalogue/game contract: JSON files must remain readable and safe-boundary manifests must stay explicit.
const jsonFiles = [];
function collectJson(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) collectJson(full);
        else if (entry.name.endsWith(".json")) jsonFiles.push(full);
    }
}
collectJson("game");
for (const file of jsonFiles) {
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(file, "utf8")), `${file} should parse as JSON`);
}
const v28_2Battle = JSON.parse(fs.readFileSync("game/the-tower-v28.2.0/battleHistoryEntryPropertiesFromMetadata.json", "utf8"));
const v28_2Wrapped = JSON.parse(fs.readFileSync("game/the-tower-v28.2.0/towerWrappedStatsPropertiesFromMetadata.json", "utf8"));
const v28_2Deep = JSON.parse(fs.readFileSync("game/the-tower-v28.2.0/deepUsefulExtraction.json", "utf8"));
assert.equal(v28_2Battle.entryCount, 142);
assert.equal(v28_2Wrapped.entryCount, 62);
assert.equal(v28_2Deep.counts.baselineSchemaFieldsStillPresent, 142);
for (const manifest of [v28_2Battle.manifest, v28_2Wrapped.manifest, v28_2Deep.manifest]) {
    assert.ok(manifest.safePurpose?.length, "catalogue manifest should state safe uses");
    assert.ok(manifest.notSafePurpose?.includes("hidden formulas"), "catalogue manifest should keep hidden-formula boundary visible");
}

console.log("v4.11z52w8 bones contract test passed");
