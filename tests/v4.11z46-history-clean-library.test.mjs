import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { parser } from "../src/pipeline/parser.js";
import { buildHistoryView } from "../src/ui/sections/historyView.js";
import { getVisibleHistoryEntries } from "../src/history/historyFilters.js";

const root = path.dirname(new URL(import.meta.url).pathname);
const appConfig = readFileSync(path.join(root, "../config/appConfig.js"), "utf8");
const historyViewSource = readFileSync(path.join(root, "../src/ui/sections/historyView.js"), "utf8");
const historyCss = readFileSync(path.join(root, "../styles/desktop/04-history-rebuild.css"), "utf8");
const commandView = readFileSync(path.join(root, "../src/ui/sections/commandDeckView.js"), "utf8");
const mobileCss = readFileSync(path.join(root, "../mobile.css"), "utf8");
const sample = readFileSync(path.join(root, "fixtures/Battle_Report_T11.txt"), "utf8");

const run = parser(sample);
const history = [run];
const state = {
    history,
    runA: null,
    runB: null,
    currentRun: null,
    ui: {
        historyFilters: {
            query: "scatter",
            sort: "newest",
            build: "all",
            tag: "all",
            showArchived: false
        }
    }
};

const html = buildHistoryView(state);
const visible = getVisibleHistoryEntries(history, state.ui.historyFilters);

assert.ok(appConfig.includes('version: "v4.11z52"'), "app version should be v4.11z52");
assert.ok(historyViewSource.includes("HISTORY VIEW WRAPPER v4.11z52w29"), "History w18 wrapper marker should exist");
assert.ok(!historyViewSource.includes("buildBlankWorkspace"), "History should no longer render the blank reset shell");
assert.ok(html.includes('data-history-view-rebuild="v4.11z52w29"'), "History view should expose the w18 rebuild marker");
assert.ok(html.includes("Report Management Hub"), "History should include a rebuilt management hero");
assert.ok(html.includes("Search saved reports"), "History should include search controls");
assert.ok(html.includes("Saved report cards"), "History should include a saved run list");
assert.ok(html.includes("Selected Report"), "History should include selected report detail");
assert.ok(html.includes("Run Intel Summary"), "History detail should include Game Brain context");
assert.ok(html.includes(">Set A</button>"), "History should be able to set Run A");
assert.ok(html.includes(">Set B</button>"), "History should be able to set Run B");
assert.ok(html.includes("Export JSON"), "History should keep export action visible");
assert.ok(visible.length === 1, "History filters should still find the saved Scatter run");
assert.ok(historyCss.includes("v4.11z52w29 proper History visual rebuild"), "History CSS should include w18 rebuild styles");
assert.ok(commandView.includes('data-command-clean-foundation="v4.11z52w29"'), "Command Deck should stay protected/current");
assert.ok(mobileCss.includes("v4.11z52b tab-ordered blank mobile module loader"), "mobile CSS should remain blank tab-ordered scaffold");

console.log("v4.11z52 History clean library test passed.");
