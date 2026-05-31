import assert from 'node:assert/strict';
import fs from 'node:fs';

import { setState, getState } from '../src/core/state.js';
import { actionSaveReportFromInput } from '../src/actions/commandDeckReportActions.js';
import { buildHistoryStateModel } from '../src/ui/sections/history/historyShared.js';
import { buildHistoryHeader } from '../src/ui/sections/history/historyHeader.js';
import { buildHistoryEditModal } from '../src/ui/sections/history/historyEditModal.js';
import { buildHistoryStatsModal } from '../src/ui/sections/history/historyStatsModal.js';
import { performUIAction } from '../src/actions/index.js';
import { historyEntryMatchesQuery } from '../src/history/historyFilters.js';

const config = fs.readFileSync('config/appConfig.js', 'utf8');
const headerSource = fs.readFileSync('src/ui/sections/history/historyHeader.js', 'utf8');
const sharedSource = fs.readFileSync('src/ui/sections/history/historyShared.js', 'utf8');
const editSource = fs.readFileSync('src/ui/sections/history/historyEditModal.js', 'utf8');
const workspaceSource = fs.readFileSync('src/ui/events/workspaceEvents.js', 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w32"'), 'visible build version should be w32');
assert.ok(sharedSource.includes('normaliseRawArchive'), 'History raw summary should use raw archive normaliser');
assert.ok(sharedSource.includes('getRawBackedHistoryCount'), 'History raw summary should fall back to raw-backed History entries');
assert.ok(headerSource.includes('Raw sources + backups'), 'History Protect wording should avoid parsed-cache jargon');
assert.ok(!headerSource.includes('parsed-cache runs'), 'History hero should not expose parsed-cache wording');
assert.ok(editSource.includes('data-history-edit-run-type-choice'), 'Edit modal should render run type choices');
assert.ok(workspaceSource.includes('setEditRunTypeChoice'), 'workspaceEvents should own run type choice clicks');
assert.ok(workspaceSource.includes('runType'), 'saveEditModal should persist runType metadata');

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
    ui: { historyFilters: { showArchived: true } },
    lastInput: ''
});

actionSaveReportFromInput({ value: batch, placeholder: '' });
let state = getState();
let model = buildHistoryStateModel(state);

assert.equal(state.history.length, 31, 'batch should save 31 History runs');
assert.equal(model.rawSummary.reportCount, 31, 'History raw summary should show 31 raw source records');
assert.equal(model.rawSummary.rawBackedRuns, 31, 'History raw summary should know all 31 runs are raw-backed');

const headerHtml = buildHistoryHeader(model);
assert.ok(headerHtml.includes('31 source records'), 'History header should show 31 raw source records');
assert.ok(headerHtml.includes('Raw sources + backups'), 'Protect workflow should use user-facing wording');
assert.ok(!headerHtml.includes('parsed-cache'), 'rendered History header should not show parsed-cache wording');

const normalRunIndex = state.history.findIndex(run => run.meta?.runType !== 'tournament');
assert.ok(normalRunIndex >= 0, 'fixture should contain a normal run that can be manually marked');

const editHtml = buildHistoryEditModal({ run: state.history[normalRunIndex], index: normalRunIndex, displayIndex: normalRunIndex });
assert.ok(editHtml.includes('Run type'), 'Edit modal should show Run type field');
assert.ok(editHtml.includes('Tournament'), 'Edit modal should include Tournament choice');
assert.ok(editHtml.includes('data-history-edit-run-type-choice="tournament"'), 'Edit modal should have tournament run type button');

performUIAction('history-update-meta', { index: normalRunIndex, meta: { runType: 'tournament', notes: 'manual tournament fix' } });
state = getState();

assert.equal(state.history[normalRunIndex].meta.runType, 'tournament', 'manual run type edit should persist into History meta');
assert.equal(state.rawArchive.reports.find(record => record.reportId === state.history[normalRunIndex].meta.reportId)?.userMeta?.runType, 'tournament', 'manual run type edit should sync to raw archive metadata');
assert.equal(historyEntryMatchesQuery(state.history[normalRunIndex], 'tournament', normalRunIndex, { mode: 'normal' }), true, 'manual tournament edits should become searchable');

const statsHtml = buildHistoryStatsModal({
    run: state.history[normalRunIndex],
    index: normalRunIndex,
    displayIndex: normalRunIndex,
    history: state.history,
    visibleHistory: state.history,
    runA: state.runA,
    runB: state.runB
});
assert.ok(statsHtml.includes('Run Type'), 'Stats modal should show Run Type in trust row');
assert.ok(statsHtml.includes('Run type'), 'Stats modal identity details should show Run type');
assert.ok(statsHtml.includes('Tournament'), 'Stats modal should show manually edited Tournament label');

console.log('v4.11z52w32 History hero raw-source + run type edit checks passed');
