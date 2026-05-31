import assert from 'node:assert/strict';
import fs from 'node:fs';

import { setState, getState } from '../src/core/state.js';
import { actionSaveReportFromInput } from '../src/actions/commandDeckReportActions.js';
import { buildHistoryStateModel } from '../src/ui/sections/history/historyShared.js';
import { buildHistoryView } from '../src/ui/sections/history/historyView.js';
import { buildHistoryInspector } from '../src/ui/sections/history/historyInspector.js';
import { performUIAction } from '../src/actions/index.js';

const config = fs.readFileSync('config/appConfig.js', 'utf8');
const toolbarSource = fs.readFileSync('src/ui/sections/history/historyToolbar.js', 'utf8');
const runListSource = fs.readFileSync('src/ui/sections/history/historyRunList.js', 'utf8');
const inspectorSource = fs.readFileSync('src/ui/sections/history/historyInspector.js', 'utf8');
const workspaceSource = fs.readFileSync('src/ui/events/workspaceEvents.js', 'utf8');
const cardSource = fs.readFileSync('src/ui/sections/history/historyRunCard.js', 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w36"'), 'visible build version should be w34');
assert.ok(toolbarSource.includes('HISTORY_RUN_TYPE_OPTIONS'), 'History toolbar should include Run Type filter options');
assert.ok(runListSource.includes('6 cards per page'), 'History list should explain 6-card pagination');
assert.ok(workspaceSource.includes('history-page-change'), 'workspaceEvents should own page changes');
assert.ok(workspaceSource.includes('history-archive-page'), 'workspaceEvents should own Archive Page');
assert.ok(workspaceSource.includes('history-select-card'), 'workspaceEvents should let card background click select a report');
assert.ok(cardSource.includes('data-history-select-index'), 'run cards should be selectable from the card background');
assert.equal(inspectorSource.includes('tbi-history2-ab-controls'), false, 'duplicated A/B control block should be removed from the inspector');
assert.ok(inspectorSource.includes('Open Dashboard'), 'inspector should keep Open Dashboard as a selected-report action');
assert.equal(cardSource.includes('Raw archive'), false, 'cards should use Raw source wording instead of Raw archive');

const batch = fs.readFileSync('tests/fixtures/andrew-batch-31-reports.txt', 'utf8');

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
  ui: { historyFilters: { showArchived: false, page: 1, runType: 'all' } },
  lastInput: ''
});

actionSaveReportFromInput({ value: batch, placeholder: '' });
let state = getState();
let model = buildHistoryStateModel(state);
let html = buildHistoryView(state);

assert.equal(state.history.length, 31, 'fixture should save 31 runs');
assert.equal(model.pagination.pageSize, 6, 'History should page at six cards');
assert.equal(model.pagedEntries.length, 6, 'first page should render six cards');
assert.match(html, /Showing 1–6 of 31/, 'render should show first page range');
assert.match(html, /Page 1 of 6/, 'render should show page count');
assert.match(html, /data-history-page-target="2"/, 'render should expose next page control');
assert.match(html, /Archive Page/, 'render should expose Archive Page for active runs');
assert.equal((html.match(/data-history-card=/g) || []).length, 6, 'rendered grid should include six cards on the page');

performUIAction('history-set-filters', { page: 2, runType: 'all' });
state = getState();
model = buildHistoryStateModel(state);
html = buildHistoryView(state);
assert.equal(model.pagedEntries.length, 6, 'second page should render six cards');
assert.match(html, /Showing 7–12 of 31/, 'second page should show correct range');
assert.match(html, /data-history-page-target="1"/, 'second page should expose previous page control');

performUIAction('history-set-filters', { page: 1, runType: 'tournament' });
state = getState();
model = buildHistoryStateModel(state);
html = buildHistoryView(state);
assert.equal(model.visibleEntries.length, 5, 'Run Type filter should find the five tournament runs from the fixture');
assert.equal(model.pagedEntries.length, 5, 'Tournament filter should render all five on one page');
assert.match(html, /Showing 1–5 of 5/, 'run type filter should show filtered range');
assert.match(html, /Tournament/, 'run type filter should render tournament cards');

const inspector = buildHistoryInspector(model);
assert.equal(inspector.includes('Swap A/B'), false, 'selected-report inspector should not duplicate global Swap A/B');
assert.equal(inspector.includes('Clear A/B'), false, 'selected-report inspector should not duplicate global Clear A/B');
assert.ok(inspector.includes('Open Dashboard'), 'selected-report inspector should keep Open Dashboard action');
assert.ok(inspector.includes('Raw source linked'), 'inspector should use Raw source wording');

console.log('v4.11z52w36 History pagination/card/inspector polish test passed.');
