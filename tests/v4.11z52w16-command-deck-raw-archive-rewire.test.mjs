import assert from "node:assert/strict";
import fs from "node:fs";

import { resetState, getState } from "../src/core/state.js";
import {
    actionSaveReportFromInput,
    actionValidateReportFromInput,
    actionClearInput,
    getCommandDeckActionStatus
} from "../src/actions/commandDeckActions.js";
import {
    buildCommandDeckRawIntakePlan,
    joinCommandDeckRawReports,
    COMMAND_DECK_RAW_INTAKE_VERSION
} from "../src/actions/commandDeckRawIntake.js";
import { loadStorage, clearStorage } from "../src/storage/localStore.js";

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

resetState();
clearStorage();

const rawA = fs.readFileSync(new URL("./fixtures/Battle_Report_T11.txt", import.meta.url), "utf8");
const rawB = fs.readFileSync(new URL("./fixtures/Battle_Report_T12.txt", import.meta.url), "utf8");

const initialPlan = buildCommandDeckRawIntakePlan(rawA, getState());
assert.equal(initialPlan.version, COMMAND_DECK_RAW_INTAKE_VERSION);
assert.equal(initialPlan.newRecords.length, 1, "fresh raw report should be planned as new");
assert.equal(initialPlan.duplicateRecords.length, 0);
assert.match(initialPlan.newIds[0], /^rpt_\d{8}_\d{4}_t11_w12147_[a-f0-9]{12}$/);
assert.equal(joinCommandDeckRawReports(initialPlan.newRecords).includes("Battle Report"), true);

const validateFeedback = actionValidateReportFromInput({ value: rawA });
assert.equal(validateFeedback.status, "checked");
assert.equal(validateFeedback.loaded, false);
assert.equal(validateFeedback.candidateIds[0], initialPlan.newIds[0]);
assert.equal(getState().history.length, 0, "Validate must not save History");

const firstSave = actionSaveReportFromInput({ value: rawA });
assert.equal(firstSave.status, "saved");
assert.equal(firstSave.loaded, true);
assert.equal(firstSave.addedIds.length, 1);
assert.equal(firstSave.rawArchivedIds.length, 1, "Save should archive raw source first");
assert.equal(firstSave.addedIds[0], firstSave.rawArchivedIds[0], "parsed History ID should match raw archive ID");
assert.match(firstSave.reportId, /^rpt_/);
assert.ok(firstSave.message.includes("Raw source archived first"));
assert.equal(getState().history.length, 1);
assert.equal(getState().rawArchive.reportCount, 1);
assert.equal(loadStorage().rawArchive.reportCount, 1);

const duplicatePlan = buildCommandDeckRawIntakePlan(rawA, getState());
assert.equal(duplicatePlan.newRecords.length, 0);
assert.equal(duplicatePlan.duplicateRecords.length, 1, "saved raw report should be detected as duplicate before parsing");

const duplicateSave = actionSaveReportFromInput({ value: rawA });
assert.equal(duplicateSave.status, "duplicate");
assert.equal(duplicateSave.loaded, false);
assert.equal(duplicateSave.addedIds.length, 0);
assert.equal(duplicateSave.duplicateIds[0], firstSave.reportId);
assert.ok(duplicateSave.message.includes("Duplicate report not saved"));
assert.equal(getState().history.length, 1, "duplicate save must not add a second History run");
assert.equal(getState().rawArchive.reportCount, 1, "duplicate save must not add a second raw record");

const mixedBatch = `${rawA}\n\n${rawB}`;
const batchSave = actionSaveReportFromInput({ value: mixedBatch });
assert.equal(batchSave.status, "saved");
assert.equal(batchSave.loaded, true);
assert.equal(batchSave.addedIds.length, 1, "mixed batch should save only the new report");
assert.equal(batchSave.duplicateIds.includes(firstSave.reportId), true, "mixed batch should report the duplicate ID");
assert.equal(getState().history.length, 2);
assert.equal(getState().rawArchive.reportCount, 2);
assert.equal(loadStorage().rawArchive.reportCount, 2);

const clearFeedback = actionClearInput({ value: mixedBatch });
assert.equal(clearFeedback.status, "cleared");
assert.equal(getState().history.length, 2, "Clear Input must not delete History");
assert.equal(getState().rawArchive.reportCount, 2, "Clear Input must not delete raw archive");

const status = getCommandDeckActionStatus();
assert.equal(status.version, "v4.11z52w16");
assert.equal(status.rawIntake.version, COMMAND_DECK_RAW_INTAKE_VERSION);

const config = fs.readFileSync(new URL("../config/appConfig.js", import.meta.url), "utf8");
const rulebook = fs.readFileSync(new URL("../docs/ARCHITECTURE_OWNERSHIP_RULES.md", import.meta.url), "utf8");
assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.ok(rulebook.includes("src/actions/commandDeckRawIntake.js"));
assert.ok(rulebook.includes("Command Deck raw archive rewire"));

console.log("v4.11z52w16 Command Deck raw archive rewire test passed");
