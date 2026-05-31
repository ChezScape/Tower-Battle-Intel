import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
    actionReset,
    actionSaveReportFromInput
} from "../src/actions/actions.js";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const sample = fs.readFileSync(path.join(root, "tests/fixtures/Battle_Report_T11.txt"), "utf8");

function labels(feedback) {
    return (feedback?.parserFeedback?.quickFacts || []).map(item => item.label);
}

actionReset();

const first = actionSaveReportFromInput({ value: sample, placeholder: "" });
assert.equal(first.status, "saved", "first report should save");
assert.ok(first.parserFeedback, "saved report should have Game Brain parser feedback");
assert.ok(labels(first).includes("Recognised labels"), "saved report should show recognised label facts");
assert.ok(labels(first).includes("Mapping polish"), "saved report should show mapping polish facts");
assert.ok(labels(first).includes("Killed By"), "saved report should show Killed By fact");
assert.equal(labels(first).includes("Unknown labels"), false, "saved report should not show scary unknown-label wording");

const duplicate = actionSaveReportFromInput({ value: sample, placeholder: "" });
assert.equal(duplicate.status, "duplicate", "second copy should be treated as duplicate");
assert.ok(duplicate.parserFeedback, "duplicate feedback should still show Game Brain parser facts");
assert.ok(labels(duplicate).includes("Recognised labels"), "duplicate report should still show recognised labels");
assert.ok(labels(duplicate).includes("Mapping polish"), "duplicate report should still show mapping polish");
assert.match(duplicate.message, /Game Brain:/, "duplicate message should include Game Brain context");

const batchInput = `${sample}\n\n---\n\n${sample}`;
actionReset();
const batch = actionSaveReportFromInput({ value: batchInput, placeholder: "" });
assert.ok(batch.parserFeedback, "batch save should expose Game Brain parser feedback");
assert.ok(labels(batch).includes("Reports checked"), "batch save should show reports checked");
assert.ok(labels(batch).includes("Loaded / duplicate"), "batch save should show loaded/duplicate fact");
assert.ok(labels(batch).includes("Recognised labels"), "batch save should show recognised label facts");

console.log("v4.11z34 Save Report Game Brain facts test passed.");
