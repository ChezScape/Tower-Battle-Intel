"use strict";

/**
 * REPORT SCHEMA
 * Expected Battle Report shape for The Tower report paste format.
 */

import {
    normaliseReportKey,
    normaliseReportSection,
    formatReportLabel
} from "./battleReportAliases.js";

export const REPORT_SCHEMA = Object.freeze({
    core: schemaSection("Core", [
        "battle_date", "game_time", "real_time", "tier", "wave", "killed_by",
        "coins_earned", "coins_per_hour", "cells_earned", "cells_per_hour"
    ], "Run identity and headline performance."),
    records: schemaSection("Records", [
        "highest_coins_minute", "largest_wave_skip", "most_coins_from_wave_skip",
        "most_cells_from_wave_skip", "largest_smart_missile_stack", "largest_golden_combo",
        "most_coins_from_golden_combo", "largest_inner_landmine_charge"
    ], "One-off run records and burst peaks."),
    damage: schemaSection("Damage", [
        "damage_dealt", "projectiles", "rend_armor", "death_ray", "thorns", "orbs",
        "land_mines", "chain_lightning", "smart_missiles", "inner_land_mines",
        "poison_swamp", "death_wave", "black_hole", "flame_bot", "attack_chip", "electrons"
    ], "Damage-source contribution."),
    damage_taken: schemaSection("Damage Taken", ["tower", "wall"], "Incoming tower and wall damage. Lower is generally better."),
    bonus_health_gained: schemaSection("Bonus Health Gained", ["from_death_wave"], "Bonus health gained during the run."),
    health_regenerated: schemaSection("Health Regenerated", ["lifesteal", "tower_health_regen", "wall_health_regen"], "Sustain and regeneration."),
    damage_blocked: schemaSection("Damage Blocked", [
        "defense_percent", "defense_absolute", "chrono_field", "chain_thunder", "flame_bot",
        "primordial_collapse", "negative_mass_projector"
    ], "Damage mitigation and blocked damage sources."),
    utility: schemaSection("Utility", [
        "recovery_packages", "free_attack_upgrade", "free_defense_upgrade", "free_utility_upgrade",
        "enemy_attack_levels_skipped", "enemy_health_levels_skipped"
    ], "Upgrade skips, package and utility flow."),
    counts: schemaSection("Counts", [
        "projectiles_count", "land_mines_spawned", "thunder_bot_stuns", "waves_skipped",
        "death_defy", "hits_absorbed_by_energy_shield", "nuke", "second_wind", "demon_mode"
    ], "Run event counts."),
    enemies_hit_by: schemaSection("Enemies Hit By", [
        "projectiles", "thorns", "orbs", "death_ray", "chain_lightning", "smart_missiles",
        "inner_land_mines", "poison_swamp", "death_wave", "black_hole", "chrono_field",
        "land_mines", "thunder_bot", "flame_bot", "attack_chip", "orbital_augment"
    ], "Hit-source distribution."),
    killed_with_effect_active: schemaSection("Killed With Effect Active", [
        "golden_tower", "death_wave", "spotlight", "amplify_bot", "golden_bot", "death_penalty"
    ], "Kills while major effects were active."),
    total_enemies: schemaSection("Total Enemies", [
        "total_enemies", "basic", "fast", "tank", "ranged", "boss", "protector", "vampires",
        "rays", "scatters", "saboteur", "commander", "overcharge", "summoned_enemies"
    ], "Enemy population and pressure mix."),
    coins: schemaSection("Coins", [
        "coins_earned", "coins_kill", "other_coin_bonuses", "critical_coin", "golden_tower",
        "golden_combo", "death_wave", "spotlight", "black_hole", "orbs", "golden_bot",
        "wave_skip", "coins_wave", "coins_fetched", "bounty_coins"
    ], "Coin-source breakdown. Sources can overlap through multipliers."),
    cash: schemaSection("Cash", ["cash_earned", "golden_tower", "interest_earned"], "Temporary in-run cash economy."),
    currencies: schemaSection("Currencies", [
        "cells_earned", "gems", "ad_gems", "gem_blocks_tapped", "fetch_gems", "medals",
        "reroll_shards_earned", "reroll_shards_fetched", "cannon_shards", "armor_shards",
        "generator_shards", "core_shards", "common_modules", "rare_modules"
    ], "Reward currencies and module drops."),
    enemies_destroyed_by: schemaSection("Enemies Destroyed By", [
        "projectiles", "thorns", "land_mines", "orbs", "chain_lightning", "smart_missiles",
        "inner_land_mines", "poison_swamp", "death_ray", "black_hole", "flame_bot", "other"
    ], "Final kill-source distribution.")
});

const FIELD_HINTS = Object.freeze({
    wave: hint("Wave", "Final wave reached before the run ended.", "progression", true, 3),
    tier: hint("Tier", "Difficulty tier used for the run.", "progression", "context", 2),
    killed_by: hint("Killed By", "Enemy or pressure source that ended the run.", "death", null, 2),
    coins_earned: hint("Coins Earned", "Total coin economy output from the run.", "economy", true, 2.8),
    coins_per_hour: hint("Coins Per Hour", "Real coin farming speed; better than raw coins for different run lengths.", "farming", true, 3),
    cells_earned: hint("Cells Earned", "Total elite cell gain from the run.", "cells", true, 2.8),
    cells_per_hour: hint("Cells Per Hour", "Real elite-cell farming speed.", "cells", true, 3),
    damage_dealt: hint("Damage Dealt", "Total damage output.", "damage", true, 1.8),
    tower: hint("Tower", "Tower damage taken in Damage Taken, or tower-related value depending on section.", "survivability", false, 1.7),
    wall: hint("Wall", "Wall damage taken or wall-related value depending on section.", "survivability", "context", 1.4),
    defense_percent: hint("Defense %", "Defense percentage blocked/mitigation report value.", "survivability", true, 1.7),
    defense_absolute: hint("Defense Absolute", "Absolute defense contribution.", "survivability", true, 1.5),
    recovery_packages: hint("Recovery Packages", "Recovery packages collected; important for EHP and package sustain.", "survivability", true, 1.6),
    enemy_attack_levels_skipped: hint("Enemy Attack Levels Skipped", "EALS utility; lowers enemy attack scaling pressure.", "utility", true, 1.7),
    enemy_health_levels_skipped: hint("Enemy Health Levels Skipped", "EHLS utility; lowers enemy health scaling pressure.", "utility", true, 1.7),
    waves_skipped: hint("Waves Skipped", "Wave skip count. Useful for speed/farm-flow reads.", "utility", true, 1.6),
    total_enemies: hint("Total Enemies", "Total enemy count for the run. Context signal, not automatically better/worse.", "enemy_pressure", "context", 1.3),
    boss: hint("Boss", "Boss count. Context signal for boss pressure.", "enemy_pressure", "context", 1.3),
    vampires: hint("Vampires", "Vampire elite count. Elite pressure and cell context.", "elite_pressure", "context", 1.6),
    rays: hint("Rays", "Ray elite count. Elite pressure and cell context.", "elite_pressure", "context", 1.6),
    scatters: hint("Scatters", "Scatter elite count. Elite pressure and cleanup context.", "elite_pressure", "context", 1.6),
    coins_kill: hint("Coins / Kill", "Coin output normalised by kills.", "economy", true, 2.1),
    coins_wave: hint("Coins / Wave", "Coin output normalised by wave.", "economy", true, 2.1),
    reroll_shards_earned: hint("Reroll Shards Earned", "Module reroll shard income.", "modules", true, 1.4),
    common_modules: hint("Common Modules", "Common module drops.", "modules", true, 1.2),
    rare_modules: hint("Rare Modules", "Rare module drops.", "modules", true, 1.3)
});

const EXPECTED_KEY_INDEX = buildExpectedKeyIndex();

export function getReportSchema() {
    return REPORT_SCHEMA;
}

export function getExpectedReportKeys(sectionKey = "") {
    const section = REPORT_SCHEMA[normaliseReportSection(sectionKey)];
    return section ? [...section.expectedKeys] : [];
}

export function isKnownReportField(key = "", sectionKey = "") {
    return Boolean(getReportMetricInfo(key, sectionKey));
}

export function getReportMetricInfo(key = "", sectionKey = "") {
    const normalKey = normaliseReportKey(key);
    const normalSection = normaliseReportSection(sectionKey);

    const directHint = FIELD_HINTS[normalKey];
    const indexed = EXPECTED_KEY_INDEX[normalKey];

    if (!directHint && !indexed) {
        return null;
    }

    const section = REPORT_SCHEMA[normalSection] || REPORT_SCHEMA[indexed?.sections?.[0]] || null;
    const hintInfo = directHint || hint(
        formatReportLabel(normalKey),
        buildGeneratedMeaning(normalKey, section),
        section?.category || "report",
        inferHigherIsBetter(normalKey, section?.category),
        inferImportance(normalKey, section?.category)
    );

    return {
        ...hintInfo,
        key: normalKey,
        section: normalSection || indexed?.sections?.[0] || "",
        sourceIds: ["local_battle_report_samples"]
    };
}

export function validateReportAgainstSchema(sections = {}) {
    const presentSections = Object.keys(sections || {}).map(normaliseReportSection);
    const missingSections = Object.keys(REPORT_SCHEMA).filter(key => key !== "core" && !presentSections.includes(key));
    const unknownSections = presentSections.filter(key => key && !REPORT_SCHEMA[key]);
    const unknownFields = findUnknownReportFields(sections);

    return {
        ok: unknownSections.length === 0,
        missingSections,
        unknownSections,
        unknownFields,
        sectionCount: presentSections.length,
        expectedSectionCount: Object.keys(REPORT_SCHEMA).length - 1
    };
}

export function findUnknownReportFields(sections = {}) {
    const out = [];

    for (const [sectionKey, rows] of Object.entries(sections || {})) {
        const section = normaliseReportSection(sectionKey);
        if (!rows || typeof rows !== "object") continue;

        for (const key of Object.keys(rows)) {
            const metric = normaliseReportKey(key);
            if (!isKnownReportField(metric, section)) {
                out.push({ section, key: metric, label: formatReportLabel(metric) });
            }
        }
    }

    return out;
}

function schemaSection(label, expectedKeys = [], meaning = "") {
    return Object.freeze({
        label,
        meaning,
        category: normaliseReportSection(label),
        expectedKeys: Object.freeze(expectedKeys.map(normaliseReportKey))
    });
}

function hint(label, meaning, category, higherIsBetter, importance = 1) {
    return Object.freeze({ label, meaning, category, higherIsBetter, importance });
}

function buildExpectedKeyIndex() {
    const out = {};
    for (const [sectionKey, section] of Object.entries(REPORT_SCHEMA)) {
        for (const key of section.expectedKeys || []) {
            if (!out[key]) out[key] = { sections: [] };
            out[key].sections.push(sectionKey);
        }
    }
    return Object.freeze(out);
}

function buildGeneratedMeaning(key, section) {
    const label = formatReportLabel(key);
    const sectionLabel = section?.label || "Battle Report";
    return `${label} from the ${sectionLabel} section.`;
}

function inferHigherIsBetter(key, category) {
    if (["damage_taken", "death", "enemy_pressure", "elite_pressure"].includes(category)) return "context";
    if (["tower", "wall"].includes(key)) return false;
    if (["death_defy", "second_wind", "demon_mode", "nuke"].includes(key)) return "context";
    if (["basic", "fast", "tank", "ranged", "boss", "protector", "vampires", "rays", "scatters", "saboteur", "commander", "overcharge", "summoned_enemies"].includes(key)) return "context";
    return true;
}

function inferImportance(key, category) {
    if (["coins_per_hour", "cells_per_hour", "wave"].includes(key)) return 3;
    if (["coins_earned", "cells_earned", "coins_kill", "coins_wave"].includes(key)) return 2.2;
    if (["elite_pressure", "survivability", "damage", "utility"].includes(category)) return 1.6;
    return 1;
}
