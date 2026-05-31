"use strict";

/**
 * GAME VERSION PROFILE
 * Local source-of-truth stamp for the catalogue.
 */

export const GAME_VERSION_PROFILE = Object.freeze({
    game: "The Tower - Idle Tower Defense",
    developer: "Tech Tree Games",
    catalogueVersion: "v28.2-knowledge-base",
    towerBattleIntelVersion: "v4.11z52m",
    checkedAt: "2026-05-28",
    confidence: "official-store + uploaded v28.2.0 XAPK deep static audit + v28 patch history + cautious wiki + local reports",
    officialSourceIds: Object.freeze([
        "official_techtree_site",
        "official_google_play",
        "official_web_store",
        "official_discord_invite",
        "local_xapk_v28_2_0_static_audit"
    ]),
    communitySourceIds: Object.freeze([
        "patch_v28_1_reddit",
        "wiki_v28_history",
        "wiki_enemies",
        "wiki_currency",
        "wiki_elite_cells",
        "wiki_ultimate_weapons",
        "wiki_modules",
        "wiki_cards"
    ]),
    notes: Object.freeze([
        "Runtime analysis does not fetch the internet.",
        "Community/wiki strategy data is used cautiously and never overrides local battle-report history.",
        "Discord is registered as an official access point only; private Discord content was not scraped."
    ])
});

export function getGameVersionProfile() {
    return GAME_VERSION_PROFILE;
}

export function getGameKnowledgeStamp() {
    return `${GAME_VERSION_PROFILE.catalogueVersion} / checked ${GAME_VERSION_PROFILE.checkedAt}`;
}
