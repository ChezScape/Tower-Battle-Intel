import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { parser } from "../src/pipeline/parser.js";
import { scanUnknownReportMetrics } from "../src/game/unknownMetricLogger.js";

const root = path.dirname(new URL(import.meta.url).pathname);
const fixtures = [
    "fixtures/Battle_Report_T11.txt",
    "fixtures/Battle_Report_T12.txt"
];

for (const fixture of fixtures) {
    const fullPath = path.join(root, fixture);
    if (!fs.existsSync(fullPath)) continue;

    const parsed = parser(fs.readFileSync(fullPath, "utf8"));
    assert.ok(parsed.core.tier, `${fixture} tier parsed`);
    assert.ok(parsed.core.wave, `${fixture} wave parsed`);
    assert.ok(parsed.core.killedBy, `${fixture} killed-by parsed`);
    assert.ok(Object.keys(parsed.sections || {}).length >= 15, `${fixture} sections parsed`);

    const scan = scanUnknownReportMetrics(parsed);
    assert.equal(scan.count, 0, `${fixture} unknown field count`);
}

console.log("report-parser-game-brain.test.mjs passed");
