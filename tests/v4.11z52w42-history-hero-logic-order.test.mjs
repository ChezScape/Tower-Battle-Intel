import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

import { setState, getState } from '../src/core/state.js';
import { actionSaveReportFromInput } from '../src/actions/commandDeckReportActions.js';
import { buildHistoryStateModel } from '../src/ui/sections/history/historyShared.js';
import { buildHistoryHeader } from '../src/ui/sections/history/historyHeader.js';

const config = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');
const headerSource = readFileSync(new URL('../src/ui/sections/history/historyHeader.js', import.meta.url), 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w42"'), 'visible build version should be w42');
assert.ok(headerSource.includes('Parser mapping'), 'History hero should use Parser mapping wording');
assert.equal(headerSource.includes('Mapping polish'), false, 'History hero should not use old Mapping polish wording');
assert.ok(headerSource.includes('Raw sources backed up'), 'History workflow should use clearer Protect wording');
assert.ok(headerSource.includes('Search and filter reports'), 'History workflow should explain Find step clearly');

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
const html = buildHistoryHeader(model);

assert.match(html, /Saved runs[\s\S]*Visible[\s\S]*Archived[\s\S]*Raw sources[\s\S]*Run A[\s\S]*Run B/, 'hero trust strip should group library counts then raw/A/B slots');
assert.match(html, /Find[\s\S]*Search and filter reports[\s\S]*Choose[\s\S]*Set Run A \/ Run B[\s\S]*Inspect[\s\S]*Stats, edit, archive[\s\S]*Protect[\s\S]*Raw sources backed up/, 'workflow should read in logical user-task order');
assert.match(html, /Latest saved[\s\S]*Best wave[\s\S]*Common deaths[\s\S]*Parser mapping/, 'record strip should show latest, best, deaths, parser mapping order');
assert.match(html, /No review needed/, 'clean parser mapping should use clearer subtitle');
assert.match(html, /Basic \+ Fast/, 'common deaths tie should still show in hero');

const rootChangelogs = readdirSync(new URL('..', import.meta.url)).filter(name => /^CHANGELOG_v4\.11z52/.test(name));
assert.ok(rootChangelogs.includes('CHANGELOG_v4.11z52w42.md'), 'w42 changelog should be at root');
assert.ok(rootChangelogs.includes('CHANGELOG_v4.11z52w38.md'), 'latest-five root changelogs should retain w38');
assert.ok(!rootChangelogs.includes('CHANGELOG_v4.11z52w37.md'), 'w37 should move out of root once w42 exists');
assert.ok(existsSync(new URL('../docs/legacy-logs/changelogs/CHANGELOG_v4.11z52w37.md', import.meta.url)), 'w37 changelog should be moved to legacy logs');

console.log('v4.11z52w42 History hero logic order polish checks passed.');
