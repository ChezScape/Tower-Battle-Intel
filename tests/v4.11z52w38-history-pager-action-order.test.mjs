import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildHistoryView } from '../src/ui/sections/history/historyView.js';

function makeRun(i, archived = false) {
  return {
    core: {
      battleDate: `May ${String(i + 1).padStart(2, '0')}, 2026 08:46`,
      tier: 11,
      wave: 7000 + i,
      killedBy: i % 2 ? 'Fast' : 'Basic',
      coins: 100000000000000 + i,
      cells: 100000 + i,
      realTime: '10h 0m 0s'
    },
    stats: {
      coinsPerHour: 10000000000000 + i,
      cellsPerHour: 13000 + i
    },
    meta: {
      reportId: `rpt_${i}`,
      fingerprint: `fp_${i}`,
      archived,
      runType: i % 3 === 0 ? 'tournament' : 'normal'
    },
    raw: { reportText: 'Battle Report\nWave\t7000' }
  };
}

const config = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');
assert.ok(config.includes('buildVersion: "v4.11z52w39"'), 'visible build version should be w38');

const history = Array.from({ length: 31 }, (_, i) => makeRun(i, i >= 24));
const baseState = {
  history,
  ui: { historyFilters: { page: 5, sort: 'newest', showArchived: true } },
  rawArchive: { reports: history.map((run, i) => ({ reportId: `rpt_${i}`, rawText: 'Battle Report' })) }
};

const html = buildHistoryView(baseState);
assert.match(html, /Showing 25–30 of 31/, 'page five should still show the correct report range');
assert.match(html, /Page 5 of 6/, 'pager should show the current page and total pages');
assert.match(html, /tbi-history2-pager-nav/, 'pager should separate navigation controls');
assert.match(html, /tbi-history2-page-actions/, 'pager should separate page actions');
assert.match(html, /Archive Page/, 'pager should always include Archive Page');
assert.match(html, /Restore Page/, 'pager should include Restore Page when archived reports are shown');

const order = [
  '>First<',
  '>Previous<',
  '<span>Jump</span>',
  '>Go<',
  '>Next<',
  '>Last<',
  '>Archive Page<',
  '>Restore Page<' 
].map(token => html.indexOf(token));
assert.ok(order.every(index => index >= 0), 'all expected pager controls should render');
for (let i = 1; i < order.length; i += 1) {
  assert.ok(order[i - 1] < order[i], `pager control ${i - 1} should appear before ${i}`);
}

const activeOnlyHtml = buildHistoryView({
  ...baseState,
  ui: { historyFilters: { page: 1, sort: 'newest', showArchived: false } }
});
assert.match(activeOnlyHtml, /Archive Page/, 'active-only view should include Archive Page');
assert.equal(activeOnlyHtml.includes('Restore Page'), false, 'active-only view should not show Restore Page');

console.log('v4.11z52w39 History pager action order checks passed.');
