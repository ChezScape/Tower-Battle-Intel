import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { setState, getState } from '../src/core/state.js';
import { actionSaveReportFromInput } from '../src/actions/commandDeckReportActions.js';
import { buildHistoryStateModel } from '../src/ui/sections/history/historyShared.js';
import { buildHistoryView } from '../src/ui/sections/history/historyView.js';

const config = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');
assert.ok(config.includes('buildVersion: "v4.11z52w46"'), 'visible build version should be w45');

const batch = readFileSync(new URL('./fixtures/andrew-batch-31-reports.txt', import.meta.url), 'utf8');

setState({
  history: [],
  rawArchive: null,
  rawReportArchive: null,
  runA: null,
  runB: null,
  currentRun: null,
  compareData: null,
  insights: [],
  ai: [],
  anomalies: [],
  inspection: null,
  ui: { historyFilters: { showArchived: false, page: 1, runType: 'all', mode: 'normal' } },
  lastInput: ''
});

actionSaveReportFromInput({ value: batch, placeholder: '' });
let state = getState();
assert.equal(state.history.length, 31, 'fixture should save 31 parsed reports');

setState({ ui: { historyFilters: { query: 'ray', page: 1, mode: 'normal', showArchived: false, runType: 'all' } } });
state = getState();
const model = buildHistoryStateModel(state);
const html = buildHistoryView(state);

assert.equal(model.visibleEntries.length, 1, 'Normal Search should search the full library and find the Ray report');
assert.equal(model.pagedEntries.length, 1, 'paged entries should contain the Ray match');
assert.match(html, /Showing 1–1 of 1/, 'History list should show one matching result, not zero current-page DOM matches');
assert.match(html, /Killed By Ray/i, 'matching card should show the Ray run');
assert.doesNotMatch(html, /0 visible of 6 shown/i, 'Search status should not be limited to the six already-rendered cards');

const workspace = readFileSync(new URL('../src/ui/events/workspaceEvents.js', import.meta.url), 'utf8');
assert.match(workspace, /history:search-library-render/, 'History input should use full-library render search action');
assert.match(workspace, /scheduleHistorySearchRender/, 'History search should schedule a render with focus restore');
assert.match(workspace, /page: 1, selectedIndex: null/, 'History search should reset to page 1 and clear stale selection');
assert.doesNotMatch(workspace, /applyHistorySearchDom\(search\)/, 'History input must not filter only the current DOM page');

console.log('v4.11z52w46 History full-library search render test passed.');
