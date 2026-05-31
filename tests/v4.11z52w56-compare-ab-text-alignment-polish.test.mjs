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

assert.ok(config.includes('buildVersion: "v4.11z52w56"'), 'visible build version should be w56');
assert.ok(source.includes('COMPARE AB TEXT ALIGNMENT POLISH v4.11z52w56'), 'Compare source should identify w56 text alignment polish');
assert.ok(source.includes('function intelRowRich'), 'Compare should include rich row helper for chip labels');
assert.ok(source.includes('function slotRow'), 'Compare should include slot row helper');
assert.ok(css.includes('v4.11z52w56 — Compare A/B text alignment and matching slot-chip polish'), 'CSS should include w56 alignment styles');
assert.ok(probe.includes('v4.11z52w56'), 'Click Truth Probe should show w56');

const html = buildCompareView({ history, rawArchive, runA: history[0], runB: history[1], ui: { activeTab: 'compare' } });
assert.match(html, /tbi-compare-title-slot-a/, 'A/B title should colour Run A');
assert.match(html, /tbi-compare-title-slot-b/, 'A/B title should colour Run B');
assert.match(html, /Ranked Differences/, 'Biggest Differences should be renamed to Ranked Differences');
assert.match(html, /tbi-compare-ab-aligned-rows tbi-compare-death-compact/, 'Death Pressure should use aligned A/B rows');
assert.match(html, /<span class="tbi-run-slot tbi-run-slot-a"[^>]*>Run <b>A<\/b><\/span><\/span>\s*<strong>Ray<\/strong>/, 'Run A death row should use matching Run A chip label');
assert.match(html, /<span class="tbi-run-slot tbi-run-slot-b"[^>]*>Run <b>B<\/b><\/span><\/span>\s*<strong>Scatter<\/strong>/, 'Run B death row should use matching Run B chip label');
assert.match(html, /Death · Enemy \/ Elite · 1 run in library/, 'Death row should keep context aligned in the note column');
assert.match(html, /Raw source[\s\S]*tbi-run-slot-a[\s\S]*linked[\s\S]*tbi-run-slot-b[\s\S]*linked/, 'Comparison Fairness raw-source row should use Run A/B chips in notes');
assert.match(html, /History Rank Context[\s\S]*tbi-run-slot-a[\s\S]*#/, 'History rank rows should use Run A/B chips');

console.log('v4.11z52w56 Compare A/B text alignment polish test passed.');
