import assert from "node:assert/strict";
import fs from "node:fs";

import { getState, setState, resetState } from "../src/core/state.js";
import { saveStorage, readSavedHistoryCandidates, readRawStorageSnapshot, getStorageKey } from "../src/storage/localStore.js";
import { actionExportHistoryJSON } from "../src/actions/actions.js";

class LocalStorageMock {
    constructor() { this.store = new Map(); }
    getItem(key) { return this.store.has(key) ? this.store.get(key) : null; }
    setItem(key, value) { this.store.set(key, String(value)); }
    removeItem(key) { this.store.delete(key); }
    clear() { this.store.clear(); }
}

global.localStorage = new LocalStorageMock();

const history = [
    { core: { battleDate: "May 07, 2026 17:09", tier: 11, wave: 7609, killedBy: "Ray" }, meta: { reportId: "export-live" } }
];

resetState();
setState({ history });

const liveExport = JSON.parse(actionExportHistoryJSON());
assert.equal(liveExport.version, "v4.11z52w29");
assert.equal(liveExport.exportSource, "live-state");
assert.equal(liveExport.history.length, 1);
assert.equal(liveExport.history[0].meta.reportId, "export-live");

resetState();
saveStorage({ history: [{ core: { wave: 8888 }, meta: { reportId: "export-localstore" } }] });

const candidates = readSavedHistoryCandidates();
assert.ok(candidates.some(item => item.source === getStorageKey() && item.history.length === 1));
assert.equal(readRawStorageSnapshot().available, true);

const storedExport = JSON.parse(actionExportHistoryJSON());
assert.equal(storedExport.version, "v4.11z52w29");
assert.equal(storedExport.history.length, 1);
assert.equal(storedExport.history[0].meta.reportId, "export-localstore");

const bootstrap = fs.readFileSync("bootstrap.js", "utf8");
assert.equal(bootstrap.includes("bindNativeControlGuard"), false);
assert.equal(fs.existsSync("src/ui/nativeControlGuard.js"), false);

const events = fs.readFileSync("src/ui/events.js", "utf8");
assert.ok(events.includes("UI EVENT MODULE LOADER v4.11z52w29"));
assert.equal(events.includes("handleDirectFileClick"), false, "old direct file bridge must remain removed");
assert.equal(events.includes("TowerBattleIntelDirectFileIO"), false, "old direct file diagnostics must remain removed");
assert.ok(events.includes("TowerBattleIntelUIShell"), "shell diagnostics should be exposed instead");
assert.equal(getState().history.length, 0, "fallback export test should not repopulate live state");

console.log("v4.11z52w6 localStore export contract test passed for shell reset");
