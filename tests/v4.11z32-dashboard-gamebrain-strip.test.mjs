import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { parser } from "../src/pipeline/parser.js";
import { buildDashboardGameBrainStrip } from "../src/ui/sections/dashboardGameBrainStrip.js";
import { buildDesktopDashboard } from "../src/ui/views/desktopView.js";
import { buildMobileDashboard } from "../src/ui/views/mobileView.js";

const root = path.dirname(new URL(import.meta.url).pathname);
const sample = fs.readFileSync(path.join(root, "fixtures/Battle_Report_T11.txt"), "utf8");
const parsed = parser(sample);

const html = buildDashboardGameBrainStrip({ runA: parsed, runB: parsed });
assert.ok(html.includes('data-dashboard-gamebrain-strip="true"'), "dashboard Game Brain strip should render");
assert.ok(html.includes("Verification"), "strip should render as a verification area");
assert.ok(html.includes('data-dashboard-gamebrain-details="true"'), "strip should use native details for optional proof");
assert.ok(html.includes("tbi-dashboard-gamebrain-summary"), "strip should expose a slim summary row");
assert.ok(html.includes("Details"), "strip should expose a Details control");
assert.ok(html.includes("Run A Read Quality"), "strip should render Run A read quality");
assert.ok(html.includes("Run B Read Quality"), "strip should render Run B read quality");
assert.ok(html.includes("Labels"), "strip should expose label recognition quality");
assert.ok(html.includes("Schema detail"), "strip should expose official/schema detail quality");
assert.ok(html.includes("Mapping polish"), "strip should expose mapping polish quality");
assert.ok(html.includes("Comparison safe"), "strip should expose comparison safety");
assert.equal(html.includes("Official Report Read"), false, "strip should not keep the old duplicate heading");
assert.equal(html.includes("Tier / Wave"), false, "strip should not repeat tier/wave from the top cards");
assert.equal(html.includes("Next checkpoint"), false, "strip should not repeat checkpoint from the top cards");
assert.equal(html.includes("Killed By"), false, "strip should not repeat killed-by from the top cards");

const desktop = buildDesktopDashboard({ runA: parsed, runB: parsed, sections: {}, stats: {}, summary: {}, insights: [], ai: [], anomalies: [] });
assert.ok(desktop.includes('data-dashboard-gamebrain-strip-shell="true"'), "desktop dashboard should include the parked visual Game Brain strip shell");
assert.ok(desktop.indexOf("tbi-run-strip") < desktop.indexOf("tbi-dashboard-gamebrain-strip"), "strip shell should sit below the protected run header");
assert.ok(desktop.indexOf("tbi-dashboard-gamebrain-strip") < desktop.indexOf("tbi-difference-overview"), "strip shell should sit above Difference Overview");

const mobile = buildMobileDashboard({ runA: parsed, runB: parsed, sections: {}, stats: {} });
assert.equal(mobile.includes("tbi-dashboard-gamebrain-strip"), false, "mobile dashboard should remain untouched");

console.log("v4.11z52k/z52w7 Dashboard Game Brain compact verification strip test passed.");
