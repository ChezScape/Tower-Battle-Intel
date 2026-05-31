import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const gameDir = path.join(root, "game", "the-tower-v28.1.0");

const required = [
  "enemyCatalogue.json",
  "ultimateWeaponCatalogue.json",
  "cardCatalogue.json",
  "cardMasteryCatalogue.json",
  "workshopCatalogue.json",
  "labResearchCatalogue.json",
  "tournamentHeatCatalogue.json",
  "guardianCatalogue.json",
  "moduleCatalogue.json",
  "botCatalogue.json",
  "perkCatalogue.json",
  "resourceEconomyCatalogue.json",
  "missionsEventsRelicsCatalogue.json",
  "projectWideUsefulDataMap.json"
];

for (const file of required) {
  assert.ok(fs.existsSync(path.join(gameDir, file)), `${file} exists`);
}

const enemy = JSON.parse(fs.readFileSync(path.join(gameDir, "enemyCatalogue.json"), "utf8"));
assert.equal(enemy.manifest.version, "28.1.0");
assert.ok(enemy.entries.some(e => e.key === "vampire" && e.tags.includes("elite")));
assert.ok(enemy.entries.some(e => e.key === "ray"));
assert.ok(enemy.entries.some(e => e.key === "scatter"));

const heat = JSON.parse(fs.readFileSync(path.join(gameDir, "tournamentHeatCatalogue.json"), "utf8"));
assert.deepEqual(heat.heatIncreaseWaves.slice(0, 5), [20, 40, 60, 80, 100]);
assert.ok(heat.entries.some(e => e.key === "enemy_level_skip"));

const resources = JSON.parse(fs.readFileSync(path.join(gameDir, "resourceEconomyCatalogue.json"), "utf8"));
assert.ok(resources.entries.some(e => e.key === "other_coin_bonuses"));
assert.ok(resources.entries.some(e => e.key === "cells"));

const projectMap = JSON.parse(fs.readFileSync(path.join(gameDir, "projectWideUsefulDataMap.json"), "utf8"));
assert.ok(projectMap.totalUsefulHits >= 20000);
assert.ok(projectMap.categories.length >= 16);

const config = fs.readFileSync(path.join(root, "config", "appConfig.js"), "utf8");
assert.match(config, /version:\s*"v4\.11z52"/);

console.log("v4.11z31 official catalogue JSON checks passed.");
