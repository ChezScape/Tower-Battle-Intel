import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildHistoryStateModel } from '../src/ui/sections/history/historyShared.js';
import { buildHistoryInspector } from '../src/ui/sections/history/historyInspector.js';

const run = {
  core: {
    battleDate: 'May 25, 2026 08:46',
    tier: 11,
    wave: 7381,
    killedBy: 'Scatter',
    coins: 127330000000000,
    cells: 127940,
    time: 35376
  },
  stats: {
    coinsPerHour: 12960000000000,
    cellsPerHour: 13020
  },
  meta: {
    reportId: 'rpt_20260525_0846_t11_w7381_c70a9cf',
    fingerprint: 'c70a9cf',
    runType: 'normal',
    buildStyle: 'unknown'
  },
  raw: {
    reportText: 'Battle Report\nReal Time\t9h 49m 36s\nWave\t7381'
  }
};

const state = {
  history: [run],
  runA: run,
  runB: null,
  currentRun: run,
  ui: { historyFilters: { page: 1, sort: 'newest', showArchived: false } }
};

const config = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');
assert.ok(config.includes('buildVersion: "v4.11z52w46"'), 'visible build version should be w44');

const model = buildHistoryStateModel(state);
const html = buildHistoryInspector(model);

assert.match(html, /Real time/i, 'selected report should render a Real time metric');
assert.match(html, /9h 49m 36s/, 'selected report should fall back to core.time seconds when core.realTime is absent');
assert.ok(!html.includes('<strong>-</strong>'), 'selected report should not show a dash for real time when core.time is present');

const source = readFileSync(new URL('../src/ui/sections/history/historyInspector.js', import.meta.url), 'utf8');
assert.match(source, /resolveInspectorRealTime/, 'inspector should own a focused real-time resolver');
assert.match(source, /core\.time/, 'resolver should include core.time fallback');

console.log('v4.11z52w46 History selected-report Real Time fallback test passed.');
