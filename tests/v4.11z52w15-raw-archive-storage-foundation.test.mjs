import assert from "node:assert/strict";
import fs from "node:fs";

import {
    RAW_REPORT_ARCHIVE_SCHEMA,
    ACTIVE_PARSED_HISTORY_LIMIT,
    createStableReportId,
    createRawReportFingerprint,
    createRawReportRecord,
    attachRawArchiveMetaToRun,
    buildRawArchiveFromRuns,
    normaliseRawArchive,
    sameRawReportIdentity
} from "../src/storage/rawReportArchiveStore.js";
import { normaliseHistoryRuns } from "../src/storage/historyStore.js";
import { normaliseComparisonSlotsForStorage } from "../src/storage/runSlotStore.js";
import { saveStorage, loadStorage, clearStorage, getLocalStoreStatus } from "../src/storage/localStore.js";

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

const raw = `Battle Report
Battle Date	May 07, 2026 17:09
Tier	11
Wave	7609
Killed By	Ray
Coins Earned	82.87T`;
const rawSpaced = ` Battle Report
Battle Date	May 07, 2026 17:09
Tier	11
Wave	7609
Killed By	Ray
Coins Earned	82.87T `;

const idA = createStableReportId(raw);
const idB = createStableReportId(rawSpaced);
assert.equal(idA, idB, "same report text should regenerate the same stable reportId");
assert.match(idA, /^rpt_20260507_1709_t11_w7609_[a-f0-9]{12}$/);
assert.equal(createRawReportFingerprint(raw), createRawReportFingerprint(rawSpaced));

const parsedRun = {
    core: {
        battleDate: "May 07, 2026 17:09",
        tier: 11,
        wave: 7609,
        killedBy: "Ray"
    },
    meta: {
        tags: ["farm", "cells"],
        notes: "Good cells run",
        buildStyle: "hybrid"
    }
};

const withRaw = attachRawArchiveMetaToRun(parsedRun, raw);
assert.equal(withRaw.meta.reportId, idA);
assert.equal(withRaw.raw.reportText, raw);
assert.equal(withRaw.meta.rawArchiveSchema, RAW_REPORT_ARCHIVE_SCHEMA);

const record = createRawReportRecord(withRaw);
assert.equal(record.reportId, idA);
assert.equal(record.summary.wave, 7609);
assert.deepEqual(record.userMeta.tags, ["farm", "cells"]);
assert.equal(record.userMeta.notes, "Good cells run");
assert.equal(record.userMeta.buildStyle, "hybrid");

const archive = buildRawArchiveFromRuns([withRaw, withRaw]);
assert.equal(archive.reportCount, 1, "duplicate raw report records should collapse into one");
assert.equal(archive.activeParsedHistoryLimit, ACTIVE_PARSED_HISTORY_LIMIT);
assert.equal(normaliseRawArchive(archive).reports.length, 1);
assert.equal(sameRawReportIdentity(withRaw, record), true);

const history = normaliseHistoryRuns([withRaw, withRaw]);
assert.equal(history.length, 1, "History storage normalisation should block duplicate reports");

const guarded = normaliseComparisonSlotsForStorage({ runA: withRaw, runB: structuredClone(withRaw), currentRun: withRaw }, "runB");
assert.equal(guarded.runA, null, "Run A/B duplicate slot guard should clear the non-preferred duplicate slot");
assert.ok(guarded.runB);
assert.equal(guarded.meta.comparisonSlotGuard.cleanedDuplicate, true);

clearStorage();
assert.equal(saveStorage({ history: [withRaw, withRaw], runA: withRaw, runB: structuredClone(withRaw) }), true);
const loaded = loadStorage();
assert.equal(loaded.history.length, 1);
assert.equal(loaded.rawArchive.reportCount, 1);
assert.equal(loaded.rawArchive.reports[0].reportId, idA);
assert.equal(getLocalStoreStatus().modules.includes("rawReportArchiveStore.js"), true);

const config = fs.readFileSync("config/appConfig.js", "utf8");
const rulebook = fs.readFileSync("docs/ARCHITECTURE_OWNERSHIP_RULES.md", "utf8");
assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(rulebook.includes("Raw Battle Report text is the permanent source of truth"));
assert.ok(rulebook.includes("Duplicate reports are forbidden"));
assert.ok(rulebook.includes("src/storage/rawReportArchiveStore.js"));

console.log("v4.11z52w15 raw archive storage foundation test passed");
