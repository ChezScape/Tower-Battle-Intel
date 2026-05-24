import fs from "node:fs";
import assert from "node:assert/strict";

const guard = fs.readFileSync("./src/ui/nativeControlGuard.js", "utf8");
const bootstrap = fs.readFileSync("./bootstrap.js", "utf8");
const config = fs.readFileSync("./config/appConfig.js", "utf8");

assert.match(config, /version:\s*"v4\.10t"/);
assert.match(guard, /NATIVE CONTROL GUARD v4\.10t/);
assert.match(guard, /stopImmediatePropagation\(\)/);
assert.match(guard, /select/);
assert.match(guard, /summary/);
assert.match(guard, /nativeControlGuardBound/);
assert.match(bootstrap, /nativeControlGuard\.js/);
assert.match(bootstrap, /bindNativeControlGuard\(\)/);

console.log("native-control-guard.test.mjs passed");
