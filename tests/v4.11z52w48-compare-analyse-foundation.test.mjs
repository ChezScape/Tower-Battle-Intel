import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildCompareView, buildCompareAnalyseModel } from '../src/ui/sections/compareView.js';
import { buildDesktopWorkspace } from '../src/ui/views/desktopView.js';

function makeRun(index, overrides = {}) {
    return {
        core: {
            battleDate: `May ${String(index).padStart(2, '0')}, 2026 08:00`,
            tier: overrides.tier ?? 11,
            wave: overrides.wave ?? (7300 + index),
            killedBy: overrides.killedBy || (index % 2 ? 'Basic' : 'Fast'),
            coins: overrides.coins ?? (100_000_000_000_000 + index),
            cells: overrides.cells ?? (120_000 + index),
            time: 36000
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
    makeRun(1, { killedBy: 'Basic', wave: 7609, coinsPerHour: 8_200_000_000_000, cellsPerHour: 13540, cells: 136850, coins: 82_870_000_000_000 }),
    makeRun(2, { killedBy: 'Fast', wave: 7381, coinsPerHour: 12_960_000_000_000, cellsPerHour: 13020, cells: 127940, coins: 127_330_000_000_000 }),
    makeRun(3, { killedBy: 'Ray', wave: 7777, coinsPerHour: 12_450_000_000_000, cellsPerHour: 14470, cells: 150380, coins: 129_410_000_000_000 }),
    makeRun(4, { killedBy: 'Scatter', wave: 1115, runType: 'tournament', coinsPerHour: 9_630_000_000, cellsPerHour: 768, cells: 1390, coins: 17_470_000_000 })
];

const rawArchive = { reports: history.map(run => ({ reportId: run.meta.reportId, rawText: run.raw.reportText })) };

const config = readFileSync('config/appConfig.js', 'utf8');
const desktopSource = readFileSync('src/ui/views/desktopView.js', 'utf8');
const compareSource = readFileSync('src/ui/sections/compareView.js', 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w51"'), 'visible build version should be w51');
assert.ok(desktopSource.includes('buildCompareView'), 'desktop Compare panel should mount the rebuilt Compare view');
assert.ok(compareSource.includes('COMPARE & ANALYSE GLANCE POLISH v4.11z52w51'), 'Compare source should identify the w51 foundation');

let html = buildCompareView({ history, rawArchive });
assert.match(html, /Saved Runs Intel/, 'no loaded slots should show Library Intel mode');
assert.match(html, /Library Overview/, 'Library Intel should include overview panel');
assert.match(html, /Top Records/, 'Library Intel should include top-records panel');
assert.match(html, /Death Patterns/, 'Library Intel should include death patterns');
assert.match(html, /Run Band Mix/, 'Library Intel should include run band mix');
assert.match(html, /Open History/, 'Compare should offer a History route');

html = buildCompareView({ history, rawArchive, runA: history[0] });
assert.match(html, /Single Report Intel/, 'one loaded slot should show single-report analysis');
assert.match(html, /Run A Intel/, 'single mode should label the loaded slot');
assert.match(html, /Compared With Saved Runs/, 'single mode should include library ranking context');
assert.match(html, /Efficiency/, 'single mode should include efficiency panel');

html = buildCompareView({ history, rawArchive, runA: history[0], runB: history[1] });
assert.match(html, /Run A vs Run B/, 'two loaded slots should show A/B Compare mode');
assert.match(html, /Difference/, 'A/B mode should include difference tiles');
assert.match(html, /Purpose Verdict/, 'A/B mode should include purpose verdicts');
assert.match(html, /Death Pressure/, 'A/B mode should include death pressure comparison');
assert.match(html, /Run A ended to Basic; Run B ended to Fast/, 'A/B mode should describe deaths');

const model = buildCompareAnalyseModel({ history, rawArchive, runA: history[0], runB: history[1] });
assert.equal(model.mode, 'ab', 'model should identify A/B mode');
assert.equal(model.library.runTypes.normal, 3, 'library run-type counts should include normal runs');
assert.equal(model.library.runTypes.tournament, 1, 'library run-type counts should include tournament runs');

const desktopHtml = buildDesktopWorkspace('compare', { history, rawArchive, runA: history[0], runB: history[1] });
assert.match(desktopHtml, /data-compare-analyse="true"/, 'desktop workspace should render Compare & Analyse');
assert.match(desktopHtml, /Run A vs Run B/, 'desktop compare panel should render A/B foundation');

console.log('v4.11z52w51 Compare & Analyse foundation test passed.');
