import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = readFileSync("config/appConfig.js", "utf8");
const commandView = readFileSync("src/ui/sections/commandDeckView.js", "utf8");
const commandCss = readFileSync("styles/desktop/02-command-deck.css", "utf8");
const mobileCss = readFileSync("mobile.css", "utf8");

assert.ok(config.includes('version: "v4.11z52"'), "app version should be v4.11z52");
assert.ok(commandView.includes('data-command-clean-foundation="v4.11z52w29"'), "Command Deck marker should be updated to current panel hierarchy rebuild");
assert.ok(commandView.includes("In-page feedback"), "Action Result pill should use user-facing in-page feedback wording");
assert.ok(!commandView.includes("No popup dependency"), "developer-style popup dependency wording should be removed");
assert.ok(commandView.includes('readinessRow("Import / Export", "Ready", "good")'), "Intake Health should show Import / Export readiness");
assert.ok(!commandView.includes("Old popups"), "Old popups row should be removed from visible Command Deck");
assert.ok(commandView.includes("Saved report library"), "History route should have current library wording");
assert.ok(!commandView.includes("Compare workspace coming next"), "parked Compare route should not be a Command Deck next step");
assert.ok(commandView.includes("Active Data"), "side panel should own active data state");
assert.ok(commandView.includes("Latest Saved"), "last saved label should be clearer");
assert.ok(commandView.includes("Tier/Wave, Killed By, checkpoint"), "Game Brain empty-state hint should not be clipped text");
assert.ok(commandCss.includes("v4.11z52 — Command Deck Visual Tidy"), "desktop CSS should include z45 visual tidy marker");
assert.ok(commandCss.includes(".tbi-command-result-empty-grid {\n    grid-template-columns: repeat(3"), "empty result grid should use 3 columns to avoid blank tile");
assert.ok(commandCss.includes("min-height: 190px"), "empty report input should be tightened slightly");
assert.ok(mobileCss.includes("v4.11z52b tab-ordered blank mobile module loader"), "mobile CSS should remain blank tab-ordered scaffold");

console.log("v4.11z52 Command Deck visual tidy test passed.");
