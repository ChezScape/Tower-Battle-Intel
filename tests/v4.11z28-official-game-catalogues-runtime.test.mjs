import assert from "node:assert/strict";
import { auditOfficialCatalogues, explainOfficialGameTerm, lookupOfficialGameTerm } from "../src/game/officialGameCatalogues.js";

const status = auditOfficialCatalogues();
assert.equal(status.ok, true);
assert.equal(status.gameVersion, "28.2.0 static recheck");
assert.ok(status.catalogueCount >= 14);
assert.ok(status.totalEntries >= 100);

assert.equal(explainOfficialGameTerm("Vampire").ok, true);
assert.equal(explainOfficialGameTerm("Golden Tower").ok, true);
assert.equal(explainOfficialGameTerm("Enemy Level Skip").ok, true);
assert.equal(explainOfficialGameTerm("Other Coin Bonuses").ok, true);
assert.ok(lookupOfficialGameTerm("Guardian").length >= 1);
assert.equal(explainOfficialGameTerm("Dissonance").ok, true);
assert.equal(explainOfficialGameTerm("Overheat").ok, true);
assert.equal(explainOfficialGameTerm("Bot+").ok, true);

const otherCoins = explainOfficialGameTerm("Other Coin Bonuses").primary;
assert.equal(otherCoins.key, "other_coin_bonuses");
assert.ok(otherCoins.notes.join(" ").includes("DestroyedByOther") || otherCoins.battleReportLinks.includes("CoinsFromCoinBonuses"));

console.log("v4.11z31 official catalogue runtime checks passed.");
