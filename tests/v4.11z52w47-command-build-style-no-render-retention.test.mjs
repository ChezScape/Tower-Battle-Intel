import assert from 'node:assert/strict';
import fs from 'node:fs';

import { buildCommandDeckView } from '../src/ui/sections/commandDeckView.js';

const workspaceSource = fs.readFileSync('src/ui/events/workspaceEvents.js', 'utf8');
const commandViewSource = fs.readFileSync('src/ui/sections/commandDeckView.js', 'utf8');
const config = fs.readFileSync('config/appConfig.js', 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w59"'), 'visible build version should be w59');
assert.ok(workspaceSource.includes('command:set-build-style-no-render'), 'build-style change should use the no-render Command Deck path');
assert.ok(workspaceSource.includes('updateVisibleCommandBuildStyle'), 'build-style change should update visible side labels without a full render');
assert.ok(workspaceSource.includes('readCommandInputValue'), 'build-style change should read the visible textarea draft defensively');
assert.ok(commandViewSource.includes('data-command-side-stat="${escapeAttr(key)}"'), 'Command Deck side stats should expose a stable data key for DOM-only updates');

const handlerMatch = workspaceSource.match(/function handleCommandChange[\s\S]*?\n}\n\nfunction handleCommandInput/);
assert.ok(handlerMatch, 'handleCommandChange block should be present');
const handlerBody = handlerMatch[0];
assert.ok(!handlerBody.includes('render(context)'), 'changing Build Style must not re-render Command Deck and wipe the textarea');
assert.ok(handlerBody.includes('actionCacheCommandInputDraft'), 'Build Style change should still cache the draft for storage/reload safety');

const pastedReport = 'Battle Report\nBattle Date\tMay 07, 2026 17:09\nWave\t7609\nKilled By\tRay';
const html = buildCommandDeckView({
  history: [],
  rawArchive: null,
  runA: null,
  runB: null,
  ui: { buildStyle: 'hybrid', lastCommandFeedback: null },
  lastInput: pastedReport
});

assert.ok(html.includes('data-command-report-input="true"'), 'Command Deck textarea should render');
assert.ok(html.includes('Battle Date'), 'Command Deck should render the preserved pasted report text');
assert.ok(html.includes('value="hybrid" selected'), 'Command Deck build select should show the selected build style');
assert.ok(html.includes('data-command-side-stat="build-style"'), 'Current Loadout Build Style stat should be targetable after no-render changes');
assert.ok(html.includes('<strong>Hybrid</strong>'), 'Current Loadout should show the selected build style label');

console.log('v4.11z52w59 Command Deck build-style no-render retention test passed.');
