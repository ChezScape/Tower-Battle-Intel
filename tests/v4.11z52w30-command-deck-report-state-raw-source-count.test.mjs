import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
    splitBattleReports,
    splitBattleReportEntries,
    isBatchSeparatorLine
} from '../src/utils/reportSplitter.js';
import {
    buildCommandDeckRawIntakePlan,
    applyCommandDeckRawArchivePlan
} from '../src/actions/commandDeckRawIntake.js';

const commandDeck = fs.readFileSync('src/ui/sections/commandDeckView.js', 'utf8');
const config = fs.readFileSync('config/appConfig.js', 'utf8');
const splitter = fs.readFileSync('src/utils/reportSplitter.js', 'utf8');
const intake = fs.readFileSync('src/actions/commandDeckRawIntake.js', 'utf8');

assert.ok(config.includes('buildVersion: "v4.11z52w32"'), 'build version should be w31');
assert.ok(commandDeck.includes('COMMAND DECK RAW SOURCE HYDRATION REPAIR v4.11z52w32'), 'Command Deck should carry w31 marker');
assert.ok(commandDeck.includes('<div class="tbi-command-kicker">Current Loadout</div>'), 'side rail eyebrow should no longer duplicate Active Data');
assert.ok(commandDeck.includes('<h3>Report State</h3>'), 'side rail title should be Report State');
assert.ok(!commandDeck.includes('<h3>Active Data</h3>'), 'duplicate Active Data title should be removed');
assert.ok(commandDeck.includes('sideStat("Library", `${history.length} saved · ${archivedCount} archived`'), 'saved and archived totals should be grouped under Library');
assert.ok(commandDeck.includes('sideStat("Raw Report Sources", `${rawSourceCount} source records`'), 'raw sources row should be clearer');
assert.ok(commandDeck.includes('normaliseRawArchive(rawArchive)'), 'raw source count should normalise current raw archive object shapes');
assert.ok(commandDeck.includes('Array.isArray(rawArchive?.records)'), 'raw source count should defensively support records[] shape');
assert.ok(commandDeck.includes('Active / no source records'), 'empty raw archive wording should be clear');

assert.ok(splitter.includes('REPORT SPLITTER v4.11z52w32'), 'report splitter should carry w31 marker');
assert.ok(splitter.includes('isBatchSeparatorLine'), 'report splitter should strip separator artifacts');
assert.ok(intake.includes('COMMAND_DECK_RAW_INTAKE_VERSION = "v4.11z52w32"'), 'raw intake should carry w31 version');
assert.ok(intake.includes('splitBattleReportEntries'), 'raw intake should use metadata-aware report splitting');
assert.ok(intake.includes('manual run marker metadata such as Tournament--'), 'raw intake status should mention manual marker metadata');

assert.equal(isBatchSeparatorLine('---'), true, '--- should be treated as batch separator junk');
assert.equal(isBatchSeparatorLine('===='), true, '==== should be treated as batch separator junk');
assert.equal(isBatchSeparatorLine('regular stat row'), false, 'normal stat rows should not be treated as separators');

const batch = `
Battle Report
Battle Date\tMay 01, 2026 10:00
Game Time\t1h
Real Time\t15m
Tier\t11
Wave\t7609
Killed By\tRay
Coins Earned\t1T
Cells Earned\t1K
---
Tournament--

Battle Report
Battle Date\tMay 02, 2026 11:00
Game Time\t2h
Real Time\t30m
Tier\t12
Wave\t923
Killed By\tTank
Coins Earned\t2T
Cells Earned\t2K
====
`;

const reports = splitBattleReports(batch);
assert.equal(reports.length, 2, 'batch should split into two Battle Reports');
assert.ok(reports.every(report => report.startsWith('Battle Report')), 'clean reports should start with Battle Report');
assert.ok(reports.every(report => !report.includes('---') && !report.includes('====')), 'clean reports should not contain separator artifacts');
assert.ok(reports.every(report => !report.includes('Tournament--')), 'manual markers should not remain in raw report text');

const entries = splitBattleReportEntries(batch);
assert.equal(entries[0].runType, 'normal', 'first report should be unmarked/normal');
assert.equal(entries[1].runType, 'tournament', 'Tournament-- should apply to the next Battle Report');
assert.deepEqual(entries[1].markers, ['tournament'], 'manual tournament marker should be stored as metadata');

const plan = buildCommandDeckRawIntakePlan(batch, {});
assert.equal(plan.reportCount, 2, 'raw intake should see two reports');
assert.equal(plan.newRecords.length, 2, 'raw intake should produce two new records');
assert.equal(plan.newRecords[0].userMeta.runType, 'normal', 'first record should be normal');
assert.equal(plan.newRecords[1].userMeta.runType, 'tournament', 'second record should carry tournament metadata');
assert.equal(plan.newRecords[1].summary.isTournament, true, 'tournament marker should set summary tournament hint');
assert.ok(plan.newRecords.every(record => !record.rawText.includes('---') && !record.rawText.includes('====')), 'raw archive records should store clean raw report text');
assert.ok(plan.newRecords.every(record => !record.rawText.includes('Tournament--')), 'manual marker should not pollute raw archive text');

const archive = applyCommandDeckRawArchivePlan(plan, {});
assert.equal(archive.reportCount, 2, 'raw archive reportCount should match saved source records');
assert.equal(archive.reports.length, 2, 'raw archive reports[] should contain two source records');
assert.equal(archive.reports[1].userMeta.runType, 'tournament', 'raw archive should preserve tournament run type metadata');

console.log('v4.11z52w32 Command Deck Report State + Raw Source Count Repair checks passed');
