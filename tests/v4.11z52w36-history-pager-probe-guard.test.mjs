import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { clearElement } from '../src/ui/dom.js';
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
    stats: { coinsPerHour: 10000000000000 + i, cellsPerHour: 13000 + i },
    meta: { reportId: `rpt_${i}`, fingerprint: `fp_${i}`, runType: i % 3 === 0 ? 'tournament' : 'normal' },
    raw: { reportText: 'Battle Report\nWave\t7000' }
  };
}

const configSource = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');
const workspaceSource = readFileSync(new URL('../src/ui/events/workspaceEvents.js', import.meta.url), 'utf8');
const probeSource = readFileSync(new URL('../src/ui/events/browserClickTruthProbe.js', import.meta.url), 'utf8');
const eventRootSource = readFileSync(new URL('../src/ui/events/index.js', import.meta.url), 'utf8');
const domSource = readFileSync(new URL('../src/ui/dom.js', import.meta.url), 'utf8');

assert.ok(configSource.includes('buildVersion: "v4.11z52w39"'), 'visible build version should be w36');
assert.ok(workspaceSource.includes('history-page-jump-enter'), 'Enter should remain supported for page jump');
assert.ok(workspaceSource.includes('deferRender'), 'page jump should defer render to avoid stale focus/blur timing');
assert.equal(workspaceSource.includes('history:page-jump-change'), false, 'change/blur should not trigger a second page-jump render');
assert.ok(probeSource.includes('Guarded stale DOM timing after render'), 'Click Truth Probe should classify stale DOM timing as guarded');
assert.ok(eventRootSource.includes('handleEventError'), 'event root should centralise guarded error handling');
assert.ok(eventRootSource.includes('!isStaleRenderTimingError'), 'event root should avoid scary toast for guarded stale timing');
assert.ok(domSource.includes('isStaleDomClearError'), 'clearElement should guard replaceChildren stale-node timing');

const state = {
  history: Array.from({ length: 31 }, (_, i) => makeRun(i)),
  ui: { historyFilters: { page: 3, sort: 'newest', showArchived: false } },
  rawArchive: { reports: Array.from({ length: 31 }, (_, i) => ({ reportId: `rpt_${i}`, rawText: 'Battle Report' })) }
};

const html = buildHistoryView(state);
assert.match(html, /Showing 13–18 of 31/, 'page 3 should still render the right result range');
assert.match(html, /data-history-page-jump="true"/, 'jump input should still render');
assert.match(html, /data-history-page-jump-go="true"/, 'jump Go button should still render');

const fakeDisconnected = { nodeType: 1, isConnected: false, replaceChildren() { throw new Error('should not be called'); } };
assert.equal(clearElement(fakeDisconnected), fakeDisconnected, 'clearElement should ignore disconnected stale elements safely');

console.log('v4.11z52w36 History pager/probe guard checks passed.');
