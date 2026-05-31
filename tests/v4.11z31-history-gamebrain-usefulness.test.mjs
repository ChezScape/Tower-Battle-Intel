import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { parser } from "../src/pipeline/parser.js";
import { buildHistoryGameBrainInsights, buildHistoryRunGameBrainSummary, buildGameBrainHistorySearchText } from "../src/history/historyGameBrain.js";
import { getVisibleHistoryEntries, historyEntryMatchesQuery } from "../src/history/historyFilters.js";
import { buildHistoryView } from "../src/ui/sections/historyView.js";

const root = path.dirname(new URL(import.meta.url).pathname);
const sample = fs.readFileSync(path.join(root, "fixtures/Battle_Report_T11.txt"), "utf8");
const parsed = parser(sample);

assert.equal(parsed.meta.parserVersion, "battle-report-parser-v4.11z31");
assert.equal(parsed.meta.gameBrainFeedback.version, "game-brain-runtime-feedback-v4.11z52");

const history = [
    parsed,
    {
        ...parsed,
        core: {
            ...parsed.core,
            battleDate: "May 08, 2026 18:00",
            wave: 8123,
            killedBy: "Vampire"
        },
        meta: {
            ...parsed.meta,
            reportId: "history-gamebrain-vampire-test",
            tags: ["cells", "vampire"],
            notes: "Vampire sustain failure test"
        }
    }
];

const summary = buildHistoryRunGameBrainSummary(history[0]);
assert.equal(summary.available, true);
assert.equal(summary.hasSavedFeedback, true);
assert.ok(summary.nextCheckpoint, "history summary should expose next checkpoint");
assert.ok(summary.officialLabels > 20, "history summary should expose recognised label count");

const searchText = buildGameBrainHistorySearchText(history[1], 1);
assert.ok(searchText.includes("vampire"), "search text should include killed-by context");
assert.ok(searchText.includes("checkpoint"), "search text should include checkpoint wording");
assert.ok(searchText.includes("recognised labels"), "search text should include recognised label wording");

assert.equal(historyEntryMatchesQuery(history[1], "vampire", 1), true);
assert.equal(historyEntryMatchesQuery(history[0], "scatter", 0), true);
assert.ok(getVisibleHistoryEntries(history, { query: "scatter" }).length >= 1);

const insights = buildHistoryGameBrainInsights(history);
assert.equal(insights.count, 2);
assert.equal(insights.withGameBrainFeedback, 2);
assert.ok(insights.topKilledBy.count >= 1);
assert.ok(insights.searchHints.length >= 3);

const layout = buildHistoryView({ history, ui: { historyFilters: {} } });
assert.ok(layout.includes("Run Intel Summary"), "Clean History inspector should include Run Intel Summary");
assert.ok(layout.includes("Library Intel"), "Clean History should include visible Library Intel");
assert.ok(layout.includes("data-history-search-text"), "Clean History cards should expose normal search text");
assert.ok(layout.includes("data-history-deep-search-text"), "Clean History cards should expose explicit deep search text");
assert.ok(layout.includes("data-history-search-mode-toggle"), "Clean History should expose a deep report search toggle");

console.log("v4.11z34 History Game Brain usefulness test passed.");
