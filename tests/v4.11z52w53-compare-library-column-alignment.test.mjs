import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCompareView } from '../src/ui/sections/compareView.js';

const config = readFileSync('config/appConfig.js', 'utf8');
const compareSource = readFileSync('src/ui/sections/compareView.js', 'utf8');
const compareCss = readFileSync('styles/desktop/05-compare.css', 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w53"'), 'visible build version should be w53');
assert.ok(compareSource.includes('COMPARE LIBRARY INTEL COLUMN ALIGNMENT POLISH v4.11z52w53'), 'Compare source should identify w53 column alignment polish');
assert.ok(compareSource.includes('tbi-compare-column-layout'), 'Library Intel should render through a two-column stack layout');
assert.ok(compareSource.includes('tbi-compare-column-primary'), 'Library Intel should have a primary stacked column');
assert.ok(compareSource.includes('tbi-compare-column-secondary'), 'Library Intel should have a secondary stacked column');
assert.ok(compareCss.includes('v4.11z52w53 — Compare Library Intel column alignment polish'), 'Compare CSS should include w53 alignment styles');
assert.ok(compareCss.includes('.tbi-compare-column .tbi-compare-intel-row'), 'Compare CSS should align rows inside Library Intel columns');

const run = (i, killedBy = 'Basic') => ({
  core: {
    battleDate: `May ${String(i).padStart(2, '0')}, 2026 05:11`,
    tier: 11,
    wave: 7000 + i,
    killedBy,
    coins: 100000000000000 + i,
    cells: 100000 + i,
    time: 36000 + i
  },
  stats: {
    coinsPerHour: 12000000000000 + i,
    cellsPerHour: 13000 + i
  },
  meta: { reportId: `rpt_${i}`, runType: i % 6 === 0 ? 'tournament' : 'normal' },
  raw: { reportText: 'Battle Report' }
});

const state = {
  history: Array.from({ length: 12 }, (_, i) => run(i + 1, i % 4 === 0 ? 'Scatter' : i % 3 === 0 ? 'Fast' : 'Basic')),
  rawArchive: { reports: Array.from({ length: 12 }, (_, i) => ({ reportId: `rpt_${i + 1}`, rawText: 'Battle Report' })) },
  runA: null,
  runB: null,
  ui: { activeTab: 'compare' }
};

const html = buildCompareView(state);
assert.ok(html.includes('tbi-compare-layout library-mode tbi-compare-column-layout'), 'Library mode should use column layout class');
assert.ok(html.includes('tbi-compare-column tbi-compare-column-primary'), 'render should include primary column wrapper');
assert.ok(html.includes('tbi-compare-column tbi-compare-column-secondary'), 'render should include secondary column wrapper');
assert.ok(html.indexOf('Library Snapshot') < html.indexOf('Top Records'), 'primary column should stack Snapshot before Top Records');
assert.ok(html.indexOf('Library Insights') < html.indexOf('Efficiency Leaders'), 'secondary column should stack Insights before Efficiency Leaders');
assert.ok(html.includes('Data Confidence'), 'Data Confidence remains in Library Intel');

console.log('v4.11z52w53 Compare Library Intel column alignment polish test passed.');
