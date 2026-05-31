import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { buildHistoryView } from '../src/ui/sections/history/historyView.js';

function makeRun(i) {
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
      runType: i % 3 === 0 ? 'tournament' : 'normal'
    },
    raw: { reportText: 'Battle Report\nWave\t7000' }
  };
}

const state = {
  history: Array.from({ length: 31 }, (_, i) => makeRun(i)),
  ui: { historyFilters: { page: 3, sort: 'newest', showArchived: false } },
  rawArchive: { reports: Array.from({ length: 31 }, (_, i) => ({ reportId: `rpt_${i}`, rawText: 'Battle Report' })) }
};

const html = buildHistoryView(state);
assert.match(html, /Showing 13–18 of 31/, 'third page should show the correct range');
assert.match(html, /Page 3 of 6/, 'pager should show current and total pages');
assert.match(html, /data-history-page-target="1"[^>]*>First</, 'pager should include First button');
assert.match(html, /data-history-page-target="2"[^>]*>Previous</, 'pager should include Previous button');
assert.match(html, /data-history-page-target="4"[^>]*>Next</, 'pager should include Next button');
assert.match(html, /data-history-page-target="6"[^>]*>Last</, 'pager should include Last button');
assert.match(html, /data-history-page-jump="true"/, 'pager should include jump-to-page input');
assert.match(html, /data-history-page-jump-go="true"/, 'pager should include jump-to-page Go button');

const workspaceSource = readFileSync(new URL('../src/ui/events/workspaceEvents.js', import.meta.url), 'utf8');
assert.match(workspaceSource, /data-history-page-jump-go/, 'workspaceEvents should own page jump button');
assert.match(workspaceSource, /history-page-jump-enter/, 'workspaceEvents should own Enter on page jump input');

const rootChangelogs = readdirSync(new URL('..', import.meta.url)).filter(name => /^CHANGELOG_v4\.11z52/.test(name));
assert.ok(rootChangelogs.includes('CHANGELOG_v4.11z52w36.md'), 'w35 changelog should be at root');
assert.ok(rootChangelogs.includes('CHANGELOG_v4.11z52w34.md'), 'recent w34 changelog should remain at root');
assert.ok(!rootChangelogs.includes('CHANGELOG_v4.11z52w6.md'), 'old w6 changelog should not remain at root');
assert.ok(existsSync(new URL('../docs/legacy-logs/changelogs/CHANGELOG_v4.11z52w6.md', import.meta.url)), 'old w6 changelog should be moved to legacy changelog folder');

console.log('v4.11z52w36 History pager jump and legacy changelog trim verified.');
