"use strict";

/**
 * GAME BRAIN KNOWLEDGE — APK EVIDENCE / SAFE ACCESS NOTES v4.11z52m
 */

export const APK_EVIDENCE_KNOWLEDGE = Object.freeze([
    {
        id: "evidence:battle-history-copy",
        term: "Battle History Copy Flow",
        type: "APK evidence",
        family: "Import / Clipboard",
        section: "Evidence",
        sourceConfidence: "game-file-confirmed-metadata-name",
        summary: "Metadata names include BattleHistoryEntryUI, BattleHistoryRoundStatsPanel and Button_CopyToClipboard, supporting TBI's user-copied Battle Report import path.",
        aliases: Object.freeze(["BattleHistoryEntryUI", "BattleHistoryRoundStatsPanel", "Button_CopyToClipboard", "CreateBattleHistoryEntry"]),
        uses: Object.freeze(["future companion overlay", "Command Deck import", "History import ordering"]),
        source: "v28.2.0 IL2CPP metadata names",
        caution: "Use user clipboard action, not silent interception."
    },
    {
        id: "evidence:save-cloud-architecture",
        term: "Save / Cloud Architecture",
        type: "APK evidence",
        family: "Safe boundaries",
        section: "Evidence",
        sourceConfidence: "game-file-confirmed-metadata-name",
        summary: "Metadata names show local/cloud save architecture around SaveLoad, LocalDataManager, SafePlayerPrefs, PlayCloudDataManager, Firestore and cloud-save methods.",
        aliases: Object.freeze(["SaveLoad", "LocalDataManager", "SafePlayerPrefs", "PlayCloudDataManager", "LoadSaveFromFirestore", "SaveToFirestore"]),
        uses: Object.freeze(["design caution", "companion app planning"]),
        source: "v28.2.0 IL2CPP metadata names",
        caution: "TBI should not try to read or intercept another app's private save/cloud data."
    },
    {
        id: "evidence:battle-date-sorting",
        term: "Battle Date Sorting",
        type: "TBI rule",
        family: "History / Ordering",
        section: "Evidence",
        sourceConfidence: "tbi-design-rule + game-file-confirmed-field",
        summary: "BattleDate is a confirmed BattleHistoryEntry field and should be the primary History/account ordering key. Import/export time is fallback only.",
        aliases: Object.freeze(["BattleDate", "Battle Date", "Imported At", "exportedAtUTC"]),
        uses: Object.freeze(["History ordering", "future companion app import queue"]),
        source: "BattleHistoryEntry metadata + TBI design decision",
        caution: "Use import time only when Battle Date is missing."
    }
]);

export function getApkEvidenceKnowledge() {
    return APK_EVIDENCE_KNOWLEDGE;
}
