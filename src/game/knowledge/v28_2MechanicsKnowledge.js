"use strict";

/**
 * GAME BRAIN KNOWLEDGE — THE TOWER v28.2 MECHANICS v4.11z52m
 * Small, modular, source-labelled mechanics glossary from the uploaded 28.2.0 XAPK static audit.
 */

export const V28_2_MECHANICS_KNOWLEDGE = Object.freeze([
    {
        id: "mechanic:dissonance",
        term: "Dissonance",
        type: "Mechanic",
        family: "Dissonance / Tier modifier",
        section: "Mechanics",
        sourceConfidence: "game-file-confirmed-description",
        summary: "v28 layer around Dissonant Runs and tier-linked boosts. Useful for Systems, Coach and Compare context.",
        aliases: Object.freeze(["Dissonance", "Dissonant Run", "Dissonant Runs", "Dissonant Boosts", "DissonanceType"]),
        uses: Object.freeze(["Systems glossary", "Coach context", "Compare caution"]),
        source: "v28.2.0 XAPK readable strings and IL2CPP metadata names",
        caution: "No hidden boost formula is claimed."
    },
    {
        id: "mechanic:dissonant-echo-labs",
        term: "Dissonant Echo Labs",
        type: "Labs / Dissonance",
        family: "Dissonance / Labs",
        section: "Mechanics",
        sourceConfidence: "game-file-confirmed-description",
        summary: "Dissonance-linked labs for Attack, Defense, Utility and Ultimate Weapon echo effects.",
        aliases: Object.freeze(["Dissonant Echo", "Dissonant Echo Labs", "DissonantBoostViewer"]),
        uses: Object.freeze(["Systems glossary", "future Coach context"]),
        source: "v28.2.0 XAPK readable strings and metadata names",
        caution: "Context only; no exact lab formula claim."
    },
    {
        id: "mechanic:overheat",
        term: "Overheat",
        type: "Mechanic",
        family: "High-wave pressure / Heat",
        section: "Mechanics",
        sourceConfidence: "game-file-confirmed-description",
        summary: "High-wave pressure system with enemy-skip decay and tournament heat-condition signals.",
        aliases: Object.freeze(["Overheat", "Heat", "Enemy Skip Decay", "eLSDecay", "Tournament Heat"]),
        uses: Object.freeze(["Coach warning", "Compare context", "Systems glossary"]),
        source: "v28.2.0 XAPK static strings and metadata names",
        caution: "Exact scaling values are not inferred."
    },
    {
        id: "mechanic:enemy-skip-decay",
        term: "Enemy Skip Decay",
        type: "Overheat signal",
        family: "High-wave pressure / Heat",
        section: "Mechanics",
        sourceConfidence: "game-file-confirmed-metadata-name",
        summary: "Metadata signals such as eLSDecayAmount and eLSDecayWavesUntilDecay show this is a distinct high-wave pressure concept worth tracking in Game Brain.",
        aliases: Object.freeze(["eLSDecayAmount", "eLSDecayWavesUntilDecay", "Enemy Level Skip Decay", "Enemy Skip Decay"]),
        uses: Object.freeze(["Coach warning", "future tournament/heat context"]),
        source: "v28.2.0 IL2CPP metadata names",
        caution: "Metadata name only; no decay formula claim."
    },
    {
        id: "mechanic:tournament-overheat-conditions",
        term: "Tournament Overheat Conditions",
        type: "Tournament condition group",
        family: "Tournament / Heat",
        section: "Tournaments",
        sourceConfidence: "game-file-confirmed-description",
        summary: "v28.2.0 metadata and readable text confirm tournament heat conditions such as Damage Decay, Health Decay, More Fleets and More Elites.",
        aliases: Object.freeze(["Damage Decay", "Health Decay", "More Fleets", "More Elites", "active_tournamentBattleConditions"]),
        uses: Object.freeze(["Tournament context", "Coach warning", "Compare caution"]),
        source: "v28.2.0 XAPK readable strings and metadata names",
        caution: "Live tournament rotations/values are not claimed."
    },
    {
        id: "mechanic:bot-bot",
        term: "Bot Bot",
        type: "Bot",
        family: "Bots",
        section: "Bots",
        sourceConfidence: "game-file-confirmed-description",
        summary: "v28 bot that affects other bot effects within its range, with related Bot+ upgrade context.",
        aliases: Object.freeze(["Bot Bot", "Bot+ Description Panel", "AllBotsUnlocked", "AllBotPlusUnlocked"]),
        uses: Object.freeze(["Systems glossary", "future Coach bot context"]),
        source: "v28.2.0 XAPK readable strings and metadata names",
        caution: "Effect wording only; no exact range/formula claim."
    },
    {
        id: "mechanic:bot-plus-abilities",
        term: "Bot+ Abilities",
        type: "Bot upgrade group",
        family: "Bots / Bot+",
        section: "Bots",
        sourceConfidence: "game-file-confirmed-description",
        summary: "Bot+ ability names include Wildfire, Titan Shock, Bonus Cells, Echoing Shot and Maximum Power.",
        aliases: Object.freeze(["Wildfire", "Titan Shock", "Bonus Cells", "Echoing Shot", "Maximum Power"]),
        uses: Object.freeze(["Systems glossary", "future Coach context", "cell/economy context"]),
        source: "v28.2.0 XAPK static audit",
        caution: "Names and high-level meanings only."
    },
    {
        id: "mechanic:synchronicity",
        term: "Synchronicity",
        type: "Bot pathing upgrade",
        family: "Bots / Pathing",
        section: "Bots",
        sourceConfidence: "game-file-confirmed-description",
        summary: "Bot pathing/synchronisation feature signalled by Synchronicity panel and v28.2.0 update strings.",
        aliases: Object.freeze(["Synchronicity", "Synchronicity Panel"]),
        uses: Object.freeze(["Systems glossary"]),
        source: "v28.2.0 XAPK static audit",
        caution: "Feature existence and wording only."
    },
    {
        id: "mechanic:assist-modules",
        term: "Assist Modules",
        type: "Module layer",
        family: "Modules / Assist Modules",
        section: "Modules",
        sourceConfidence: "game-file-confirmed-metadata-name",
        summary: "v28.2.0 metadata contains Assist Module panels, slots, efficiency and toggle signals. Useful as a future Systems module family.",
        aliases: Object.freeze(["Assist Modules", "Assist Module Info Panel", "AssistModulesUnlocked", "assistModuleSlots"]),
        uses: Object.freeze(["Systems glossary", "future module knowledge"]),
        source: "v28.2.0 IL2CPP metadata names",
        caution: "Metadata signals only until UI/report examples verify exact wording."
    },
    {
        id: "mechanic:golden-combo-records",
        term: "Golden Combo Records",
        type: "Battle Report record",
        family: "Records / Economy",
        section: "Battle Report",
        sourceConfidence: "game-file-confirmed-metadata-name",
        summary: "Largest Golden Combo and Most Coins From Golden Combo remain visible BattleHistoryEntry record fields.",
        aliases: Object.freeze(["LargestGoldenCombo", "MostCoinsFromGoldenCombo", "Largest Golden Combo", "Most Coins From Golden Combo"]),
        uses: Object.freeze(["Compare records", "History search", "economy context"]),
        source: "v28.2.0 BattleHistoryEntry metadata names",
        caution: "Record field knowledge only."
    }
]);

export function getV282MechanicsKnowledge() {
    return V28_2_MECHANICS_KNOWLEDGE;
}
