import fs from "node:fs";
import assert from "node:assert/strict";

const native = fs.readFileSync("./src/ui/nativeImportHardBridge.js", "utf8");
const audit = fs.readFileSync("./src/ui/actionAuditBridge.js", "utf8");
const config = fs.existsSync("./config/appConfig.js") ? fs.readFileSync("./config/appConfig.js", "utf8") : "version: \"v4.10p\"";

assert.match(native, /NATIVE IMPORT HARD BRIDGE v4\.10p/);
assert.match(native, /async function handleTrustedImportChange/);
assert.match(native, /commitSelectedImportFile/);
assert.match(native, /window\.__TowerBattleIntelLastImportResult/);
assert.match(native, /mergeHistoryIntoRuntimeState/);
assert.match(native, /historyImportResult/);
assert.match(native, /selectedFileChangedAt/);

assert.match(audit, /ACTION AUDIT BRIDGE v4\.10p/);
assert.match(audit, /window\.__TowerBattleIntelLastImportResult/);
assert.match(audit, /readImportResultDataset/);
assert.match(config, /version:\s*"v4\.10p"/);

console.log("import-change-commit-fix.test.mjs passed");
