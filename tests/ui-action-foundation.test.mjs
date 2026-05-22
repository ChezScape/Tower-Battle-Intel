import assert from 'node:assert/strict';

import {
    performUIAction,
    actionGetState
} from '../src/actions/actions.js';

const tab = performUIAction('set-dashboard-tab', { tab: 'history' });
assert.equal(tab, 'history');
assert.equal(actionGetState().ui.dashboardTab, 'history');

const filters = performUIAction('history-set-filters', {
    query: 'ray',
    sort: 'oldest',
    build: 'hybrid',
    tag: 'all',
    showArchived: true
});
assert.equal(filters.query, 'ray');
assert.equal(filters.sort, 'oldest');
assert.equal(filters.build, 'hybrid');
assert.equal(filters.showArchived, true);

const selected = performUIAction('select-section', { section: 'damage' });
assert.equal(selected, 'damage');
assert.equal(actionGetState().ui.selectedSection, 'damage');

const cleared = performUIAction('select-section', { section: 'damage' });
assert.equal(cleared, null);
assert.equal(actionGetState().ui.selectedSection, null);

const build = performUIAction('set-build-style', { buildStyle: 'hybrid' });
assert.equal(build, 'hybrid');

console.log('ui-action-foundation.test.mjs passed');
