import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCommandDeckView } from '../src/ui/sections/commandDeckView.js';

const config = readFileSync(new URL('../config/appConfig.js', import.meta.url), 'utf8');
assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));

const run = {
    core: {
        tier: 11,
        wave: 7609,
        killedBy: 'Ray',
        battleDate: 'May 07, 2026 17:09'
    },
    meta: {
        reportId: 'rpt_20260507_1709_t11_w7609_test',
        archived: true,
        buildStyle: 'hybrid'
    }
};

const html = buildCommandDeckView({
    history: [run],
    runA: run,
    runB: null,
    rawArchive: { reportCount: 1, reports: [{ reportId: run.meta.reportId }] },
    ui: {
        buildStyle: 'hybrid',
        lastCommandFeedback: {
            status: 'saved',
            reportId: run.meta.reportId,
            addedIds: [run.meta.reportId]
        }
    }
});

assert.ok(html.includes('data-command-clean-foundation="v4.11z52w29"'));
assert.ok(html.includes('Report Intake &amp; Control Room') || html.includes('Report Intake & Control Room'));
assert.ok(html.includes('Raw archive flow'), 'hero should describe the raw archive flow');
assert.ok(html.includes('Paste'), 'hero should include Paste step');
assert.ok(html.includes('Validate'), 'hero should include Validate step');
assert.ok(html.includes('Raw Source + History cache'), 'hero should include raw source/history cache step');
assert.ok(html.includes('Manage'), 'hero should include Manage step');

assert.ok(!html.includes('tbi-command-hero-stats'), 'hero should no longer mirror Active Data state rows');
assert.ok(!html.includes('Next Steps'), 'old Next Steps panel should be replaced');
assert.ok(!html.includes('Current Data'), 'old Current Data heading should be replaced');
assert.ok(!html.includes('System Readiness'), 'old System Readiness kicker should be replaced');
assert.ok(!html.includes('Control Health'), 'old Control Health heading should be replaced');

assert.ok(html.includes('After Save'), 'saved feedback should switch Report Flow to After Save');
assert.ok(html.includes('View in History'), 'after-save flow should route to History');
assert.ok(html.includes('Open Dashboard'), 'report flow should still expose Dashboard');
assert.ok(html.includes('Export Backup'), 'report flow should expose safe backup export');
assert.ok(html.includes('Import Backup'), 'report flow should expose safe backup import');
assert.ok(!html.includes('Open Compare'), 'Command Deck should not route to parked Compare from the Report Flow panel');

assert.ok(html.includes('Active Data'), 'right rail should own active data state');
assert.ok(html.includes('Run A'), 'Active Data should show Run A');
assert.ok(html.includes('Run B'), 'Active Data should show Run B');
assert.ok(html.includes('Saved Reports'), 'Active Data should show saved report count');
assert.ok(html.includes('Archived Runs'), 'Active Data should show archived count');
assert.ok(html.includes('Raw Sources'), 'Active Data should show raw source count');
assert.ok(html.includes('1 source records'), 'Active Data should show raw source count text');
assert.ok(html.includes('Latest Saved'), 'Active Data should show latest saved report');
assert.ok(html.includes('Build Style'), 'Active Data should show build style');

assert.ok(html.includes('Intake Health'), 'right rail should show intake health');
assert.ok(html.includes('Report Intake Health'), 'health card should use new heading');
assert.ok(html.includes('Duplicate Check'), 'intake health should show duplicate check state');
assert.ok(html.includes('Import / Export'), 'intake health should show import/export readiness');

assert.ok(html.includes('Settings later for global data management'), 'Command rules should point global data management to Settings later');
assert.ok(html.includes('Use History for stats, edit, archive, delete, and Run A / Run B'), 'Command rules should point saved-run work to History');

console.log('v4.11z52w29 command deck panel hierarchy test passed');
