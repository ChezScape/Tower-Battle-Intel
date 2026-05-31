import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildCompareView, buildCompareAnalyseModel } from '../src/ui/sections/compareView.js';

function makeRun(index, overrides = {}) {
    return {
        core: {
            battleDate: `May ${String(index).padStart(2, '0')}, 2026 08:00`,
            tier: overrides.tier ?? 11,
            wave: overrides.wave ?? (7300 + index),
            killedBy: overrides.killedBy || (index % 2 ? 'Basic' : 'Fast'),
            coins: overrides.coins ?? (100_000_000_000_000 + index),
            cells: overrides.cells ?? (120_000 + index),
            time: overrides.time ?? 36000
        },
        stats: {
            coinsPerHour: overrides.coinsPerHour ?? (10_000_000_000_000 + index),
            cellsPerHour: overrides.cellsPerHour ?? (13000 + index)
        },
        meta: {
            reportId: `rpt_${index}`,
            fingerprint: `fp_${index}`,
            runType: overrides.runType || 'normal'
        },
        raw: { reportText: 'Battle Report\nTier\t11' }
    };
}

const history = [
    makeRun(1, { killedBy: 'Ray', wave: 7609, coinsPerHour: 8_200_000_000_000, cellsPerHour: 13540, cells: 136850, coins: 82_870_000_000_000, time: 36395 }),
    makeRun(2, { killedBy: 'Scatter', wave: 7381, coinsPerHour: 12_960_000_000_000, cellsPerHour: 13020, cells: 127940, coins: 127_330_000_000_000, time: 35376 }),
    makeRun(3, { killedBy: 'Basic', wave: 7777, coinsPerHour: 13_170_000_000_000, cellsPerHour: 14470, cells: 150380, coins: 134_500_000_000_000 }),
    makeRun(4, { killedBy: 'Fast', wave: 1115, runType: 'tournament', coinsPerHour: 9_630_000_000, cellsPerHour: 768, cells: 1390, coins: 17_470_000_000 })
];

const rawArchive = { reports: history.map(run => ({ reportId: run.meta.reportId, rawText: run.raw.reportText })) };
const config = readFileSync('config/appConfig.js', 'utf8');
const compareSource = readFileSync('src/ui/sections/compareView.js', 'utf8');
const compareCss = readFileSync('styles/desktop/05-compare.css', 'utf8');
const probeSource = readFileSync('src/ui/events/browserClickTruthProbe.js', 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w51"'), 'visible build version should be w50');
assert.ok(compareSource.includes('COMPARE & ANALYSE INSIGHT DENSITY POLISH v4.11z52w51'), 'Compare source should identify w50 insight density polish');
assert.ok(compareCss.includes('v4.11z52w51 — Compare insight density polish'), 'Compare CSS should include w50 insight density styles');
assert.ok(probeSource.includes('v4.11z52w51'), 'Click Truth Probe visible version should be w50');

let html = buildCompareView({ history, rawArchive });
assert.match(html, /Saved Runs Intel/, 'library mode should still render when no slots are loaded');
assert.match(html, /Library Insights/, 'library mode should include insight summary');
assert.match(html, /Efficiency Leaders/, 'library mode should include efficiency leader panel');
assert.match(html, /Top Records/, 'library mode should keep top records');
assert.match(html, /Raw source coverage is 4 \/ 4/, 'library insights should mention raw source coverage');

html = buildCompareView({ history, rawArchive, runB: history[1] });
assert.match(html, /Single Report Intel/, 'one loaded slot should show Single Report mode');
assert.match(html, /Run Insights/, 'single mode should include Run Insights');
assert.match(html, /Death Pressure Context/, 'single mode should include death pressure context');
assert.match(html, /Next Test Suggestion/, 'single mode should include next test suggestion');
assert.match(html, /Use this as the single-run baseline/, 'single next test should be cautious and useful');

html = buildCompareView({ history, rawArchive, runA: history[0], runB: history[1] });
assert.match(html, /Run A vs Run B/, 'two loaded slots should show A\/B Compare mode');
assert.match(html, /Compare Insights/, 'A/B mode should include Compare Insights');
assert.match(html, /Biggest Differences/, 'A/B mode should include biggest differences panel');
assert.match(html, /History Rank Context/, 'A/B mode should include rank context');
assert.match(html, /Death Pressure Context/, 'A/B mode should include richer death pressure context');
assert.match(html, /Next Test Suggestion/, 'A/B mode should include next test suggestion');
assert.match(html, /Run A is the better push baseline; Run B is the better coin farming baseline\./, 'A/B next test should explain push/farming baselines');

const model = buildCompareAnalyseModel({ history, rawArchive, runA: history[0], runB: history[1] });
assert.equal(model.mode, 'ab', 'model should still identify A/B mode');
assert.equal(model.library.rawSummary.sourceCoverageLabel, '4 / 4', 'model should preserve raw source coverage');

console.log('v4.11z52w51 Compare insight density polish test passed.');
