"use strict";

/**
 * HISTORY BADGES
 * Pure badge helpers for Battle History Trace cards.
 */

import {
    sameHistoryRun
} from "../core/history.js";

/* --------------------------------------------------
   BUILD BADGES
-------------------------------------------------- */

export function buildHistoryBadges({
    run = null,
    index = 0,
    summary = {},
    runA = null,
    runB = null
} = {}) {

    const badges = [];

    if (run?.meta?.archived) {
        badges.push({
            label: "Archived",
            tone: "muted"
        });
    }

    if (run && runA && sameHistoryRun(run, runA)) {
        badges.push({
            label: "Baseline A",
            tone: "a"
        });
    }

    if (run && runB && sameHistoryRun(run, runB)) {
        badges.push({
            label: "Compare B",
            tone: "b"
        });
    }

    if (summary?.latest?.index === index) {
        badges.push({
            label: "Latest",
            tone: "info"
        });
    }

    if (summary?.bestWave?.index === index) {
        badges.push({
            label: "Best Wave",
            tone: "good"
        });
    }

    if (summary?.bestCoins?.index === index) {
        badges.push({
            label: "Best Coins",
            tone: "gold"
        });
    }

    if (summary?.bestCells?.index === index) {
        badges.push({
            label: "Best Cells",
            tone: "cyan"
        });
    }

    const tags =
        Array.isArray(run?.meta?.tags)
            ? run.meta.tags
            : [];

    tags.slice(0, 3).forEach(tag => {
        badges.push({
            label: `#${tag}`,
            tone: "tag"
        });
    });

    return badges;
}