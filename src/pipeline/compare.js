"use strict";

/**
 * COMPARE ENGINE v4.10d
 * Stable B - A diff with game-brain priority, roles and summaries.
 */

import {
    parseNumber,
    safeDiv,
    clamp
} from "../utils/math.js";

import {
    formatLabel
} from "../utils/format.js";

import {
    getMetricInfo,
    normaliseMetricKey
} from "../game/metricCatalog.js";

import {
    getMetricCompareRole,
    getMetricPriorityInfo,
    getMetricPriorityScore
} from "../game/metricPriorityRules.js";

const CORE_KEYS = Object.freeze(["wave", "tier", "coins", "cells", "time"]);
const STAT_KEYS = Object.freeze(["coinsPerHour", "cellsPerHour", "coinsPerWave", "cellsPerWave", "efficiency"]);
const META_KEYS = new Set(["archive", "archived", "battleDate", "battle_date", "buildStyle", "build_style", "id", "meta", "raw", "tags"]);

export function compare(A = null, B = null) {
    const baseline = A || {};
    const current = B || {};

    const core = diffCore(baseline.core || {}, current.core || {});
    const stats = diffStats(baseline.stats || {}, current.stats || {});
    const sections = diffSections(baseline.sections || {}, current.sections || {});
    const summary = buildSummary({ A: baseline, B: current, core, stats, sections });

    return {
        core,
        stats,
        sections,
        summary,
        meta: {
            compareVersion: "compare-engine-v4.10d",
            direction: "B - A",
            baselineReportId: baseline.meta?.reportId || baseline.meta?.id || "",
            compareReportId: current.meta?.reportId || current.meta?.id || ""
        }
    };
}

function diffCore(a = {}, b = {}) {
    const out = {};
    for (const key of CORE_KEYS) {
        if (key === "tier") {
            out[key] = diffValue(key, a[key], b[key], { section: "core", role: "neutral_signal" });
        } else {
            out[key] = diffValue(key, a[key], b[key], { section: "core" });
        }
    }

    out.killedBy = {
        a: a.killedBy || a.killed_by || "",
        b: b.killedBy || b.killed_by || "",
        diff: 0,
        pct: 0,
        changed: (a.killedBy || a.killed_by || "") !== (b.killedBy || b.killed_by || ""),
        role: "neutral_signal",
        outcome: "neutral",
        key: "killed_by",
        section: "core",
        label: "Killed By",
        priority: 3,
        importance: 3
    };

    out.battleDate = {
        a: a.battleDate || a.battle_date || "",
        b: b.battleDate || b.battle_date || "",
        diff: 0,
        pct: 0,
        changed: (a.battleDate || a.battle_date || "") !== (b.battleDate || b.battle_date || ""),
        role: "neutral_signal",
        outcome: "neutral",
        key: "battle_date",
        section: "core",
        label: "Battle Date",
        priority: 0,
        importance: 0
    };

    return out;
}

function diffStats(a = {}, b = {}) {
    return STAT_KEYS.reduce((out, key) => {
        out[key] = diffValue(key, a[key], b[key], { section: "stats" });
        return out;
    }, {});
}

function diffSections(aSections = {}, bSections = {}) {
    const names = new Set([
        ...Object.keys(aSections || {}),
        ...Object.keys(bSections || {})
    ]);

    const out = {};
    for (const section of names) {
        if (section === "core") continue;
        out[section] = diffObject(aSections[section] || {}, bSections[section] || {}, { section });
    }
    return out;
}

function diffObject(a = {}, b = {}, { section = "" } = {}) {
    const keys = new Set([
        ...Object.keys(a || {}),
        ...Object.keys(b || {})
    ]);

    const out = {};
    for (const key of keys) {
        if (META_KEYS.has(key)) continue;
        out[key] = diffValue(key, a?.[key], b?.[key], { section });
    }
    return out;
}

function diffValue(key, aValue, bValue, { section = "", role = null } = {}) {
    const aNum = parseNumber(aValue);
    const bNum = parseNumber(bValue);
    const diff = bNum - aNum;
    const pct = percentChange(aNum, bNum);
    const metric = getMetricInfo(key, section);
    const priorityInfo = getMetricPriorityInfo(key, section);
    const compareRole = role || getMetricCompareRole(key, section);
    const outcome = outcomeForDiff(diff, compareRole);

    return {
        key: normaliseMetricKey(key),
        section,
        label: metric.label || formatLabel(key),
        meaning: metric.meaning || priorityInfo.meaning || "",
        category: metric.category || priorityInfo.category || categoryForSection(section),
        a: aNum,
        b: bNum,
        rawA: aValue,
        rawB: bValue,
        diff,
        pct,
        changed: Math.abs(diff) > 0,
        role: compareRole,
        compareRole,
        outcome,
        priority: priorityInfo.importance || getMetricPriorityScore(key, section),
        priorityLevel: priorityInfo.level || "normal",
        score: Math.abs(scoreMagnitude(diff, pct)) * (priorityInfo.importance || 1),
        note: buildMetricNote({ key, section, metric, outcome, diff, pct, role: compareRole })
    };
}

function buildSummary({ A = {}, B = {}, core = {}, stats = {}, sections = {} } = {}) {
    const items = flatten(core, stats, sections);
    const scored = items
        .filter(item => item.role !== "neutral_signal" && item.changed)
        .map(item => ({ ...item, score: item.score || Math.abs(scoreMagnitude(item.diff, item.pct)) * (item.priority || 1) }))
        .sort((left, right) => right.score - left.score);

    const topGains = scored.filter(item => item.outcome === "good").slice(0, 8);
    const topLosses = scored.filter(item => item.outcome === "bad").slice(0, 8);
    const categoryScores = buildCategoryScores(items);
    const sectionSummaries = buildSectionSummaries(items);
    const farmingVerdict = buildFarmingVerdict({ core, stats, categoryScores });

    return {
        summaryVersion: "compare-summary-v4.10d",
        direction: "B - A",
        topGains,
        topLosses,
        biggestSwing: scored[0] || null,
        farmingVerdict,
        farming: farmingVerdict,
        categoryScores,
        sectionSummaries,
        totals: {
            changed: items.filter(item => item.changed).length,
            gains: topGains.length,
            losses: topLosses.length,
            neutralSignals: items.filter(item => item.role === "neutral_signal" && item.changed).length
        },
        runLabels: {
            a: A.core?.battleDate || A.meta?.reportId || "Run A",
            b: B.core?.battleDate || B.meta?.reportId || "Run B"
        }
    };
}

function flatten(core = {}, stats = {}, sections = {}) {
    const out = [];

    for (const [key, item] of Object.entries(core || {})) {
        if (isDiffItem(item)) out.push({ ...item, path: `core.${key}` });
    }

    for (const [key, item] of Object.entries(stats || {})) {
        if (isDiffItem(item)) out.push({ ...item, path: `stats.${key}` });
    }

    for (const [section, rows] of Object.entries(sections || {})) {
        for (const [key, item] of Object.entries(rows || {})) {
            if (isDiffItem(item)) out.push({ ...item, path: `${section}.${key}` });
        }
    }

    return out;
}

function buildCategoryScores(items = []) {
    const categories = {
        damage: scoreBucket(),
        economy: scoreBucket(),
        survivability: scoreBucket(),
        utility: scoreBucket(),
        progression: scoreBucket(),
        rewards: scoreBucket(),
        other: scoreBucket()
    };

    for (const item of items) {
        const cat = categoryForItem(item);
        const bucket = categories[cat] || categories.other;
        const weight = item.priority || 1;
        const magnitude = Math.max(1, Math.min(5, Math.abs(scoreMagnitude(item.diff, item.pct))));
        const score = weight * magnitude;

        if (item.outcome === "good") bucket.good += score;
        else if (item.outcome === "bad") bucket.bad += score;
        else bucket.neutral += score;
        bucket.count += 1;
        bucket.net = bucket.good - bucket.bad;
    }

    return Object.fromEntries(Object.entries(categories).map(([key, value]) => [key, {
        ...value,
        score: value.net,
        verdict: value.net > 2 ? "good" : value.net < -2 ? "bad" : "neutral"
    }]));
}

function buildSectionSummaries(items = []) {
    const map = new Map();

    for (const item of items) {
        const key = item.section || "other";
        const entry = map.get(key) || { section: key, label: formatLabel(key), changed: 0, gains: 0, losses: 0, neutral: 0, net: 0, top: [] };
        if (item.changed) entry.changed += 1;
        if (item.outcome === "good") entry.gains += 1;
        else if (item.outcome === "bad") entry.losses += 1;
        else entry.neutral += 1;
        entry.net += item.outcome === "good" ? 1 : item.outcome === "bad" ? -1 : 0;
        if (item.changed) entry.top.push(item);
        map.set(key, entry);
    }

    return [...map.values()].map(entry => ({
        ...entry,
        top: entry.top.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5),
        verdict: entry.net > 0 ? "improved" : entry.net < 0 ? "weaker" : "mixed"
    }));
}

function buildFarmingVerdict({ core = {}, stats = {}, categoryScores = {} } = {}) {
    const coinsRate = stats.coinsPerHour?.diff || 0;
    const cellsRate = stats.cellsPerHour?.diff || 0;
    const wave = core.wave?.diff || 0;
    const economy = categoryScores.economy?.net || 0;
    const survivability = categoryScores.survivability?.net || 0;

    const farmScore = scoreSign(coinsRate) * 3 + scoreSign(cellsRate) * 2 + scoreSign(economy) + scoreSign(wave) + scoreSign(survivability);

    let verdict = "mixed_farm";
    let title = "Mixed Farm";
    let note = "The comparison is split. Check whether economy gains are worth the wave/survival trade-off.";

    if (farmScore >= 3) {
        verdict = "better_farm";
        title = "Better Farm";
        note = "Run B looks stronger for farming based on rate, economy and progression signals.";
    } else if (farmScore <= -3) {
        verdict = "worse_farm";
        title = "Worse Farm";
        note = "Run B looks weaker for farming. Check survival pressure, economy sources and run length.";
    }

    return { verdict, title, note, score: farmScore };
}

function scoreBucket() {
    return { good: 0, bad: 0, neutral: 0, net: 0, count: 0 };
}

function isDiffItem(item) {
    return item && typeof item === "object" && Object.prototype.hasOwnProperty.call(item, "diff");
}

function percentChange(a, b) {
    const left = parseNumber(a);
    const right = parseNumber(b);
    if (!left) return right ? 100 : 0;
    return ((right - left) / Math.abs(left)) * 100;
}

function outcomeForDiff(diff = 0, role = "higher_is_better") {
    if (Math.abs(diff) < 1e-12) return "neutral";
    if (role === "neutral_signal") return "neutral";
    if (role === "lower_is_better") return diff < 0 ? "good" : "bad";
    return diff > 0 ? "good" : "bad";
}

function scoreMagnitude(diff = 0, pct = 0) {
    const pctPart = Number.isFinite(Number(pct)) ? Math.min(5, Math.abs(Number(pct)) / 20) : 0;
    const diffPart = Math.min(5, Math.log10(Math.abs(Number(diff) || 0) + 10) / 4);
    return Math.max(pctPart, diffPart);
}

function scoreSign(value = 0) {
    const num = Number(value || 0);
    if (num > 0) return 1;
    if (num < 0) return -1;
    return 0;
}

function categoryForItem(item = {}) {
    const section = String(item.section || "");
    const key = String(item.key || "");
    const category = String(item.category || "");

    if (/coin|cash|farming|economy/.test(section) || /coin|cash|golden|wave_skip/.test(key) || /economy|farming|cash/.test(category)) return "economy";
    if (/damage|hit|destroyed|kill/.test(section) || /damage|projectile|orb|thorn|missile|death_wave|black_hole/.test(key) || /damage/.test(category)) return "damage";
    if (/health|blocked|taken|survival|defense|enemy_pressure|elite/.test(section) || /wall|tower|regen|defense|recovery|ray|scatter|vampire/.test(key) || /surviv|defense|enemy|elite/.test(category)) return "survivability";
    if (/utility|count/.test(section) || /upgrade|skipped|package|stun|defy|nuke|second_wind|demon/.test(key) || /utility|counts/.test(category)) return "utility";
    if (/currenc|module|reward|shard|gem|cell/.test(section) || /cell|gem|shard|module|medal/.test(key) || /reward|module|currency|cells/.test(category)) return "rewards";
    if (/wave|tier/.test(key)) return "progression";
    return "other";
}

function categoryForSection(section = "") {
    return categoryForItem({ section });
}

function buildMetricNote({ metric, outcome, diff, pct, role }) {
    const direction = outcome === "good" ? "improved" : outcome === "bad" ? "weakened" : "changed";
    const roleText = role === "lower_is_better" ? "lower is better" : role === "neutral_signal" ? "context signal" : "higher is better";
    const meaning = metric?.meaning ? `${metric.meaning} ` : "";
    return `${meaning}${formatLabel(metric?.label || "metric")} ${direction}; ${roleText}.`;
}

export default compare;
