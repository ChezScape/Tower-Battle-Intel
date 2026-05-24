import assert from "node:assert/strict";
import fs from "node:fs";

const desktop = fs.readFileSync("./desktop.css", "utf8");
const mobile = fs.readFileSync("./mobile.css", "utf8");

assert.match(desktop, /v4\.11q Desktop Compact VS Removal/);
assert.match(desktop, /@media \(max-width:\s*1120px\)[\s\S]*\.tbi-vs-core \.tbi-vs-gem,[\s\S]*\.tbi-vs-core \.tbi-vs-label[\s\S]*display:\s*none !important/);
assert.match(desktop, /@media \(max-width:\s*1120px\)[\s\S]*\.tbi-vs-core::after[\s\S]*content:\s*"A VS B  COMPARISON" !important/);
assert.match(desktop, /@media \(max-width:\s*940px\) and \(min-width:\s*860px\)[\s\S]*content:\s*"COMPARISON" !important/);
assert.equal(mobile.includes("v4.11q Desktop Compact VS Removal"), false);

console.log("current-v4.11q-compact-vs-removal.test.mjs passed");
