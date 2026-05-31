import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { parser } from "../src/pipeline/parser.js";
import { buildHistoryView } from "../src/ui/sections/historyView.js";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const config = fs.readFileSync(path.join(root, "config/appConfig.js"), "utf8");
const historyView = fs.readFileSync(path.join(root, "src/ui/sections/historyView.js"), "utf8");
const historyCss = fs.readFileSync(path.join(root, "styles/desktop/04-history-rebuild.css"), "utf8");
const mobileCss = fs.readFileSync(path.join(root, "mobile.css"), "utf8");
const sample = fs.readFileSync(path.join(root, "tests/fixtures/Battle_Report_T11.txt"), "utf8");

assert.ok(config.includes('version: "v4.11z52"'), "app version should be v4.11z52");
assert.ok(fs.readFileSync(path.join(root, "src/ui/sections/history/historyInspector.js"), "utf8").includes("Run Intel Summary"), "selected run panel should use Run Intel Summary instead of Game Brain Read");
assert.equal(fs.readFileSync(path.join(root, "src/ui/sections/history/historyInspector.js"), "utf8").includes("Game Brain Read"), false, "Game Brain Read label should be removed from History UI source");
assert.ok(fs.readFileSync(path.join(root, "src/ui/sections/history/historyInspector.js"), "utf8").includes("Run understood:"), "run intel lead should use calmer wording");
assert.ok(fs.readFileSync(path.join(root, "src/ui/sections/history/historyInspector.js"), "utf8").includes("Death pressure:"), "death wording should be practical rather than debug-heavy");
assert.ok(fs.readFileSync(path.join(root, "src/ui/sections/history/historyInspector.js"), "utf8").includes("Mapping: clean"), "mapping wording should be calm when clean");
assert.ok(fs.readFileSync(path.join(root, "src/ui/sections/history/historyInspector.js"), "utf8").includes("buildRunIntelBullets"), "History should use curated Run Intel bullets");
assert.ok(historyCss.includes("v4.11z52w29 proper History visual rebuild"), "History CSS should include w18 Run Intel styling");
assert.equal(mobileCss.includes("v4.11z52b tab-ordered blank mobile module loader"), true, "mobile CSS should remain blank tab-ordered scaffold");

const parsed = parser(sample);
const html = buildHistoryView({
    history: [parsed],
    runA: parsed,
    ui: { historyFilters: { showArchived: true } }
});

assert.ok(html.includes("Run Intel Summary"), "rendered selected-run panel should show Run Intel Summary");
assert.ok(html.includes("Run understood:"), "rendered panel should show calmer lead text");
assert.ok(html.includes("Recognised"), "rendered fact card should combine checked/recognised label concepts");
assert.ok(html.includes("Next target"), "rendered notes should use Next target wording");
assert.ok(html.includes("Death pressure"), "rendered notes should use Death pressure wording");
assert.ok(html.includes("Mapping: clean") || html.includes("Mapping"), "rendered notes should report mapping without scary wording");
assert.equal(html.includes("Game Brain Read"), false, "rendered History should not show Game Brain Read");
assert.equal(html.includes("diagnosis.."), false, "rendered History should not include double punctuation");

console.log("v4.11z52 History Run Intel panel polish test passed.");
