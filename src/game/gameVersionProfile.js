"use strict";

/**
 * GAME VERSION PROFILE
 * Local source-of-truth stamp for the catalogue.
 */

export const GAME_VERSION_PROFILE = Object.freeze({
    game: "The Tower - Idle Tower Defense",
    developer: "Tech Tree Games",
    catalogueVersion: "v28.1-aware",
    towerBattleIntelVersion: "v4.9l",
    checkedAt: "2026-05-21",
    confidence: "official-store + official site + v28.1 patch notes + cautious wiki + local reports",
    officialSourceIds: Object.freeze([
        "official_techtree_site",
        "official_google_play",
        "official_web_store",
        "official_discord_invite"
    ]),
    communitySourceIds: Object.freeze([
        "patch_v28_1_reddit",
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
