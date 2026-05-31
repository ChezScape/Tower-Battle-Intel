import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parser } from "../src/pipeline/parser.js";
import { buildGameBrainDebugPayload, formatGameBrainSaveSummary } from "../src/game/gameBrainRuntimeFeedback.js";

const root = path.dirname(new URL(import.meta.url).pathname);
const sample = fs.readFileSync(path.join(root, "fixtures/Battle_Report_T11.txt"), "utf8");
const parsed = parser(sample);

assert.equal(parsed.meta.parserVersion, "battle-report-parser-v4.11z31");
assert.ok(parsed.meta.gameBrainFeedback, "parser should attach Game Brain feedback");
assert.ok(parsed.meta.gameBrainFeedback.labelCoverage.knownOfficialLabels > 20, "recognised label matches should be present");
assert.equal(parsed.meta.gameBrainFeedback.version, "game-brain-runtime-feedback-v4.11z52");
assert.ok(parsed.meta.gameBrainFeedback.readableSummary?.headline?.includes("Game Brain recognised"), "readable summary headline should be present");
assert.ok(parsed.meta.gameBrainFeedback.readableSummary?.quickFacts?.length >= 4, "readable summary quick facts should be present");
assert.equal(parsed.meta.gameBrainFeedback.milestone.ok, true, "milestone feedback should work");
assert.equal(parsed.meta.gameBrainFeedback.specialMeanings.otherKills.key, "destroyed_by_other", "Other should map as the official DestroyedByOther Battle Report field");

const debug = buildGameBrainDebugPayload({ currentRun: { core: parsed.core, sections: parsed.sections, flat: parsed.flat, meta: parsed.meta } });
assert.equal(debug.status.officialCatalogues.ok, true);
assert.equal(debug.status.battleReportSchema.ok, true);
assert.equal(debug.status.waveTierMilestones.ok, true);
assert.equal(debug.currentRun.available, true);
assert.ok(debug.currentRun.labelCoverage.knownOfficialLabels > 20);
assert.ok(debug.visibleSummary?.cards?.length >= 4, "debug visible summary should include cards");
const saveSummary = formatGameBrainSaveSummary(parsed.meta.gameBrainFeedback);
assert.ok(saveSummary.headline.includes("Game Brain recognised"), "save summary should be human readable");
assert.ok(saveSummary.quickFacts.length >= 4, "save summary should include quick facts");

console.log("v4.11z34 Game Brain visible feedback test passed.");
