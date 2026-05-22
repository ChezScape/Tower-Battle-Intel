"use strict";

/**
 * BUILD STYLE PROFILES
 * Used by AI Coach, priority logic and future UI sorting.
 */

export const BUILD_STYLE_PROFILES = Object.freeze({
    unknown: profile({
        label: "Unknown",
        meaning: "No build style selected. Advice should stay cautious and history-based.",
        priorities: ["wave", "coins_per_hour", "cells_per_hour"],
        warnings: ["killed_by", "damage_taken"],
        dashboardBias: "balanced"
    }),
    health_ehp: profile({
        label: "Health / EHP",
        meaning: "Survival-focused build using health, defense, recovery, wall, and sustain.",
        priorities: ["wave", "damage_taken", "recovery_packages", "health_regenerated", "damage_blocked", "cells_per_hour"],
        warnings: ["ray", "scatter", "vampire", "tower", "wall"],
        dashboardBias: "survival"
    }),
    blender: profile({
        label: "Blender",
        meaning: "Orb/control focused style where enemy clear flow matters heavily.",
        priorities: ["orbs", "black_hole", "death_ray", "waves_skipped", "coins_per_hour"],
        warnings: ["fast", "protector", "scatter"],
        dashboardBias: "control"
    }),
    devo: profile({
        label: "Devo",
        meaning: "Controlled enemy handling and economy timing style.",
        priorities: ["golden_tower", "death_wave", "coins_per_hour", "coins_earned", "health_bonus"],
        warnings: ["early_death", "low_wave", "elite_pressure"],
        dashboardBias: "economy_timing"
    }),
    orb_devo: profile({
        label: "Orb Devo",
        meaning: "Devo variant with strong orb-based clearing.",
        priorities: ["orbs", "death_wave", "golden_tower", "black_hole", "coins_per_hour"],
        warnings: ["protector", "scatter", "low_orb_kills"],
        dashboardBias: "orb_economy"
    }),
    glass_cannon: profile({
        label: "Glass Cannon",
        meaning: "Damage-first style. Survival drops may be expected if damage scaling is the priority.",
        priorities: ["damage_dealt", "smart_missiles", "chain_lightning", "spotlight", "wave"],
        warnings: ["tower", "wall", "low_recovery", "elite_pressure"],
        dashboardBias: "damage"
    }),
    hybrid: profile({
        label: "Hybrid",
        meaning: "Mixed damage and survival approach.",
        priorities: ["wave", "coins_per_hour", "cells_per_hour", "damage_dealt", "damage_taken", "utility"],
        warnings: ["economy_progression_split", "elite_pressure", "utility_drop"],
        dashboardBias: "balanced"
    })
});

export function getBuildStyleProfile(style = "unknown") {
    return BUILD_STYLE_PROFILES[String(style || "unknown").trim()] || BUILD_STYLE_PROFILES.unknown;
}

export function getBuildPriorityList(style = "unknown") {
    return [...getBuildStyleProfile(style).priorities];
}

export function getBuildWarningList(style = "unknown") {
    return [...getBuildStyleProfile(style).warnings];
}

function profile(config = {}) {
    return Object.freeze({
        label: config.label || "Unknown",
        meaning: config.meaning || "No description.",
        priorities: Object.freeze(config.priorities || []),
        warnings: Object.freeze(config.warnings || []),
        dashboardBias: config.dashboardBias || "balanced"
    });
}
