import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = readFileSync("config/appConfig.js", "utf8");
const commandActions = readFileSync("src/actions/commandDeckReportActions.js", "utf8");

assert.ok(config.includes('version: "v4.11z52"'), "app version should be v4.11z52");
assert.ok(commandActions.includes('title: "Validate Report"'), "Validate action should pass an explicit Validate Report title");
assert.ok(commandActions.includes('Report checked. Nothing has been saved yet.'), "single-report validate message should remain check-only");
assert.ok(commandActions.includes('No report checked. Paste a Battle Report first.'), "empty validate message should stay validate-specific");
assert.ok(commandActions.includes('let title = details.title || "Save Report";'), "feedback builder should respect explicit action titles");
assert.ok(commandActions.includes('title = "Report checked"') === false, "feedback builder should not force the old checked title over explicit titles");

console.log("v4.11z52 Command Deck result label polish test passed.");
