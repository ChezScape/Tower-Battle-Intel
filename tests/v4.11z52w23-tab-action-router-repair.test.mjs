import assert from "node:assert/strict";
import fs from "node:fs";

import { getTabEventStatus } from "../src/ui/events/tabEvents.js";
import { getWorkspaceEventStatus } from "../src/ui/events/workspaceEvents.js";
import { BROWSER_CLICK_TRUTH_PROBE_VERSION } from "../src/ui/events/browserClickTruthProbe.js";

const config = fs.readFileSync(new URL("../config/appConfig.js", import.meta.url), "utf8");
const tabEvents = fs.readFileSync(new URL("../src/ui/events/tabEvents.js", import.meta.url), "utf8");
const appTabs = fs.readFileSync(new URL("../src/app/tabs.js", import.meta.url), "utf8");
const eventIndex = fs.readFileSync(new URL("../src/ui/events/index.js", import.meta.url), "utf8");
const rulebook = fs.readFileSync(new URL("../docs/ARCHITECTURE_OWNERSHIP_RULES.md", import.meta.url), "utf8");

assert.ok(config.includes('buildVersion: "v4.11z52w29"'));
assert.ok(config.includes('displayVersion: "v4.11z52w29"'));
assert.equal(BROWSER_CLICK_TRUTH_PROBE_VERSION, "v4.11z52w29");

assert.ok(appTabs.includes('body?.setAttribute("data-dashboard-tab", nextTab)'), "body still carries passive active-tab runtime state");
assert.equal(tabEvents.includes('closestEnabled(event?.target, "[data-dashboard-tab]")'), false, "tab events must not broadly match body/html runtime stamps");
assert.ok(tabEvents.includes('function findTabTrigger'), "tabEvents should use the explicit tab trigger gate");
assert.ok(tabEvents.includes('button[data-dashboard-tab]'), "button tab triggers should still work");
assert.ok(tabEvents.includes('a[data-dashboard-tab]'), "link tab triggers should still work");
assert.ok(tabEvents.includes('tag === "body" || tag === "html"'), "tabEvents should guard against body/html matches");

assert.ok(eventIndex.includes('handleTabClick'), "top nav tab handler remains active");
assert.ok(eventIndex.includes('handleWorkspaceClick'), "workspace click handler remains active after tab handler");
assert.ok(rulebook.includes('v4.11z52w29 Tab Router Safety Rule'), "RULE book should document the body/html data-dashboard-tab safety rule");

const tabStatus = getTabEventStatus();
assert.equal(tabStatus.active, true);
assert.equal(tabStatus.version, "v4.11z52w29");

const workspaceStatus = getWorkspaceEventStatus();
assert.equal(workspaceStatus.active, true);
assert.ok(workspaceStatus.commandFallbackActions.includes("validate-report"));
assert.ok(workspaceStatus.commandFallbackActions.includes("save-report"));

console.log("v4.11z52w29 tab action router repair test passed");
