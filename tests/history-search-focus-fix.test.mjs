import fs from "node:fs";
import assert from "node:assert/strict";

const index = fs.readFileSync("./index.html", "utf8");
const config = fs.readFileSync("./config/appConfig.js", "utf8");
const guard = fs.readFileSync("./src/ui/historySearchFocusGuard.js", "utf8");

assert.match(config, /version:\s*"v4\.11r"/);
assert.match(index, /historySearchFocusGuard\.js/);
assert.match(index, /<script\s+src="\.\/src\/ui\/historySearchFocusGuard\.js"><\/script>[\s\S]*<script\s+type="module"\s+src="\.\/app\.js"/);
assert.match(guard, /HISTORY SEARCH FOCUS GUARD v4\.11q/);
assert.match(guard, /\[data-history-filter-query\], input\.history-search/);
assert.match(guard, /stopImmediatePropagation/);
assert.match(guard, /history-set-filters/);
assert.match(guard, /TowerBattleIntelHistorySearchFocusGuard/);

console.log("history-search-focus-fix.test.mjs passed");
