"use strict";

/**
 * AI COACH v4.10d
 * Game-aware advice layer using build profiles, death cause and compare summary.
 */

import {
    interpretDeathCause,
    getFarmingTierAdvice,
    getBuildStyleInfo,
    interpretMetricDelta
} from "../game/interpretationRules.js";

import {
    getBuildPriorityList,
    getBuildWarningList
} from "../game/buildStyleProfiles.js";

import {
    formatDelta,
    formatNumber
} from "../utils/format.js";

export function aiCoach(currentRun = null, previousRun = null, compareData = null, insights = [], trend = {}, options = {}) {
    const buildStyle = options.buildStyle || trend?.buildStyle || currentRun?.meta?.buildStyle || "unknown";
    const build = getBuildStyleInfo(buildStyle);
    const history = options.history || trend?.history || [];

    const cards = [
        overviewCard(currentRun, previousRun, compareData, build),
        deathCauseCard(currentRun, buildStyle),
        farmingCard(compareData),
        buildStyleCard(buildStyle),
        priorityCard(compareData, buildStyle),
        warningsCard(currentRun, compareData, buildStyle),
        historyCard(history, trend),
        ...insightReactionCards(insights)
    ];

    return cards.filter(Boolean).slice(0, 14);
}

function overviewCard(currentRun, previousRun, compareData, build) {
    if (!currentRun && !previousRun) {
        return card("info", "Waiting For Reports", "Paste and save at least one Battle Report to start analysis.", `Build style: ${build.label}`);
    }
    if (currentRun && !previousRun) {
        return card("info", "One Run Loaded", "Load a second report into A/B comparison for full coaching.", describeRun(currentRun));
    }

    const wave = compareData?.core?.wave?.diff || 0;
    const coins = compareData?.stats?.coinsPerHour?.diff || compareData?.core?.coins?.diff || 0;
    const cells = compareData?.stats?.cellsPerHour?.diff || compareData?.core?.cells?.diff || 0;
    const severity = wave >= 0 && (coins >= 0 || cells >= 0) ? "good" : wave < 0 && coins < 0 && cells < 0 ? "bad" : "neutral";

    return card(severity, "A/B Run Read", `Wave ${formatDelta(wave, { compact: true })}, coin rate ${formatDelta(coins, { compact: true })}, cell rate ${formatDelta(cells, { compact: true })}.`, `Judged as ${build.label}.`);
}

function deathCauseCard(run, buildStyle) {
    const killedBy = run?.core?.killedBy || run?.core?.killed_by || "";
    const result = interpretDeathCause(killedBy, buildStyle);
    return card(result.severity || "neutral", result.title || "Death Cause", result.message || "No death cause found.", "Death cause intelligence");
}

function farmingCard(compareData) {
    const farming = compareData?.summary?.farming || compareData?.summary?.farmingVerdict;
    if (!farming) return card("info", "Farming Verdict Waiting", "Load two comparable reports to judge farming direction.", "Economy + cells + wave read");
    return card(farming.verdict === "better_farm" ? "good" : farming.verdict === "worse_farm" ? "bad" : "neutral", farming.title || "Farming Verdict", farming.note || "Check farm/progression trade-off.", `Score: ${farming.score ?? 0}`);
}

function buildStyleCard(buildStyle) {
    const build = getBuildStyleInfo(buildStyle);
    const priorities = getBuildPriorityList(buildStyle).slice(0, 5).join(", ") || "wave, coins/hour, cells/hour";
    return card("info", `${build.label} Lens`, build.meaning || "Build style selected.", `Priority metrics: ${priorities}`);
}

function priorityCard(compareData, buildStyle) {
    const priorities = new Set(getBuildPriorityList(buildStyle));
    const items = [
        ...(compareData?.summary?.topGains || []),
        ...(compareData?.summary?.topLosses || [])
    ].filter(item => priorities.has(item.key)).slice(0, 4);

    if (!items.length) {
        return null;
    }

    const first = items[0];
    const advice = interpretMetricDelta(first.key, first.diff, first.pct, buildStyle);
    return card(advice.severity || first.outcome || "neutral", `Build Priority: ${first.label}`, advice.message || `${first.label} changed by ${formatDelta(first.diff, { compact: true })}.`, advice.meta || "Priority metric");
}

function warningsCard(currentRun, compareData, buildStyle) {
    const warnings = getBuildWarningList(buildStyle);
    const killedBy = String(currentRun?.core?.killedBy || "").toLowerCase();
    const matched = warnings.filter(item => killedBy && killedBy.includes(String(item).replace(/_/g, " ")));

    if (matched.length) {
        return card("bad", "Build Warning Matched", `Death cause matches this build's warning list: ${matched.join(", ")}.`, "Check survival/control pressure.");
    }

    const losses = (compareData?.summary?.topLosses || []).slice(0, 2);
    if (losses.length) {
        return card("neutral", "Watch These Losses", losses.map(item => `${item.label} ${formatDelta(item.diff, { compact: true })}`).join("; "), "Top loss watchlist");
    }

    return null;
}

function historyCard(history = [], trend = {}) {
    const advice = getFarmingTierAdvice(history);
    if (advice) {
        return card(advice.severity || "info", advice.title || "History Advice", advice.message || "History trend available.", advice.meta || "History-aware advice");
    }

    const count = Array.isArray(history) ? history.length : Number(trend?.count || 0);
    return card("info", "History Context", `${count} saved run(s) available for trend context.`, "More saved reports improve advice.");
}

function insightReactionCards(insights = []) {
    return (Array.isArray(insights) ? insights : []).slice(0, 4).map(item => card(item.severity || item.level || "neutral", item.title || "Insight", item.message || item.description || "Review this insight.", item.meta || "From insight engine"));
}

function describeRun(run = {}) {
    const core = run.core || {};
    return `Tier ${core.tier || "-"}, wave ${formatNumber(core.wave || 0)}, killed by ${core.killedBy || "unknown"}`;
}

function card(severity, title, message, meta = "") {
    return {
        type: "coach",
        severity,
        level: severity,
        title,
        message,
        meta
    };
}

export const buildAICoach = aiCoach;
export const coach = aiCoach;
export default aiCoach;
