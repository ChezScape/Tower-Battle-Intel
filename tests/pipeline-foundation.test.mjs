import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

import { parser, compare, analyser, insightEngine, aiCoach, progressionAI, runPipeline } from "../src/pipeline/index.js";
import { compute } from "../src/core/compute.js";

const root = path.dirname(new URL(import.meta.url).pathname);
const t11 = path.join(root, "fixtures/Battle_Report_T11.txt");
const t12 = path.join(root, "fixtures/Battle_Report_T12.txt");

if (fs.existsSync(t11) && fs.existsSync(t12)) {
    const parsedA = parser(fs.readFileSync(t11, "utf8"));
    const parsedB = parser(fs.readFileSync(t12, "utf8"));

    assert.ok(parsedA.core.wave, "T11 wave parsed");
    assert.ok(parsedB.core.wave, "T12 wave parsed");
    assert.ok(Object.keys(parsedA.sections || {}).length >= 15, "T11 sections parsed");
    assert.ok(Object.keys(parsedB.sections || {}).length >= 15, "T12 sections parsed");
    assert.equal(parsedA.meta.unknownMetricScan.count, 0, "T11 no unknown metrics");
    assert.equal(parsedB.meta.unknownMetricScan.count, 0, "T12 no unknown metrics");

    const runA = compute(parsedA);
    const runB = compute(parsedB);
    const diff = compare(runA, runB);

    assert.ok(diff.core.wave, "wave diff exists");
    assert.ok(diff.stats.coinsPerHour, "coins/hour diff exists");
    assert.ok(diff.summary, "summary exists");
    assert.ok(Array.isArray(diff.summary.topGains), "top gains exists");
    assert.ok(Array.isArray(diff.summary.topLosses), "top losses exists");
    assert.ok(diff.summary.farmingVerdict, "farming verdict exists");
    assert.ok(diff.summary.categoryScores, "category scores exists");

    const insights = analyser(runB, runA, diff);
    assert.ok(Array.isArray(insights), "analyser array");

    const coach = aiCoach(runB, runA, diff, insights, {}, { history: [runA, runB], buildStyle: "hybrid" });
    assert.ok(Array.isArray(coach), "coach array");
    assert.ok(coach.length > 0, "coach cards exist");

    const trend = progressionAI([runA, runB], runB);
    assert.ok(Array.isArray(trend), "progression array");

    const full = runPipeline(fs.readFileSync(t12, "utf8"), [runA], { buildStyle: "hybrid" });
    assert.ok(full.current.core.wave, "runPipeline current wave");
    assert.ok(full.compare.summary, "runPipeline compare summary");
}

console.log("pipeline-foundation.test.mjs passed");
