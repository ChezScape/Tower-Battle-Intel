import fs from "node:fs";
import assert from "node:assert/strict";

const hard = fs.readFileSync("./src/ui/nativeImportHardBridge.js", "utf8");
const audit = fs.readFileSync("./src/ui/actionAuditBridge.js", "utf8");
const config = fs.readFileSync("./config/appConfig.js", "utf8");

assert.match(config, /version:\s*"v4\.10q"/);
assert.match(hard, /const VERSION = "v4\.10q"/);
assert.match(hard, /bindInputDirectly/);
assert.match(hard, /handleDirectInputFileEvent/);
assert.match(hard, /scheduleSelectedFileWatch/);
assert.match(hard, /window\.addEventListener\("focus", activeFocusHandler, true\)/);
assert.match(hard, /historyImportFileObservedAt/);
assert.match(hard, /pollActive/);
assert.match(audit, /const VERSION = "v4\.10q"/);

console.log("file-input-direct-bind-fix.test.mjs passed");
