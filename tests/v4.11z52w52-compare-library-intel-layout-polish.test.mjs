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
            runType: overrides.runType || 'normal',
            archived: Boolean(overrides.archived)
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

assert.ok(config.includes('buildVersion: "v4.11z52w53"'), 'visible build version should be w53');
assert.ok(compareSource.includes('COMPARE LIBRARY INTEL COLUMN ALIGNMENT POLISH v4.11z52w53'), 'Compare source should identify current library layout polish');
assert.ok(compareSource.includes('function buildLibraryDataConfidenceBlock'), 'Compare should include Data Confidence builder');
assert.ok(compareCss.includes('v4.11z52w53 — Compare Library Intel layout and source-health polish'), 'Compare CSS should include w52 layout polish styles');
assert.ok(probeSource.includes('v4.11z52w53'), 'Click Truth Probe visible version should be w53');

const html = buildCompareView({ history, rawArchive });
assert.match(html, /Saved Runs Intel/, 'library mode should render when no slots are loaded');
assert.match(html, /Library Snapshot/, 'library mode should rename overview to Library Snapshot');
assert.match(html, /Library Insights/, 'library mode should keep Library Insights');
assert.match(html, /Top Records/, 'library mode should keep Top Records');
assert.match(html, /Efficiency Leaders/, 'library mode should put Efficiency Leaders near Top Records');
assert.match(html, /Death Patterns/, 'library mode should keep Death Patterns');
assert.match(html, /Run Band Mix/, 'library mode should keep Run Band Mix');
assert.match(html, /Next Targets/, 'library mode should keep Next Targets');
assert.match(html, /Data Confidence/, 'library mode should add Data Confidence panel');
assert.match(html, /Evidence level/, 'Data Confidence should include evidence level row');
assert.match(html, /Strong/, 'Data Confidence should identify clean linked evidence as Strong');
assert.match(html, /Run types: Normal 3 · Tournament 1/, 'Library Snapshot should keep run type summary');

const snapshotIndex = html.indexOf('Library Snapshot');
const insightsIndex = html.indexOf('Library Insights');
const topRecordsIndex = html.indexOf('Top Records');
const efficiencyIndex = html.indexOf('Efficiency Leaders');
const deathIndex = html.indexOf('Death Patterns');
const bandIndex = html.indexOf('Run Band Mix');
const nextIndex = html.indexOf('Next Targets');
const confidenceIndex = html.indexOf('Data Confidence');
assert.ok(snapshotIndex < topRecordsIndex, 'primary column should stack snapshot before records');
assert.ok(topRecordsIndex < deathIndex, 'primary column should stack records before death patterns');
assert.ok(deathIndex < nextIndex, 'primary column should stack death patterns before next targets');
assert.ok(insightsIndex < efficiencyIndex, 'secondary column should stack insights before efficiency leaders');
assert.ok(efficiencyIndex < bandIndex, 'secondary column should stack efficiency before run band mix');
assert.ok(bandIndex < confidenceIndex, 'secondary column should stack run band mix before data confidence');

const abHtml = buildCompareView({ history, rawArchive, runA: history[0], runB: history[1] });
const waveLineCount = (abHtml.match(/leads push/g) || []).length;
assert.equal(waveLineCount, 2, 'A/B compare should not duplicate the wave insight beyond insight + verdict subtext');
assert.match(abHtml, /Comparison Fairness/, 'A/B comparison fairness should remain intact');

const model = buildCompareAnalyseModel({ history, rawArchive });
assert.equal(model.mode, 'library', 'model should remain in library mode with no slots loaded');
assert.equal(model.library.rawSummary.sourceCoverageLabel, '4 / 4', 'model should preserve raw source coverage');

console.log('v4.11z52w53 Compare Library Intel layout polish test passed.');
