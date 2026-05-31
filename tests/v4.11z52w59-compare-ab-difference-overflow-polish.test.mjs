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

assert.ok(config.includes('buildVersion: "v4.11z52w59"'), 'visible build version should be w59');
assert.ok(source.includes('COMPARE AB DIFFERENCE OVERFLOW POLISH v4.11z52w59'), 'Compare source should identify w59 overflow polish');
assert.ok(probe.includes('v4.11z52w59'), 'Click Truth Probe should show w59');
assert.ok(css.includes('v4.11z52w59 — Compare A/B Difference overflow containment polish'), 'CSS should include w59 overflow containment styles');
assert.match(css, /\.tbi-compare-layout\.ab-mode \.tbi-compare-diff-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/, 'A/B Difference grid should default to two columns to avoid narrow five-card overflow');
assert.match(css, /\.tbi-compare-layout\.ab-mode \.tbi-compare-diff-tile em \.tbi-compare-slot-metric-pair\s*\{[\s\S]*?grid-template-columns:\s*auto minmax\(0, 1fr\) auto auto minmax\(0, 1fr\)/, 'A/B metric pairs should use contained grid columns');
assert.match(css, /text-overflow:\s*ellipsis/, 'A/B metric values should be contained rather than overspilling');

const html = buildCompareView({ history, rawArchive, runA: history[0], runB: history[1], ui: { activeTab: 'compare' } });
assert.match(html, /Difference[\s\S]*tbi-compare-diff-grid/, 'Difference panel should still render the diff grid');
assert.match(html, /<span class="tbi-run-letter tbi-run-stat-arrow tbi-run-slot-a"[^>]*><b>A<\/b><i>›<\/i><\/span>/, 'A metric marker should remain arrow style');
assert.match(html, /<span class="tbi-run-letter tbi-run-stat-arrow tbi-run-slot-b"[^>]*><b>B<\/b><i>›<\/i><\/span>/, 'B metric marker should remain arrow style');
assert.match(html, /Ranked Differences[\s\S]*tbi-compare-slot-metric-pair/, 'Ranked Differences should retain A/B metric pairs');
assert.match(html, /Purpose Verdict[\s\S]*tbi-compare-slot-metric-pair/, 'Purpose Verdict should retain A/B metric pairs');

console.log('v4.11z52w59 Compare A/B Difference overflow polish test passed.');
