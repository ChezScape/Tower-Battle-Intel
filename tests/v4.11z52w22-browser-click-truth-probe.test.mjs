import assert from "node:assert/strict";
import fs from "node:fs";

import { getWorkspaceEventStatus } from "../src/ui/events/workspaceEvents.js";
import { getBrowserClickTruthProbeStatus, BROWSER_CLICK_TRUTH_PROBE_VERSION } from "../src/ui/events/browserClickTruthProbe.js";

const config = fs.readFileSync(new URL("../config/appConfig.js", import.meta.url), "utf8");
const eventIndex = fs.readFileSync(new URL("../src/ui/events/index.js", import.meta.url), "utf8");
const workspaceEvents = fs.readFileSync(new URL("../src/ui/events/workspaceEvents.js", import.meta.url), "utf8");
const probe = fs.readFileSync(new URL("../src/ui/events/browserClickTruthProbe.js", import.meta.url), "utf8");
const desktopCss = fs.readFileSync(new URL("../styles/desktop/11-workspace-reset.css", import.meta.url), "utf8");

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.equal(BROWSER_CLICK_TRUTH_PROBE_VERSION, "v4.11z52w29");

assert.ok(eventIndex.includes('document.addEventListener("pointerdown", handleDocumentPointerDownCapture, true)'), "pointer probe should bind in capture phase");
assert.ok(eventIndex.includes('document.addEventListener("click", handleDocumentClickCapture, true)'), "click owner should bind in capture phase");
assert.ok(eventIndex.includes("recordClickProbe"), "event root should record click truth snapshots");
assert.ok(eventIndex.includes("recordProbeError"), "event root should expose runtime action errors in the probe");
assert.ok(eventIndex.includes("capturePhaseOwner: true"), "status should say capture owner is active");
assert.equal(eventIndex.includes('document.addEventListener("click", handleDocumentClick, false)'), false, "old bubble click owner should not be active");

assert.ok(workspaceEvents.includes("function findCommandActionButton"), "workspace events should have root-independent Command fallback matching");
assert.ok(workspaceEvents.includes("COMMAND_ACTIONS"), "known Command actions should be matched even if root selector misses");
assert.ok(workspaceEvents.includes("captureTruthProbe: true"), "workspace status should expose the truth probe phase");

assert.ok(probe.includes("Click Truth Probe"), "probe should render visible browser feedback");
assert.ok(probe.includes("TowerBattleIntelClickTruth"), "probe should expose a browser console helper");
assert.ok(desktopCss.includes(".tbi-click-truth-probe"), "probe should have scoped visual styling");

const status = getWorkspaceEventStatus();
assert.equal(status.active, true);
assert.equal(status.captureTruthProbe, true);
assert.ok(status.commandFallbackActions.includes("save-report"));
assert.ok(status.commandFallbackActions.includes("validate-report"));

const probeStatus = getBrowserClickTruthProbeStatus();
assert.equal(probeStatus.version, "v4.11z52w29");
assert.equal(probeStatus.enabled, true);

console.log("v4.11z52w29 browser click truth probe test passed");
