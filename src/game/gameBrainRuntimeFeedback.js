"use strict";

/**
 * GAME BRAIN RUNTIME FEEDBACK v4.11z52
 *
 * Read-only bridge between parsed Battle Reports and the official/source-labelled
 * catalogue layer. It gives parser/debug/save flows useful wording without
 * changing Dashboard visuals, Compare layout, mobile CSS, or hidden formula logic.
 */

import {
    auditParsedReportLabels,
    findOfficialBattleReportField,
    explainOfficialBattleReportField,
    getOfficialBattleReportSchemaStatus
} from "./battleReportOfficialSchema.js";

import {
    getKnownBattleReportLabels,
    normaliseReportKey,
    formatReportLabel
} from "./battleReportAliases.js";

import {
    auditOfficialCatalogues,
    explainOfficialGameTerm
} from "./officialGameCatalogues.js";

import {
    explainWaveTierMilestone,
    getWaveTierMilestoneStatus
} from "./waveTierMilestoneCatalogue.js";

const MAX_KNOWN_PREVIEW = 50;
const MAX_UNKNOWN_PREVIEW = 30;

const KNOWN_PARSER_LABEL_KEYS = new Set(
    getKnownBattleReportLabels()
        .map(label => normaliseReportKey(label))
        .filter(Boolean)
);

const SECTION_AWARE_FIELD_OVERRIDES = new Map(Object.entries({
    // Run header / rate fields present in pasted reports but not stored as core BattleHistoryEntry fields.
    "core.coins_per_hour": "CoinsEarned",
    "core.cells_per_hour": "CellsEarned",

    // Damage output.
    "damage.projectiles": "ProjectilesDamage",
    "damage.rend_armor": "RendArmorDamage",
    "damage.death_ray": "DeathRayDamage",
    "damage.thorns": "ThornsDamage",
    "damage.orbs": "OrbDamage",
    "damage.land_mines": "LandMineDamage",
    "damage.chain_lightning": "ChainLightningDamage",
    "damage.smart_missiles": "SmartMissileDamage",
    "damage.inner_land_mines": "InnerLandMineDamage",
    "damage.poison_swamp": "PoisonSwampDamage",
    "damage.death_wave": "DeathWaveDamage",
    "damage.black_hole": "BlackHoleDamage",
    "damage.flame_bot": "FlameBotDamage",
    "damage.attack_chip": "AttackChipDamage",
    "damage.electrons": "ElectronsDamage",

    // Damage taken / survival.
    "damage_taken.tower": "DamageTakenTower",
    "damage_taken.wall": "DamageTakenWall",
    "bonus_health_gained.from_death_wave": "HealthFromDeathWaveThisRound",
    "damage_blocked.defense_percent": "DefensePercentBlocked",
    "damage_blocked.defense_absolute": "DefenseAbsoluteBlocked",
    "damage_blocked.chrono_field": "ChronoFieldBlocked",
    "damage_blocked.chain_thunder": "ChainThunderBlocked",
    "damage_blocked.flame_bot": "FlameBotBlocked",
    "damage_blocked.primordial_collapse": "PrimordialCollapseBlocked",
    "damage_blocked.negative_mass_projector": "NegativeMassProjectorBlocked",

    // Utility / counts.
    "utility.free_attack_upgrade": "FreeAttackUpgrades",
    "utility.free_defense_upgrade": "FreeDefenseUpgrades",
    "utility.free_utility_upgrade": "FreeUtilityUpgrades",
    "utility.enemy_attack_levels_skipped": "EnemyAttackLevelSkips",
    "utility.enemy_health_levels_skipped": "EnemyHealthLevelSkips",
    "counts.nuke": "NukesUsed",
    "counts.second_wind": "SecondWindsUsed",
    "counts.demon_mode": "DemonModesUsed",

    // Enemies hit by.
    "enemies_hit_by.projectiles": "EnemiesHitByProjectilesThisRound",
    "enemies_hit_by.thorns": "EnemiesHitByThornsThisRound",
    "enemies_hit_by.orbs": "EnemiesHitByOrbsThisRound",
    "enemies_hit_by.death_ray": "EnemiesHitByDeathRayThisRound",
    "enemies_hit_by.chain_lightning": "EnemiesHitByChainLightningThisRound",
    "enemies_hit_by.smart_missiles": "EnemiesHitBySmartMissilesThisRound",
    "enemies_hit_by.inner_land_mines": "EnemiesHitByInnerLandMinesThisRound",
    "enemies_hit_by.poison_swamp": "EnemiesHitByPoisonSwampThisRound",
    "enemies_hit_by.death_wave": "TaggedByDeathwave",
    "enemies_hit_by.black_hole": "EnemiesHitByBlackHoleThisRound",
    "enemies_hit_by.chrono_field": "EnemiesHitByChronoFieldThisRound",
    "enemies_hit_by.land_mines": "EnemiesHitByLandMineThisRound",
    "enemies_hit_by.thunder_bot": "EnemiesHitByThunderBotThisRound",
    "enemies_hit_by.flame_bot": "EnemiesHitByFlameBotThisRound",
    "enemies_hit_by.attack_chip": "EnemiesHitByAttackChipThisRound",
    "enemies_hit_by.orbital_augment": "EnemiesHitByOrbitalAugmentThisRound",

    // Killed with effect active.
    "killed_with_effect_active.golden_tower": "DestroyedInGoldenTower",
    "killed_with_effect_active.death_wave": "DestroyedInDeathWave",
    "killed_with_effect_active.spotlight": "DestroyedInSpotlight",
    "killed_with_effect_active.amplify_bot": "DestroyedInAmplifyBot",
    "killed_with_effect_active.golden_bot": "DestroyedInGoldenBot",
    "killed_with_effect_active.death_penalty": "DestroyedByDeathPenalty",

    // Total enemies.
    "total_enemies.summoned_enemies": "SummonedEnemies",

    // Economy / resources.
    "coins.coins_kill": "CoinsEarned",
    "coins.critical_coin": "CoinsFromCritCoin",
    "coins.golden_tower": "CoinsFromGoldenTower",
    "coins.golden_combo": "CoinsFromGoldenCombo",
    "coins.death_wave": "CoinsFromDeathWave",
    "coins.spotlight": "CoinsFromSpotlight",
    "coins.black_hole": "CoinsFromBlackHole",
    "coins.orbs": "CoinsFromOrbs",
    "coins.golden_bot": "GoldenBotCoinsEarned",
    "coins.wave_skip": "MostCoinsFromWaveSkip",
    "coins.coins_wave": "CoinsEarned",
    "coins.coins_fetched": "GuardianCoinsFetched",
    "coins.bounty_coins": "BountyCoins",
    "cash.golden_tower": "CashFromGoldenTower",
    "currencies.gems": "GemsThisRound",
    "currencies.fetch_gems": "GuardianGems",
    "currencies.medals": "GuardianMedals",
    "currencies.reroll_shards_fetched": "GuardianRerollShards",
    "currencies.cannon_shards": "GuardianCannonShards",
    "currencies.armor_shards": "GuardianArmorShards",
    "currencies.generator_shards": "GuardianGeneratorShards",
    "currencies.core_shards": "GuardianCoreShards",
    "currencies.common_modules": "GuardianCommonModules",
    "currencies.rare_modules": "GuardianRareModules",

    // Enemies destroyed by.
    "enemies_destroyed_by.projectiles": "DestroyedByProjectiles",
    "enemies_destroyed_by.thorns": "DestroyedByThorns",
    "enemies_destroyed_by.land_mines": "DestroyedByLandMine",
    "enemies_destroyed_by.orbs": "DestroyedByOrbs",
    "enemies_destroyed_by.chain_lightning": "DestroyedByChainLightning",
    "enemies_destroyed_by.smart_missiles": "DestroyedBySmartMissiles",
    "enemies_destroyed_by.inner_land_mines": "DestroyedByInnerLandMines",
    "enemies_destroyed_by.poison_swamp": "DestroyedByPoisonSwamp",
    "enemies_destroyed_by.death_ray": "DestroyedByDeathRay",
    "enemies_destroyed_by.black_hole": "DestroyedByBlackHole",
    "enemies_destroyed_by.flame_bot": "DestroyedByFlameBot",
    "enemies_destroyed_by.other": "DestroyedByOther"
}));

export function buildGameBrainParserFeedback(input = {}) {
    const core = input.core || {};
    const sections = input.sections || {};
    const flat = input.flat || {};
    const labelEntries = collectReportLabelEntries(sections, flat);
    const officialAudit = auditParsedReportLabelEntries(labelEntries);
    const labels = labelEntries.map(item => item.auditLabel);
    const known = Array.isArray(officialAudit.known) ? officialAudit.known : [];
    const parserKnown = Array.isArray(officialAudit.parserKnown) ? officialAudit.parserKnown : [];
    const unknown = Array.isArray(officialAudit.unknown) ? officialAudit.unknown : [];
    const familyCounts = countBy(known.map(item => item.family || "Unmapped"));
    const sectionCounts = countBy(known.map(item => item.section || "Unmapped"));
    const recognisedLabels = known.length + parserKnown.length;
    const coveragePercent = labels.length
        ? Math.round((recognisedLabels / labels.length) * 100)
        : 0;

    const killedBy = String(core.killedBy || core.killed_by || flat.killed_by || "").trim();
    const killedByContext = killedBy ? compactGameTermExplanation(killedBy) : null;
    const milestone = explainWaveTierMilestone({
        tier: core.tier ?? flat.tier,
        wave: core.wave ?? flat.wave,
        isTournament: Boolean(core.isTournament ?? flat.is_tournament ?? flat.tournament)
    });

    const otherKills = explainOfficialBattleReportField("Other");
    const otherCoinBonuses = explainOfficialBattleReportField("Other Coin Bonuses");

    const warnings = [];
    if (unknown.length) {
        warnings.push(`${unknown.length} parsed label(s) need mapping polish before Game Brain can classify them.`);
    }
    if (!milestone.ok) {
        warnings.push("Wave milestone context could not be calculated because Wave is missing or invalid.");
    }
    if (!killedByContext?.ok && killedBy) {
        warnings.push(`Killed By value '${killedBy}' has no z28 official catalogue explanation yet.`);
    }

    const labelCoverage = {
        totalLabels: labels.length,
        knownOfficialLabels: recognisedLabels,
        schemaMappedLabels: known.length,
        parserKnownLabels: parserKnown.length,
        unknownLabels: unknown.length,
        schemaReviewLabels: parserKnown.length,
        coveragePercent
    };

    const readableSummary = buildReadableGameBrainSummary({
        core,
        labelCoverage,
        milestone,
        killedByContext,
        warnings
    });

    return {
        ok: officialAudit.knownCount > 0 && milestone.ok,
        version: "game-brain-runtime-feedback-v4.11z52",
        source: "The Tower v28.1.0 schema + v28.2.0 static XAPK audit layer",
        safePurpose: "Parser feedback, Debug Panel checks, Game Brain wording, History/Compare grouping.",
        notSafePurpose: "Hidden formulas, exact enemy scaling maths, live server values, or automated gameplay.",
        labelCoverage,
        readableSummary,
        families: familyCounts,
        sections: sectionCounts,
        officialFields: {
            knownPreview: known.slice(0, MAX_KNOWN_PREVIEW),
            unknownPreview: unknown.slice(0, MAX_UNKNOWN_PREVIEW),
            parserKnownPreview: parserKnown.slice(0, MAX_UNKNOWN_PREVIEW)
        },
        milestone,
        killedBy: killedByContext,
        specialMeanings: {
            otherKills: compactBattleReportField(otherKills),
            otherCoinBonuses: compactBattleReportField(otherCoinBonuses),
            rule: "Enemies Hit By, Enemies Destroyed By, and Killed With Effect Active must remain separate meanings."
        },
        warnings
    };
}

export function buildGameBrainDebugPayload(state = {}) {
    const current = state?.runB || state?.currentRun || state?.runA || null;
    const history = Array.isArray(state?.history) ? state.history : [];

    const payload = {
        status: {
            officialCatalogues: auditOfficialCatalogues(),
            battleReportSchema: getOfficialBattleReportSchemaStatus(),
            waveTierMilestones: getWaveTierMilestoneStatus()
        },
        currentRun: buildRunGameBrainSummary(current),
        runA: buildRunGameBrainSummary(state?.runA || null),
        runB: buildRunGameBrainSummary(state?.runB || null),
        history: buildHistoryGameBrainSummary(history),
        safePurpose: "This panel confirms catalogue/schema wiring and parser feedback. It does not expose formulas or modify game data."
    };

    payload.visibleSummary = buildDebugVisibleSummary(payload);

    return payload;
}

export function buildRunGameBrainSummary(run = null) {
    if (!run) {
        return {
            available: false,
            message: "No run loaded yet. Save or select a report to see Game Brain parser feedback.",
            readableSummary: {
                tone: "quiet",
                headline: "No run loaded yet.",
                summaryLines: ["Save or select a report to see Game Brain parser feedback."],
                quickFacts: []
            }
        };
    }

    const savedFeedback = run?.meta?.gameBrainFeedback || null;
    const feedback = isCurrentGameBrainFeedback(savedFeedback)
        ? savedFeedback
        : buildGameBrainParserFeedback({
            core: run.core || {},
            sections: run.sections || {},
            flat: run.flat || {}
        });

    return {
        available: true,
        reportId: run?.meta?.reportId || run?.id || null,
        battleDate: run?.core?.battleDate || null,
        tier: run?.core?.tier ?? null,
        wave: run?.core?.wave ?? null,
        killedBy: run?.core?.killedBy || null,
        labelCoverage: feedback.labelCoverage || null,
        readableSummary: feedback.readableSummary || buildReadableGameBrainSummary({
            core: run.core || {},
            labelCoverage: feedback.labelCoverage || {},
            milestone: feedback.milestone || null,
            killedByContext: feedback.killedBy || null,
            warnings: feedback.warnings || []
        }),
        milestone: feedback.milestone || null,
        killedByContext: feedback.killedBy || null,
        warningCount: Array.isArray(feedback.warnings) ? feedback.warnings.length : 0,
        warnings: Array.isArray(feedback.warnings) ? feedback.warnings.slice(0, 10) : []
    };
}

export function formatGameBrainSaveSummary(feedback = null) {
    if (!feedback) return null;

    const readable = feedback.readableSummary || buildReadableGameBrainSummary({
        labelCoverage: feedback.labelCoverage || {},
        milestone: feedback.milestone || null,
        killedByContext: feedback.killedBy || null,
        warnings: feedback.warnings || []
    });

    return {
        tone: readable.tone || "info",
        headline: readable.headline || "Game Brain checked this report.",
        summaryLines: Array.isArray(readable.summaryLines) ? readable.summaryLines.slice(0, 4) : [],
        quickFacts: Array.isArray(readable.quickFacts) ? readable.quickFacts.slice(0, 5) : [],
        warnings: Array.isArray(feedback.warnings) ? feedback.warnings.slice(0, 5) : []
    };
}

function isCurrentGameBrainFeedback(feedback = null) {
    return Boolean(feedback && String(feedback.version || "").includes("v4.11z52"));
}

function buildReadableGameBrainSummary({ core = {}, labelCoverage = {}, milestone = null, killedByContext = null, warnings = [] } = {}) {
    const total = Number(labelCoverage.totalLabels || 0);
    const known = Number(labelCoverage.knownOfficialLabels || 0);
    const schemaMapped = Number(labelCoverage.schemaMappedLabels || 0);
    const parserKnown = Number(labelCoverage.parserKnownLabels || 0);
    const unknown = Number(labelCoverage.unknownLabels || 0);
    const percent = Number(labelCoverage.coveragePercent || 0);
    const tier = core.tier ?? milestone?.tier ?? null;
    const wave = core.wave ?? milestone?.wave ?? null;

    const tone = unknown > 0
        ? "watch"
        : known > 0
            ? "good"
            : "quiet";

    const headline = known > 0
        ? `Game Brain recognised ${known} Battle Report label${known === 1 ? "" : "s"}${total ? ` from ${total} checked label${total === 1 ? "" : "s"}` : ""}${schemaMapped ? `; ${schemaMapped} have official/schema detail attached` : ""}.`
        : "Game Brain is ready, but no report labels were recognised yet.";

    const summaryLines = [];
    if (milestone?.ok) {
        const remaining = Number(milestone.remainingToNextCheckpoint || 0);
        if (remaining > 0) {
            summaryLines.push(`Wave checkpoint: next target is Wave ${milestone.nextCheckpoint}, ${remaining} waves away.`);
        } else if (milestone.nextCheckpoint) {
            summaryLines.push(`Wave checkpoint: this run is sitting on the Wave ${milestone.nextCheckpoint} checkpoint.`);
        } else {
            summaryLines.push(milestone.message || "Wave checkpoint context is available.");
        }
    }

    if (milestone?.band?.label) {
        summaryLines.push(`Run band: ${milestone.band.label}.`);
    }

    if (killedByContext?.ok) {
        const label = killedByContext.label || killedByContext.input || "Unknown";
        const family = killedByContext.family ? ` / ${killedByContext.family}` : "";
        const meaning = killedByContext.meaning ? ` — ${killedByContext.meaning}` : "";
        summaryLines.push(`Killed By: ${label}${family}${meaning}`);
    } else if (core.killedBy) {
        summaryLines.push(`Killed By: ${core.killedBy}. No official catalogue explanation is attached yet.`);
    }

    if (unknown > 0) {
        summaryLines.push(`Mapping polish: ${unknown} report label${unknown === 1 ? "" : "s"} need review before Game Brain can classify them. The report still loaded safely.`);
    } else if (known > 0) {
        const detail = parserKnown ? ` ${schemaMapped} label${schemaMapped === 1 ? "" : "s"} have official/schema detail attached; ${parserKnown} extra parser-known label${parserKnown === 1 ? "" : "s"} are recognised safely.` : "";
        summaryLines.push(`Mapping polish: none needed for this parsed report.${detail}`);
    }

    const quickFacts = [
        fact("Recognised labels", `${known || 0} labels`, known ? "good" : "quiet"),
        fact("Report labels checked", String(total || known || 0), total || known ? "info" : "quiet"),
        fact("Mapping polish", unknown ? `${unknown} labels` : "None needed", unknown ? "watch" : "good"),
        fact("Schema detail", schemaMapped ? `${schemaMapped} labels` : "Pending", schemaMapped ? "info" : "quiet"),
        fact("Tier / Wave", tier || wave ? `T${tier || "?"} / W${wave || "?"}` : "Not parsed", tier || wave ? "info" : "quiet"),
        fact("Next checkpoint", milestone?.ok ? `Wave ${milestone.nextCheckpoint}` : "Unavailable", milestone?.ok ? "info" : "quiet"),
        fact("Killed By", killedByContext?.label || core.killedBy || "Unknown", killedByContext?.ok ? "info" : "quiet")
    ];

    return {
        tone,
        headline,
        summaryLines: summaryLines.slice(0, 6),
        quickFacts,
        hasWarnings: Array.isArray(warnings) && warnings.length > 0,
        warningCount: Array.isArray(warnings) ? warnings.length : 0
    };
}

function buildDebugVisibleSummary(payload = {}) {
    const status = payload.status || {};
    const current = payload.currentRun || {};
    const catalogue = status.officialCatalogues || {};
    const schema = status.battleReportSchema || {};
    const milestones = status.waveTierMilestones || {};

    const cards = [
        fact("Catalogues", catalogue.ok ? `${catalogue.catalogueCount || 0} files / ${catalogue.totalEntries || 0} entries` : "Needs check", catalogue.ok ? "good" : "watch"),
        fact("Battle schema", schema.ok ? `${schema.fieldCount || 0} fields / ${schema.aliasCount || 0} aliases` : "Needs check", schema.ok ? "good" : "watch"),
        fact("Milestones", milestones.ok ? `${milestones.baseCheckpointCount || 0} base / ${milestones.heatCheckpointCount || 0} Heat` : "Needs check", milestones.ok ? "good" : "watch"),
        fact("Current run", current.available ? `${current.reportId || "Loaded"}` : "No run loaded", current.available ? "info" : "quiet")
    ];

    return {
        headline: current?.readableSummary?.headline || "Game Brain catalogue wiring is loaded.",
        cards,
        currentRunLines: current?.readableSummary?.summaryLines || [],
        historyNote: payload.history?.note || "",
        safePurpose: payload.safePurpose
    };
}

function buildHistoryGameBrainSummary(history = []) {
    const runs = history.filter(Boolean);
    const withFeedback = runs.filter(run => run?.meta?.gameBrainFeedback).length;
    const unknownLabels = runs.reduce((sum, run) => sum + Number(run?.meta?.gameBrainFeedback?.labelCoverage?.unknownLabels || 0), 0);
    const killedByCounts = countBy(runs.map(run => run?.core?.killedBy || "Unknown"));

    return {
        count: runs.length,
        withGameBrainFeedback: withFeedback,
        withoutGameBrainFeedback: Math.max(0, runs.length - withFeedback),
        totalUnknownLabels: unknownLabels,
        killedByCounts,
        note: runs.length && withFeedback < runs.length
            ? "Older saved reports may not have z30 parser feedback until they are re-imported or recalculated."
            : "Game Brain feedback is present for currently parsed z30 runs."
    };
}

function collectReportLabelEntries(sections = {}, flat = {}) {
    const entries = [];
    const seen = new Set();

    for (const [section, rows] of Object.entries(sections || {})) {
        if (!rows || typeof rows !== "object") continue;
        for (const key of Object.keys(rows)) {
            addLabelEntry(entries, seen, {
                section,
                key,
                rawLabel: formatReportLabel(key),
                source: "section"
            });
        }
    }

    for (const key of Object.keys(flat || {})) {
        const alreadySeenInSection = [...seen].some(value => value.endsWith(`.${key}`));
        if (alreadySeenInSection) continue;
        addLabelEntry(entries, seen, {
            section: "flat",
            key,
            rawLabel: formatReportLabel(key),
            source: "flat"
        });
    }

    return entries;
}

function addLabelEntry(entries = [], seen = new Set(), item = {}) {
    const section = normaliseReportKey(item.section || "core");
    const key = normaliseReportKey(item.key || item.rawLabel || "");
    if (!key) return;

    const id = `${section}.${key}`;
    if (seen.has(id)) return;

    seen.add(id);
    entries.push({
        section,
        key,
        rawLabel: item.rawLabel || formatReportLabel(key),
        auditLabel: `${section}.${key}`,
        source: item.source || "section"
    });
}

function auditParsedReportLabelEntries(entries = []) {
    const known = [];
    const parserKnown = [];
    const unknown = [];

    for (const entry of entries || []) {
        const field = resolveSectionAwareField(entry);

        if (field) {
            known.push({
                input: entry.auditLabel,
                label: entry.key,
                rawLabel: entry.rawLabel,
                sourceSection: entry.section,
                property: field.property,
                displayLabel: field.displayLabel,
                family: field.family,
                section: field.section
            });
            continue;
        }

        if (isParserKnownLabel(entry)) {
            parserKnown.push({
                input: entry.auditLabel,
                label: entry.key,
                rawLabel: entry.rawLabel,
                sourceSection: entry.section,
                displayLabel: entry.rawLabel,
                family: "Parser-known report label",
                section: entry.section
            });
            continue;
        }

        unknown.push({
            label: entry.key,
            key: entry.key,
            section: entry.section,
            rawLabel: entry.rawLabel
        });
    }

    return {
        ok: unknown.length === 0,
        total: entries.length,
        knownCount: known.length + parserKnown.length,
        schemaMappedCount: known.length,
        parserKnownCount: parserKnown.length,
        unknownCount: unknown.length,
        known,
        parserKnown,
        unknown
    };
}

function resolveSectionAwareField(entry = {}) {
    const section = normaliseReportKey(entry.section || "core");
    const key = normaliseReportKey(entry.key || entry.rawLabel || "");
    const compound = `${section}.${key}`;
    const override = SECTION_AWARE_FIELD_OVERRIDES.get(compound);

    if (override) {
        const field = findOfficialBattleReportField(override);
        if (field) return field;
    }

    return findOfficialBattleReportField(key)
        || findOfficialBattleReportField(entry.rawLabel)
        || null;
}

function isParserKnownLabel(entry = {}) {
    const key = normaliseReportKey(entry.key || entry.rawLabel || "");
    return Boolean(key && KNOWN_PARSER_LABEL_KEYS.has(key));
}

function compactGameTermExplanation(term = "") {
    const explained = explainOfficialGameTerm(term);
    if (!explained?.ok) {
        return {
            ok: false,
            input: term,
            message: explained?.message || "No official catalogue explanation found."
        };
    }

    const primary = explained.primary || {};
    return {
        ok: true,
        input: term,
        label: primary.label || term,
        catalogueKey: primary.catalogueKey || null,
        family: primary.family || null,
        meaning: primary.meaning || "",
        sourceConfidence: primary.sourceConfidence || "unknown",
        tags: Array.isArray(primary.tags) ? primary.tags.slice(0, 8) : [],
        warning: explained.warning || ""
    };
}

function compactBattleReportField(explained = {}) {
    if (!explained?.ok) {
        return {
            ok: false,
            input: explained?.input || "",
            message: explained?.message || "No official Battle Report field explanation found."
        };
    }

    return {
        ok: true,
        property: explained.property,
        key: explained.key,
        displayLabel: explained.displayLabel,
        family: explained.family,
        section: explained.section,
        meaning: explained.meaning,
        sourceConfidence: explained.sourceConfidence
    };
}

function countBy(values = []) {
    const out = {};
    for (const value of values) {
        const key = String(value || "Unknown").trim() || "Unknown";
        out[key] = (out[key] || 0) + 1;
    }
    return out;
}

function toneForCoverage(coverage = {}) {
    const unknown = Number(coverage.unknownLabels || 0);
    const percent = Number(coverage.coveragePercent || 0);
    if (unknown > 0) return "watch";
    if (percent >= 90) return "good";
    if (percent > 0) return "info";
    return "quiet";
}

function fact(label, value, tone = "info") {
    return {
        label: String(label || ""),
        value: String(value ?? ""),
        tone: String(tone || "info")
    };
}

export default {
    buildGameBrainParserFeedback,
    buildGameBrainDebugPayload,
    buildRunGameBrainSummary,
    formatGameBrainSaveSummary
};
