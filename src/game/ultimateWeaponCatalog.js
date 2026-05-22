"use strict";

import { normaliseReportKey, formatReportLabel } from "./battleReportAliases.js";

export const ULTIMATE_WEAPON_CATALOG = Object.freeze({
    golden_tower: effect("Golden Tower", "GT", "ultimate_weapon", "Major economy Ultimate Weapon/effect source.", ["economy", "cash", "coins"]),
    black_hole: effect("Black Hole", "BH", "ultimate_weapon", "Enemy control and economy-linked Ultimate Weapon/effect source.", ["economy", "control", "damage"]),
    death_wave: effect("Death Wave", "DW", "ultimate_weapon", "Ultimate Weapon/effect source connected to damage, health, coins and cells depending on setup.", ["damage", "health", "economy", "cells"]),
    spotlight: effect("Spotlight", "SL", "ultimate_weapon", "Damage/economy multiplier effect source.", ["damage", "economy"]),
    smart_missiles: effect("Smart Missiles", "SM", "ultimate_weapon", "Damage-focused Ultimate Weapon source.", ["damage", "burst"]),
    chain_lightning: effect("Chain Lightning", "CL", "ultimate_weapon", "Damage-focused chained-hit Ultimate Weapon source.", ["damage"]),
    chrono_field: effect("Chrono Field", "CF", "ultimate_weapon", "Control/slow Ultimate Weapon effect source.", ["control", "survival"]),
    inner_land_mines: effect("Inner Land Mines", "ILM", "ultimate_weapon", "Damage/control Ultimate Weapon source.", ["damage", "control"]),
    poison_swamp: effect("Poison Swamp", "PS", "ultimate_weapon", "Damage/control Ultimate Weapon source.", ["damage", "control"]),
    flame_bot: effect("Flame Bot", "FB", "bot", "Bot/effect source in damage and damage-blocked sections.", ["bot", "damage"]),
    golden_bot: effect("Golden Bot", "GB", "bot", "Bot/economy effect source.", ["bot", "economy"]),
    amplify_bot: effect("Amplify Bot", "AB", "bot", "Bot/effect source in active-effect kill counts.", ["bot", "damage"]),
    thunder_bot: effect("Thunder Bot", "TB", "bot", "Bot/effect source for stun and hit context.", ["bot", "control"]),
    chain_thunder: effect("Chain Thunder", "CT", "effect", "Thunder-related damage/blocking effect source.", ["control", "defense"]),
    primordial_collapse: effect("Primordial Collapse", "PC", "effect", "Advanced effect/source found in blocked-damage sections.", ["advanced", "defense"]),
    negative_mass_projector: effect("Negative Mass Projector", "NMP", "effect", "Advanced effect/source found in blocked-damage sections.", ["advanced", "defense"]),
    death_penalty: effect("Death Penalty", "DP", "module_effect", "Module/effect source in active-effect kill counts.", ["module", "kill-effect"]),
    orbital_augment: effect("Orbital Augment", "OA", "module_effect", "Module/effect source in enemy-hit counts.", ["module", "damage"])
});

const ALIAS = buildAliasIndex(ULTIMATE_WEAPON_CATALOG);

export function getUltimateWeaponInfo(key = "") {
    const normal = normaliseReportKey(key);
    const canonical = ALIAS[normal] || normal;
    return ULTIMATE_WEAPON_CATALOG[canonical] || { label: formatReportLabel(key), short: "", type: "unknown_effect", meaning: "Ultimate weapon, bot, module effect or major report source not registered yet.", categories: [], sourceIds: ["local_history"], aliases: [] };
}
function effect(label, short, type, meaning, categories) { return Object.freeze({ label, short, type, meaning, categories: Object.freeze(categories), sourceIds: Object.freeze(["wiki_ultimate_weapons", "local_battle_report_samples"]), aliases: Object.freeze([]) }); }
function buildAliasIndex(catalog) { const m={}; for (const [k,v] of Object.entries(catalog)) { m[normaliseReportKey(k)]=k; if(v.short) m[normaliseReportKey(v.short)]=k; for(const a of v.aliases||[]) m[normaliseReportKey(a)]=k; } return Object.freeze(m); }
