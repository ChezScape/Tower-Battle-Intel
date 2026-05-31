import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
    actionReset,
    actionSaveReportFromInput
} from "../src/actions/actions.js";

import { parser } from "../src/pipeline/parser.js";
import { buildDashboardGameBrainStrip } from "../src/ui/sections/dashboardGameBrainStrip.js";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const config = fs.readFileSync(path.join(root, "config/appConfig.js"), "utf8");
const commandActions = fs.readFileSync(path.join(root, "src/actions/commandDeckReportActions.js"), "utf8");
const runtimeFeedback = fs.readFileSync(path.join(root, "src/game/gameBrainRuntimeFeedback.js"), "utf8");
const dashboardStrip = fs.readFileSync(path.join(root, "src/ui/sections/dashboardGameBrainStrip.js"), "utf8");
const sample = fs.readFileSync(path.join(root, "tests/fixtures/Battle_Report_T11.txt"), "utf8");

assert.ok(config.includes('version: "v4.11z52"'), "app version should be v4.11z52");

for (const source of [commandActions, runtimeFeedback, dashboardStrip]) {
    assert.equal(source.includes("Official labels found"), false, "old official-label wording should be removed");
    assert.equal(source.includes("Alias review"), false, "old alias-review wording should be removed");
    assert.equal(source.includes("Labels checked"), false, "old labels-checked wording should be removed");
}

assert.ok(commandActions.includes("Recognised labels"), "Command Deck should show recognised label wording");
assert.ok(commandActions.includes("Report labels checked"), "Command Deck should show report labels checked wording");
assert.ok(commandActions.includes("Mapping polish"), "Command Deck should show mapping polish wording");
assert.ok(commandActions.includes("labels need mapping polish"), "Command Deck summary should clarify safe mapping polish");
assert.ok(runtimeFeedback.includes("Mapping polish"), "runtime summary should avoid scary unknown-label wording");

const parsed = parser(sample);
const stripHTML = buildDashboardGameBrainStrip({ runA: parsed, runB: parsed });
assert.ok(stripHTML.includes("Labels"), "Dashboard strip should show label quality");
assert.ok(stripHTML.includes("Mapping polish"), "Dashboard strip should show mapping polish");

function labels(feedback) {
    return (feedback?.parserFeedback?.quickFacts || []).map(item => item.label);
}

actionReset();
const first = actionSaveReportFromInput({ value: sample, placeholder: "" });
assert.equal(first.status, "saved", "single report should save");
assert.ok(labels(first).includes("Recognised labels"), "save feedback should show recognised labels");
assert.ok(labels(first).includes("Report labels checked"), "save feedback should show report labels checked");
assert.ok(labels(first).includes("Mapping polish"), "save feedback should show mapping polish");
assert.ok(labels(first).includes("Killed By"), "save feedback should keep Killed By visible after wording polish");
assert.match(first.message, /report labels recognised/, "save message should use calmer recognised-label wording");
assert.equal(first.message.includes("recognised labels found"), false, "save message should not use old wording");

const duplicate = actionSaveReportFromInput({ value: sample, placeholder: "" });
assert.equal(duplicate.status, "duplicate", "duplicate report should still be detected");
assert.ok(labels(duplicate).includes("Mapping polish"), "duplicate feedback should keep mapping polish facts");
assert.equal(duplicate.message.includes("recognised labels found"), false, "duplicate message should not use old wording");

console.log("v4.11z52 Command Deck Game Brain wording polish test passed.");
