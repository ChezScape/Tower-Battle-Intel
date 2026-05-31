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
    makeRun(3, { killedBy: 'Basic', wave: 7777, coinsPerHour: 13_170_000_000_000, cellsPerHour: 14470, cells: 150380, coins: 134_500_000_000_000 }),
    makeRun(4, { killedBy: 'Fast', wave: 1115, runType: 'tournament', coinsPerHour: 9_630_000_000, cellsPerHour: 768, cells: 1390, coins: 17_470_000_000 })
];

const rawArchive = { reports: history.map(run => ({ reportId: run.meta.reportId, rawText: run.raw.reportText })) };
const config = readFileSync('config/appConfig.js', 'utf8');
const compareSource = readFileSync('src/ui/sections/compareView.js', 'utf8');
const compareCss = readFileSync('styles/desktop/05-compare.css', 'utf8');
const probeSource = readFileSync('src/ui/events/browserClickTruthProbe.js', 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w54"'), 'visible build version should be w54');
assert.ok(compareSource.includes('COMPARE SINGLE REPORT COLUMN ALIGNMENT POLISH v4.11z52w54'), 'Compare source should identify w54 single report polish');
assert.ok(compareCss.includes('v4.11z52w54 — Compare Single Report column alignment polish'), 'Compare CSS should include w54 single report layout styles');
assert.ok(probeSource.includes('v4.11z52w54'), 'Click Truth Probe visible version should be w54');

const html = buildCompareView({ history, rawArchive, runA: history[0], runB: null, ui: { activeTab: 'compare' } });
assert.match(html, /<section class="tbi-compare-layout single-mode tbi-compare-column-layout">/, 'Single Report should use independent column layout');
assert.match(html, /tbi-compare-column tbi-compare-column-primary/, 'Single Report should render a primary column');
assert.match(html, /tbi-compare-column tbi-compare-column-secondary/, 'Single Report should render a secondary column');
assert.ok(html.indexOf('Run A Intel') < html.indexOf('Efficiency'), 'primary column should stack run summary before efficiency');
assert.ok(html.indexOf('Efficiency') < html.indexOf('Death Pressure Context'), 'primary column should stack efficiency before death pressure');
assert.ok(html.indexOf('Run Insights') < html.indexOf('Compared With Saved Runs'), 'secondary column should stack insights before saved-run rank context');
assert.ok(html.indexOf('Compared With Saved Runs') < html.indexOf('Similar Runs Context'), 'secondary column should stack ranks before similar-run context');
assert.ok(html.includes('tbi-compare-single-efficiency'), 'Single Report efficiency should use the dedicated compact class');
assert.match(html, /Similar Runs Context/, 'Single Report should retain similar runs context');
assert.match(html, /Next Test Suggestion/, 'Single Report should retain next test suggestion');

const abHtml = buildCompareView({ history, rawArchive, runA: history[0], runB: history[1], ui: { activeTab: 'compare' } });
const rankMatches = abHtml.match(/History Rank Context/g) || [];
assert.equal(rankMatches.length, 1, 'A/B Compare should not duplicate History Rank Context');

console.log('v4.11z52w54 Compare Single Report column alignment polish test passed.');
