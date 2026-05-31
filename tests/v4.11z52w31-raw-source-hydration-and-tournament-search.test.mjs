import assert from 'node:assert/strict';
import fs from 'node:fs';

import { setState, getState } from '../src/core/state.js';
import { actionSaveReportFromInput } from '../src/actions/commandDeckReportActions.js';
import { buildCommandDeckView } from '../src/ui/sections/commandDeckView.js';
import { buildHistoryRunCard } from '../src/ui/sections/history/historyRunCard.js';
import { historyEntryMatchesQuery, getVisibleHistoryEntries } from '../src/history/historyFilters.js';
import { splitBattleReportEntries } from '../src/utils/reportSplitter.js';

const config = fs.readFileSync('config/appConfig.js', 'utf8');
const commandDeckActions = fs.readFileSync('src/actions/commandDeckReportActions.js', 'utf8');
const rawStore = fs.readFileSync('src/storage/rawReportArchiveStore.js', 'utf8');
const commandDeck = fs.readFileSync('src/ui/sections/commandDeckView.js', 'utf8');
const historyFilters = fs.readFileSync('src/history/historyFilters.js', 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w32"'), 'visible build version should be w31');
assert.ok(commandDeckActions.includes('syncHistoryRawMetadataFromPlan'), 'Command save should sync raw metadata into History after parsing');
assert.ok(rawStore.includes('Array.isArray(rawArchive?.records)'), 'raw archive normaliser should accept legacy records[] shapes');
assert.ok(rawStore.includes('manualMarkers'), 'raw archive merge should preserve manual marker metadata');
assert.ok(commandDeck.includes('getRawBackedHistoryCount'), 'Command Deck should fall back to raw-backed History counts when needed');
assert.ok(historyFilters.includes('getRunType'), 'History search should include run type metadata');

const batch = fs.readFileSync('tests/fixtures/andrew-batch-31-reports.txt', 'utf8');
const entries = splitBattleReportEntries(batch);
assert.equal(entries.length, 31, 'Andrew batch sample should split into 31 Battle Reports');
assert.equal(entries.filter(entry => entry.runType === 'tournament').length, 5, 'Andrew batch sample should detect 5 manual tournament markers');

setState({
    history: [],
    rawArchive: null,
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

const feedback = actionSaveReportFromInput({ value: batch, placeholder: '' });
const state = getState();

assert.equal(feedback.status, 'saved', 'batch save should succeed');
assert.equal(feedback.addedIds.length, 31, 'batch save should add 31 parsed History entries');
assert.equal(feedback.rawArchivedIds.length, 31, 'batch save should archive 31 raw source records');
assert.equal(feedback.rawArchiveCount, 31, 'feedback raw archive count should be 31');
assert.equal(state.history.length, 31, 'state should contain 31 History entries');
assert.equal(state.rawArchive?.reportCount, 31, 'state rawArchive reportCount should be 31');
assert.equal(state.rawArchive?.reports?.length, 31, 'state rawArchive reports[] should contain 31 records');
assert.equal(state.rawArchive.reports.filter(record => record.rawText).length, 31, 'all raw source records should keep raw Battle Report text');
assert.equal(state.rawArchive.reports.filter(record => /(^|\n)\s*---\s*(\n|$)/.test(record.rawText)).length, 0, 'separator junk should not be stored in raw source text');
assert.equal(state.rawArchive.reports.filter(record => record.userMeta?.runType === 'tournament').length, 5, 'raw archive should preserve tournament metadata');
assert.equal(state.history.filter(run => run.raw?.reportText).length, 31, 'parsed History entries should remain raw-backed');
assert.equal(state.history.filter(run => run.meta?.runType === 'tournament').length, 5, 'History entries should receive tournament metadata');
assert.equal(state.history.filter((run, index) => historyEntryMatchesQuery(run, 'tournament', index, { mode: 'normal' })).length, 5, 'normal History search should find tournament runs');

const commandHtml = buildCommandDeckView(state);
assert.ok(commandHtml.includes('31 source records'), 'Command Deck should show 31 raw source records after batch save');
assert.ok(commandHtml.includes('Report State'), 'Command Deck should keep Report State side panel wording');
assert.ok(commandHtml.includes('Current Loadout'), 'Command Deck should keep Current Loadout eyebrow wording');

const tournamentEntry = getVisibleHistoryEntries(state.history, { showArchived: true, query: 'tournament', mode: 'normal' }, null)[0];
assert.ok(tournamentEntry, 'visible History entries should include tournament search hits');
const cardHtml = buildHistoryRunCard(tournamentEntry, state);
assert.ok(cardHtml.includes('Tournament'), 'History card should show a Tournament run type chip');

console.log('v4.11z52w32 raw source hydration and tournament search checks passed');
