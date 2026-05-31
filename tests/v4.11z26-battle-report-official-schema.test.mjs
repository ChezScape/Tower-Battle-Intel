import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "game", "the-tower-v28.1.0");
const fields = JSON.parse(fs.readFileSync(path.join(dataDir, "battleReportFields.json"), "utf8"));
const aliases = JSON.parse(fs.readFileSync(path.join(dataDir, "battleReportAliases.json"), "utf8"));
const sections = JSON.parse(fs.readFileSync(path.join(dataDir, "battleReportSections.json"), "utf8"));
const enemies = JSON.parse(fs.readFileSync(path.join(dataDir, "enemyReportFields.json"), "utf8"));
const guardians = JSON.parse(fs.readFileSync(path.join(dataDir, "guardianReportFields.json"), "utf8"));

assert.equal(fields.manifest.version, "28.1.0");
assert.ok(fields.fields.length >= 140, "Expected at least 140 observed BattleHistoryEntry fields");
assert.ok(aliases.aliases.length >= 250, "Expected a useful parser alias dictionary");
assert.ok(sections.officialSectionLabels.includes("Enemies Hit By"));
assert.ok(sections.officialSectionLabels.includes("Killed With Effect Active"));
assert.ok(sections.officialSectionLabels.includes("Enemies Destroyed By"));

const byLabel = new Map(fields.fields.map((field) => [field.displayLabel, field]));
const byProp = new Map(fields.fields.map((field) => [field.property, field]));

assert.equal(byProp.get("DestroyedByOther")?.family, "Enemies Destroyed By");
assert.equal(byProp.get("CoinsFromCoinBonuses")?.family, "Currencies / Rewards");
assert.notEqual(byProp.get("DestroyedByOther")?.family, byProp.get("CoinsFromCoinBonuses")?.family, "Other kills and Other Coin Bonuses must stay separate");

for (const property of ["TotalSaboteurs", "TotalCommanders", "TotalOvercharges"]) {
    assert.ok(byProp.has(property), `Missing newer enemy field: ${property}`);
}

assert.ok(enemies.knownEnemyTotalFields.length >= 10, "Expected enemy total fields");
assert.ok(guardians.guardianFields.length >= 10, "Expected Guardian schema fields");

console.log("v4.11z31 Battle Report official schema patch checks passed.");
