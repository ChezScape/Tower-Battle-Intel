import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const config = readFileSync(resolve(root, "config/appConfig.js"), "utf8");
const actions = readFileSync(resolve(root, "src/actions/index.js"), "utf8");
const commandDeckActions = readFileSync(resolve(root, "src/actions/commandDeckActions.js"), "utf8");
const commandReportActions = readFileSync(resolve(root, "src/actions/commandDeckReportActions.js"), "utf8");
const commandDeck = readFileSync(resolve(root, "src/ui/sections/commandDeckView.js"), "utf8");
const mobileCss = readFileSync(resolve(root, "mobile.css"), "utf8");

assert.ok(config.includes('version: "v4.11z52"'), "app version should be v4.11z52");
assert.ok(commandDeckActions.includes('from "./commandDeckReportActions.js"'), "Command Deck action foundation should import split Command Deck report actions");
assert.ok(actions.includes("actionSaveReportFromInput(resolveReportInput(payload.input))"), "main action bus should delegate save-report to split input resolver");
assert.ok(commandReportActions.includes("COMMAND DECK REPORT ACTIONS v4.11z52"), "split Command Deck report module marker should exist");
assert.ok(commandReportActions.includes("export function actionSaveReportFromInput"), "split module should own Save Report");
assert.ok(commandReportActions.includes("export function actionValidateReportFromInput"), "split module should own Validate Report");
assert.ok(commandReportActions.includes("export function actionSaveAndLoadDashboard"), "split module should own Save + Dashboard");
assert.ok(commandReportActions.includes("export function resolveReportInput"), "split module should own report input resolution");
assert.ok(commandReportActions.includes("function escapeAttr"), "split module should include escapeAttr for Game Brain fact rendering");
assert.ok((commandReportActions.match(/selectors\.forEach\(selector =>/g) || []).length >= 1, "Command Deck actions should use shared selector loops for input resolution/clearing");
assert.ok(commandDeck.includes("COMMAND DECK PANEL HIERARCHY REBUILD v4.11z52w29"), "Command Deck visible shell should remain in place");
assert.ok(!mobileCss.includes("commandDeckReportActions"), "mobile CSS should remain untouched by action layer split");

console.log("v4.11z52 command deck action layer split test passed.");
