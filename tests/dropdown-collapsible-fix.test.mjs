import fs from "node:fs";
import assert from "node:assert/strict";

const bridge = fs.readFileSync("./src/ui/actionAuditBridge.js", "utf8");
const css = fs.readFileSync("./desktop.css", "utf8");

assert.match(bridge, /const VERSION = "v4\.11q";/);
assert.match(bridge, /native select\/dropdown controls must be left completely native/i);
assert.match(bridge, /let the browser's native <details>\/<summary> toggle happen/i);
assert.doesNotMatch(bridge, /details\.open = !details\.open;\n\n    lastAction = \{/);
assert.match(bridge, /native-select-click/);
assert.match(bridge, /native-text-click/);
assert.match(css, /Dropdown \+ Collapsible Fix/);
assert.match(css, /history-choice-select/);
assert.match(css, /details > summary/);

console.log("dropdown-collapsible-fix.test.mjs passed");
