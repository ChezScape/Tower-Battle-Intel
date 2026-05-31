import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const appConfig = readFileSync(resolve(root, "config/appConfig.js"), "utf8");
assert.ok(appConfig.includes('version: "v4.11z52"'), "app version should be v4.11z52");

const dashboardView = readFileSync(resolve(root, "src/ui/views/desktopView.js"), "utf8");
assert.ok(dashboardView.includes("buildDesktopDashboard"), "desktop dashboard builder must remain present");
assert.ok(dashboardView.includes("buildDashboardVisualShell"), "desktop Dashboard should now use the compact visual shell owner");

for (const [file, exportName, label] of [
    ["compareView.js", "buildCompareView", "Compare"],
    ["systemsMatrix.js", "buildSystemsMatrix", "Systems"],
    ["coachView.js", "buildCoachView", "Coach"],
    ["anomaliesView.js", "buildAnomaliesView", "Anomalies"]
]) {
    const text = readFileSync(resolve(root, "src/ui/sections", file), "utf8");
    assert.ok(text.includes("workspaceResetView"), `${label} should use the shared blank reset shell`);
    assert.ok(text.includes(exportName), `${label} export should remain available`);
}


const historyView = readFileSync(resolve(root, "src/ui/sections/historyView.js"), "utf8");
assert.ok(historyView.includes("HISTORY VIEW WRAPPER v4.11z52w29"), "History should now route through the w18 modular rebuild wrapper");
assert.ok(readFileSync(resolve(root, "src/ui/sections/history/historyView.js"), "utf8").includes("data-history-clean-library"), "History clean library marker should exist in modular view");

const resetCss = readFileSync(resolve(root, "styles/desktop/11-workspace-reset.css"), "utf8");
assert.ok(resetCss.includes('body[data-dashboard-tab="command"] .input-section'), "old desktop Command Deck input console should remain hidden");

const commandDeck = readFileSync(resolve(root, "src/ui/sections/commandDeckView.js"), "utf8");
assert.ok(commandDeck.includes("COMMAND DECK PANEL HIERARCHY REBUILD v4.11z52w29"), "Command Deck should now be clean foundation, not reset shell");
assert.ok(commandDeck.includes("data-command-report-input"), "Command Deck should own the visible report intake input");

console.log("v4.11z52 workspace reset + command foundation test passed.");
