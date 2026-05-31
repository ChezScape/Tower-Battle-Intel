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

assert.ok(config.includes('buildVersion: "v4.11z52w51"'), 'visible build version should be w51');
assert.ok(compareSource.includes('COMPARE & ANALYSE GLANCE POLISH v4.11z52w51'), 'Compare source should identify w51 glance polish');
assert.ok(compareSource.includes('tbi-compare-verdict-primary'), 'Compare should use the stronger verdict block class');
assert.ok(compareCss.includes('v4.11z52w51'), 'Compare CSS should include w51 glance polish styles');
assert.ok(probeSource.includes('v4.11z52w51'), 'Click Truth Probe visible version should be w51');

let html = buildCompareView({ history, rawArchive });
assert.match(html, /Saved Runs Intel/, 'library mode should still render when no slots are loaded');
assert.match(html, /Top Records/, 'Library Intel should use the polished records wording');
assert.doesNotMatch(html, /Best Runs/, 'Old Best Runs wording should be removed from Compare library mode');

html = buildCompareView({ history, rawArchive, runB: history[1] });
assert.match(html, /Single Report Intel/, 'one loaded slot should show Single Report mode');
assert.match(html, /<em>Verdict<\/em>/, 'single mode should show a labelled verdict');
assert.match(html, /Deep farming run with strong coin pace\. Scatter was the limiting pressure\./, 'single verdict should read as a clear sentence');
assert.match(html, /compact-efficiency/, 'single mode should use compact efficiency tiles');
assert.match(html, /Death pattern/, 'saved-run comparison should use clearer death pattern wording');

html = buildCompareView({ history, rawArchive, runA: history[0], runB: history[1] });
assert.match(html, /Run A vs Run B/, 'two loaded slots should show A\/B Compare mode');
assert.match(html, /A\/B Verdict/, 'A\/B mode should use the polished verdict panel title');
assert.match(html, /Run A pushed deeper by \+228 waves/, 'A\/B verdict should explain push winner with value');
assert.match(html, /Run B earned \+44\.46T more coins/, 'A\/B verdict should explain coin winner with value');
assert.match(html, /Run B had better farming pace/, 'A\/B verdict should explain farming pace winner');
assert.match(html, /Run A leads push; Run B leads coin pace/, 'A\/B subtext should explain purpose split');

const model = buildCompareAnalyseModel({ history, rawArchive, runA: history[0], runB: history[1] });
assert.equal(model.mode, 'ab', 'model should still identify A/B mode');

console.log('v4.11z52w51 Compare glance polish test passed.');
