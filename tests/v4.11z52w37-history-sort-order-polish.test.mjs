import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { HISTORY_SORT_OPTIONS, sortHistoryEntries } from '../src/history/historyFilters.js';
import { buildHistoryToolbar } from '../src/ui/sections/history/historyToolbar.js';

const config = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');
assert.ok(config.includes('buildVersion: "v4.11z52w39"'), 'visible build version should be w38');

const sortValues = HISTORY_SORT_OPTIONS.map(option => option.value);
const sortLabels = HISTORY_SORT_OPTIONS.map(option => option.label);

assert.deepEqual(sortValues, [
  'newest',
  'oldest',
  'tier_desc',
  'wave_desc',
  'quality_desc',
  'coins_desc',
  'cph_desc',
  'cells_desc',
  'cellsph_desc'
], 'History sort options should be grouped as time, progression, score, rewards, rates');

assert.deepEqual(sortLabels, [
  'Newest',
  'Oldest',
  'Highest Tier',
  'Highest Wave',
  'Best Score',
  'Highest Coins',
  'Highest Coins/h',
  'Highest Cells',
  'Highest Cells/h'
], 'History sort labels should render in logical user-facing order');

const toolbarHtml = buildHistoryToolbar({
  filters: { sort: 'newest', build: 'all', tag: 'all', runType: 'all', showArchived: false, mode: 'normal' },
  tags: ['farmfail']
});

const renderedOrder = sortLabels.map(label => toolbarHtml.indexOf(`>${label}</option>`));
assert.ok(renderedOrder.every(index => index >= 0), 'all sort labels should render in toolbar select');
for (let i = 1; i < renderedOrder.length; i += 1) {
  assert.ok(renderedOrder[i - 1] < renderedOrder[i], `sort label ${sortLabels[i - 1]} should appear before ${sortLabels[i]}`);
}

const runs = [
  { run: { core: { tier: 11, wave: 7600, coins: 1, cells: 5 }, stats: { coinsPerHour: 100, cellsPerHour: 1 }, meta: { qualityScore: 90 } }, originalIndex: 0 },
  { run: { core: { tier: 12, wave: 1000, coins: 10, cells: 1 }, stats: { coinsPerHour: 1, cellsPerHour: 100 }, meta: { qualityScore: 10 } }, originalIndex: 1 }
];
assert.equal(sortHistoryEntries(runs, 'tier_desc')[0].originalIndex, 1, 'Highest Tier sort behaviour should still work');
assert.equal(sortHistoryEntries(runs, 'wave_desc')[0].originalIndex, 0, 'Highest Wave sort behaviour should still work');

console.log('v4.11z52w39 History sort order polish checks passed.');
