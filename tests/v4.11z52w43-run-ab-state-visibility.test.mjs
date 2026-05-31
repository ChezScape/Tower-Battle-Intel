import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildHistoryView } from '../src/ui/sections/history/historyView.js';
import { buildHistoryStatsModal } from '../src/ui/sections/history/historyStatsModal.js';
import { buildCommandDeckView } from '../src/ui/sections/commandDeckView.js';

function makeRun(index, killedBy = 'Basic') {
  return {
    core: {
      battleDate: `May ${20 + index}, 2026 08:46`,
      tier: 11,
      wave: 7300 + index,
      killedBy,
      coins: 100000000000000 + index,
      cells: 120000 + index,
      realTime: '9h 49m 36s'
    },
    stats: {
      coinsPerHour: 12000000000000 + index,
      cellsPerHour: 13000 + index
    },
    meta: {
      reportId: `rpt_run_${index}`,
      fingerprint: `fingerprint_${index}`,
      runType: 'normal',
      buildStyle: 'unknown'
    },
    raw: { reportText: 'Battle Report\nTier\t11\nWave\t7300' }
  };
}

const runA = makeRun(1, 'Scatter');
const runB = makeRun(2, 'Fast');
const history = [runA, runB, makeRun(3, 'Tank')];
const state = {
  history,
  runA,
  runB,
  currentRun: runA,
  rawArchive: { reports: history.map((run, index) => ({ reportId: run.meta.reportId, rawText: run.raw.reportText, fingerprint: run.meta.fingerprint })) },
  ui: { historyFilters: { page: 1, sort: 'newest', showArchived: false } }
};

const config = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');
assert.ok(config.includes('buildVersion: "v4.11z52w43"'), 'visible build version should be w43');

const historyHTML = buildHistoryView(state);
assert.ok(historyHTML.includes('is-run-a'), 'History card should expose Run A active card class');
assert.ok(historyHTML.includes('is-run-b'), 'History card should expose Run B active card class');
assert.ok(historyHTML.includes('Run A active'), 'Run A card/inspector button should use active wording');
assert.ok(historyHTML.includes('Run B active'), 'Run B card/inspector button should use active wording');
assert.ok(historyHTML.includes('Load A'), 'inactive card Run A action should read Load A');
assert.ok(historyHTML.includes('Load B'), 'inactive card Run B action should read Load B');
assert.ok(historyHTML.includes('tone-run-a'), 'History hero should use Run A tone for active slot');
assert.ok(historyHTML.includes('tone-run-b'), 'History hero should use Run B tone for active slot');

const statsHTML = buildHistoryStatsModal({ run: runA, index: 0, displayIndex: 0, history, visibleHistory: history, runA, runB });
assert.ok(statsHTML.includes('Run A active'), 'Stats modal should show Run A active wording for loaded run');
assert.ok(statsHTML.includes('Load Run B'), 'Stats modal should show inactive Run B load wording when selected run is not B');
assert.ok(statsHTML.includes('slot-a active'), 'Stats modal Run A button should carry active class');

const commandHTML = buildCommandDeckView(state);
assert.ok(commandHTML.includes('tbi-command-side-stat run-a'), 'Command Deck current loadout should light Run A shell');
assert.ok(commandHTML.includes('tbi-command-side-stat run-b'), 'Command Deck current loadout should light Run B shell');
assert.ok(commandHTML.includes('Active slot'), 'Command Deck current loadout should show active slot helper text');

const historyCSS = readFileSync(new URL('../styles/desktop/04-history-rebuild.css', import.meta.url), 'utf8');
assert.ok(historyCSS.includes('.tbi-history2-run-card.is-run-a'), 'History CSS should include Run A card shell polish');
assert.ok(historyCSS.includes('.tbi-history2-btn.slot-a.active'), 'History CSS should include Run A button active polish');
assert.ok(historyCSS.includes('.tbi-history2-btn.slot-b.active'), 'History CSS should include Run B button active polish');

const commandCSS = readFileSync(new URL('../styles/desktop/02-command-deck.css', import.meta.url), 'utf8');
assert.ok(commandCSS.includes('.tbi-command-side-stat.run-a'), 'Command CSS should include Run A shell polish');
assert.ok(commandCSS.includes('.tbi-command-side-stat.run-b'), 'Command CSS should include Run B shell polish');

console.log('v4.11z52w43 Run A/B state visibility polish test passed.');
