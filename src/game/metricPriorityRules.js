"use strict";

import { normaliseReportKey } from "./battleReportAliases.js";
import { getReportMetricInfo } from "./reportSchema.js";

export const PRIMARY_METRICS = Object.freeze([
    "wave", "coins_earned", "coins_per_hour", "cells_earned", "cells_per_hour", "killed_by"
]);

export const SECONDARY_METRICS = Object.freeze([
    "damage_dealt", "damage_taken", "tower", "wall", "defense_percent", "defense_absolute",
    "golden_tower", "black_hole", "death_wave", "spotlight", "orbs", "thorns",
    "enemy_attack_levels_skipped", "enemy_health_levels_skipped", "waves_skipped"
]);

export const DETAIL_METRICS = Object.freeze([
    "projectiles_count", "land_mines_spawned", "reroll_shards_fetched", "common_modules", "rare_modules"
]);

const LOWER_IS_BETTER = new Set([
    "tower", "wall", "damage_taken", "damage_taken_tower", "damage_taken_wall"
]);

const NEUTRAL_SIGNAL = new Set([
    "ad_gems", "gems", "gem_blocks_tapped", "fetch_gems", "medals", "projectiles_count",
    "land_mines_spawned", "death_defy", "second_wind", "demon_mode", "nuke", "basic",
    "fast", "tank", "ranged", "boss", "protector", "vampires", "rays", "scatters",
    "saboteur", "commander", "overcharge", "summoned_enemies"
]);

export function getMetricPriorityInfo(metricKey = "", sectionKey = "") {
    const key = normaliseReportKey(metricKey);
    const schema = getReportMetricInfo(key, sectionKey) || {};

    if (PRIMARY_METRICS.includes(key)) return info("primary", 3, schema);
    if (SECONDARY_METRICS.includes(key)) return info("secondary", 2, schema);
    if (DETAIL_METRICS.includes(key)) return info("detail", 0.8, schema);

    return info("normal", Number(schema.importance || 1), schema);
}

export function isLowerBetterMetric(metricKey = "", sectionKey = "") {
    const key = normaliseReportKey(metricKey);
    const schema = getReportMetricInfo(key, sectionKey);
    if (LOWER_IS_BETTER.has(key)) return true;
    return schema?.higherIsBetter === false;
}

export function isNeutralSignalMetric(metricKey = "", sectionKey = "") {
    const key = normaliseReportKey(metricKey);
    const schema = getReportMetricInfo(key, sectionKey);
    return NEUTRAL_SIGNAL.has(key) || schema?.higherIsBetter === "context";
}

export function getMetricCompareRole(metricKey = "", sectionKey = "") {
    if (isNeutralSignalMetric(metricKey, sectionKey)) return "neutral_signal";
    if (isLowerBetterMetric(metricKey, sectionKey)) return "lower_is_better";
    return "higher_is_better";
}

export function getMetricPriorityScore(metricKey = "", sectionKey = "") {
    return getMetricPriorityInfo(metricKey, sectionKey).importance;
}

function info(level, importance, schema = {}) {
    return Object.freeze({
        level,
        importance,
        category: schema.category || "other",
        meaning: schema.meaning || ""
    });
}
