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

assert.ok(config.includes('buildVersion: "v4.11z52w53"'), 'visible build version should be w53');
assert.ok(compareSource.includes('COMPARE LIBRARY INTEL COLUMN ALIGNMENT POLISH v4.11z52w53'), 'Compare source should identify current Compare polish');
assert.ok(compareCss.includes('v4.11z52w53 — Compare fairness and similar-runs context polish'), 'Compare CSS should include current fairness styles');
assert.ok(probeSource.includes('v4.11z52w53'), 'Click Truth Probe visible version should be w53');

let html = buildCompareView({ history, rawArchive, runA: history[0] });
assert.match(html, /Single Report Intel/, 'one loaded slot should show Single Report mode');
assert.match(html, /Similar Runs Context/, 'single mode should include similar runs context');
assert.match(html, /Tier 11 Normal/, 'similar scope should describe tier and run type');
assert.match(html, /Best similar wave/, 'similar context should include best similar wave');
assert.match(html, /Death Pressure Context/, 'single mode should keep death pressure context');

html = buildCompareView({ history, rawArchive, runA: history[0], runB: history[1] });
assert.match(html, /Run A vs Run B/, 'two loaded slots should show A\/B Compare mode');
assert.match(html, /Comparison Fairness/, 'A/B mode should include comparison fairness panel');
assert.match(html, /Same tier/, 'fairness panel should check tier');
assert.match(html, /Same run type/, 'fairness panel should check run type');
assert.match(html, /Raw source/, 'fairness panel should check raw source coverage');
assert.match(html, /Verdict confidence/, 'fairness panel should show confidence');
assert.match(html, /Similar Runs Context/, 'A/B mode should include similar runs context');
assert.match(html, /Shared similar scope/, 'same tier/type pair should show shared similar scope');
assert.match(html, /Run A death/, 'death pressure context should use compact Run A death row');
assert.match(html, /Run B death/, 'death pressure context should use compact Run B death row');
assert.doesNotMatch(html, /<article class="tbi-compare-death-card">/, 'A/B death pressure should no longer use large empty death cards');

const mismatch = makeRun(5, { tier: 12, runType: 'tournament', killedBy: 'Basic', time: 1800 });
html = buildCompareView({ history: [...history, mismatch], rawArchive, runA: history[0], runB: mismatch });
assert.match(html, /Same tier[\s\S]*?<strong>No<\/strong>/, 'fairness should warn when tiers differ');
assert.match(html, /Same run type[\s\S]*?<strong>No<\/strong>/, 'fairness should warn when run types differ');
assert.match(html, /Verdict confidence[\s\S]*?<strong>Review<\/strong>/, 'fairness confidence should drop to review when context differs');

const model = buildCompareAnalyseModel({ history, rawArchive, runA: history[0], runB: history[1] });
assert.equal(model.mode, 'ab', 'model should still identify A/B mode');
assert.equal(model.library.rawSummary.sourceCoverageLabel, '4 / 4', 'model should preserve raw source coverage');

console.log('v4.11z52w53 Compare fairness context regression test passed.');
