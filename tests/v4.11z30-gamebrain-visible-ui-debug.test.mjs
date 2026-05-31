import assert from "node:assert/strict";
import fs from "node:fs";

const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const render = fs.readFileSync(new URL("../src/ui/render.js", import.meta.url), "utf8");
const bootstrap = fs.readFileSync(new URL("../bootstrap.js", import.meta.url), "utf8");
const topNav = fs.readFileSync(new URL("../src/ui/components/topNav.js", import.meta.url), "utf8");

assert.equal(fs.existsSync(new URL("../src/ui/dev/inspectionPanel.js", import.meta.url)), false, "Debug inspection panel should be removed");
assert.equal(fs.existsSync(new URL("../styles/desktop/09-settings-debug-base.css", import.meta.url)), false, "desktop Debug panel CSS should be removed");
assert.equal(index.includes("debugPanel"), false, "static Debug panel root should be removed");
assert.equal(index.includes("toggleDebug"), false, "hidden Debug button should be removed");
assert.equal(render.includes("renderInspectionPanel"), false, "root render should not render Debug UI");
assert.equal(bootstrap.includes("Debug"), false, "bootstrap should not load Debug helpers");
assert.equal(topNav.includes("toggle-display-mode"), false, "theme/display toggle should be removed");

console.log("v4.11z52t debugless UI cleanup test passed.");
