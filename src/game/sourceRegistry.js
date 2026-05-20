"use strict";

/**
 * SOURCE REGISTRY
 * Conservative knowledge provenance for Tower Battle Intel.
 *
 * This file intentionally stores source metadata only.
 * Runtime analysis must never fetch the internet; it uses this local snapshot.
 */

export const KNOWLEDGE_CHECKED_AT = "2026-05-19";

export const SOURCE_REGISTRY = Object.freeze({

    official: [
        {
            id: "official_techtree_site",
            name: "Tech Tree Games official site",
            type: "official_site",
            confidence: "official",
            checked: KNOWLEDGE_CHECKED_AT,
            url: "https://www.techtreegames.com/",
            note: "Official developer site. Describes The Tower as tower defense with one tower."
        },
        {
            id: "official_google_play",
            name: "Google Play listing",
            type: "store_listing",
            confidence: "official_store",
            checked: KNOWLEDGE_CHECKED_AT,
            url: "https://play.google.com/store/apps/details?id=com.TechTreeGames.TheTower",
            note: "Official Android listing. Confirms upgrade, research, cards, tournaments and Ultimate Weapons."
        },
        {
            id: "official_web_store",
            name: "The Tower Web Store",
            type: "official_store",
            confidence: "official",
            checked: KNOWLEDGE_CHECKED_AT,
            url: "https://store.techtreegames.com/thetower/",
            note: "Official web store for The Tower by Tech Tree Games."
        },
        {
            id: "patch_v28_1_reddit",
            name: "V28.1 patch notes",
            type: "official_or_semi_official_patch_notes",
            confidence: "patch_notes_high",
            checked: KNOWLEDGE_CHECKED_AT,
            url: "https://www.reddit.com/r/TheTowerGame/comments/1tabrix/v281_patch_notes_may_11_2026/",
            note: "Recent v28.1 patch notes; used only for broad QoL/visibility direction, not exact balance math."
        }
    ],

    community: [
        {
            id: "wiki_enemies",
            name: "The Tower Wiki - Enemies",
            type: "community_wiki",
            confidence: "community_wiki_medium_high",
            checked: KNOWLEDGE_CHECKED_AT,
            url: "https://the-tower-idle-tower-defense.fandom.com/wiki/Enemies",
            note: "Enemy categories, spawn notes and immunity notes. Community-maintained, so verify after patches."
        },
        {
            id: "wiki_tier_specific_guide",
            name: "The Tower Wiki - Tier-Specific Guide",
            type: "community_guide",
            confidence: "community_guide_medium",
            checked: KNOWLEDGE_CHECKED_AT,
            url: "https://the-tower-idle-tower-defense.fandom.com/wiki/Tier-Specific_Guide",
            note: "Useful for broad interpretation of normal, elite and boss pressure. Advice can become stale."
        },
        {
            id: "community_game_subreddit",
            name: "r/TheTowerGame",
            type: "community_discussion",
            confidence: "community_mixed",
            checked: KNOWLEDGE_CHECKED_AT,
            url: "https://www.reddit.com/r/TheTowerGame/",
            note: "Useful for current terminology and player reports. Treat individual advice cautiously."
        }
    ],

    local: [
        {
            id: "local_history",
            name: "User Battle Report History",
            type: "local_history",
            confidence: "personal_high",
            checked: "runtime",
            url: "localStorage",
            note: "Best source for personal farming advice because it reflects the actual account and runs."
        }
    ]
});

export function getSourceRegistry() {
    return SOURCE_REGISTRY;
}

export function getSourceById(sourceId = "") {

    const groups = [
        ...SOURCE_REGISTRY.official,
        ...SOURCE_REGISTRY.community,
        ...SOURCE_REGISTRY.local
    ];

    return groups.find(source => source.id === sourceId) || null;
}

export function getSourceWarning({ short = false } = {}) {

    if (short) {
        return "Knowledge checked 2026-05-19. Prefer your saved run history for personal advice.";
    }

    return "Game knowledge changes after updates. Tower Battle Intel uses a local knowledge snapshot checked 2026-05-19, and your saved run history should override generic advice.";
}

export function getKnowledgeSnapshotLabel() {
    return `The Tower knowledge snapshot: ${KNOWLEDGE_CHECKED_AT}`;
}
