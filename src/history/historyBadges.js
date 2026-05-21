"use strict";

/**
 * HISTORY BADGES
 * Pure badge helpers for Battle History Trace cards.
 */

import {
    sameHistoryRun
} from "../core/history.js";

import {
    buildRunQualityScore
} from "./historyStats.js";

export function buildHistoryBadges({
    run = null,
    index = 0,
    summary = {},
    runA = null,
    runB = null
} = {}) {

    const badges = [];

    if (!run) return badges;

    if (run?.meta?.archived) {
        badges.push(badge("Archived", "muted", "Run is archived"));
    }

    if (runA && sameHistoryRun(run, runA)) {
        badges.push(badge("Baseline A", "a", "Currently loaded as Run A"));
    }

    if (runB && sameHistoryRun(run, runB)) {
        badges.push(badge("Compare B", "b", "Currently loaded as Run B"));
    }

    if (summary?.latest?.index === index) {
        badges.push(badge("Latest", "info", "Most recently saved visible run"));
    }

    if (summary?.bestWave?.index === index) {
        badges.push(badge("Best Wave", "good", "Highest wave in this history set"));
    }

    if (summary?.bestCoins?.index === index) {
        badges.push(badge("Best Coins", "gold", "Highest coins in this history set"));
    }

    if (summary?.bestCells?.index === index) {
        badges.push(badge("Best Cells", "cyan", "Highest cells in this history set"));
    }

    if (summary?.bestCoinsPerHour?.index === index) {
        badges.push(badge("Best CPH", "gold", "Highest coins per hour in this history set"));
    }

    if (summary?.bestCellsPerHour?.index === index) {
        badges.push(badge("Best Cells/h", "cyan", "Highest cells per hour in this history set"));
    }

    const quality = buildRunQualityScore(run, summary);
    if (quality >= 90) {
        badges.push(badge("Elite Run", "good", "Run quality score is 90+"));
    } else if (quality >= 75) {
        badges.push(badge("Strong Run", "info", "Run quality score is 75+"));
    }

    getRunTags(run).slice(0, 3).forEach(tag => {
        badges.push(badge(`#${tag}`, "tag", "Saved history tag"));
    });

    return dedupeBadges(badges);
}

export function getRunTags(run = null) {
    const source = Array.isArray(run?.meta?.tags)
        ? run.meta.tags
        : typeof run?.meta?.tags === "string"
            ? run.meta.tags.split(/[#,\s]+/g)
            : [];

    const seen = new Set();

    return source
        .map(tag => String(tag || "").trim().replace(/^#+/, "").toLowerCase())
        .filter(Boolean)
        .filter(tag => {
            if (seen.has(tag)) return false;
            seen.add(tag);
            return true;
        });
}

function badge(label, tone = "neutral", title = "") {
    return Object.freeze({ label, tone, title });
}

function dedupeBadges(badges = []) {
    const seen = new Set();

    return badges.filter(item => {
        const key = `${item.tone}:${item.label}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export default {
    buildHistoryBadges,
    getRunTags
};
