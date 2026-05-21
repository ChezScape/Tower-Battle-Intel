"use strict";

import { normaliseReportKey, formatReportLabel } from "./battleReportAliases.js";

export const MODULE_TYPES = Object.freeze({
    cannon: module("Cannon", "Attack", "Attack-focused module family."),
    armor: module("Armor", "Defense", "Defense-focused module family."),
    generator: module("Generator", "Utility", "Utility-focused module family."),
    core: module("Core", "Ultimate Weapons", "Ultimate Weapon-focused module family.")
});

export const MODULE_CATALOG = Object.freeze({
    ...MODULE_TYPES,
    reroll_shards_earned: metric("Reroll Shards Earned", "Reroll shard income used for module sub-stat rerolls.", "reroll"),
    reroll_shards_fetched: metric("Reroll Shards Fetched", "Fetched reroll shard income.", "reroll"),
    cannon_shards: metric("Cannon Shards", "Attack module shard reward.", "shards"),
    armor_shards: metric("Armor Shards", "Defense module shard reward.", "shards"),
    generator_shards: metric("Generator Shards", "Utility module shard reward.", "shards"),
    core_shards: metric("Core Shards", "Ultimate Weapon module shard reward.", "shards"),
    common_modules: metric("Common Modules", "Common module drops.", "drops"),
    rare_modules: metric("Rare Modules", "Rare module drops.", "drops")
});

export function getModuleInfo(key = "") {
    const normal = normaliseReportKey(key);
    return MODULE_CATALOG[normal] || { label: formatReportLabel(key), meaning: "Module metric not registered yet.", category: "unknown", sourceIds: ["local_history"] };
}
function metric(label, meaning, category) { return Object.freeze({ label, meaning, category, sourceIds: Object.freeze(["wiki_modules", "local_battle_report_samples"]), aliases: [] }); }
function module(label, focus, meaning) { return Object.freeze({ label, focus, meaning, category: "module_type", sourceIds: Object.freeze(["wiki_modules"]), aliases: [] }); }
