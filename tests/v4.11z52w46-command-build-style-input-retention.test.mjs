import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { setState, getState } from '../src/core/state.js';
import { actionSetBuildStyle } from '../src/actions/appActions.js';
import { actionCacheCommandInputDraft } from '../src/actions/commandDeckActions.js';
import { buildCommandDeckView } from '../src/ui/sections/commandDeckView.js';

const workspaceEvents = readFileSync(new URL('../src/ui/events/workspaceEvents.js', import.meta.url), 'utf8');
const config = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');

assert.match(config, /buildVersion:\s*"v4\.11z52w46"/, 'visible build version should be w46');
assert.match(workspaceEvents, /function handleCommandChange/, 'workspaceEvents should own Command Deck build-style changes');
assert.match(workspaceEvents, /actionCacheCommandInputDraft\(input\.value \|\| ""\)/, 'build-style changes should cache the visible report draft before render');
assert.ok(workspaceEvents.indexOf('actionCacheCommandInputDraft(input.value || "")') < workspaceEvents.indexOf('performUIAction("set-build-style"'), 'draft caching should happen before set-build-style render');

const reportText = `Battle Report\nBattle Date\tMay 07, 2026 17:09\nReal Time\t10h 6m 35s\nTier\t11\nWave\t7609\nKilled By\tRay`;

setState({
  history: [],
  rawArchive: null,
  runA: null,
  runB: null,
  currentRun: null,
  ui: { buildStyle: 'unknown', dashboardTab: 'command' },
  lastInput: ''
});

actionCacheCommandInputDraft(reportText);
actionSetBuildStyle('hybrid');

const state = getState();
assert.equal(state.ui.buildStyle, 'hybrid', 'build style should update');
assert.equal(state.lastInput, reportText, 'cached Command Deck input should survive build-style action');

const html = buildCommandDeckView(state);
assert.ok(html.includes('Hybrid'), 'Command Deck should render selected Hybrid build style');
assert.ok(html.includes('Battle Date'), 'Command Deck textarea should keep pasted report text after build-style change');
assert.ok(html.includes('Killed By\tRay'), 'Command Deck textarea should preserve exact report content');

console.log('v4.11z52w46 Command Deck build-style input retention verified.');
