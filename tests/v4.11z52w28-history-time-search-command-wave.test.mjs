import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildHistoryStatsModal } from '../src/ui/sections/history/historyStatsModal.js';
import { buildCommandDeckView } from '../src/ui/sections/commandDeckView.js';
import { buildHistoryStateModel } from '../src/ui/sections/history/historyShared.js';

const config = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');
assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));

const run = {
    core: {
        tier: 11,
        wave: 7609,
        coins: 82870000000000,
        cells: 136850,
        time: 36395,
        killedBy: 'Ray',
        battleDate: 'May 07, 2026 17:09'
    },
    stats: {
        coinsPerHour: 8200000000000,
        cellsPerHour: 13540
    },
    sections: {
        core: {
            battle_date: 'May 07, 2026 17:09',
            game_time: '2d 0h 31m 51s',
            real_time: '10h 6m 35s',
            tier: '11',
            wave: '7609',
            killed_by: 'Ray'
        }
    },
    meta: {
        reportId: 'rpt_20260507_1709_t11_w7609_test',
        buildStyle: 'hybrid'
    }
};

const modal = buildHistoryStatsModal({ run, index: 0, displayIndex: 0, history: [run], visibleHistory: [run] });
assert.ok(modal.includes('2d 0h 31m 51s'), 'Stats Summary should show Game Time from sections/core evidence');
assert.ok(modal.includes('10h 6m 35s'), 'Stats Summary should show Real Time from sections/core evidence');
assert.ok(modal.includes('Wave 7609'), 'Stats modal should keep exact raw Wave digits');

const command = buildCommandDeckView({ history: [run], runA: run, runB: null, ui: { buildStyle: 'hybrid' } });
assert.ok(command.includes('T11 / Wave 7609'), 'Command Deck run labels should say exact Wave 7609');
assert.ok(!command.includes('W7.61K'), 'Command Deck must not compact waves');
assert.ok(!command.includes('T11 / W7609'), 'Command Deck should not use old W shorthand for waves');

const model = buildHistoryStateModel({ history: [run], rawArchive: { reports: [] }, ui: { historyFilters: {} } });
assert.equal(model.rawSummary.reportCount, 0, 'raw source record count remains distinct from parsed history');
assert.equal(model.rawSummary.parsedCacheRuns, 1, 'parsed History count is still known separately');

const workspaceEvents = readFileSync(new URL('../src/ui/events/workspaceEvents.js', import.meta.url), 'utf8');
assert.ok(workspaceEvents.includes('lastAction = "history:search-live"'), 'History search should use live in-place filtering');
assert.ok(workspaceEvents.includes('applyHistorySearchDom(search)'), 'History search should update DOM without full render');
assert.ok(!workspaceEvents.includes('lastAction = "history:search";\n        performUIAction("history-set-filters", { query: search.value || "" });\n        render(context);'), 'History search must not full-render on every typed character');

console.log('v4.11z52w29 history time/search/command wave repair test passed');
