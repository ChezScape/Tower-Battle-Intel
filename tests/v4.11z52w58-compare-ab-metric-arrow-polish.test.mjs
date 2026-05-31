import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCompareView } from '../src/ui/sections/compareView.js';

function makeRun(index, overrides = {}) {
    return {
        core: {
            battleDate: `May ${String(index).padStart(2, '0')}, 2026 08:00`,
            tier: overrides.tier ?? 11,
            wave: overrides.wave ?? (7300 + index),
            killedBy: overrides.killedBy || (index % 2 ? 'Ray' : 'Scatter'),
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
const source = readFileSync('src/ui/sections/compareView.js', 'utf8');
const css = readFileSync('styles/desktop/05-compare.css', 'utf8');
const probe = readFileSync('src/ui/events/browserClickTruthProbe.js', 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w58"'), 'visible build version should be w58');
assert.ok(source.includes('COMPARE AB METRIC ARROW POLISH v4.11z52w58'), 'Compare source should identify w58 metric arrow polish');
assert.ok(source.includes('tbi-run-stat-arrow'), 'Compare should use arrow marker class for A/B stat values');
assert.ok(!source.includes('tbi-run-letter tbi-run-stat-badge'), 'Compare should not render circular stat-badge letters for metric pairs');
assert.ok(css.includes('v4.11z52w58 — Compare A/B metric arrows replacing circular stat badges'), 'CSS should include w58 metric arrow polish styles');
assert.ok(css.includes(':not(.tbi-run-stat-badge):not(.tbi-run-stat-arrow)'), 'metric value selector should not override arrow colours');
assert.ok(probe.includes('v4.11z52w58'), 'Click Truth Probe should show w58');

const html = buildCompareView({ history, rawArchive, runA: history[0], runB: history[1], ui: { activeTab: 'compare' } });
assert.match(html, /tbi-run-letter tbi-run-stat-arrow tbi-run-slot-a/, 'A metric markers should use arrow class');
assert.match(html, /tbi-run-letter tbi-run-stat-arrow tbi-run-slot-b/, 'B metric markers should use arrow class');
assert.doesNotMatch(html, /tbi-run-stat-badge/, 'A/B metric stat values should not use circular stat badges');
assert.match(html, /<span class="tbi-run-letter tbi-run-stat-arrow tbi-run-slot-a"[^>]*><b>A<\/b><i>›<\/i><\/span>/, 'A marker should show arrow chevron');
assert.match(html, /<span class="tbi-run-letter tbi-run-stat-arrow tbi-run-slot-b"[^>]*><b>B<\/b><i>›<\/i><\/span>/, 'B marker should show arrow chevron');
assert.match(html, /Difference[\s\S]*tbi-compare-slot-metric-pair/, 'Difference tiles should keep A/B metric pairs');
assert.match(html, /Ranked Differences[\s\S]*tbi-compare-slot-metric-pair/, 'Ranked Differences should keep A/B metric pairs');
assert.match(html, /Purpose Verdict[\s\S]*Best push run[\s\S]*tbi-compare-slot-metric-pair/, 'Purpose Verdict should keep A/B metric pairs');
assert.match(html, /<span class="tbi-run-slot tbi-run-slot-a"[^>]*>Run <b>A<\/b><\/span>/, 'Full Run A chips should remain');
assert.match(html, /<span class="tbi-run-slot tbi-run-slot-b"[^>]*>Run <b>B<\/b><\/span>/, 'Full Run B chips should remain');

console.log('v4.11z52w58 Compare A/B metric arrow polish test passed.');
