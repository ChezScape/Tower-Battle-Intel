import assert from "node:assert/strict";

import { buildHistoryStatsModal } from "../src/ui/sections/history/historyStatsModal.js";

const baseRun = {
  core: {
    battleDate: "May 24, 2026 01:22",
    tier: 12,
    wave: 1115,
    killedBy: "Fast",
    coins: 17470000000,
    cells: 1390,
    realTime: "1h 48m 51s",
    gameTime: "7h 15m 25s"
  },
  stats: {
    coinsPerHour: 9630000000,
    cellsPerHour: 768
  },
  meta: {
    reportId: "rpt_20260524_0122_t12_w1115_6d71a3e21b2c",
    fingerprint: "6d71a3e21b2c",
    runType: "tournament",
    buildStyle: "unknown"
  },
  raw: {
    reportText: "Battle Report\nBattle Date\tMay 24, 2026 01:22\nTier\t12\nWave\t1115"
  }
};

const previousRun = {
  core: { battleDate: "May 23, 2026 16:58", tier: 11, wave: 7345, killedBy: "Ranged", coins: 121830000000000, cells: 127670 },
  stats: { coinsPerHour: 12080000000000, cellsPerHour: 12660 },
  meta: { runType: "normal", reportId: "rpt_previous" },
  raw: { reportText: "Battle Report\nBattle Date\tMay 23, 2026 16:58" }
};

const html = buildHistoryStatsModal({
  run: baseRun,
  index: 1,
  displayIndex: 1,
  history: [previousRun, baseRun],
  visibleHistory: [previousRun, baseRun],
  runA: null,
  runB: null
});

assert.match(html, /Raw Source Verified/, "top source badge should use Raw Source wording");
assert.equal((html.match(/Raw Source Verified/g) || []).length, 1, "Raw Source Verified should only appear once as a status badge");
assert.equal(html.includes("Raw archive verified"), false, "stats modal should not repeat old raw archive wording");
assert.equal(html.includes("Quality"), false, "Quality label should be removed from the stats modal");
assert.match(html, /Performance Score/, "score should be labelled as performance, not report quality");
assert.match(html, /data-ui-action="history-stats-edit"/, "modal should expose Edit Metadata action near run actions");
assert.match(html, /data-history-edit-index="1"/, "Edit Metadata should carry the history index");
assert.match(html, /Compared with previous saved run/, "delta panel should explain the comparison source");
assert.match(html, /Different run type: Normal → Tournament/, "delta panel should warn when run type context differs");
assert.match(html, /Same run type in view/, "library context should include run-type context");
assert.equal(html.includes("Archived in scope"), false, "Archived in scope should be removed from stats modal context");
assert.match(html, /Data actions/, "JSON actions should be grouped as data actions in the footer");

console.log("v4.11z52w33 History Stats modal polish test passed.");
