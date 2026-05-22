"use strict";

export const KNOWLEDGE_CHECKED_AT = "2026-05-21";

export const SOURCE_REGISTRY = Object.freeze({
    official: Object.freeze([
        source("official_techtree_site", "Tech Tree Games official site", "official_site", "official", "https://www.techtreegames.com/", "Official developer site."),
        source("official_google_play", "Google Play listing", "store_listing", "official_store", "https://play.google.com/store/apps/details?id=com.TechTreeGames.TheTower", "Official Android listing; confirms game loop and current store update context."),
        source("official_app_store", "Apple App Store listing", "store_listing", "official_store", "https://apps.apple.com/app/the-tower-idle-tower-defense/id1575590830", "Official iOS listing."),
        source("official_web_store", "The Tower Web Store", "official_store", "official", "https://store.techtreegames.com/thetower/", "Official web store categories such as gems, stones, packs and passes."),
        source("official_discord_invite", "The Tower official Discord invite", "official_discord_invite", "official_access_point_only", "https://discord.com/invite/thetowerdefense", "Public invite page only; private Discord content not accessed."),
        source("patch_v28_1_reddit", "V28.1 patch notes - May 11 2026", "patch_notes", "patch_notes_high", "https://www.reddit.com/r/TheTowerGame/comments/1tabrix/v281_patch_notes_may_11_2026/", "Used for current description/encyclopedia direction.")
    ]),
    community: Object.freeze([
        source("wiki_home", "The Tower Wiki home", "community_wiki", "community_wiki_medium", "https://the-tower-idle-tower-defense.fandom.com/wiki/The_Tower_-_Idle_Tower_Defense_Wiki", "Community maintained index."),
        source("wiki_enemies", "The Tower Wiki - Enemies", "community_wiki", "community_wiki_medium_high", "https://the-tower-idle-tower-defense.fandom.com/wiki/Enemies", "Enemy family, boss, elite and spawn-cap context."),
        source("wiki_currency", "The Tower Wiki - Currency", "community_wiki", "community_wiki_medium_high", "https://the-tower-idle-tower-defense.fandom.com/wiki/Currency", "Currency categories and broad currency behaviour."),
        source("wiki_elite_cells", "The Tower Wiki - Elite Cells", "community_wiki", "community_wiki_medium_high", "https://the-tower-idle-tower-defense.fandom.com/wiki/Currency/Elite_Cells", "Elite cell drop/source context."),
        source("wiki_ultimate_weapons", "The Tower Wiki - Ultimate Weapons", "community_wiki", "community_wiki_medium_high", "https://the-tower-idle-tower-defense.fandom.com/wiki/Ultimate_Weapons", "Ultimate Weapon context."),
        source("wiki_modules", "The Tower Wiki - Modules", "community_wiki", "community_wiki_medium_high", "https://the-tower-idle-tower-defense.fandom.com/wiki/Modules", "Module type context."),
        source("wiki_cards", "The Tower Wiki - Cards", "community_wiki", "community_wiki_medium_high", "https://the-tower-idle-tower-defense.fandom.com/wiki/Cards", "Card context."),
        source("local_battle_report_samples", "Andrew's battle report samples", "local_samples", "local_runtime_high", "local://uploaded-battle-report-samples", "Used to validate parser/schema/metric coverage."),
        source("local_history", "Local saved Tower Battle Intel history", "local_runtime", "local_runtime_context", "local://tower-battle-intel-history", "User's own saved report context.")
    ])
});

const FLAT_SOURCES = Object.freeze(
    Object.values(SOURCE_REGISTRY).flat().reduce((map, item) => {
        map[item.id] = item;
        return map;
    }, {})
);

export function getSourceRegistry() { return SOURCE_REGISTRY; }
export function getSourceById(sourceId = "") { return FLAT_SOURCES[String(sourceId || "").trim()] || null; }
export function getSourceWarning({ short = false } = {}) {
    return short
        ? "Knowledge snapshot: official/store first, wiki/community cautious."
        : "Tower Battle Intel uses a dated local game-knowledge snapshot. Official/store and patch-note sources are higher confidence; wiki/community sources are cautious guidance.";
}
export function getKnowledgeSnapshotLabel() { return `Game knowledge checked ${KNOWLEDGE_CHECKED_AT}`; }

function source(id, name, type, confidence, url, note) {
    return Object.freeze({ id, name, type, confidence, checked: KNOWLEDGE_CHECKED_AT, url, note });
}
