import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

import { setState, getState } from '../src/core/state.js';
import { actionSaveReportFromInput } from '../src/actions/commandDeckReportActions.js';
import { buildHistoryStateModel } from '../src/ui/sections/history/historyShared.js';
import { buildHistoryInspector } from '../src/ui/sections/history/historyInspector.js';

const config = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');
const inspectorSource = readFileSync(new URL('../src/ui/sections/history/historyInspector.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/desktop/04-history-rebuild.css', import.meta.url), 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w41"'), 'visible build version should be w41');
assert.ok(inspectorSource.includes('buildRunIntelRows'), 'Run Intel Summary should render compact rows');
assert.ok(inspectorSource.includes('tbi-history2-run-intel-row'), 'Run Intel Summary should have row markup');
assert.equal(inspectorSource.includes('buildRunIntelBullets'), false, 'Run Intel Summary should not use old bullet builder');
assert.equal(inspectorSource.includes('Run understood:'), false, 'Run Intel Summary should not use paragraph lead wording');
assert.ok(css.includes('tbi-history2-run-intel-compact'), 'CSS should style Run Intel compact feed');

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

assert.match(inspectorHtml, /Run Intel Summary/, 'inspector should render Run Intel Summary heading');
assert.match(inspectorHtml, /Report read/, 'Run Intel should show report read row');
assert.match(inspectorHtml, /142 \/ 142 labels/, 'Run Intel should show recognised label count as a compact value');
assert.match(inspectorHtml, /Next target/, 'Run Intel should show next target row');
assert.match(inspectorHtml, /Run band/, 'Run Intel should show run band row');
assert.match(inspectorHtml, /Deep farming/, 'Run Intel should shorten deep farming band wording');
assert.match(inspectorHtml, /Death pressure/, 'Run Intel should show death pressure row');
assert.match(inspectorHtml, /Mapping/, 'Run Intel should show mapping row');
assert.match(inspectorHtml, /Clean/, 'Run Intel should show clean mapping');
assert.doesNotMatch(inspectorHtml, /<ul>/, 'Run Intel should not render the old bullet list');
assert.doesNotMatch(inspectorHtml, /Run understood:/, 'Run Intel should not render the old paragraph lead');

const rootChangelogs = readdirSync(new URL('..', import.meta.url)).filter(name => /^CHANGELOG_v4\.11z52/.test(name));
assert.ok(rootChangelogs.includes('CHANGELOG_v4.11z52w41.md'), 'w41 changelog should be at root');
assert.ok(rootChangelogs.includes('CHANGELOG_v4.11z52w37.md'), 'latest-five root changelogs should retain w37');
assert.ok(!rootChangelogs.includes('CHANGELOG_v4.11z52w36.md'), 'w36 should move out of root once w41 exists');
assert.ok(existsSync(new URL('../docs/legacy-logs/changelogs/CHANGELOG_v4.11z52w36.md', import.meta.url)), 'w36 changelog should be moved to legacy logs');

console.log('v4.11z52w41 Run Intel Summary glance polish checks passed.');
