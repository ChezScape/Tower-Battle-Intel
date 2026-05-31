import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const rulebook = readFileSync('docs/ARCHITECTURE_OWNERSHIP_RULES.md', 'utf8');
const config = readFileSync('config/appConfig.js', 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.ok(rulebook.includes('# Tower Battle Intel — Architecture Ownership Rules'));
assert.ok(rulebook.includes('**Current catalogue checkpoint:** `v4.11z52w29`'));
assert.ok(rulebook.includes('Rulebook update required'));
assert.ok(rulebook.includes('Hard event-owner rebuild'));

const requiredFiles = [
  'index.html',
  'app.js',
  'bootstrap.js',
  'config/appConfig.js',
  'src/app/init.js',
  'src/app/render.js',
  'src/app/tabs.js',
  'src/app/version.js',
  'src/ui/dashboard.js',
  'src/ui/views/desktopView.js',
  'src/ui/views/mobileView.js',
  'src/ui/views/dashboardVisualShell.js',
  'src/ui/sections/workspaceResetView.js',
  'src/ui/render.js',
  'src/ui/events.js',
  'src/ui/events/index.js',
  'src/ui/events/shellEventUtils.js',
  'src/ui/events/tabEvents.js',
  'src/ui/events/workspaceEvents.js',
  'src/ui/events/mobileShellEvents.js',
  'src/ui/events/importExportEvents.js',
  'src/core/state.js',
  'src/core/events.js',
  'src/core/events/index.js',
  'src/core/events/stateEvents.js',
  'src/core/events/historyStateEvents.js',
  'src/core/events/runSlotEvents.js',
  'src/core/events/storageEvents.js',
  'src/storage/localStore.js',
  'src/storage/storageKeys.js',
  'src/storage/storageUtils.js',
  'src/storage/historyStore.js',
  'src/storage/runSlotStore.js',
  'src/storage/importStore.js',
  'src/storage/exportStore.js',
  'src/actions/actions.js',
  'src/actions/index.js',
  'src/actions/actionUtils.js',
  'src/actions/appActions.js',
  'src/actions/commandDeckActions.js',
  'src/actions/commandDeckReportActions.js',
  'src/actions/historyActions.js',
  'src/actions/importExportActions.js'
];

for (const file of requiredFiles) {
  assert.ok(rulebook.includes(`## \`${file}\``), `missing rulebook entry for ${file}`);
}

const removedFiles = [
  'src/ui/events/parkedActionEvents.js',
  'src/ui/events/dashboardEvents.js',
  'src/ui/events/commandDeckEvents.js',
  'src/ui/events/historyEvents.js',
  'src/actions/parkedActions.js'
];
for (const file of removedFiles) {
  assert.ok(rulebook.includes(`${file}`), `rulebook should record removal of ${file}`);
}

const requiredPhrases = [
  'Purpose:',
  'Not allowed to:',
  'Called by:',
  'May call:',
  'Red line:',
  'No DOM in core domain events',
  'No raw localStorage outside storage modules',
  'Wave formatting rule',
  'old parked catch-all is not allowed back'
];

for (const phrase of requiredPhrases) {
  assert.ok(rulebook.includes(phrase), `missing rule phrase: ${phrase}`);
}

console.log('v4.11z52w29 architecture rulebook catalogue test passed');
