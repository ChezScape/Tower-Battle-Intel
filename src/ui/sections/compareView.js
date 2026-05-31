"use strict";

/**
 * COMPARE AB DIFFERENCE OVERFLOW POLISH v4.11z52w59
 *
 * Clean rebuild foundation:
 * - no loaded runs: Saved Runs / Library Intel
 * - one loaded run: Single Report Intel
 * - two loaded runs: A/B Compare
 */

import {
    escapeHTML,
    escapeAttr,
    formatNumber,
    formatTime
} from "./sectionUtils.js";

import {
    buildHistorySummary,
    buildRawArchiveSummary,
    formatTierWave,
    formatWaveNumber,
    sameRun,
    formatRunTypeLabel
} from "./history/historyShared.js";

import {
    buildHistoryRunGameBrainSummary,
    buildHistoryGameBrainInsights
} from "../../history/historyGameBrain.js";

export const COMPARE_ANALYSE_FOUNDATION_VERSION = "v4.11z52w59";

const CORE_METRICS = Object.freeze([
    { key: "wave", label: "Wave", picker: run => run?.core?.wave, tone: "progress" },
    { key: "coins", label: "Coins", picker: run => run?.core?.coins, tone: "coins" },
    { key: "cells", label: "Cells", picker: run => run?.core?.cells, tone: "cells" },
    { key: "coinsPerHour", label: "Coins/h", picker: run => getCoinsPerHour(run), tone: "coins" },
    { key: "cellsPerHour", label: "Cells/h", picker: run => getCellsPerHour(run), tone: "cells" }
]);

export function buildCompareView(state = {}, options = {}) {
    const model = buildCompareAnalyseModel(state);

    return `
        <div class="tbi-compare-analyse" data-compare-analyse="true" data-compare-version="${escapeAttr(COMPARE_ANALYSE_FOUNDATION_VERSION)}">
            ${buildCompareHero(model)}
            ${buildCompareModeView(model)}
        </div>
    `;
}

export function buildCompareAnalyseModel(state = {}) {
    const history = Array.isArray(state.history) ? state.history.filter(Boolean) : [];
    const activeHistory = history.filter(run => !run?.meta?.archived);
    const runA = state.runA || null;
    const runB = state.runB || null;
    const loaded = [runA ? { slot: "A", run: runA } : null, runB ? { slot: "B", run: runB } : null].filter(Boolean);
    const mode = runA && runB
        ? "ab"
        : loaded.length === 1
            ? "single"
            : "library";

    const summary = buildHistorySummary(history);
    const rawSummary = buildRawArchiveSummary(state.rawArchive || state.rawReportArchive || null, history);
    const gameBrain = buildHistoryGameBrainInsights(activeHistory.length ? activeHistory : history);
    const library = buildLibraryIntel({ history, activeHistory, summary, rawSummary, gameBrain });

    return {
        state,
        history,
        activeHistory,
        runA,
        runB,
        loaded,
        mode,
        summary,
        rawSummary,
        gameBrain,
        library
    };
}

function buildCompareHero(model = {}) {
    const title = model.mode === "ab"
        ? "Run A vs Run B"
        : model.mode === "single"
            ? "Single Report Intel"
            : "Saved Runs Intel";

    const subtitle = model.mode === "ab"
        ? "Compare the loaded Dashboard slots and explain which run wins for push, farming, cells, and pace."
        : model.mode === "single"
            ? "Analyse one loaded run against your saved report library."
            : "Understand your saved Battle Reports, death patterns, best runs, and farming efficiency.";

    return `
        <section class="tbi-compare-hero tbi-card">
            <div class="tbi-compare-hero-copy">
                <span class="tbi-compare-kicker">Compare & Analyse</span>
                <h2>${model.mode === "ab" ? `<span class="tbi-compare-title-slot tbi-compare-title-slot-a">Run <b>A</b></span><span class="tbi-compare-title-vs">vs</span><span class="tbi-compare-title-slot tbi-compare-title-slot-b">Run <b>B</b></span>` : escapeHTML(title)}</h2>
                <p>${escapeHTML(subtitle)}</p>
                <div class="tbi-compare-mode-strip" aria-label="Compare modes">
                    ${modeChip("Library Intel", model.mode === "library")}
                    ${modeChip("Single Report", model.mode === "single")}
                    ${modeChip("A/B Compare", model.mode === "ab")}
                </div>
            </div>
            <div class="tbi-compare-hero-stats" aria-label="Saved library status">
                ${heroStat("Saved Runs", String(model.summary.totalRuns || 0), "Library")}
                ${heroStat("Raw Sources", model.rawSummary.sourceCoverageLabel || `${model.rawSummary.reportCount || 0}`, "Evidence")}
                ${heroStat("Run A", model.runA ? formatTierWave(model.runA) : "Empty", model.runA ? "Loaded" : "Choose in History", model.runA ? "a" : "neutral")}
                ${heroStat("Run B", model.runB ? formatTierWave(model.runB) : "Empty", model.runB ? "Loaded" : "Choose in History", model.runB ? "b" : "neutral")}
            </div>
            <div class="tbi-compare-hero-actions">
                <button type="button" class="tbi-compare-action" data-dashboard-tab="history">Open History</button>
                <button type="button" class="tbi-compare-action ghost" data-dashboard-tab="command">Open Command Deck</button>
            </div>
        </section>
    `;
}

function buildCompareModeView(model = {}) {
    if (model.mode === "ab") {
        return buildABCompare(model);
    }

    if (model.mode === "single") {
        return buildSingleReportIntel(model);
    }

    return buildLibraryIntelView(model);
}

function buildLibraryIntelView(model = {}) {
    const { library } = model;
    const topRecordsPanel = panel("Top Records", "Highest saved records", `
        <div class="tbi-compare-tile-grid five">
            ${bestRunTile("Best Wave", library.best.wave, "Wave")}
            ${bestRunTile("Best Coins", library.best.coins, "Coins")}
            ${bestRunTile("Best Cells", library.best.cells, "Cells")}
            ${bestRunTile("Best Coins/h", library.best.coinsPerHour, "Coins/h")}
            ${bestRunTile("Best Cells/h", library.best.cellsPerHour, "Cells/h")}
        </div>
    `);

    const deathPatternsPanel = panel("Death Patterns", "What usually ends runs", `
        <div class="tbi-compare-intel-rows">
            ${intelRow("Most common deaths", library.deaths.topDeaths.label, library.deaths.topDeaths.sub)}
            ${intelRow("Death family", library.deaths.topFamily.label, library.deaths.topFamily.sub)}
            ${intelRow("Elite deaths", library.deaths.elite.label, library.deaths.elite.sub)}
            ${intelRow("Rare deaths", library.deaths.rare.label, library.deaths.rare.sub)}
        </div>
    `);

    const runBandPanel = panel("Run Band Mix", "Saved-run shape", `
        <div class="tbi-compare-intel-rows">
            ${library.bandRows.map(row => intelRow(row.label, row.value, row.sub)).join("")}
        </div>
    `);

    const nextTargetsPanel = panel("Next Targets", "Useful checkpoint pressure", `
        <div class="tbi-compare-intel-rows">
            ${intelRow("Common checkpoint", library.nextTargets.topCheckpoint.label, library.nextTargets.topCheckpoint.sub)}
            ${intelRow("Elite pressure", library.deaths.elite.label, library.deaths.elite.sub)}
            ${intelRow("Parser mapping", library.mapping.label, library.mapping.sub)}
        </div>
    `);

    return `
        <section class="tbi-compare-layout library-mode tbi-compare-column-layout">
            <div class="tbi-compare-column tbi-compare-column-primary">
                ${panel("Library Snapshot", "Across your saved runs", buildLibrarySnapshotBlock(model, library))}
                ${topRecordsPanel}
                ${deathPatternsPanel}
                ${nextTargetsPanel}
            </div>
            <div class="tbi-compare-column tbi-compare-column-secondary">
                ${panel("Library Insights", "What the saved runs are saying", buildLibraryInsightsBlock(library))}
                ${panel("Efficiency Leaders", "Best saved pace", buildEfficiencyLeadersBlock(library))}
                ${runBandPanel}
                ${panel("Data Confidence", "Source health", buildLibraryDataConfidenceBlock(model, library))}
            </div>
        </section>
    `;
}

function buildSingleReportIntel(model = {}) {
    const item = model.loaded[0];
    const run = item?.run || null;
    const slot = item?.slot || "A";
    const gb = buildHistoryRunGameBrainSummary(run);
    const ranks = buildRunRanks(run, model.activeHistory.length ? model.activeHistory : model.history);

    return `
        <section class="tbi-compare-layout single-mode tbi-compare-column-layout">
            <div class="tbi-compare-column tbi-compare-column-primary">
                ${panel(`Run ${slot} Intel`, run?.core?.battleDate || "Loaded report", `
                    ${buildRunSummaryCard(run, slot)}
                    <div class="tbi-compare-verdict-box tbi-compare-verdict-primary tone-${escapeAttr(slot.toLowerCase())}">
                        <em>Verdict</em>
                        <strong>${escapeHTML(singleReportVerdict(run, gb, ranks))}</strong>
                        <span>${escapeHTML(singleReportSubtext(gb))}</span>
                    </div>
                `)}
                ${panel("Efficiency", "Pace and yield", `
                    <div class="tbi-compare-tile-grid five compact-efficiency tbi-compare-single-efficiency">
                        ${metricCard("Coins/h", formatNumber(getCoinsPerHour(run)), "Farming pace")}
                        ${metricCard("Cells/h", formatNumber(getCellsPerHour(run)), "Cell pace")}
                        ${metricCard("Coins / Wave", formatNumber(safeDivide(run?.core?.coins, run?.core?.wave)), "Yield density")}
                        ${metricCard("Cells / Wave", formatNumber(safeDivide(run?.core?.cells, run?.core?.wave)), "Cell density")}
                        ${metricCard("Waves / Hour", formatNumber(getWavesPerHour(run), 0), "Push pace")}
                    </div>
                `)}
                ${panel("Death Pressure Context", "How this death fits your library", buildSingleDeathPressureContext(run, model))}
                ${panel("Next Test Suggestion", "Safe next check", buildSingleNextTest(run, gb, ranks))}
            </div>
            <div class="tbi-compare-column tbi-compare-column-secondary">
                ${panel("Run Insights", "What this run suggests", buildSingleRunInsights(run, gb, ranks))}
                ${panel("Compared With Saved Runs", "Where this report sits", `
                    <div class="tbi-compare-intel-rows">
                        ${intelRow("Wave rank", ranks.wave.label, ranks.wave.sub)}
                        ${intelRow("Coins/h rank", ranks.coinsPerHour.label, ranks.coinsPerHour.sub)}
                        ${intelRow("Cells/h rank", ranks.cellsPerHour.label, ranks.cellsPerHour.sub)}
                        ${intelRow("Death pattern", ranks.death.label, ranks.death.sub)}
                        ${intelRow("Run band", shortenBand(gb.bandLabel || "Unbanded"), gb.nextCheckpoint ? `Next ${formatWaveNumber(gb.nextCheckpoint)}` : "No checkpoint")}
                    </div>
                `)}
                ${panel("Similar Runs Context", "Compared with same tier/type", buildSimilarRunsContext(run, model.activeHistory.length ? model.activeHistory : model.history))}
                ${panel("Library Context", "Whole-library patterns", buildLibraryContextBlock(model.library))}
            </div>
        </section>
    `;
}

function buildABCompare(model = {}) {
    const a = model.runA;
    const b = model.runB;
    const diffs = CORE_METRICS.map(metric => buildDiffMetric(metric, a, b));

    return `
        <section class="tbi-compare-layout ab-mode tbi-compare-column-layout">
            <div class="tbi-compare-column tbi-compare-column-primary">
                ${panel("A/B Verdict", "Loaded Dashboard slots", `
                    ${buildABIdentityStrip()}
                    <div class="tbi-compare-ab-grid">
                        ${buildRunSummaryCard(a, "A")}
                        ${buildRunSummaryCard(b, "B")}
                    </div>
                    <div class="tbi-compare-verdict-box tbi-compare-verdict-primary tone-split">
                        <em>Verdict</em>
                        <strong>${buildABVerdictMarkup(diffs)}</strong>
                        <span>${buildABSubtextMarkup(a, b, diffs)}</span>
                    </div>
                `)}
                ${panel("Difference", "B - A, with winner shown", `
                    <div class="tbi-compare-diff-grid">
                        ${diffs.map(diffTile).join("")}
                    </div>
                `)}
                ${panel("Purpose Verdict", "Different runs can win different jobs", `
                    <div class="tbi-compare-intel-rows tbi-compare-purpose-rows">
                        ${purposeMetricRow("Best push run", "wave", diffs)}
                        ${purposeMetricRow("Best farming run", "coinsPerHour", diffs)}
                        ${purposeMetricRow("Best cells run", "cells", diffs)}
                        ${purposeMetricRow("Best coins pace", "coinsPerHour", diffs)}
                        ${purposeMetricRow("Best cell pace", "cellsPerHour", diffs)}
                    </div>
                `)}
                ${panel("Death Pressure Context", "How each run ended", buildABDeathPressureContext(a, b, model))}
                ${panel("Next Test Suggestion", "Safe next check", buildABNextTest(a, b, diffs))}
            </div>
            <div class="tbi-compare-column tbi-compare-column-secondary">
                ${panel("Compare Insights", "What changed between A and B", buildCompareInsights(a, b, diffs))}
                ${panel("Comparison Fairness", "Data confidence before judging the result", buildComparisonFairness(a, b, model))}
                ${panel("Ranked Differences", "Largest useful swings", buildBiggestDifferences(diffs))}
                ${panel("Similar Runs Context", "Same tier/type saved-run baseline", buildABSimilarRunsContext(a, b, model.activeHistory.length ? model.activeHistory : model.history))}
                ${panel("History Rank Context", "Where A and B sit in saved runs", buildABRankContext(a, b, model.activeHistory.length ? model.activeHistory : model.history))}
                ${panel("Library Context", "Whole-library patterns", buildLibraryContextBlock(model.library))}
            </div>
        </section>
    `;
}


function buildLibrarySnapshotBlock(model = {}, library = {}) {
    return `
        <div class="tbi-compare-snapshot-grid">
            ${metricCard("Saved runs", model.summary.totalRuns || 0, "Total library")}
            ${metricCard("Raw sources", model.rawSummary.sourceCoverageLabel || "0 / 0", "Linked evidence")}
            ${metricCard("Archived", model.summary.archivedRuns || 0, "Hidden from active view")}
        </div>
        <div class="tbi-compare-inline-summary tbi-compare-run-type-summary">
            ${escapeHTML(runTypeSummary(library.runTypes))}
        </div>
    `;
}

function buildLibraryDataConfidenceBlock(model = {}, library = {}) {
    const rawLinked = library.rawSummary?.sourceCoverageLabel || "0 / 0";
    const archived = Number(model.summary?.archivedRuns || 0);
    const mappingClean = library.mapping?.label === "Clean";
    const evidenceLevel = rawLinked.includes("/") && rawLinked.split("/").map(part => Number.parseInt(part.trim(), 10)).every(Number.isFinite)
        ? rawLinked.split("/").map(part => Number.parseInt(part.trim(), 10))
        : null;
    const fullRawCoverage = evidenceLevel ? evidenceLevel[0] === evidenceLevel[1] && evidenceLevel[1] > 0 : false;
    const confidence = fullRawCoverage && mappingClean ? "Strong" : mappingClean ? "Good" : "Review";

    return `
        <div class="tbi-compare-intel-rows tbi-compare-data-confidence-rows">
            ${intelRow("Raw sources", rawLinked, fullRawCoverage ? "Full coverage" : "Check missing links")}
            ${intelRow("Parser mapping", library.mapping?.label || "Unknown", library.mapping?.sub || "No review needed")}
            ${intelRow("Archived runs", String(archived), archived ? "Hidden from active view" : "None hidden")}
            ${intelRow("Run types", runTypeSummary(library.runTypes), "Saved scope")}
            ${intelRow("Evidence level", confidence, confidence === "Strong" ? "Clean + linked" : "Review context")}
        </div>
    `;
}

function buildLibraryInsightsBlock(library = {}) {
    const topBand = library.bandRows?.[0] || null;
    const lines = [
        `${library.summary?.totalRuns || 0} saved runs are available for analysis.`,
        `${library.deaths.topDeaths.label || "No death pattern"} is the most common death pattern (${library.deaths.topDeaths.sub || "0 runs"}).`,
        `${topBand?.value || "No run band"} is the main saved-run shape (${topBand?.sub || "0 runs"}).`,
        `Raw source coverage is ${library.rawSummary?.sourceCoverageLabel || "0 / 0"}.`
    ];
    return insightList(lines);
}

function buildEfficiencyLeadersBlock(library = {}) {
    return `
        <div class="tbi-compare-intel-rows">
            ${intelRow("Best coin pace", library.best.coinsPerHour?.display || "-", library.best.coinsPerHour?.sub || "No run")}
            ${intelRow("Best cell pace", library.best.cellsPerHour?.display || "-", library.best.cellsPerHour?.sub || "No run")}
            ${intelRow("Best wave push", library.best.wave?.display || "-", library.best.wave?.sub || "No run")}
        </div>
    `;
}

function buildSingleRunInsights(run = null, gb = {}, ranks = {}) {
    const death = run?.core?.killedBy || "Unknown";
    const coinRank = parseRankNumber(ranks?.coinsPerHour?.label);
    const cellRank = parseRankNumber(ranks?.cellsPerHour?.label);
    const lines = [
        `${shortenBand(gb.bandLabel || "Saved")} run with ${coinRank && coinRank <= 5 ? "strong coin pace" : "steady pace"}.`,
        `${death} was the limiting pressure.`,
        coinRank ? `Coins/h sits ${ranks.coinsPerHour.label} in the current saved-run scope.` : "Coins/h rank needs more saved runs.",
        cellRank ? `Cells/h sits ${ranks.cellsPerHour.label} in the current saved-run scope.` : "Cells/h rank needs more saved runs."
    ];
    return insightList(lines);
}

function buildSingleDeathPressureContext(run = null, model = {}) {
    const death = run?.core?.killedBy || "Unknown";
    const gb = buildHistoryRunGameBrainSummary(run);
    const runs = model.activeHistory.length ? model.activeHistory : model.history;
    const count = runs.filter(item => (item?.core?.killedBy || "Unknown") === death).length;
    return `
        <div class="tbi-compare-intel-rows">
            ${intelRow("This run ended to", death, gb.killedByFamily || "Run pressure")}
            ${intelRow("Library frequency", death, countText(count))}
            ${intelRow("Pressure family", gb.killedByFamily || "Unknown", deathFamilyHint(gb.killedByFamily))}
        </div>
    `;
}

function buildSingleNextTest(run = null, gb = {}, ranks = {}) {
    const death = run?.core?.killedBy || "Unknown";
    const checkpoint = gb.nextCheckpoint ? `Wave ${formatWaveNumber(gb.nextCheckpoint)}` : "the next clean checkpoint";
    const lines = [
        `Use this as the single-run baseline, then load a second similar run for direct A/B comparison.`,
        `Watch whether ${death} pressure repeats before changing build direction.`,
        `Next useful checkpoint remains ${checkpoint}.`
    ];
    return insightList(lines);
}

function buildCompareInsights(a = null, b = null, diffs = []) {
    const wave = winnerForMetric("wave", diffs);
    const coins = winnerForMetric("coins", diffs);
    const coinPace = winnerForMetric("coinsPerHour", diffs);
    const cells = winnerForMetric("cells", diffs);
    const cellPace = winnerForMetric("cellsPerHour", diffs);
    const lines = [
        `${slotTagFromLabel(wave.label)} leads push (${escapeHTML(wave.sub)}).`,
        `${slotTagFromLabel(coins.label)} leads total coins (${escapeHTML(coins.sub)}).`,
        `${slotTagFromLabel(coinPace.label)} leads coin pace (${escapeHTML(coinPace.sub)}).`,
        `${slotTagFromLabel(cells.label)} leads total cells (${escapeHTML(cells.sub)}).`,
        `${slotTagFromLabel(cellPace.label)} leads cell pace (${escapeHTML(cellPace.sub)}).`
    ];
    return insightListHTML(lines);
}

function buildBiggestDifferences(diffs = []) {
    const orderedKeys = ["coins", "coinsPerHour", "wave", "cells", "cellsPerHour"];
    const rows = orderedKeys
        .map(key => diffs.find(item => item.key === key))
        .filter(Boolean)
        .map(item => {
            const winner = item.winner === "Tie" ? "Tie" : slotTag(item.winner);
            const value = item.winner === "Tie" ? "Same value" : `+${escapeHTML(item.display)}`;
            return intelRowHTML(item.label, `${winner} ${value}`, slotMetricPair(item));
        })
        .join("");
    return `<div class="tbi-compare-intel-rows tbi-compare-biggest-diffs">${rows}</div>`;
}

function buildABRankContext(a = null, b = null, history = []) {
    const aRanks = buildRunRanks(a, history);
    const bRanks = buildRunRanks(b, history);
    return `
        <div class="tbi-compare-intel-rows tbi-compare-ab-aligned-rows tbi-compare-rank-rows">
            ${slotRow("A", aRanks.wave.label, `Wave rank · ${escapeHTML(aRanks.wave.sub)}`)}
            ${slotRow("B", bRanks.wave.label, `Wave rank · ${escapeHTML(bRanks.wave.sub)}`)}
            ${slotRow("A", aRanks.coinsPerHour.label, `Coins/h rank · ${escapeHTML(aRanks.coinsPerHour.sub)}`)}
            ${slotRow("B", bRanks.cellsPerHour.label, `Cells/h rank · ${escapeHTML(bRanks.cellsPerHour.sub)}`)}
        </div>
    `;
}

function buildABDeathPressureContext(a = null, b = null, model = {}) {
    const aGb = buildHistoryRunGameBrainSummary(a);
    const bGb = buildHistoryRunGameBrainSummary(b);
    const runs = model.activeHistory.length ? model.activeHistory : model.history;
    const aDeath = a?.core?.killedBy || "Unknown";
    const bDeath = b?.core?.killedBy || "Unknown";
    const aCount = runs.filter(item => (item?.core?.killedBy || "Unknown") === aDeath).length;
    const bCount = runs.filter(item => (item?.core?.killedBy || "Unknown") === bDeath).length;
    const bothElite = /elite/i.test(aGb.killedByFamily || "") && /elite/i.test(bGb.killedByFamily || "");

    return `
        <div class="tbi-compare-intel-rows tbi-compare-ab-aligned-rows tbi-compare-death-compact">
            ${slotRow("A", aDeath, `Death · ${escapeHTML(aGb.killedByFamily || "Run pressure")} · ${escapeHTML(countText(aCount))} in library`)}
            ${slotRow("B", bDeath, `Death · ${escapeHTML(bGb.killedByFamily || "Run pressure")} · ${escapeHTML(countText(bCount))} in library`)}
            ${intelRowHTML("Pressure pattern", escapeHTML(bothElite ? "Both elite pressure" : "Mixed pressure"), escapeHTML(bothElite ? "Compare elite control" : "Check death type split"))}
        </div>
    `;
}


function buildComparisonFairness(a = null, b = null, model = {}) {
    const sameTier = Number(a?.core?.tier || 0) === Number(b?.core?.tier || 0) && Number(a?.core?.tier || 0) > 0;
    const aType = normaliseRunType(a);
    const bType = normaliseRunType(b);
    const sameRunType = aType === bType;
    const timeContext = compareRealTimeContext(a, b);
    const rawA = hasRawSource(a);
    const rawB = hasRawSource(b);
    const cleanMapping = Number(model?.library?.mapping?.sub?.match?.(/\d+/)?.[0] || 0) === 0 || model?.library?.mapping?.label === "Clean";
    const confidence = sameTier && sameRunType && rawA && rawB && timeContext.tone !== "wide" ? "Good" : "Review";
    const confidenceSub = confidence === "Good" ? "Fair comparison" : "Check context before judging";

    return `
        <div class="tbi-compare-intel-rows tbi-compare-fairness-rows">
            ${intelRow("Same tier", sameTier ? "Yes" : "No", sameTier ? `Tier ${a?.core?.tier || b?.core?.tier || "?"}` : `A T${a?.core?.tier || "?"} · B T${b?.core?.tier || "?"}`)}
            ${intelRow("Same run type", sameRunType ? "Yes" : "No", sameRunType ? formatRunTypeLabel(aType) : `${formatRunTypeLabel(aType)} vs ${formatRunTypeLabel(bType)}`)}
            ${intelRow("Real time", timeContext.label, timeContext.sub)}
            ${intelRowHTML("Raw source", escapeHTML(rawA && rawB ? "Both linked" : rawA || rawB ? "One linked" : "Missing"), `${slotTag("A")} ${escapeHTML(rawA ? "linked" : "missing")} · ${slotTag("B")} ${escapeHTML(rawB ? "linked" : "missing")}`)}
            ${intelRow("Parser mapping", cleanMapping ? "Clean" : "Review", model?.library?.mapping?.sub || "No review needed")}
            ${intelRow("Verdict confidence", confidence, confidenceSub)}
        </div>
    `;
}

function buildSimilarRunsContext(run = null, history = []) {
    const scope = similarRuns(run, history);
    return `
        <div class="tbi-compare-intel-rows tbi-compare-similar-rows">
            ${intelRow("Similar scope", scope.label, scope.sub)}
            ${intelRow("Best similar wave", scope.bestWave?.display || "-", scope.bestWave?.sub || "No matching run")}
            ${intelRow("Best similar coins/h", scope.bestCoinsPerHour?.display || "-", scope.bestCoinsPerHour?.sub || "No matching run")}
            ${intelRow("Best similar cells/h", scope.bestCellsPerHour?.display || "-", scope.bestCellsPerHour?.sub || "No matching run")}
        </div>
    `;
}

function buildABSimilarRunsContext(a = null, b = null, history = []) {
    const aScope = similarRuns(a, history);
    const bScope = similarRuns(b, history);
    const shared = aScope.key === bScope.key ? aScope : null;
    return `
        <div class="tbi-compare-intel-rows tbi-compare-similar-rows">
            ${shared ? intelRow("Shared similar scope", shared.label, shared.sub) : slotRow("A", aScope.label, `Similar scope · ${escapeHTML(aScope.sub)}`)}
            ${shared ? intelRow("Best similar wave", shared.bestWave?.display || "-", shared.bestWave?.sub || "No matching run") : slotRow("B", bScope.label, `Similar scope · ${escapeHTML(bScope.sub)}`)}
            ${shared ? intelRow("Best similar coins/h", shared.bestCoinsPerHour?.display || "-", shared.bestCoinsPerHour?.sub || "No matching run") : slotRow("A", aScope.bestWave?.display || "-", `Best similar wave · ${escapeHTML(aScope.bestWave?.sub || "No matching run")}`)}
            ${shared ? intelRow("Best similar cells/h", shared.bestCellsPerHour?.display || "-", shared.bestCellsPerHour?.sub || "No matching run") : slotRow("B", bScope.bestWave?.display || "-", `Best similar wave · ${escapeHTML(bScope.bestWave?.sub || "No matching run")}`)}
        </div>
    `;
}

function buildABNextTest(a = null, b = null, diffs = []) {
    const wave = winnerForMetric("wave", diffs);
    const coinPace = winnerForMetric("coinsPerHour", diffs);
    const cellPace = winnerForMetric("cellsPerHour", diffs);
    const lines = [
        `${wave.label} is the better push baseline; ${coinPace.label} is the better coin farming baseline.`,
        `Compare another similar-tier run before changing build direction.`,
        `Watch whether ${a?.core?.killedBy || "Run A pressure"} or ${b?.core?.killedBy || "Run B pressure"} repeats.`,
        `${cellPace.label} is the better cell pace reference.`
    ];
    return insightList(lines);
}

function insightListHTML(lines = []) {
    return `
        <ul class="tbi-compare-insight-list tbi-compare-insight-list-html">
            ${lines.filter(Boolean).map(line => `<li>${line}</li>`).join("")}
        </ul>
    `;
}

function insightList(lines = []) {
    return `
        <ul class="tbi-compare-insight-list">
            ${lines.filter(Boolean).map(line => `<li>${escapeHTML(line)}</li>`).join("")}
        </ul>
    `;
}

function deathFamilyHint(value = "") {
    return /elite/i.test(value) ? "Elite-pressure death" : /common/i.test(value) ? "Common-enemy death" : "Death family context";
}

function buildLibraryContextBlock(library = {}) {
    return `
        <div class="tbi-compare-intel-rows">
            ${intelRow("Most common deaths", library.deaths.topDeaths.label, library.deaths.topDeaths.sub)}
            ${intelRow("Run band mix", library.bandRows[0]?.value || "No pattern", library.bandRows[0]?.sub || "")}
            ${intelRow("Death family", library.deaths.topFamily.label, library.deaths.topFamily.sub)}
            ${intelRow("Best wave", library.best.wave?.display || "-", library.best.wave?.sub || "")}
        </div>
    `;
}

function buildLibraryIntel({ history = [], activeHistory = [], summary = {}, rawSummary = {}, gameBrain = {} } = {}) {
    const runs = activeHistory.length ? activeHistory : history;
    const deathCounts = countBy(runs.map(run => run?.core?.killedBy || "Unknown"));
    const topDeaths = topTie(deathCounts);
    const familyDetails = gameBrain.deathFamilyDetails || {};
    const commonFamily = familyDetails.common || null;
    const eliteFamily = familyDetails.elite || null;
    const bandRows = countsToRows(gameBrain.bandCounts || {}).slice(0, 5).map(row => ({
        label: shortenBand(row.label),
        value: shortenBand(row.label),
        sub: countText(row.count)
    }));

    return {
        runTypes: countRunTypes(runs),
        best: {
            wave: bestRun(runs, run => run?.core?.wave, "Wave"),
            coins: bestRun(runs, run => run?.core?.coins, "Coins"),
            cells: bestRun(runs, run => run?.core?.cells, "Cells"),
            coinsPerHour: bestRun(runs, getCoinsPerHour, "Coins/h"),
            cellsPerHour: bestRun(runs, getCellsPerHour, "Cells/h")
        },
        deathCounts,
        deaths: {
            topDeaths: {
                label: topDeaths.label,
                sub: topDeaths.tie ? `${topDeaths.count} each` : countText(topDeaths.count)
            },
            topFamily: commonFamily ? {
                label: "Common enemies",
                sub: commonFamily.countText || countText(commonFamily.count)
            } : countTopFamily(gameBrain.familyCounts || {}),
            elite: eliteFamily ? {
                label: eliteFamily.label || "Elite enemies",
                sub: eliteFamily.countText || countText(eliteFamily.count)
            } : { label: "No elite deaths", sub: "0 runs" },
            rare: rareDeaths(deathCounts)
        },
        bandRows: bandRows.length ? bandRows : [{ label: "Run band", value: "No saved pattern", sub: "0 runs" }],
        nextTargets: {
            topCheckpoint: topCheckpoint(gameBrain.checkpointCounts || {})
        },
        mapping: {
            label: Number(gameBrain.unknownLabelsTotal || 0) ? "Needs review" : "Clean",
            sub: Number(gameBrain.unknownLabelsTotal || 0) ? `${gameBrain.unknownLabelsTotal} labels` : "No review needed"
        },
        summary,
        rawSummary
    };
}

function buildRunSummaryCard(run = null, slot = "A") {
    const core = run?.core || {};
    const stats = run?.stats || {};
    const tone = slot === "B" ? "b" : "a";

    if (!run) {
        return `
            <article class="tbi-compare-run-card tone-${escapeAttr(tone)} empty">
                <span>${slotTag(slot)}</span>
                <h3>Empty</h3>
                <p>Choose a run from History to load this slot.</p>
            </article>
        `;
    }

    return `
        <article class="tbi-compare-run-card tone-${escapeAttr(tone)}">
            <span>${slotTag(slot)}</span>
            <h3>${escapeHTML(formatTierWave(run))}</h3>
            <p>${escapeHTML(core.battleDate || "Saved report")} · Killed By ${escapeHTML(core.killedBy || "Unknown")}</p>
            <div class="tbi-compare-run-metrics">
                ${miniMetric("Coins", formatNumber(core.coins || 0))}
                ${miniMetric("Cells", formatNumber(core.cells || 0))}
                ${miniMetric("Coins/h", formatNumber(getCoinsPerHour(run)))}
                ${miniMetric("Cells/h", formatNumber(getCellsPerHour(run)))}
                ${miniMetric("Real time", formatRunTime(run))}
                ${miniMetric("Run type", formatRunTypeLabel(run?.meta?.runType || "normal"))}
            </div>
        </article>
    `;
}

function panel(title = "", subtitle = "", body = "") {
    return `
        <section class="tbi-compare-panel tbi-card">
            <header class="tbi-compare-panel-head">
                <div>
                    <span>${escapeHTML(subtitle)}</span>
                    <h3>${escapeHTML(title)}</h3>
                </div>
            </header>
            <div class="tbi-compare-panel-body">
                ${body}
            </div>
        </section>
    `;
}

function modeChip(label, active = false) {
    return `<span class="tbi-compare-mode-chip ${active ? "active" : ""}">${escapeHTML(label)}</span>`;
}

function heroStat(label, value, sub = "", tone = "neutral") {
    return `
        <div class="tbi-compare-hero-stat tone-${escapeAttr(tone)}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(String(value ?? "-"))}</strong>
            <em>${escapeHTML(sub)}</em>
        </div>
    `;
}

function metricCard(label, value, sub = "") {
    return `
        <div class="tbi-compare-metric-card">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(String(value ?? "-"))}</strong>
            <em>${escapeHTML(sub)}</em>
        </div>
    `;
}

function bestRunTile(label, best = null, fallback = "") {
    return metricCard(label, best?.display || "-", best?.sub || fallback);
}

function miniMetric(label, value) {
    return `<div><span>${escapeHTML(label)}</span><strong>${escapeHTML(String(value ?? "-"))}</strong></div>`;
}

function intelRow(label, value, sub = "") {
    return `
        <div class="tbi-compare-intel-row">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(String(value || "-"))}</strong>
            <em>${escapeHTML(String(sub || ""))}</em>
        </div>
    `;
}
function intelRowHTML(label, valueHTML = "", subHTML = "") {
    return `
        <div class="tbi-compare-intel-row">
            <span>${escapeHTML(label)}</span>
            <strong>${valueHTML || "-"}</strong>
            <em>${subHTML || ""}</em>
        </div>
    `;
}

function intelRowRich(labelHTML = "", valueHTML = "", subHTML = "") {
    return `
        <div class="tbi-compare-intel-row tbi-compare-intel-row-rich">
            <span>${labelHTML || ""}</span>
            <strong>${valueHTML || "-"}</strong>
            <em>${subHTML || ""}</em>
        </div>
    `;
}

function slotRow(slot = "A", value = "", subHTML = "") {
    return intelRowRich(slotTag(slot), escapeHTML(String(value || "-")), subHTML || "");
}

function slotTag(slot = "") {
    const clean = String(slot || "").toUpperCase() === "B" ? "B" : "A";
    return `<span class="tbi-run-slot tbi-run-slot-${clean.toLowerCase()}" data-run-slot="${clean}">Run <b>${clean}</b></span>`;
}

function slotLetterTag(slot = "") {
    const clean = String(slot || "").toUpperCase() === "B" ? "B" : "A";
    return `<span class="tbi-run-letter tbi-run-stat-arrow tbi-run-slot-${clean.toLowerCase()}" data-run-slot="${clean}"><b>${clean}</b><i>›</i></span>`;
}

function slotMetricPair(item = {}) {
    return `<span class="tbi-compare-slot-metric-pair">${slotLetterTag("A")} <span>${escapeHTML(formatMetricByKey(item.key, item.aValue))}</span><i>·</i>${slotLetterTag("B")} <span>${escapeHTML(formatMetricByKey(item.key, item.bValue))}</span></span>`;
}

function purposeMetricRow(label, key, diffs = []) {
    const item = diffByKey(key, diffs);
    const winner = winnerForMetric(key, diffs);
    const value = item ? slotMetricPair(item) : escapeHTML(winner.sub || "-");
    return intelRowHTML(label, slotTagFromLabel(winner.label), value);
}

function slotTagFromLabel(label = "") {
    const text = String(label || "");
    if (/Run\s+B/i.test(text)) return slotTag("B");
    if (/Run\s+A/i.test(text)) return slotTag("A");
    return escapeHTML(text || "Tie");
}

function buildABIdentityStrip() {
    return `
        <div class="tbi-compare-ab-identity" aria-label="Run A versus Run B">
            ${slotTag("A")}
            <span class="tbi-compare-ab-vs">vs</span>
            ${slotTag("B")}
        </div>
    `;
}


function runTypeSummary(runTypes = {}) {
    const rows = Object.entries(runTypes)
        .filter(([, count]) => Number(count || 0) > 0)
        .map(([type, count]) => `${formatRunTypeLabel(type)} ${count}`);

    return `Run types: ${rows.length ? rows.join(" · ") : "No saved run types yet"}`;
}

function buildRunTypeRows(runTypes = {}) {
    return `<p class="tbi-compare-inline-summary">${escapeHTML(runTypeSummary(runTypes))}</p>`;
}

function buildDiffMetric(metric, a = null, b = null) {
    const aValue = toNumber(metric.picker(a));
    const bValue = toNumber(metric.picker(b));
    const diff = bValue - aValue;
    const winner = diff > 0 ? "B" : diff < 0 ? "A" : "Tie";
    return {
        ...metric,
        aValue,
        bValue,
        diff,
        winner,
        display: metric.key === "wave" ? formatWaveNumber(Math.abs(diff)) : formatNumber(Math.abs(diff))
    };
}

function diffTile(item = {}) {
    const tone = item.winner === "A" ? "a" : item.winner === "B" ? "b" : "neutral";
    const winnerLabel = item.winner === "Tie" ? "Tie" : slotTag(item.winner);

    return `
        <div class="tbi-compare-diff-tile tone-${escapeAttr(tone)}">
            <span>${escapeHTML(item.label)}</span>
            <strong>${winnerLabel} ${item.winner === "Tie" ? "" : `+${escapeHTML(item.display)}`}</strong>
            <em>${slotMetricPair(item)}</em>
        </div>
    `;
}

function purposeRow(label, winner) {
    return intelRowHTML(label, slotTagFromLabel(winner.label), escapeHTML(winner.sub));
}

function winnerForMetric(key, diffs = []) {
    const item = diffs.find(entry => entry.key === key);
    if (!item || item.winner === "Tie") return { label: "Tie", sub: "Same value" };
    return { label: `Run ${item.winner}`, sub: `${item.label} +${item.display}` };
}

function diffByKey(key = "", diffs = []) {
    return diffs.find(entry => entry.key === key) || null;
}

function parseRankNumber(label = "") {
    const match = String(label || "").match(/#(\d+)/);
    return match ? Number(match[1]) : null;
}

function deathCard(label, run = null) {
    const gb = buildHistoryRunGameBrainSummary(run);
    return `
        <article class="tbi-compare-death-card">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(run?.core?.killedBy || "Unknown")}</strong>
            <em>${escapeHTML(gb.killedByFamily || "Run context")}</em>
        </article>
    `;
}

function buildABVerdictMarkup(diffs = []) {
    const wave = diffByKey("wave", diffs);
    const coins = diffByKey("coins", diffs);
    const cells = diffByKey("cells", diffs);
    const coinsPerHour = diffByKey("coinsPerHour", diffs);
    const cellsPerHour = diffByKey("cellsPerHour", diffs);
    const parts = [];

    if (wave?.winner && wave.winner !== "Tie") parts.push(`${slotTag(wave.winner)} pushed deeper by +${escapeHTML(wave.display)} waves`);
    if (coins?.winner && coins.winner !== "Tie") parts.push(`${slotTag(coins.winner)} earned +${escapeHTML(coins.display)} more coins`);
    if (coinsPerHour?.winner && coinsPerHour.winner !== "Tie") parts.push(`${slotTag(coinsPerHour.winner)} had better farming pace`);
    if (cells?.winner && cells.winner !== "Tie" && cells.winner !== coins?.winner) parts.push(`${slotTag(cells.winner)} led cells`);
    if (cellsPerHour?.winner && cellsPerHour.winner !== "Tie" && cellsPerHour.winner !== coinsPerHour?.winner) parts.push(`${slotTag(cellsPerHour.winner)} led cells/h`);

    return parts.length ? `${parts.slice(0, 3).join(". ")}.` : "Both loaded runs are closely matched on the core metrics.";
}

function buildABSubtextMarkup(a = null, b = null, diffs = []) {
    const wave = winnerForMetric("wave", diffs);
    const coins = winnerForMetric("coinsPerHour", diffs);
    return `${slotTagFromLabel(wave.label)} leads push; ${slotTagFromLabel(coins.label)} leads coin pace. ${slotTag("A")} ended to ${escapeHTML(a?.core?.killedBy || "Unknown")}; ${slotTag("B")} ended to ${escapeHTML(b?.core?.killedBy || "Unknown")}.`;
}

function singleReportVerdict(run = null, gb = {}, ranks = {}) {
    const band = shortenBand(gb.bandLabel || "Saved run");
    const death = run?.core?.killedBy || "Unknown pressure";
    const coinRank = parseRankNumber(ranks?.coinsPerHour?.label);
    const pace = coinRank && coinRank <= 5 ? "strong coin pace" : "steady pace";
    return `${band} run with ${pace}. ${death} was the limiting pressure.`;
}

function singleReportSubtext(gb = {}) {
    if (gb.nextCheckpoint) return `Next useful checkpoint: Wave ${formatWaveNumber(gb.nextCheckpoint)}. Load a second run when you want a direct A/B comparison.`;
    return "Load a second run when you want a direct A/B comparison.";
}

function buildRunRanks(run = null, history = []) {
    const runs = Array.isArray(history) ? history.filter(Boolean) : [];
    return {
        wave: rankInfo(run, runs, item => item?.core?.wave, "wave"),
        coinsPerHour: rankInfo(run, runs, getCoinsPerHour, "coins/h"),
        cellsPerHour: rankInfo(run, runs, getCellsPerHour, "cells/h"),
        death: deathRarityInfo(run, runs)
    };
}

function rankInfo(run = null, runs = [], picker = () => 0, label = "value") {
    if (!run || !runs.length) return { label: "No library", sub: "0 runs" };
    const value = toNumber(picker(run));
    const sorted = runs
        .map(item => toNumber(picker(item)))
        .filter(Number.isFinite)
        .sort((a, b) => b - a);
    const index = sorted.findIndex(item => item <= value);
    const rank = index >= 0 ? index + 1 : sorted.length;
    return { label: `#${rank} of ${sorted.length}`, sub: label };
}

function deathRarityInfo(run = null, runs = []) {
    const death = run?.core?.killedBy || "Unknown";
    const count = runs.filter(item => (item?.core?.killedBy || "Unknown") === death).length;
    return { label: `${death}`, sub: countText(count) };
}

function bestRun(runs = [], picker = () => 0, label = "") {
    let best = null;
    runs.forEach((run, index) => {
        const value = toNumber(picker(run));
        if (!Number.isFinite(value)) return;
        if (!best || value > best.value) best = { run, index, value };
    });
    if (!best) return null;
    return {
        ...best,
        display: label === "Wave" ? `Wave ${formatWaveNumber(best.value)}` : formatNumber(best.value),
        sub: best.run?.core?.battleDate || `Best ${label}`
    };
}

function countBy(values = []) {
    const out = {};
    values.forEach(value => {
        const key = String(value || "Unknown").trim() || "Unknown";
        out[key] = (out[key] || 0) + 1;
    });
    return out;
}

function countsToRows(counts = {}) {
    return Object.entries(counts || {})
        .map(([label, count]) => ({ label, count: Number(count || 0) }))
        .filter(row => row.count > 0)
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function topTie(counts = {}) {
    const rows = countsToRows(counts);
    if (!rows.length) return { label: "No pattern", count: 0, tie: false };
    const top = rows[0].count;
    const tied = rows.filter(row => row.count === top);
    return {
        label: tied.map(row => row.label).join(" + "),
        count: top,
        tie: tied.length > 1
    };
}

function rareDeaths(counts = {}) {
    const rows = countsToRows(counts).filter(row => row.count === 1);
    if (!rows.length) return { label: "None", sub: "No single-run deaths" };
    return { label: rows.map(row => row.label).slice(0, 3).join(" + "), sub: `${rows.length} rare death${rows.length === 1 ? "" : "s"}` };
}

function countTopFamily(counts = {}) {
    const top = topTie(counts);
    return { label: top.label || "No family", sub: top.count ? countText(top.count) : "0 runs" };
}

function topCheckpoint(counts = {}) {
    const top = topTie(counts);
    return { label: top.label || "No checkpoint", sub: top.count ? countText(top.count) : "0 runs" };
}

function countRunTypes(runs = []) {
    return runs.reduce((out, run) => {
        const type = String(run?.meta?.runType || "normal").trim().toLowerCase().replace(/[\s-]+/g, "_") || "normal";
        out[type] = (out[type] || 0) + 1;
        return out;
    }, {});
}

function shortenBand(value = "") {
    const text = String(value || "").trim();
    if (/deep run\s*\/\s*farming endurance/i.test(text)) return "Deep farming";
    if (/first sustained tier push/i.test(text)) return "First tier push";
    return text || "Unbanded";
}

function countText(count = 0) {
    const value = Number(count || 0);
    return `${value} run${value === 1 ? "" : "s"}`;
}


function normaliseRunType(run = null) {
    return String(run?.meta?.runType || "normal").trim().toLowerCase().replace(/[\s-]+/g, "_") || "normal";
}

function hasRawSource(run = null) {
    return Boolean(
        run?.raw?.reportText
        || run?.rawText
        || run?.rawReportText
        || run?.reportText
        || run?.battleReportText
        || run?.meta?.rawText
        || run?.meta?.rawReportText
        || run?.meta?.reportText
        || run?.source?.rawText
        || run?.source?.reportText
    );
}

function compareRealTimeContext(a = null, b = null) {
    const left = getRealTimeSeconds(a);
    const right = getRealTimeSeconds(b);
    if (!left || !right) return { label: "Unknown", sub: "Missing time", tone: "unknown" };
    const diff = Math.abs(right - left);
    const max = Math.max(left, right);
    const minutes = Math.round(diff / 60);
    if (max <= 0) return { label: "Unknown", sub: "Missing time", tone: "unknown" };
    const ratio = diff / max;
    if (ratio <= 0.15) return { label: "Close", sub: `${minutes}m apart`, tone: "close" };
    if (ratio <= 0.35) return { label: "Different", sub: `${minutes}m apart`, tone: "different" };
    return { label: "Very different", sub: `${minutes}m apart`, tone: "wide" };
}

function similarRuns(run = null, history = []) {
    const tier = Number(run?.core?.tier || 0);
    const type = normaliseRunType(run);
    const runs = (Array.isArray(history) ? history : []).filter(item => {
        if (!item) return false;
        return Number(item?.core?.tier || 0) === tier && normaliseRunType(item) === type;
    });
    const label = tier ? `Tier ${tier} ${formatRunTypeLabel(type)}` : formatRunTypeLabel(type);
    return {
        key: `${tier}:${type}`,
        label,
        sub: countText(runs.length),
        runs,
        bestWave: bestRun(runs, item => item?.core?.wave, "Wave"),
        bestCoinsPerHour: bestRun(runs, getCoinsPerHour, "Coins/h"),
        bestCellsPerHour: bestRun(runs, getCellsPerHour, "Cells/h")
    };
}

function getCoinsPerHour(run = null) {
    return toNumber(run?.stats?.coinsPerHour ?? run?.core?.coinsPerHour ?? 0);
}

function getCellsPerHour(run = null) {
    return toNumber(run?.stats?.cellsPerHour ?? run?.core?.cellsPerHour ?? 0);
}

function getWavesPerHour(run = null) {
    const seconds = getRealTimeSeconds(run);
    const hours = seconds > 0 ? seconds / 3600 : 0;
    return hours > 0 ? toNumber(run?.core?.wave) / hours : 0;
}

function getRealTimeSeconds(run = null) {
    const value = run?.stats?.realTimeSeconds ?? run?.core?.time ?? 0;
    return toNumber(value);
}

function formatRunTime(run = null) {
    const core = run?.core || {};
    if (core.realTime || core.real_time || core.timeText) return core.realTime || core.real_time || core.timeText;
    const seconds = getRealTimeSeconds(run);
    return seconds > 0 ? formatTime(seconds) : "-";
}

function formatMetricByKey(key = "", value = 0) {
    if (key === "wave") return formatWaveNumber(value);
    return formatNumber(value);
}

function safeDivide(a = 0, b = 0) {
    const left = toNumber(a);
    const right = toNumber(b);
    return right > 0 ? left / right : 0;
}

function toNumber(value = 0) {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
}

export default { buildCompareView };
