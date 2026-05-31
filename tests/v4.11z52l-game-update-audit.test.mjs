import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { getGameUpdateAudit, isGameUpdateAuditCurrent } from "../src/game/gameUpdateAudit.js";
import { getGameVersionProfile } from "../src/game/gameVersionProfile.js";
import { auditOfficialCatalogues, explainOfficialGameTerm } from "../src/game/officialGameCatalogues.js";

const root = path.resolve(".");
const auditDir = path.join(root, "game", "the-tower-v28.2.0");

assert.ok(fs.existsSync(auditDir));
assert.ok(fs.existsSync(path.join(auditDir, "manifest.json")));
assert.ok(fs.existsSync(path.join(auditDir, "xapkStaticAudit.json")));
assert.ok(fs.existsSync(path.join(auditDir, "updateMechanicCatalogue.json")));
assert.ok(fs.existsSync(path.join(auditDir, "battleReportSchemaRecheck.json")));

const manifest = JSON.parse(fs.readFileSync(path.join(auditDir, "manifest.json"), "utf8"));
assert.equal(manifest.version, "28.2.0");
assert.ok(String(manifest.tbiBuild || "").startsWith("v4.11z52"));

const audit = JSON.parse(fs.readFileSync(path.join(auditDir, "xapkStaticAudit.json"), "utf8"));
assert.equal(audit.manifest.version_name, "28.2.0");
assert.equal(audit.battleReportSchemaRecheck.baselineFieldCount, 142);
assert.equal(audit.battleReportSchemaRecheck.propertyNamesFoundInV28_2_0, 142);
assert.deepEqual(audit.battleReportSchemaRecheck.propertyNamesMissingInV28_2_0, []);

const runtime = getGameUpdateAudit();
assert.equal(runtime.version, "28.2.0");
assert.equal(runtime.battleReportSchema.breakingPropertyNameChangeDetected, false);
assert.equal(isGameUpdateAuditCurrent("28.2.0"), true);

const profile = getGameVersionProfile();
assert.ok(["v28.2-audit-aware", "v28.2-knowledge-base"].includes(profile.catalogueVersion));
assert.ok(profile.officialSourceIds.includes("local_xapk_v28_2_0_static_audit"));

const status = auditOfficialCatalogues();
assert.equal(status.gameVersion, "28.2.0 static recheck");
assert.ok(status.catalogueCount >= 14);
assert.equal(explainOfficialGameTerm("Dissonant Echo").ok, true);
assert.equal(explainOfficialGameTerm("Damage Decay").ok, true);
assert.equal(explainOfficialGameTerm("Bonus Cells").ok, true);

const config = fs.readFileSync(path.join(root, "config", "appConfig.js"), "utf8");
assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));

console.log("v4.11z52l/z52n game update audit compatibility checks passed for shell reset.");
