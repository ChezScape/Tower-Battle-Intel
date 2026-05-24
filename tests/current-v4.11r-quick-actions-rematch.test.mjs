import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("./desktop.css", "utf8");
const sideIntel = readFileSync("./src/ui/sections/sideIntel.js", "utf8");
const mobile = readFileSync("./mobile.css", "utf8");

assert.match(css, /Quick Actions Mockup Rematch/);
assert.match(css, /\.tbi-quick-actions \.concept5-actions button\.wide/);
assert.match(css, /text-transform:\s*none !important/);
assert.match(css, /clip-path:\s*polygon\(0 10px/);
assert.match(css, /grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\) !important/);
assert.match(sideIntel, /actionButton\("open-command", "Paste Report", "paste"\)/);
assert.match(sideIntel, /actionButton\("toggle-debug", "Health Scan", "health", "wide"\)/);
assert.match(sideIntel, /actionButton\("clear-runs", "Clear Runs", "clear", "wide"\)/);
assert.equal(mobile.includes("Quick Actions Mockup Rematch"), false);

console.log("current-v4.11r-quick-actions-rematch.test.mjs passed");
