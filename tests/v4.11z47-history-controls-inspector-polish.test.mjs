import fs from 'node:fs';
import assert from 'node:assert/strict';
import { parser } from '../src/pipeline/parser.js';
import { buildHistoryView } from '../src/ui/sections/historyView.js';

const appConfig = fs.readFileSync('config/appConfig.js', 'utf8');
const historyView = fs.readFileSync('src/ui/sections/historyView.js', 'utf8');
const historyCss = fs.readFileSync('styles/desktop/04-history-rebuild.css', 'utf8');
const commandView = fs.readFileSync('src/ui/sections/commandDeckView.js', 'utf8');
const mobileCss = fs.readFileSync('styles/mobile/04-mobile-history.css', 'utf8');
const sample = fs.readFileSync('tests/fixtures/Battle_Report_T11.txt', 'utf8');
const run = parser(sample);
const html = buildHistoryView({
    history: [run],
    runA: run,
    runB: null,
    currentRun: run,
    ui: { historyFilters: { query: '', sort: 'newest', build: 'all', tag: 'all', showArchived: false } }
});

assert.ok(appConfig.includes('version: "v4.11z52"'), 'app version should be v4.11z52');
assert.ok(historyView.includes('HISTORY VIEW WRAPPER v4.11z52w29'), 'History wrapper marker should be updated');
assert.ok(html.includes('data-history-view-rebuild="v4.11z52w29"'), 'History view should expose w18 marker');

assert.ok(html.includes('Archived runs'), 'Show archived should render as a full button toggle');
assert.ok(!historyView.includes('type="checkbox" data-history-filter-archived'), 'Old small Show archived checkbox should not be rendered');
assert.ok(html.includes('data-history-filter-value="showArchived"'), 'Archive toggle should use button filter wiring');

assert.ok(html.includes('Import JSON'), 'Toolbar should expose normal library actions');
assert.ok(html.includes('Delete'), 'Run cards should expose delete controls without a global danger zone');
assert.ok(html.includes('>Set A</button>'), 'Run cards should use Set A wording');
assert.ok(html.includes('>Set B</button>'), 'Run cards should use Set B wording');
assert.ok(!historyView.includes('>Load Run A</button>'), 'Selected-run inspector should not load same run into A');
assert.ok(!historyView.includes('>Load Run B</button>'), 'Selected-run inspector should not load same run into B');
assert.ok(html.includes('data-swap-history-slots="true"'), 'Selected-run inspector should expose Swap A/B');
assert.ok(html.includes('data-clear-history-selection="true"'), 'Selected-run inspector should expose Clear A/B');
assert.ok(html.includes('A/B controls'), 'Inspector should expose the A/B control group');

assert.ok(html.includes('Archived runs'), 'Full archive toggle should render as a visible state button');
assert.ok(html.includes('Swap A/B'), 'Selected-run inspector should render Swap A/B');
assert.ok(html.includes('Clear A/B'), 'Selected-run inspector should render Clear A/B');

assert.ok(historyCss.includes('v4.11z52w29 proper History visual rebuild'), 'History CSS should include w18 rebuild block');
assert.ok(historyCss.includes('.tbi-history2-archive-toggle'), 'History CSS should style full archive toggle');
assert.ok(historyCss.includes('.tbi-history2-card-actions'), 'History CSS should style card actions');

assert.ok(commandView.includes('COMMAND DECK PANEL HIERARCHY REBUILD v4.11z52w29'), 'Command Deck marker should remain current/protected');
assert.ok(mobileCss.includes('Intentionally empty in v4.11z25'), 'mobile History module should remain a blank scaffold');

console.log('v4.11z52 History controls + inspector polish test passed.');
