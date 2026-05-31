import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { parser } from "../src/pipeline/parser.js";
import { buildHistoryRunGameBrainSummary, buildHistoryGameBrainInsights } from "../src/history/historyGameBrain.js";
import { buildHistoryView } from "../src/ui/sections/historyView.js";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const config = fs.readFileSync(path.join(root, "config/appConfig.js"), "utf8");
const historyView = fs.readFileSync(path.join(root, "src/ui/sections/historyView.js"), "utf8");
const runtimeFeedback = fs.readFileSync(path.join(root, "src/game/gameBrainRuntimeFeedback.js"), "utf8");
const historyCss = fs.readFileSync(path.join(root, "styles/desktop/04-history-rebuild.css"), "utf8");
const mobileCss = fs.readFileSync(path.join(root, "mobile.css"), "utf8");
const sample = fs.readFileSync(path.join(root, "tests/fixtures/Battle_Report_T11.txt"), "utf8");

assert.ok(config.includes('version: "v4.11z52"'), "app version should be v4.11z52");
assert.ok(historyView.includes('HISTORY VIEW WRAPPER v4.11z52w29'), "History marker should be w18");
assert.ok(buildHistoryView({ history: [], ui: { historyFilters: {} } }).includes('Report Management Hub'), "History should render the w18 management hub");
assert.ok(fs.readFileSync(path.join(root, "src/ui/sections/history/historyInspector.js"), "utf8").includes('buildRunIntelLead'), "History should use compact Run Intel wording");
assert.ok(runtimeFeedback.includes('SECTION_AWARE_FIELD_OVERRIDES'), "runtime feedback should include section-aware field mapping");
assert.ok(runtimeFeedback.includes('schemaMappedLabels'), "runtime coverage should preserve schema detail count");
assert.ok(historyCss.includes('v4.11z52w29 proper History visual rebuild'), "History CSS should include w18 archive toggle styling");
assert.ok(mobileCss.includes('v4.11z52b tab-ordered blank mobile module loader'), "mobile CSS should remain blank tab-ordered scaffold");

const parsed = parser(sample);
const coverage = parsed.meta.gameBrainFeedback.labelCoverage;
assert.equal(coverage.unknownLabels, 0, "known pasted report labels should no longer be treated as unknown labels");
assert.ok(coverage.knownOfficialLabels >= coverage.schemaMappedLabels, "recognised labels should include schema-mapped labels");
assert.ok(coverage.schemaMappedLabels > 40, "schema detail should still be attached for many labels");
assert.equal(parsed.meta.gameBrainFeedback.readableSummary.quickFacts.some(fact => fact.label === "Mapping polish" && fact.value === "None needed"), true, "mapping polish should be calm when no true unknowns remain");

const oldFeedbackRun = {
    ...parsed,
    meta: {
        ...parsed.meta,
        gameBrainFeedback: {
            version: "game-brain-runtime-feedback-v4.11z34",
            labelCoverage: {
                totalLabels: 106,
                knownOfficialLabels: 47,
                unknownLabels: 59,
                coveragePercent: 44
            }
        }
    }
};
const liveSummary = buildHistoryRunGameBrainSummary(oldFeedbackRun);
assert.equal(liveSummary.unknownLabels, 0, "History should rebuild stale saved Game Brain feedback using z50 mapping");

const history = [parsed, parsed, parsed].map((run, index) => ({
    ...run,
    core: { ...run.core, battleDate: `Run ${index + 1}`, killedBy: index === 1 ? "Basic" : "Scatter" },
    meta: { ...run.meta, reportId: `z50_test_${index}` }
}));
const insights = buildHistoryGameBrainInsights(history);
assert.ok(Number(insights.topFamily?.count || 0) <= history.length, "Library Intel family count should count runs, not field entries");

const html = buildHistoryView({ history, ui: { historyFilters: {} } });
assert.ok(html.includes('Run Intel'), "rendered History should show Run Intel");
assert.equal(html.includes('Unknown labels'), false, "rendered History should avoid scary unknown-label wording");

const archivedShownHtml = buildHistoryView({ history, ui: { historyFilters: { showArchived: true } } });
const archivedHiddenHtml = buildHistoryView({ history, ui: { historyFilters: { showArchived: false } } });
assert.ok(archivedShownHtml.includes('<span>Archived runs</span>'), "History archive toggle should use state label Archived runs");
assert.ok(archivedShownHtml.includes('<b>Shown</b>') && archivedHiddenHtml.includes('<b>Hidden</b>'), "History archive toggle should say Shown/Hidden instead of On/Off");
assert.equal(archivedShownHtml.includes('Hide archived'), false, "History archive toggle should not use confusing action wording");
assert.equal(archivedHiddenHtml.includes('Show archived'), false, "History archive toggle should not use confusing action wording");
assert.ok(archivedShownHtml.includes('<b>Shown</b>'), "Archived runs state should render as Shown when archive filter is enabled");
assert.ok(archivedHiddenHtml.includes('<b>Hidden</b>'), "Archived runs state should render as Hidden when archive filter is disabled");

console.log("v4.11z52 History archive toggle clarity test passed.");
