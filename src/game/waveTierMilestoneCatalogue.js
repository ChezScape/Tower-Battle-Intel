"use strict";

/**
 * WAVE / TIER / MILESTONE CATALOGUE v4.11z27
 * Source: static readable strings + Unity/IL2CPP metadata names from The Tower v28.1.0 XAPK.
 * Safe purpose: Game Brain milestone context, next-checkpoint hints, and debug validation.
 * Not safe purpose: hidden formulas, exact enemy scaling maths, exact reward tables, or live server settings.
 */

const HEAT_INCREASE_WAVES = Object.freeze([
    20, 40, 60, 80, 100,
    150, 200, 250, 300, 350, 400, 450,
    500, 600, 700, 800, 900, 1000
]);

const BASE_WAVE_CHECKPOINTS = Object.freeze([
    20, 40, 60, 80, 100,
    150, 200, 250, 300, 350, 400, 450,
    500, 600, 700, 800, 900, 1000,
    1500, 2000, 2500, 3000, 3500, 4000, 4500,
    5000, 6000, 7000, 8000, 9000, 10000
]);

const EARLY_RUN_CHECKPOINTS = Object.freeze([20, 40, 60, 100]);

const OFFICIAL_CONCEPTS = Object.freeze([
    Object.freeze({
        concept: "Wave",
        meaning: "The primary measure of in-run progression. Each Wave spawns enemies and progressively scales enemy health and damage.",
        sourceConfidence: "game-file-confirmed-label"
    }),
    Object.freeze({
        concept: "Tier",
        meaning: "Global difficulty level. Higher Tiers scale enemy difficulty faster, grant higher coin multipliers, and unlock milestone rewards.",
        sourceConfidence: "game-file-confirmed-label"
    }),
    Object.freeze({
        concept: "Milestones",
        meaning: "Specific Wave targets within each Tier. Reaching Milestones unlocks one-time permanent rewards, Relics, and new game features.",
        sourceConfidence: "game-file-confirmed-label"
    }),
    Object.freeze({
        concept: "Wave Info panel",
        meaning: "The app has a Wave Info panel tied to enemy chance, health, damage, speed, and mass text, plus CalculateEnemyValues metadata.",
        sourceConfidence: "game-file-observed"
    }),
    Object.freeze({
        concept: "WaveMilestones",
        meaning: "The app metadata includes CheckAndPostWaveMilestonesPerTier, CheckAndPostWave100PerTier, wave20, wave40, wave60, and WaveMilestones symbols.",
        sourceConfidence: "game-file-observed-medium-high"
    })
]);

const WAVE_BANDS = Object.freeze([
    Object.freeze({ min: 1, max: 19, label: "Opening waves", tone: "neutral", advice: "Very early run context. Treat this as setup/check parsing rather than a serious progression judgement." }),
    Object.freeze({ min: 20, max: 99, label: "Early milestone pressure", tone: "info", advice: "The game has observed early milestone/event clues at waves 20, 40, and 60." }),
    Object.freeze({ min: 100, max: 499, label: "First sustained tier push", tone: "info", advice: "Wave 100 is an observed per-tier checkpoint clue. Use this band to judge early tier stability." }),
    Object.freeze({ min: 500, max: 999, label: "Mid-run pressure band", tone: "warn", advice: "Use 500/600/700/800/900 as clean progress anchors. Tournament Heat also uses this cadence." }),
    Object.freeze({ min: 1000, max: 4999, label: "Long push band", tone: "warn", advice: "Use 500-wave increments for next-goal guidance; avoid claiming reward unlocks unless reward data is confirmed." }),
    Object.freeze({ min: 5000, max: Infinity, label: "Deep run / farming endurance band", tone: "good", advice: "Use 1000-wave blocks, rate stability, and death-cause trends for improvement advice." })
]);

function toPositiveInteger(value) {
    if (typeof value === "string") {
        const cleaned = value.replace(/,/g, "").trim();
        if (!cleaned) {
            return null;
        }
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) && parsed > 0
            ? Math.floor(parsed)
            : null;
    }

    const num = Number(value);
    return Number.isFinite(num) && num > 0
        ? Math.floor(num)
        : null;
}

function getWaveBand(wave) {
    const parsed = toPositiveInteger(wave);

    if (!parsed) {
        return Object.freeze({
            label: "Unknown wave band",
            tone: "neutral",
            advice: "No valid Wave value was found.",
            min: null,
            max: null
        });
    }

    return WAVE_BANDS.find(band => parsed >= band.min && parsed <= band.max) || WAVE_BANDS[WAVE_BANDS.length - 1];
}

function getNearestBaseMilestones(wave) {
    const parsed = toPositiveInteger(wave);

    if (!parsed) {
        return {
            wave: null,
            previous: null,
            next: BASE_WAVE_CHECKPOINTS[0],
            progressToNext: 0,
            checkpoints: [...BASE_WAVE_CHECKPOINTS]
        };
    }

    const previous = [...BASE_WAVE_CHECKPOINTS]
        .reverse()
        .find(item => item <= parsed) || null;

    let next = BASE_WAVE_CHECKPOINTS.find(item => item > parsed) || null;

    if (!next) {
        next = Math.ceil((parsed + 1) / 1000) * 1000;
    }

    const lower = previous || 0;
    const span = Math.max(1, next - lower);
    const progressToNext = Math.max(0, Math.min(1, (parsed - lower) / span));

    return {
        wave: parsed,
        previous,
        next,
        remaining: Math.max(0, next - parsed),
        progressToNext,
        checkpoints: [...BASE_WAVE_CHECKPOINTS]
    };
}

function getTournamentHeatContext(wave) {
    const parsed = toPositiveInteger(wave);

    if (!parsed) {
        return {
            active: false,
            previousHeatWave: null,
            nextHeatWave: HEAT_INCREASE_WAVES[0],
            remainingToNextHeat: HEAT_INCREASE_WAVES[0],
            heatIncreaseWaves: [...HEAT_INCREASE_WAVES],
            sourceConfidence: "game-file-confirmed-label"
        };
    }

    const previousHeatWave = [...HEAT_INCREASE_WAVES]
        .reverse()
        .find(item => item <= parsed) || null;

    const nextHeatWave = HEAT_INCREASE_WAVES.find(item => item > parsed) || null;

    return {
        active: true,
        previousHeatWave,
        nextHeatWave,
        remainingToNextHeat: nextHeatWave ? Math.max(0, nextHeatWave - parsed) : 0,
        heatIncreaseWaves: [...HEAT_INCREASE_WAVES],
        sourceConfidence: "game-file-confirmed-label"
    };
}

function extractReportValue(report = {}, names = []) {
    if (!report || typeof report !== "object") {
        return null;
    }

    const direct = names.find(name => Object.prototype.hasOwnProperty.call(report, name));
    if (direct) {
        return report[direct];
    }

    const normalized = Object.entries(report).find(([key]) => {
        const normal = String(key || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return names.some(name => String(name).toLowerCase().replace(/[^a-z0-9]/g, "") === normal);
    });

    return normalized ? normalized[1] : null;
}

function explainWaveTierMilestone(input = {}) {
    const report = input && typeof input === "object" ? input : {};

    const tier = toPositiveInteger(
        report.tier ?? extractReportValue(report, ["Tier", "tier", "difficultyTier", "Difficulty Tier"])
    );

    const wave = toPositiveInteger(
        report.wave ?? extractReportValue(report, ["Wave", "wave", "Max Wave", "maxWave", "highestWave", "Highest Wave"])
    );

    const isTournament = Boolean(
        report.isTournament ?? report.tournament ?? report.IsTournament ?? report.manualTournamentTag
    );

    const base = getNearestBaseMilestones(wave);
    const band = getWaveBand(wave);
    const heat = isTournament ? getTournamentHeatContext(wave) : null;

    const title = wave
        ? `Tier ${tier || "?"} / Wave ${wave}`
        : "Wave milestone context unavailable";

    const message = wave
        ? `Reached ${band.label}. Next checkpoint: Wave ${base.next}. ${base.remaining || 0} waves remaining.`
        : "No valid Wave value was found, so milestone context could not be calculated.";

    return {
        ok: Boolean(wave),
        tier,
        wave,
        isTournament,
        title,
        band,
        previousCheckpoint: base.previous,
        nextCheckpoint: base.next,
        remainingToNextCheckpoint: base.remaining ?? null,
        progressToNextCheckpoint: base.progressToNext,
        tournamentHeat: heat,
        message,
        sourceConfidence: "tbi-inferred from game-file confirmed/observed concepts",
        warnings: [
            "Exact official reward milestone tables were not extracted from the static XAPK pass.",
            "Enemy health/damage formulas were observed as method names only, not safely extracted."
        ]
    };
}

function analyseReportWaveMilestone(report = {}) {
    return explainWaveTierMilestone(report);
}

function getWaveTierMilestoneStatus() {
    return {
        ok: true,
        gameVersion: "28.1.0",
        catalogue: "Wave/Tier/Milestone Catalogue",
        baseCheckpointCount: BASE_WAVE_CHECKPOINTS.length,
        heatCheckpointCount: HEAT_INCREASE_WAVES.length,
        earlyRunCheckpoints: [...EARLY_RUN_CHECKPOINTS],
        concepts: OFFICIAL_CONCEPTS.map(item => item.concept),
        sourceConfidence: "mixed: game-file-confirmed-label / game-file-observed / tbi-inferred"
    };
}

const api = Object.freeze({
    status: getWaveTierMilestoneStatus,
    explain: explainWaveTierMilestone,
    analyseReport: analyseReportWaveMilestone,
    band: getWaveBand,
    nearest: getNearestBaseMilestones,
    heat: getTournamentHeatContext,
    checkpoints: () => [...BASE_WAVE_CHECKPOINTS],
    heatCheckpoints: () => [...HEAT_INCREASE_WAVES],
    concepts: () => OFFICIAL_CONCEPTS.map(item => ({ ...item }))
});

if (typeof window !== "undefined") {
    window.TowerBattleIntelWaveTierMilestones = api;
}

export {
    BASE_WAVE_CHECKPOINTS,
    HEAT_INCREASE_WAVES,
    EARLY_RUN_CHECKPOINTS,
    OFFICIAL_CONCEPTS,
    getWaveBand,
    getNearestBaseMilestones,
    getTournamentHeatContext,
    explainWaveTierMilestone,
    analyseReportWaveMilestone,
    getWaveTierMilestoneStatus
};

export default api;
