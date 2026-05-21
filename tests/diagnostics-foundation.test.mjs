import assert from "node:assert/strict";

import {
    pipelineInspector,
    capturePipelineTrace,
    getPipelineTraceLog,
    clearPipelineTraceLog
} from "../src/diagnostics/pipelineInspector.js";

import {
    trace,
    traceTime,
    getTraceLog,
    clearTraceLog
} from "../src/diagnostics/traceEngine.js";

import {
    runSystemHealthScan
} from "../src/diagnostics/systemHealthScan.js";

clearPipelineTraceLog();
clearTraceLog();

const payload = { ok: true };
assert.equal(trace("diagnostics/test", payload), payload);
assert.equal(traceTime("diagnostics/time").time >= 0, true);

const entry = capturePipelineTrace("diagnostics/direct", { direct: true });
assert.equal(entry.stage, "diagnostics/direct");
assert.equal(getTraceLog().length >= 3, true);
assert.equal(getPipelineTraceLog().length >= 3, true);

const inspection = pipelineInspector({
    rawInput: "Battle Report\nWave\t1",
    reportCount: 1,
    usedReportCount: 1,
    parsed: {
        core: { tier: 1, wave: 1, killedBy: "Basic" },
        sections: { core: {} },
        flat: { wave: 1 },
        meta: { confidence: 50, unknownReportFields: [] }
    },
    computed: {
        core: { tier: 1, wave: 1, killedBy: "Basic" },
        stats: {},
        sections: {},
        meta: { reportId: "test" }
    },
    history: []
});

assert.equal(inspection.version, "pipeline-inspector-v4.9x");
assert.equal(inspection.parser.success, true);
assert.equal(inspection.compute.success, true);
assert.equal(Array.isArray(inspection.warnings), true);

const health = runSystemHealthScan({
    inspection,
    ui: { debug: false },
    history: []
});

assert.equal(health.scanVersion, "system-health-scan-v4.9x");
assert.equal(Array.isArray(health.checks), true);
assert.equal(health.checks.some(check => check.id === "DIAG_001"), true);
assert.equal(health.checks.some(check => check.id === "DIAG_005"), true);

console.log("diagnostics-foundation.test.mjs passed");
