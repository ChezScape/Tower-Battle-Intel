import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const appConfig = fs.readFileSync(path.join(root, "config/appConfig.js"), "utf8");
const mobileCss = fs.readFileSync(path.join(root, "mobile.css"), "utf8");
const desktopCss = fs.readFileSync(path.join(root, "desktop.css"), "utf8");

assert.ok(appConfig.includes('version: "v4.11z52"'), "app version should be v4.11z52");
assert.ok(desktopCss.includes("03-dashboard-locked.css"), "protected dashboard lock module should remain loaded");
assert.ok(desktopCss.includes("05-compare.css"), "Compare bare foundation module should remain loaded");
assert.ok(mobileCss.includes("styles/mobile"), "mobile blank module scaffold loader should remain intact");
assert.ok(!mobileCss.includes("history-gamebrain"), "z31 should not add desktop history polish into mobile.css");

console.log("v4.11z52 dashboard lock/version safety test passed.");
