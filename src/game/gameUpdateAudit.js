"use strict";

/**
 * GAME UPDATE AUDIT v4.11z52m
 * Read-only static audit summary for The Tower 28.2.0 XAPK.
 * Safe purpose: catalogue freshness, official wording, and Game Brain glossary context.
 */

export const GAME_UPDATE_AUDIT_V28_2_0 = Object.freeze({
    game: "The Tower - Idle Tower Defense",
    packageName: "com.TechTreeGames.TheTower",
    version: "28.2.0",
    versionCode: "966",
    source: "Uploaded APKPure XAPK, read-only static strings/resources audit",
    checkedAt: "2026-05-28",
    battleReportSchema: Object.freeze({
        baseline: "v28.1.0 Battle Report schema",
        baselineFieldCount: 142,
        propertyNamesFoundInV28_2_0: 142,
        breakingPropertyNameChangeDetected: false,
        conclusion: "Keep v28.1.0 parser schema as active baseline; use v28.2.0 as a freshness/recheck layer."
    }),
    usefulThemes: Object.freeze([
        "Dissonance / Dissonant Runs",
        "Dissonant Echo labs",
        "Overheat and tournament Overheat conditions",
        "Bot Bot and Bot+ abilities",
        "Synchronicity bot pathing",
        "Battle Report/stat category simplification",
        "Largest Wave Skip / Largest Golden Combo record wording",
        "TowerWrappedStats account-stat metadata names",
        "Battle History copy-to-clipboard metadata flow",
        "Save/cloud architecture caution for future companion app",
        "Golden Tower VFX toggle",
        "Event Store relic rotation wording"
    ]),
    warnings: Object.freeze([
        "This audit does not reveal hidden formulas or live server values.",
        "Use as wording/context for TBI Game Brain, Compare, Systems and Coach only.",
        "Discord/private sources were not scraped."
    ])
});

export function getGameUpdateAudit() {
    return GAME_UPDATE_AUDIT_V28_2_0;
}

export function isGameUpdateAuditCurrent(version = "") {
    return String(version || "").trim() === GAME_UPDATE_AUDIT_V28_2_0.version;
}

if (typeof window !== "undefined") {
    window.TowerBattleIntelGameUpdateAudit = Object.freeze({
        status: getGameUpdateAudit,
        isCurrent: isGameUpdateAuditCurrent
    });
}
