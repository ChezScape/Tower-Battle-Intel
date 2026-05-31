import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

import { setState, getState } from '../src/core/state.js';
import { actionSaveReportFromInput } from '../src/actions/commandDeckReportActions.js';
import { buildHistoryStateModel } from '../src/ui/sections/history/historyShared.js';
import { buildHistoryInspector } from '../src/ui/sections/history/historyInspector.js';

const config = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');
const inspectorSource = readFileSync(new URL('../src/ui/sections/history/historyInspector.js', import.meta.url), 'utf8');
const gameBrainSource = readFileSync(new URL('../src/history/historyGameBrain.js', import.meta.url), 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w40"'), 'visible build version should be w40');
assert.ok(gameBrainSource.includes('buildDeathFamilyDetails'), 'History Game Brain should expose death family details');
assert.ok(inspectorSource.includes('Run band mix'), 'Library Intel should use Run band mix wording');
assert.ok(inspectorSource.includes('Death family'), 'Library Intel should use Death family wording');
assert.ok(inspectorSource.includes('Elite deaths'), 'Library Intel should include Elite deaths row when present');
assert.equal(inspectorSource.includes('Top family'), false, 'Library Intel should not use vague Top family wording');
assert.equal(inspectorSource.includes('Common band'), false, 'Library Intel should not use vague Common band wording');

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
const model = buildHistoryStateModel(getState());
const inspectorHtml = buildHistoryInspector(model);

assert.equal(model.insights.topBand.label, 'Deep run / farming endurance band', 'fixture top band should be the deep farming band');
assert.equal(model.insights.topBand.count, 26, 'fixture deep farming band count should be 26');
assert.equal(model.insights.topFamily.label, 'Enemy / Common', 'fixture top family should be common enemies');
assert.equal(model.insights.topFamily.count, 26, 'fixture common enemy family count should be 26');
assert.equal(model.insights.deathFamilyDetails.elite.count, 5, 'fixture should detect five elite-family deaths');
assert.equal(model.insights.deathFamilyDetails.elite.label, 'Scatter + Ray', 'elite-family details should show Scatter + Ray');
assert.equal(model.insights.deathFamilyDetails.common.count, 26, 'fixture should detect 26 common-family deaths');

assert.match(inspectorHtml, /Run band mix/, 'inspector should render Run band mix');
assert.match(inspectorHtml, /Deep farming/, 'inspector should show friendly Deep farming label');
assert.match(inspectorHtml, /26 runs/, 'inspector should show 26 runs for deep farming/common enemies');
assert.match(inspectorHtml, /Death family/, 'inspector should render Death family');
assert.match(inspectorHtml, /Common enemies/, 'inspector should show friendly Common enemies label');
assert.match(inspectorHtml, /Elite deaths/, 'inspector should render Elite deaths row');
assert.match(inspectorHtml, /Scatter \+ Ray/, 'inspector should show elite death labels');
assert.match(inspectorHtml, /5 runs/, 'inspector should show elite death count');
assert.doesNotMatch(inspectorHtml, /Top family/i, 'inspector should not render old Top family wording');
assert.doesNotMatch(inspectorHtml, /Common band/i, 'inspector should not render old Common band wording');

const rootChangelogs = readdirSync(new URL('..', import.meta.url)).filter(name => /^CHANGELOG_v4\.11z52/.test(name));
assert.ok(rootChangelogs.includes('CHANGELOG_v4.11z52w40.md'), 'w40 changelog should be at root');
assert.ok(rootChangelogs.includes('CHANGELOG_v4.11z52w36.md'), 'latest-five root changelogs should retain w36');
assert.ok(!rootChangelogs.includes('CHANGELOG_v4.11z52w35.md'), 'w35 should be moved out of root once w40 exists');
assert.ok(existsSync(new URL('../docs/legacy-logs/changelogs/CHANGELOG_v4.11z52w35.md', import.meta.url)), 'w35 changelog should be moved to legacy logs');

console.log('v4.11z52w40 Library Intel glance polish checks passed.');
