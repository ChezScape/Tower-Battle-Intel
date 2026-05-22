import assert from 'node:assert/strict';

import { normaliseDashboardTab } from '../src/ui/dashboard.js';
import { getDeviceMode } from '../src/ui/deviceMode.js';
import { buildDesktopWorkspace } from '../src/ui/views/desktopView.js';
import { buildMobileWorkspace } from '../src/ui/views/mobileView.js';
import { getUIState, setUIState, resetUIState } from '../src/ui/uistate.js';
import { compact, delta, percent, time } from '../src/ui/numbers.js';

assert.equal(normaliseDashboardTab('dashboard'), 'overview');
assert.equal(normaliseDashboardTab('deck'), 'command');
assert.equal(normaliseDashboardTab('nonsense'), 'overview');
assert.equal(getDeviceMode(), 'desktop');

resetUIState();
setUIState({ dashboardTab: 'history', selectedSection: 'damage', quietDisplay: true });
assert.equal(getUIState().dashboardTab, 'history');
assert.equal(getUIState().selectedSection, 'damage');
assert.equal(getUIState().quietDisplay, true);

const state = {
  runA: null,
  runB: null,
  history: [],
  insights: [],
  ai: [],
  anomalies: [],
  compareData: { core: {}, stats: {}, sections: {}, summary: {} },
  sections: {},
  stats: {},
  core: {},
  summary: {},
  ui: {}
};

const desktop = buildDesktopWorkspace('overview', state);
assert.match(desktop, /data-desktop-workspace="true"/);
assert.match(desktop, /data-dashboard-panel="overview"/);
assert.match(desktop, /tbi-desktop-grid/);

const mobile = buildMobileWorkspace('overview', state);
assert.match(mobile, /data-mobile-workspace="true"/);
assert.match(mobile, /data-ui-action="open-compare-section"/);
assert.match(mobile, /tbi-mobile-bottom-nav/);

assert.equal(typeof compact(1000), 'string');
assert.equal(typeof delta(10), 'string');
assert.equal(typeof percent(0.1), 'string');
assert.equal(typeof time(60), 'string');

console.log('ui-render-layer.test.mjs passed');
