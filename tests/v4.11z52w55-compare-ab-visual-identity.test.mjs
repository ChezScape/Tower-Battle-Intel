import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCompareView } from '../src/ui/sections/compareView.js';

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
    makeRun(3, { killedBy: 'Basic', wave: 7777, coinsPerHour: 13_170_000_000_000, cellsPerHour: 14470, cells: 150380, coins: 134_500_000_000_000 })
];

const rawArchive = { reports: history.map(run => ({ reportId: run.meta.reportId, rawText: run.raw.reportText })) };
const config = readFileSync('config/appConfig.js', 'utf8');
const compareSource = readFileSync('src/ui/sections/compareView.js', 'utf8');
const compareCss = readFileSync('styles/desktop/05-compare.css', 'utf8');
const probeSource = readFileSync('src/ui/events/browserClickTruthProbe.js', 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w55"'), 'visible build version should be w55');
assert.ok(compareSource.includes('COMPARE AB VISUAL IDENTITY POLISH v4.11z52w55'), 'Compare source should identify w55 A/B visual identity polish');
assert.ok(compareCss.includes('v4.11z52w55 — Compare A/B visual identity and column alignment polish'), 'Compare CSS should include w55 A/B identity styles');
assert.ok(probeSource.includes('v4.11z52w55'), 'Click Truth Probe visible version should be w55');

const html = buildCompareView({ history, rawArchive, runA: history[0], runB: history[1], ui: { activeTab: 'compare' } });
assert.match(html, /<section class="tbi-compare-layout ab-mode tbi-compare-column-layout">/, 'A/B mode should use independent column layout');
assert.match(html, /tbi-compare-ab-identity/, 'A/B mode should include the identity strip');
assert.match(html, /tbi-run-slot tbi-run-slot-a/, 'A/B mode should render Run A cyan identity tags');
assert.match(html, /tbi-run-slot tbi-run-slot-b/, 'A/B mode should render Run B gold identity tags');
assert.match(html, /tbi-run-letter tbi-run-slot-a/, 'A/B metric detail should render A letter identity');
assert.match(html, /tbi-run-letter tbi-run-slot-b/, 'A/B metric detail should render B letter identity');
assert.match(html, /tbi-compare-purpose-rows/, 'Purpose Verdict should use the A/B purpose row styling hook');
assert.match(html, /tbi-compare-insight-list-html/, 'Compare Insights should use HTML-safe coloured run labels');
assert.match(html, /<span class="tbi-run-slot tbi-run-slot-a"[^>]*>Run <b>A<\/b><\/span> pushed deeper/, 'A/B verdict should colour Run A inside verdict text');
assert.match(html, /<span class="tbi-run-slot tbi-run-slot-b"[^>]*>Run <b>B<\/b><\/span> earned/, 'A/B verdict should colour Run B inside verdict text');
assert.ok(html.indexOf('A/B Verdict') < html.indexOf('Difference'), 'primary A/B column should keep verdict before difference');
assert.ok(html.indexOf('Compare Insights') < html.indexOf('Comparison Fairness'), 'secondary A/B column should keep insights before fairness');

const rankMatches = html.match(/History Rank Context/g) || [];
assert.equal(rankMatches.length, 1, 'A/B Compare should still avoid duplicate History Rank Context');

console.log('v4.11z52w55 Compare A/B visual identity polish test passed.');
