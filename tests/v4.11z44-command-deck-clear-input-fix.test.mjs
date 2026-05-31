import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = readFileSync("config/appConfig.js", "utf8");
const commandActions = readFileSync("src/actions/commandDeckReportActions.js", "utf8");
const commandView = readFileSync("src/ui/sections/commandDeckView.js", "utf8");

assert.ok(config.includes('version: "v4.11z52"'), "app version should be v4.11z52");

assert.ok(commandActions.includes('export function actionClearInput'), "Clear Input action should exist in Command Deck action module");
assert.ok(commandActions.includes('clearAllCommandReportInputs();'), "Clear Input should clear all visible and legacy report textareas");
assert.ok(commandActions.includes('title: "Input cleared"'), "Clear Input should show a clear in-page result title");
assert.ok(commandActions.includes('message: "Battle Report input cleared. History and saved runs were kept."'), "Clear Input should explain that history was preserved");
assert.ok(commandActions.includes('lastCommandFeedback: feedback'), "Clear Input should replace stale keep-input feedback");
assert.ok(commandActions.includes('keepInput: false'), "Clear Input feedback must not restore old input after render");
assert.ok(commandActions.includes('window.TowerBattleIntelLastSaveReport = feedback'), "Clear Input should replace stale runtime feedback too");

assert.ok(commandView.includes('lastInput = typeof state.lastInput === "string" && state.lastInput'), "Command Deck view should use lastInput only when populated");
assert.ok(commandView.includes('feedbackDraft = state.ui?.lastCommandFeedback?.keepInput'), "Command Deck should only restore feedback draft when keepInput is true");

console.log("v4.11z52 Command Deck clear input fix test passed.");
