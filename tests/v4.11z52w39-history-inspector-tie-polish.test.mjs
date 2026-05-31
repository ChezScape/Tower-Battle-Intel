import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

import { setState, getState } from '../src/core/state.js';
import { actionSaveReportFromInput } from '../src/actions/commandDeckReportActions.js';
import { buildHistoryStateModel } from '../src/ui/sections/history/historyShared.js';
import { buildHistoryInspector } from '../src/ui/sections/history/historyInspector.js';
import { buildHistoryHeader } from '../src/ui/sections/history/historyHeader.js';

const config = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');
const inspectorSource = readFileSync(new URL('../src/ui/sections/history/historyInspector.js', import.meta.url), 'utf8');
const gameBrainSource = readFileSync(new URL('../src/history/historyGameBrain.js', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../styles/desktop/04-history-rebuild.css', import.meta.url), 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w39"'), 'visible build version should be w39');
assert.ok(gameBrainSource.includes('formatTieLabel'), 'History Game Brain should include tie-label formatting');
assert.ok(gameBrainSource.includes('countText'), 'History Game Brain should expose tie-aware count text');
assert.ok(inspectorSource.includes('Most common deaths'), 'Inspector Library Intel should use clearer death wording');
assert.equal(inspectorSource.includes('Top killed by'), false, 'Inspector should not use old Top killed by wording');
assert.ok(inspectorSource.includes('Cells/h'), 'Inspector should fill metric gaps with Cells/h');
assert.ok(inspectorSource.includes('Real time'), 'Inspector should fill metric gaps with Real time');
assert.equal(inspectorSource.includes('statusPill("Next target"'), false, 'Inspector proof chips should not duplicate Next target');
assert.equal(inspectorSource.includes('statusPill("Mapping"'), false, 'Inspector proof chips should not duplicate Mapping');
assert.ok(cssSource.includes('v4.11z52w39'), 'History CSS should include w39 selected inspector polish rules');
assert.ok(cssSource.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'), 'Inspector should use compact 2-column grids');

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
  ui: { historyFilters: { page: 1, sort: 'newest', showArchived: false, runType: 'all' } },
  lastInput: ''
});

actionSaveReportFromInput({ value: batch, placeholder: '' });
const state = getState();
const model = buildHistoryStateModel(state);
const inspectorHtml = buildHistoryInspector(model);
const headerHtml = buildHistoryHeader(model);

assert.equal(state.history.length, 31, 'fixture should save 31 History reports');
assert.deepEqual(model.insights.killedByCounts, {
  Basic: 7,
  Fast: 7,
  Tank: 6,
  Ranged: 6,
  Scatter: 4,
  Ray: 1
}, '31-report batch killed-by counts should match the verified totals');
assert.equal(model.insights.topKilledBy.tied, true, 'Basic and Fast should be detected as a tie');
assert.equal(model.insights.topKilledBy.label, 'Basic + Fast', 'tie should show both top deaths');
assert.equal(model.insights.topKilledBy.countText, '7 each', 'tie should show each-count wording');
assert.match(inspectorHtml, /Most common deaths/, 'inspector should render Most common deaths');
assert.match(inspectorHtml, /Basic \+ Fast/, 'inspector should render tied top deaths');
assert.match(inspectorHtml, /7 each/, 'inspector should render tie count text');
assert.doesNotMatch(inspectorHtml, /Top killed by/i, 'inspector should not render old Top killed by wording');
assert.match(headerHtml, /Common deaths/, 'header should use plural common-deaths wording');
assert.match(headerHtml, /Basic \+ Fast/, 'header should show tied common deaths');

const rootChangelogs = readdirSync(new URL('..', import.meta.url)).filter(name => /^CHANGELOG_v4\.11z52/.test(name));
assert.ok(rootChangelogs.includes('CHANGELOG_v4.11z52w39.md'), 'w39 changelog should be at root');
assert.ok(rootChangelogs.includes('CHANGELOG_v4.11z52w35.md'), 'latest-five root changelogs should retain w35');
assert.ok(!rootChangelogs.includes('CHANGELOG_v4.11z52w34.md'), 'w34 should be moved out of root once w39 exists');
assert.ok(existsSync(new URL('../docs/legacy-logs/changelogs/CHANGELOG_v4.11z52w34.md', import.meta.url)), 'w34 changelog should be moved to legacy logs');

console.log('v4.11z52w39 History inspector tie polish checks passed.');
