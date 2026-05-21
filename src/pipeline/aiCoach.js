"use strict";

/**
 * AI COACH
 * Game-aware advice layer for Tower Battle Intel.
 *
 * Uses:
 * - metric meanings
 * - death cause intelligence
 * - build-style context
 * - farming tier advice from user history when available
 */

import {
    explainMetric,
    interpretMetricDelta,
    interpretDeathCause,
    getFarmingTierAdvice,
    getBuildStyleInfo
} from "../game/interpretationRules.js";

import {
    getMetricInfo,
    normaliseMetricKey
} from "../game/metricCatalog.js";

import {
    formatNumber,
    formatPercent
} from "../utils/format.js";

/* --------------------------------------------------
   MAIN AI COACH
-------------------------------------------------- */

export function aiCoach(
    currentRun = null,
    previousRun = null,
    compareData = {},
    insights = [],
    trend = {},
    options = {}
) {

    const buildStyle =
        options.buildStyle ||
        trend?.buildStyle ||
        "unknown";

    const history =
        options.history ||
        trend?.history ||
        [];

    const cards = [];

    cards.push(
        buildOverviewCard({
            currentRun,
            previousRun,
            compareData,
            buildStyle
        })
    );

    cards.push(
        buildDeathCauseCard({
            currentRun,
            buildStyle
        })
    );

    cards.push(
        buildEconomyCard({
            compareData,
            currentRun,
            previousRun,
            buildStyle
        })
    );

    cards.push(
        buildCellsCard({
            compareData,
            currentRun,
            previousRun,
            buildStyle
        })
    );

    cards.push(
        buildProgressionCard({
            compareData,
            currentRun,
            previousRun,
            buildStyle
        })
    );

    cards.push(
        buildUtilityCard({
            compareData,
            buildStyle
        })
    );

    cards.push(
        buildFarmingAdviceCard({
            history,
            trend
        })
    );

    cards.push(
        buildBuildStyleCard({
            buildStyle
        })
    );

    const extraCards =
        buildInsightReactionCards(insights);

    return [
        ...cards,
        ...extraCards
    ].filter(Boolean);
}

/* --------------------------------------------------
   OVERVIEW
-------------------------------------------------- */

function buildOverviewCard({
    currentRun,
    previousRun,
    compareData,
    buildStyle
}) {

    const build =
        getBuildStyleInfo(buildStyle);

    if (!currentRun && !previousRun) {

        return card({
            severity: "neutral",
            title: "Waiting For Reports",
            message: "Paste a battle report into Save A, then another into Save B to unlock coaching.",
            meta: `Build style: ${build.label}`
        });
    }

    if (currentRun && !previousRun) {

        return card({
            severity: "info",
            title: "Run Loaded",
            message: "Save A is loaded. Add a second report to Save B for comparison intelligence.",
            meta: describeRun(currentRun)
        });
    }

    const waveDiff =
        getDiff(compareData, "core", "wave");

    const coinsDiff =
        getDiff(compareData, "core", "coins");

    const cellsDiff =
        getDiff(compareData, "core", "cells");

    const severity =
        scoreSeverity([
            waveDiff,
            coinsDiff,
            cellsDiff
        ]);

    return card({
        severity,
        title: "Run Comparison Summary",
        message:
            `Wave changed by ${formatSignedNumber(waveDiff, 0)}, ` +
            `coins changed by ${formatSignedTower(coinsDiff)}, ` +
            `and cells changed by ${formatSignedTower(cellsDiff)}.`,
        meta: `Judged cautiously using build style: ${build.label}`
    });
}

/* --------------------------------------------------
   DEATH CAUSE
-------------------------------------------------- */

function buildDeathCauseCard({
    currentRun,
    buildStyle
}) {

    const killedBy =
        currentRun?.core?.killedBy ||
        currentRun?.core?.killed_by ||
        "";

    const result =
        interpretDeathCause(
            killedBy,
            buildStyle
        );

    return card({
        severity: result.severity,
        title: result.title,
        message: result.message,
        meta: "Death cause intelligence"
    });
}

/* --------------------------------------------------
   ECONOMY
-------------------------------------------------- */

function buildEconomyCard({
    compareData,
    currentRun,
    previousRun,
    buildStyle
}) {

    const coinsDiff =
        getDiff(compareData, "core", "coins");

    const coinsPerHourDiff =
        getFirstDiff(
            compareData,
            "stats",
            [
                "coinsPerHour",
                "coins_per_hour",
                "coinsPerHr",
                "coins_per_hr"
            ]
        );

    const coinInfo =
        explainMetric("coins_earned");

    const cphInfo =
        explainMetric("coins_per_hour");

    let severity =
        coinsPerHourDiff > 0 || coinsDiff > 0
            ? "good"
            : coinsPerHourDiff < 0 || coinsDiff < 0
            ? "bad"
            : "neutral";

    let message =
        `${coinInfo.label} measures ${coinInfo.meaning.toLowerCase()} ` +
        `${cphInfo.label} is more important for farming speed because it measures ${cphInfo.meaning.toLowerCase()}`;

    if (coinsPerHourDiff !== 0) {
        message += ` Coins/hour changed by ${formatSignedTower(coinsPerHourDiff)}.`;
    } else if (coinsDiff !== 0) {
        message += ` Total coins changed by ${formatSignedTower(coinsDiff)}.`;
    }

    const currentCPH =
        currentRun?.stats?.coinsPerHour ||
        currentRun?.stats?.coins_per_hour ||
        0;

    const previousCPH =
        previousRun?.stats?.coinsPerHour ||
        previousRun?.stats?.coins_per_hour ||
        0;

    return card({
        severity,
        title: "Economy Read",
        message,
        meta:
            `Previous CPH: ${formatNumber(previousCPH)} | ` +
            `Current CPH: ${formatNumber(currentCPH)}`
    });
}

/* --------------------------------------------------
   CELLS
-------------------------------------------------- */

function buildCellsCard({
    compareData,
    currentRun,
    previousRun,
    buildStyle
}) {

    const cellsDiff =
        getDiff(compareData, "core", "cells");

    const cellsPerHourDiff =
        getFirstDiff(
            compareData,
            "stats",
            [
                "cellsPerHour",
                "cells_per_hour",
                "cellsPerHr",
                "cells_per_hr"
            ]
        );

    const cellInfo =
        explainMetric("cells_per_hour");

    const severity =
        cellsPerHourDiff > 0 || cellsDiff > 0
            ? "good"
            : cellsPerHourDiff < 0 || cellsDiff < 0
            ? "bad"
            : "neutral";

    let message =
        `${cellInfo.label} measures ${cellInfo.meaning.toLowerCase()} `;

    if (cellsPerHourDiff !== 0) {
        message += `Cells/hour changed by ${formatSignedTower(cellsPerHourDiff)}.`;
    } else if (cellsDiff !== 0) {
        message += `Total cells changed by ${formatSignedTower(cellsDiff)}.`;
    } else {
        message += "Cell output stayed mostly flat.";
    }

    const currentCellsPH =
        currentRun?.stats?.cellsPerHour ||
        currentRun?.stats?.cells_per_hour ||
        0;

    const previousCellsPH =
        previousRun?.stats?.cellsPerHour ||
        previousRun?.stats?.cells_per_hour ||
        0;

    return card({
        severity,
        title: "Cell Farming Read",
        message,
        meta:
            `Previous cells/hour: ${formatNumber(previousCellsPH)} | ` +
            `Current cells/hour: ${formatNumber(currentCellsPH)}`
    });
}

/* --------------------------------------------------
   PROGRESSION
-------------------------------------------------- */

function buildProgressionCard({
    compareData,
    currentRun,
    previousRun,
    buildStyle
}) {

    const waveDiff =
        getDiff(compareData, "core", "wave");

    const tierDiff =
        getDiff(compareData, "core", "tier");

    const waveResult =
        interpretMetricDelta(
            "wave",
            waveDiff,
            getPct(compareData, "core", "wave"),
            buildStyle
        );

    let message =
        waveResult.message;

    if (tierDiff !== 0) {
        message += ` Tier also changed by ${formatSignedNumber(tierDiff, 0)}, so compare carefully.`;
    }

    const severity =
        waveDiff > 0
            ? "good"
            : waveDiff < 0
            ? "bad"
            : "neutral";

    return card({
        severity,
        title: "Progression Read",
        message,
        meta:
            `Previous wave: ${previousRun?.core?.wave || "-"} | ` +
            `Current wave: ${currentRun?.core?.wave || "-"}`
    });
}

/* --------------------------------------------------
   UTILITY
-------------------------------------------------- */

function buildUtilityCard({
    compareData,
    buildStyle
}) {

    const sections =
        compareData?.sections || {};

    const utility =
        sections.utility || {};

    const counts =
        sections.counts || {};

    const eals =
        getMetricDiffFromObject(
            utility,
            "enemy_attack_levels_skipped"
        );

    const ehls =
        getMetricDiffFromObject(
            utility,
            "enemy_health_levels_skipped"
        );

    const waveSkips =
        getMetricDiffFromObject(
            counts,
            "waves_skipped"
        );

    const parts = [];

    if (eals !== 0) {
        const info =
            getMetricInfo("enemy_attack_levels_skipped");

        parts.push(
            `${info.label}: ${formatSignedNumber(eals, 0)}`
        );
    }

    if (ehls !== 0) {
        const info =
            getMetricInfo("enemy_health_levels_skipped");

        parts.push(
            `${info.label}: ${formatSignedNumber(ehls, 0)}`
        );
    }

    if (waveSkips !== 0) {
        const info =
            getMetricInfo("waves_skipped");

        parts.push(
            `${info.label}: ${formatSignedNumber(waveSkips, 0)}`
        );
    }

    if (!parts.length) {

        return card({
            severity: "neutral",
            title: "Utility Read",
            message: "Utility metrics did not show a major registered movement.",
            meta: "Watching EALS, EHLS, and Waves Skipped"
        });
    }

    const severity =
        eals + ehls + waveSkips > 0
            ? "good"
            : eals + ehls + waveSkips < 0
            ? "bad"
            : "neutral";

    return card({
        severity,
        title: "Utility Read",
        message: parts.join(" | "),
        meta: "EALS / EHLS / wave skip contribution"
    });
}

/* --------------------------------------------------
   FARMING TIER ADVICE
-------------------------------------------------- */

function buildFarmingAdviceCard({
    history,
    trend
}) {

    const advice =
        getFarmingTierAdvice(history);

    if (!advice.ready) {

        return card({
            severity: "info",
            title: "Farming Tier Advice",
            message:
                "Not enough saved history yet. Save multiple runs across different tiers to unlock personal farming advice.",
            meta: "Uses your own report history, not generic advice"
        });
    }

    return card({
        severity: "good",
        title: "Farming Tier Advice",
        message: advice.message,
        meta: advice.warning || "Based on your own saved history"
    });
}

/* --------------------------------------------------
   BUILD STYLE CARD
-------------------------------------------------- */

function buildBuildStyleCard({
    buildStyle
}) {

    const build =
        getBuildStyleInfo(buildStyle);

    return card({
        severity:
            buildStyle === "unknown"
                ? "neutral"
                : "info",
        title: "Build-Aware Analysis",
        message:
            buildStyle === "unknown"
                ? "No build style selected yet. Advice is cautious because Health / EHP, Blender, Devo, Glass Cannon, and Hybrid builds should be judged differently."
                : build.meaning,
        meta: `Current build style: ${build.label}`
    });
}

/* --------------------------------------------------
   INSIGHT REACTION CARDS
-------------------------------------------------- */

function buildInsightReactionCards(insights = []) {

    if (!Array.isArray(insights) || !insights.length) {
        return [];
    }

    return insights
        .slice(0, 3)
        .map(item => {

            if (typeof item === "string") {

                return card({
                    severity: "info",
                    title: "Insight Follow-Up",
                    message: item,
                    meta: "From insight engine"
                });
            }

            return card({
                severity:
                    item.severity ||
                    item.type ||
                    "info",

                title:
                    item.title ||
                    "Insight Follow-Up",

                message:
                    item.message ||
                    item.description ||
                    "Insight detected.",

                meta:
                    item.meta ||
                    "From insight engine"
            });
        });
}

/* --------------------------------------------------
   CARD FACTORY
-------------------------------------------------- */

function card({
    severity = "neutral",
    title = "AI Coach",
    message = "",
    meta = ""
} = {}) {

    return {
        type: "coach",
        severity,
        title,
        message,
        meta
    };
}

/* --------------------------------------------------
   DATA HELPERS
-------------------------------------------------- */

function getDiff(
    compareData = {},
    group = "",
    key = ""
) {

    return Number(
        compareData?.[group]?.[key]?.diff || 0
    );
}

function getPct(
    compareData = {},
    group = "",
    key = ""
) {

    return Number(
        compareData?.[group]?.[key]?.pct || 0
    );
}

function getFirstDiff(
    compareData = {},
    group = "",
    keys = []
) {

    for (const key of keys) {

        const value =
            compareData?.[group]?.[key]?.diff;

        if (Number.isFinite(Number(value))) {
            return Number(value);
        }
    }

    return 0;
}

function getMetricDiffFromObject(
    source = {},
    wantedKey = ""
) {

    const wanted =
        normaliseMetricKey(wantedKey);

    for (const [key, value] of Object.entries(source || {})) {

        if (normaliseMetricKey(key) === wanted) {
            return Number(value?.diff || 0);
        }
    }

    return 0;
}

function scoreSeverity(values = []) {

    const total =
        values.reduce(
            (sum, value) =>
                sum + Number(value || 0),
            0
        );

    if (total > 0) {
        return "good";
    }

    if (total < 0) {
        return "bad";
    }

    return "neutral";
}

function describeRun(run = null) {

    if (!run) {
        return "";
    }

    return [
        `Tier ${run?.core?.tier || "-"}`,
        `Wave ${run?.core?.wave || "-"}`,
        `Coins ${formatNumber(run?.core?.coins || 0)}`,
        `Cells ${formatNumber(run?.core?.cells || 0)}`
    ].join(" | ");
}

function formatSignedTower(value, precision = 2) {

    const num =
        Number(value || 0);

    if (!Number.isFinite(num)) {
        return "0";
    }

    const formatted =
        formatNumber(num, precision);

    if (num > 0) {
        return `+${formatted}`;
    }

    return formatted;
}

function formatSignedNumber(value, precision = 0) {

    const num =
        Number(value || 0);

    if (!Number.isFinite(num)) {
        return "0";
    }

    const output =
        num.toFixed(precision);

    if (num > 0) {
        return `+${output}`;
    }

    return output;
}

/* --------------------------------------------------
   OLD COMPATIBILITY ALIASES
-------------------------------------------------- */

export const buildAICoach = aiCoach;
export const coach = aiCoach;
