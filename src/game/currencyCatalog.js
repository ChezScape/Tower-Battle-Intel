"use strict";

import { normaliseReportKey, formatReportLabel } from "./battleReportAliases.js";

export const CURRENCY_CATALOG = Object.freeze({
    cash_earned: currency("Cash Earned", "Temporary in-run cash earned.", "cash"),
    cash: currency("Cash", "Temporary in-run upgrade currency.", "cash"),
    coins_earned: currency("Coins Earned", "Main permanent coin economy earned by the run.", "economy"),
    coins: currency("Coins", "Permanent workshop/research economy currency.", "economy"),
    coins_per_hour: currency("Coins Per Hour", "Real coin farming rate.", "economy_rate"),
    cells_earned: currency("Elite Cells Earned", "Elite-cell income from the run.", "cells"),
    cells_per_hour: currency("Cells Per Hour", "Real elite-cell farming rate.", "cells_rate"),
    elite_cells: currency("Elite Cells", "Currency dropped by elite enemies and used for lab boosts.", "cells"),
    gems: currency("Gems", "Premium currency used for cards/modules and other progression purchases.", "premium"),
    ad_gems: currency("Ad Gems", "Gems gained from ad rewards.", "premium"),
    gem_blocks_tapped: currency("Gem Blocks Tapped", "Gem block taps recorded by the report.", "premium_activity"),
    fetch_gems: currency("Fetch Gems", "Gems collected through fetch/guardian style loot when present.", "premium_activity"),
    stones: currency("Stones", "Power Stones used for Ultimate Weapon progression.", "ultimate_weapons", ["power_stones"]),
    power_stones: currency("Power Stones", "Ultimate Weapon progression currency.", "ultimate_weapons"),
    medals: currency("Medals", "Event currency/reward type.", "event"),
    keys: currency("Keys", "Progression currency category.", "progression"),
    bits: currency("Bits", "Progression currency category.", "progression"),
    tokens: currency("Tokens", "Progression currency category.", "progression"),
    shards: currency("Shards", "Module-related currency family.", "modules"),
    reroll_shards_earned: currency("Reroll Shards Earned", "Module reroll shard income.", "modules"),
    reroll_shards_fetched: currency("Reroll Shards Fetched", "Reroll shards collected through fetch/guardian style loot.", "modules"),
    cannon_shards: currency("Cannon Shards", "Attack module shard reward.", "modules"),
    armor_shards: currency("Armor Shards", "Defense module shard reward.", "modules"),
    generator_shards: currency("Generator Shards", "Utility module shard reward.", "modules"),
    core_shards: currency("Core Shards", "Ultimate Weapon module shard reward.", "modules"),
    common_modules: currency("Common Modules", "Common module drops.", "modules"),
    rare_modules: currency("Rare Modules", "Rare module drops.", "modules")
});

const ALIASES = buildAliasIndex(CURRENCY_CATALOG);

export function getCurrencyInfo(key = "") {
    const normal = normaliseReportKey(key);
    const canonical = ALIASES[normal] || normal;
    return CURRENCY_CATALOG[canonical] || { label: formatReportLabel(key), meaning: "Currency or reward type not registered yet.", category: "unknown", sourceIds: ["local_history"], aliases: [] };
}

function currency(label, meaning, category, aliases = []) {
    return Object.freeze({ label, meaning, category, sourceIds: Object.freeze(["wiki_currency", "local_battle_report_samples"]), aliases: Object.freeze(aliases) });
}
function buildAliasIndex(catalog) { const m={}; for (const [k,v] of Object.entries(catalog)) { m[normaliseReportKey(k)]=k; for (const a of v.aliases||[]) m[normaliseReportKey(a)]=k; } return Object.freeze(m); }
