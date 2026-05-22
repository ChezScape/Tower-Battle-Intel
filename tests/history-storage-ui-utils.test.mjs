import assert from 'node:assert/strict';

import { buildHistoryStats, buildPreviousDelta, buildRunQualityScore } from '../src/history/historyStats.js';
import { normaliseHistoryFilters, getVisibleHistoryEntries } from '../src/history/historyFilters.js';
import { buildHistoryBadges } from '../src/history/historyBadges.js';
import { getHistoryRun, getVisibleHistory } from '../src/history/historySelectors.js';
import { formatNumber, formatDelta, escapeHTML } from '../src/ui/utils/format.js';
import { buildDeltaDisplay } from '../src/ui/utils/deltaFormat.js';
import { getHeatStyle } from '../src/ui/utils/colourScale.js';
import { importStorage, exportStorage, clearStorage, saveStorage, loadStorage } from '../src/storage/localStore.js';
import { renderInspectionPanel } from '../src/ui/dev/inspectionPanel.js';

const history = [
  { core: { wave: 100, coins: 1000, cells: 10 }, stats: { coinsPerHour: 50, cellsPerHour: 1 }, meta: { reportId: 'a', buildStyle: 'hybrid', tags: ['farm'] } },
  { core: { wave: 200, coins: 2500, cells: 30 }, stats: { coinsPerHour: 90, cellsPerHour: 2 }, meta: { reportId: 'b', buildStyle: 'devo', tags: ['cells'] } },
  { core: { wave: 150, coins: 1800, cells: 20 }, stats: { coinsPerHour: 70, cellsPerHour: 1.5 }, meta: { reportId: 'c', archived: true, buildStyle: 'hybrid', tags: ['farm'] } }
];

const stats = buildHistoryStats(history.filter(run => !run.meta.archived));
assert.equal(stats.count, 2);
assert.equal(stats.bestWave.value, 200);
assert.equal(buildPreviousDelta(history, 1).wave, 100);
assert.ok(buildRunQualityScore(history[1], stats) > 0);

const filters = normaliseHistoryFilters({ query: 'cells', build: 'devo', tag: 'cells' });
assert.equal(filters.sort, 'newest');
assert.equal(getVisibleHistoryEntries(history, filters, stats).length, 1);
assert.equal(getVisibleHistory(history).length, 2);
assert.equal(getHistoryRun(history, 0).meta.reportId, 'a');
assert.ok(buildHistoryBadges({ run: history[1], index: 1, summary: stats }).some(b => b.label === 'Best Wave'));

assert.equal(escapeHTML('<x>'), '&lt;x&gt;');
assert.ok(formatNumber(1000));
assert.ok(formatDelta(100).startsWith('+'));
assert.equal(buildDeltaDisplay({ diff: -3 }).severity, 'bad');
assert.equal(getHeatStyle(5, 10).severity, 'good');

// Node/localStorage absent path should be safe.
assert.equal(clearStorage(), false);
assert.equal(saveStorage({ history }), false);
assert.equal(loadStorage(), null);
assert.equal(importStorage(JSON.stringify({ history })), false);
assert.equal(typeof exportStorage(), 'string');
assert.equal(typeof renderInspectionPanel, 'function');

console.log('history-storage-ui-utils.test.mjs passed');
