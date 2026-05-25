"use strict";

/**
 * COMPARE TREND MONITOR v4.11z6
 * Growth Chart Clarity Pass: verdict-first, family overlay charts,
 * fixed stat colours, primary/secondary line hierarchy, clickable line focus, clearer legends and real calculation rows.
 */

import {
    escapeHTML,
    escapeAttr,
    formatNumber,
    formatDelta
} from "./sectionUtils.js";

import { parseNumber, clamp } from "../../utils/math.js";

const MS_DAY = 24 * 60 * 60 * 1000;

const RANGE_OPTIONS = Object.freeze([
    { key: "30d", label: "30 Days", days: 30 },
    { key: "90d", label: "90 Days", days: 90, preferred: true },
    { key: "6m", label: "6 Months", days: 183 },
    { key: "1y", label: "1 Year", days: 365 },
    { key: "all", label: "All Time", days: null }
]);

const PRIMARY_TREND_METRICS = Object.freeze([
    { key: "wave", label: "Wave Growth", short: "Wave", tone: "cyan", type: "max", family: "Progress" },
    { key: "coins", label: "Coins Growth", short: "Coins", tone: "gold", type: "max", family: "Farming" },
    { key: "cells", label: "Cells Growth", short: "Cells", tone: "green", type: "max", family: "Farming" },
    { key: "coinsRate", label: "Coins / Hour", short: "Coins/hr", tone: "violet", type: "avg", family: "Farming" },
    { key: "cellsRate", label: "Cells / Hour", short: "Cells/hr", tone: "green", type: "avg", family: "Farming" }
]);

const FAMILY_GROUPS = Object.freeze([
    {
        key: "farming",
        label: "Farming",
        subtitle: "Coins, cells and rate growth",
        tone: "gold",
        metrics: [
            { key: "economyTotal", label: "Economy Total", tone: "economy", type: "avg", primary: true, lineStyle: "solid" },
            { key: "coins", label: "Coins", tone: "coins", type: "max", lineStyle: "solid" },
            { key: "coinsRate", label: "Coins / Hour", tone: "coins-rate", type: "avg", lineStyle: "dash" },
            { key: "cells", label: "Cells", tone: "cells", type: "max", lineStyle: "solid" },
            { key: "cellsRate", label: "Cells / Hour", tone: "cells-rate", type: "avg", lineStyle: "dash" }
        ]
    },
    {
        key: "combat",
        label: "Combat",
        subtitle: "Damage, enemies and effect uptime",
        tone: "pink",
        metrics: [
            { key: "damageOutput", label: "Damage Output", tone: "damage", type: "avg", primary: true, lineStyle: "solid" },
            { key: "enemyTotal", label: "Enemies Hit By", tone: "enemies", type: "avg", lineStyle: "solid" },
            { key: "effectTotal", label: "Effects Active", tone: "effects", type: "avg", lineStyle: "dash" }
        ]
    },
    {
        key: "survival",
        label: "Survival",
        subtitle: "Wave depth and defensive pressure",
        tone: "cyan",
        metrics: [
            { key: "wave", label: "Wave", tone: "wave", type: "max", primary: true, lineStyle: "solid" },
            { key: "defenseTotal", label: "Defense / Survival", tone: "defense", type: "avg", lineStyle: "solid" },
            { key: "recordTotal", label: "Records", tone: "records", type: "avg", lineStyle: "dash" }
        ]
    },
    {
        key: "utility",
        label: "Utility",
        subtitle: "Packages, upgrades and skips",
        tone: "violet",
        metrics: [
            { key: "utilityTotal", label: "Utility Total", tone: "utility", type: "avg", primary: true, lineStyle: "solid" },
            { key: "countTotal", label: "Counts", tone: "counts", type: "avg", lineStyle: "dash" }
        ]
    }
]);

const SUMMARY_METRICS = Object.freeze([
    { key: "wave", label: "Wave", tone: "cyan" },
    { key: "coins", label: "Coins", tone: "gold" },
    { key: "cells", label: "Cells", tone: "green" },
    { key: "coinsRate", label: "Coins / Hour", tone: "violet" },
    { key: "cellsRate", label: "Cells / Hour", tone: "green" },
    { key: "damageOutput", label: "Damage Output", tone: "pink" },
    { key: "economyTotal", label: "Economy Total", tone: "gold" },
    { key: "utilityTotal", label: "Utility Total", tone: "violet" }
]);

export function buildCompareTrendMonitor(state = {}) {
    const historyPoints = buildHistoryPoints(state);
    const monthPoints = buildMonthlyPoints(historyPoints);
    const preferredRange = RANGE_OPTIONS.find(option => option.preferred) || RANGE_OPTIONS[1] || RANGE_OPTIONS[0];
    const preferredPoints = filterPointsByRange(historyPoints, preferredRange);
    const activeRun = state.runB || state.runA || null;
    const activeLabel = activeRun === state.runB && state.runB ? "Run B" : state.runA ? "Run A" : "No Report";
    const activeSignals = buildSingleReportSignals(activeRun);
    const movers = buildGrowthMovers(preferredPoints);
    const verdict = buildGrowthVerdict(preferredPoints, movers, activeSignals);
    const coverage = buildCoverageSummary(historyPoints, monthPoints);

    return `
        <section id="tbi-compare-trend-monitor" class="tbi-compare-trend-console tbi-card tbi-growth-workspace-v411z3" data-compare-trend-console="true">
            <header class="tbi-growth-command-head">
                <div>
                    <span class="tbi-kicker">Growth Intelligence</span>
                    <h3>Growth Command Centre</h3>
                    <p>Verdict first, then the evidence: combined family graphs, calculation rows, top gains/losses, monthly rollups, and single-report signals.</p>
                </div>
                <div class="tbi-trend-active-pill">
                    <span>Active</span>
                    <strong>${escapeHTML(activeLabel)}</strong>
                </div>
            </header>

            <nav class="tbi-growth-anchor-nav tbi-growth-anchor-nav-v411z3" aria-label="Growth workspace navigation">
                <a href="#tbi-growth-verdict">Growth Verdict</a>
                <a href="#tbi-growth-main-trends">Main Trends</a>
                <a href="#tbi-growth-movers">Gains / Losses</a>
                <a href="#tbi-growth-monthly-rollup">Monthly</a>
                <a href="#tbi-growth-stat-families">Combined Graphs</a>
                <a href="#tbi-growth-best-average">Best / Average</a>
                <a href="#tbi-growth-signal-breakdown">Single Report</a>
            </nav>

            <div class="tbi-growth-intel-layout">
                <main class="tbi-growth-intel-main">
                    ${buildGrowthVerdictPanel(verdict, coverage, preferredRange)}
                    ${buildRangeOverview(historyPoints)}
                    ${buildPrimaryTrendSection(preferredRange, preferredPoints)}
                    ${buildMoversSection(movers)}
                    ${buildMonthlyRollupSection(monthPoints)}
                    ${buildFamilyGroupsSection(preferredRange, preferredPoints)}
                    ${buildBestAverageSection(historyPoints, monthPoints)}
                    ${buildSingleReportSignalPanel(activeSignals, activeLabel)}
                </main>
                <aside class="tbi-growth-intel-rail">
                    ${buildGrowthRail(verdict, movers, coverage, activeLabel)}
                </aside>
            </div>
        </section>
    `;
}

function buildGrowthVerdictPanel(verdict, coverage, rangeOption) {
    return `
        <section id="tbi-growth-verdict" class="tbi-growth-section tbi-growth-verdict-panel ${escapeAttr(verdict.tone)}">
            <div class="tbi-growth-verdict-main">
                <span class="tbi-kicker">Growth Verdict</span>
                <h4>${escapeHTML(verdict.title)}</h4>
                <p>${escapeHTML(verdict.summary)}</p>
                <div class="tbi-growth-verdict-chips">
                    <span>Range: ${escapeHTML(rangeOption.label)}</span>
                    <span>${escapeHTML(String(coverage.reportCount))} saved reports</span>
                    <span>${escapeHTML(String(coverage.monthCount))} month group${coverage.monthCount === 1 ? "" : "s"}</span>
                </div>
            </div>
            <div class="tbi-growth-verdict-grid">
                ${verdict.cards.map(card => `
                    <article class="${escapeAttr(card.tone)}">
                        <span>${escapeHTML(card.label)}</span>
                        <strong>${escapeHTML(card.value)}</strong>
                        <small>${escapeHTML(card.note)}</small>
                    </article>
                `).join("")}
            </div>
        </section>
    `;
}

function buildRangeOverview(points = []) {
    return `
        <section id="tbi-growth-range-overview" class="tbi-growth-section tbi-growth-overview-section">
            <header class="tbi-growth-section-head">
                <div>
                    <span class="tbi-kicker">Range Overview</span>
                    <strong>Time Windows</strong>
                </div>
                <small>All visible · no hidden switching</small>
            </header>
            <div class="tbi-growth-range-card-grid tbi-growth-range-card-grid-v411z3">
                ${RANGE_OPTIONS.map(option => buildRangeOverviewCard(option, points)).join("")}
            </div>
        </section>
    `;
}

function buildRangeOverviewCard(option, allPoints = []) {
    const points = filterPointsByRange(allPoints, option);
    const months = buildMonthlyPoints(points);
    const waveGrowth = diffBetween(points, "wave");
    const coinsRateGrowth = diffBetween(points, "coinsRate");
    const bestWave = Math.max(...points.map(point => Number(point.wave || 0)), 0);
    const avgCellsRate = average(points, "cellsRate");

    return `
        <article id="tbi-growth-range-${escapeAttr(option.key)}" class="tbi-growth-range-card ${option.preferred ? "is-preferred" : ""}">
            <header>
                <span>${escapeHTML(option.label)}</span>
                <b>${escapeHTML(String(points.length))} reports</b>
            </header>
            <div class="tbi-growth-range-metrics">
                <div><small>Best Wave</small><strong>${escapeHTML(formatNumber(bestWave))}</strong></div>
                <div><small>Avg Cells/hr</small><strong>${escapeHTML(formatNumber(avgCellsRate))}</strong></div>
                <div><small>Wave</small><strong class="${waveGrowth >= 0 ? "good" : "bad"}">${escapeHTML(formatDelta(waveGrowth, { compact: true }))}</strong></div>
                <div><small>Coins/hr</small><strong class="${coinsRateGrowth >= 0 ? "good" : "bad"}">${escapeHTML(formatDelta(coinsRateGrowth, { compact: true }))}</strong></div>
            </div>
            <footer>
                <span>${escapeHTML(String(months.length))} month group${months.length === 1 ? "" : "s"}</span>
                <span>${escapeHTML(points[0]?.label || "—")} → ${escapeHTML(points.at(-1)?.label || "—")}</span>
            </footer>
        </article>
    `;
}

function buildPrimaryTrendSection(rangeOption, points = []) {
    return `
        <section id="tbi-growth-main-trends" class="tbi-growth-section tbi-growth-main-trend-section">
            <header class="tbi-growth-section-head">
                <div>
                    <span class="tbi-kicker">Main Trends</span>
                    <strong>${escapeHTML(rangeOption.label)} · Key growth lines</strong>
                </div>
                <small>${escapeHTML(String(points.length))} report snapshots</small>
            </header>
            <div class="tbi-growth-main-chart-grid">
                ${PRIMARY_TREND_METRICS.map(metric => buildTrendGraphCard(metric, points, { size: "large", footerLabel: `${points.length} reports`, showRange: true })).join("")}
            </div>
        </section>
    `;
}

function buildMoversSection(movers) {
    return `
        <section id="tbi-growth-movers" class="tbi-growth-section tbi-growth-movers-section">
            <header class="tbi-growth-section-head">
                <div>
                    <span class="tbi-kicker">What Changed Most</span>
                    <strong>Top Gains / Top Drops</strong>
                </div>
                <small>Based on first → latest saved report in range</small>
            </header>
            <div class="tbi-growth-movers-grid">
                ${buildMoverList("Top Gains", movers.gains, "good")}
                ${buildMoverList("Top Drops", movers.losses, "bad")}
                ${buildFocusNextCard(movers)}
            </div>
        </section>
    `;
}

function buildMoverList(title, items = [], tone = "neutral") {
    return `
        <article class="tbi-growth-mover-list ${escapeAttr(tone)}">
            <h5>${escapeHTML(title)}</h5>
            ${(items.length ? items : [{ label: "Need more history", value: "—", tone: "neutral" }]).map(item => `
                <div>
                    <span>${escapeHTML(item.label)}</span>
                    <strong>${escapeHTML(item.value)}</strong>
                </div>
            `).join("")}
        </article>
    `;
}

function buildFocusNextCard(movers) {
    const biggestLoss = movers.losses[0];
    const biggestGain = movers.gains[0];
    const focus = biggestLoss ? `Watch ${biggestLoss.label}` : biggestGain ? `Build around ${biggestGain.label}` : "Save more reports";
    const reason = biggestLoss ? `${biggestLoss.label} is the largest drop in the selected range.` : biggestGain ? `${biggestGain.label} is currently the strongest growth signal.` : "Trend intelligence gets stronger after 2+ saved reports.";

    return `
        <article class="tbi-growth-focus-card">
            <span class="tbi-kicker">Focus Next</span>
            <h5>${escapeHTML(focus)}</h5>
            <p>${escapeHTML(reason)}</p>
        </article>
    `;
}

function buildMonthlyRollupSection(months = []) {
    const hasMultiMonth = months.length >= 2;

    return `
        <section id="tbi-growth-monthly-rollup" class="tbi-growth-section tbi-month-summary-section">
            <header class="tbi-growth-section-head">
                <div>
                    <span class="tbi-kicker">Monthly Intelligence</span>
                    <strong>${escapeHTML(months.length ? `${months.length} Month Group${months.length === 1 ? "" : "s"}` : "Need dated saved reports")}</strong>
                </div>
                <small>${hasMultiMonth ? "Month-to-month charts active" : "Month comparison locked"}</small>
            </header>
            ${buildMonthlySummaryGrid(months)}
            ${hasMultiMonth ? `
                <div class="tbi-growth-chart-grid tbi-monthly-chart-grid">
                    ${PRIMARY_TREND_METRICS.slice(0, 4).map(metric => buildTrendGraphCard(metric, months, { compact: true, footerLabel: `${months.length} months`, showRange: true })).join("")}
                </div>
            ` : buildMonthLockedCard(months)}
        </section>
    `;
}

function buildMonthlySummaryGrid(months = []) {
    if (!months.length) {
        return `<div class="tbi-growth-empty-state">Save reports with battle dates to unlock monthly rollups.</div>`;
    }

    return `
        <div class="tbi-growth-month-card-grid">
            ${months.slice(-6).map(month => `
                <article class="tbi-growth-month-card">
                    <header>
                        <strong>${escapeHTML(month.label)}</strong>
                        <span>${escapeHTML(String(month.runs || 0))} runs</span>
                    </header>
                    <div><span>Best Wave</span><b>${escapeHTML(formatNumber(month.wave))}</b></div>
                    <div><span>Avg Coins/hr</span><b>${escapeHTML(formatNumber(month.coinsRate))}</b></div>
                    <div><span>Avg Cells/hr</span><b>${escapeHTML(formatNumber(month.cellsRate))}</b></div>
                    <div><span>Best Coins</span><b>${escapeHTML(formatNumber(month.coins))}</b></div>
                    <footer>
                        <span>Strongest: ${escapeHTML(bestFamilyForPoint(month))}</span>
                    </footer>
                </article>
            `).join("")}
        </div>
    `;
}

function buildMonthLockedCard(months = []) {
    return `
        <article class="tbi-growth-month-locked-card">
            <span class="tbi-kicker">Month-to-Month</span>
            <h5>Locked until 2+ months of saved reports exist</h5>
            <p>Current coverage: ${escapeHTML(String(months.length))} month group${months.length === 1 ? "" : "s"}. Once a second month exists, this area becomes a proper month-to-month comparison chart set.</p>
        </article>
    `;
}

function buildFamilyGroupsSection(rangeOption, points = []) {
    return `
        <section id="tbi-growth-stat-families" class="tbi-growth-section tbi-growth-family-section tbi-growth-combined-section-v411z4 tbi-growth-combined-section-v411z5">
            <header class="tbi-growth-section-head">
                <div>
                    <span class="tbi-kicker">Growth Chart Clarity Pass</span>
                    <strong>${escapeHTML(rangeOption.label)} · Family Overlay Charts</strong>
                </div>
                <small>Fixed colours · click a legend, line, or calculation row to focus it</small>
            </header>
            <div class="tbi-growth-family-grid tbi-growth-family-grid-v411z4 tbi-growth-family-grid-v411z5">
                ${FAMILY_GROUPS.map(group => buildFamilyGroup(group, points)).join("")}
            </div>
        </section>
    `;
}

function buildFamilyGroup(group, points = []) {
    const groupScore = group.metrics.reduce((sum, metric) => sum + Math.abs(diffBetween(points, metric.key)), 0);
    const strongest = strongestMetricForGroup(group, points);

    return `
        <article class="tbi-growth-family-card tbi-growth-combined-family-card ${escapeAttr(group.tone)}" data-growth-family-card="true" data-growth-family-key="${escapeAttr(group.key)}">
            <header class="tbi-growth-family-card-head">
                <div>
                    <span>${escapeHTML(group.label)}</span>
                    <small>${escapeHTML(group.subtitle)}</small>
                </div>
                <strong>${escapeHTML(formatNumber(groupScore))}</strong>
            </header>
            <p class="tbi-growth-line-focus-hint">Click a legend chip, graph line, or calculation row to focus that stat. Click it again or All Lines to reset.</p>
            <div class="tbi-combined-family-body">
                <div class="tbi-combined-family-chart-wrap">
                    ${buildCombinedFamilyChart(group, points)}
                    ${buildCombinedFamilyLegend(group, points)}
                </div>
                <div class="tbi-combined-family-calcs">
                    <header>
                        <span>Calculations</span>
                        <b>${escapeHTML(strongest ? `Strongest: ${strongest.label}` : "Need history")}</b>
                    </header>
                    ${group.metrics.map(metric => buildCombinedMetricCalc(metric, points)).join("")}
                </div>
            </div>
        </article>
    `;
}

function buildCombinedFamilyChart(group, points = []) {
    const width = 620;
    const height = 230;
    const padX = 30;
    const padY = 22;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;

    if (points.length < 2) {
        return `
            <div class="tbi-combined-empty-chart">
                <strong>Need 2+ saved reports</strong>
                <span>Combined ${escapeHTML(group.label)} graph unlocks when history has more than one point.</span>
            </div>
        `;
    }

    const lines = group.metrics
        .map(metric => buildNormalisedLine(metric, points, { width, height, padX, padY, usableW, usableH }))
        .filter(Boolean);

    const labels = ["100", "50", "0"].map((label, index) => {
        const y = padY + (usableH * index / 2);
        return `<text x="4" y="${(y + 4).toFixed(1)}" class="family-axis-label">${label}</text>`;
    }).join("");

    return `
        <svg class="tbi-combined-family-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttr(group.label)} combined normalised growth chart">
            <line x1="${padX}" y1="${padY}" x2="${padX}" y2="${height - padY}" class="family-axis" />
            <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" class="family-axis" />
            <line x1="${padX}" y1="${padY + usableH / 2}" x2="${width - padX}" y2="${padY + usableH / 2}" class="family-midline" />
            ${labels}
            ${lines.map(line => `<polyline class="family-overlay-line tone-${escapeAttr(line.tone)} ${line.primary ? "primary-line" : "secondary-line"} ${line.lineStyle === "dash" ? "dash-line" : "solid-line"}" data-growth-line-key="${escapeAttr(line.key)}" data-growth-line-label="${escapeAttr(line.label)}" points="${escapeAttr(line.points)}" />`).join("")}
            ${lines.map(line => `<circle class="family-overlay-dot tone-${escapeAttr(line.tone)} ${line.primary ? "primary-dot" : "secondary-dot"}" data-growth-dot-key="${escapeAttr(line.key)}" data-growth-line-label="${escapeAttr(line.label)}" cx="${escapeAttr(line.endX)}" cy="${escapeAttr(line.endY)}" r="${line.primary ? "4.4" : "3"}" />`).join("")}
        </svg>
    `;
}

function buildNormalisedLine(metric, points = [], dims) {
    const values = points.map(point => Number(point[metric.key] || 0));

    if (values.length < 2) {
        return null;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min || 1;
    const plotted = values.map((value, index) => {
        const x = dims.padX + (dims.usableW * index / Math.max(1, values.length - 1));
        const normalised = (value - min) / spread;
        const y = dims.padY + dims.usableH - normalised * dims.usableH;
        return { x, y };
    });

    return {
        key: metric.key,
        label: metric.label,
        tone: metric.tone || "cyan",
        primary: Boolean(metric.primary),
        lineStyle: metric.lineStyle || "solid",
        points: plotted.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" "),
        endX: plotted.at(-1)?.x.toFixed(1) || "0",
        endY: plotted.at(-1)?.y.toFixed(1) || "0"
    };
}

function buildCombinedFamilyLegend(group, points = []) {
    return `
        <div class="tbi-combined-family-legend" data-growth-family-legend="true">
            <span class="all-lines-chip" role="button" tabindex="0" data-growth-line-clear="true" aria-pressed="false">
                <i class="solid"></i>
                <b>All Lines</b>
                <small>Reset</small>
            </span>
            ${group.metrics.map(metric => {
                const change = diffBetween(points, metric.key);
                const tone = change > 0 ? "good" : change < 0 ? "bad" : "neutral";
                return `
                    <span class="tone-${escapeAttr(metric.tone)} ${metric.primary ? "primary-metric" : "secondary-metric"}" role="button" tabindex="0" data-growth-metric-focus="${escapeAttr(metric.key)}" data-growth-metric-label="${escapeAttr(metric.label)}" aria-pressed="false">
                        <i class="${escapeAttr(metric.lineStyle || "solid")}"></i>
                        <b>${escapeHTML(metric.label)}</b>
                        <small>${metric.primary ? "Primary" : metric.type === "avg" ? "Average" : "Best"}</small>
                        <em class="${escapeAttr(tone)}">${escapeHTML(formatDelta(change, { compact: true }))}</em>
                    </span>
                `;
            }).join("")}
        </div>
    `;
}
function buildCombinedMetricCalc(metric, points = []) {
    const first = points[0]?.[metric.key] || 0;
    const latest = points.at(-1)?.[metric.key] || 0;
    const best = maxOf(points, metric.key);
    const avg = avgOf(points, metric.key);
    const change = latest - first;
    const tone = change > 0 ? "good" : change < 0 ? "bad" : "neutral";
    const summaryValue = metric.type === "avg" ? avg : best;
    const summaryLabel = metric.type === "avg" ? "Avg" : "Best";
    const status = change > 0 ? "Improving" : change < 0 ? "Dropping" : "Flat";

    return `
        <div class="tbi-combined-calc-row ${escapeAttr(tone)} ${metric.primary ? "primary-metric" : "secondary-metric"}" role="button" tabindex="0" data-growth-metric-focus="${escapeAttr(metric.key)}" data-growth-metric-label="${escapeAttr(metric.label)}" aria-pressed="false">
            <div>
                <span class="tone-${escapeAttr(metric.tone)}">${escapeHTML(metric.label)}</span>
                <small>${escapeHTML(summaryLabel)} ${escapeHTML(formatNumber(summaryValue))} · ${escapeHTML(status)}</small>
            </div>
            <b><small>Latest</small>${escapeHTML(formatNumber(latest))}</b>
            <em><small>Change</small>${escapeHTML(formatDelta(change, { compact: true }))}</em>
        </div>
    `;
}

function strongestMetricForGroup(group, points = []) {
    return [...group.metrics]
        .map(metric => ({ ...metric, movement: Math.abs(diffBetween(points, metric.key)) }))
        .sort((a, b) => b.movement - a.movement)[0] || null;
}

function buildBestAverageSection(points = [], months = []) {
    const cards = SUMMARY_METRICS.map(metric => metricSummary(metric.label, maxOf(points, metric.key), avgOf(points, metric.key), diffBetween(points, metric.key), metric.tone));

    return `
        <section id="tbi-growth-best-average" class="tbi-growth-section tbi-best-average-section">
            <header class="tbi-growth-section-head">
                <div>
                    <span class="tbi-kicker">Best / Average Summary</span>
                    <strong>${escapeHTML(String(points.length))} reports · ${escapeHTML(String(months.length))} months</strong>
                </div>
                <small>Best vs average gap</small>
            </header>
            <div class="tbi-best-average-grid tbi-best-average-grid-v411z3">
                ${cards.map(card => `
                    <article class="tbi-best-average-card ${escapeAttr(card.tone)}">
                        <span>${escapeHTML(card.label)}</span>
                        <div><small>Best</small><strong>${escapeHTML(card.best)}</strong></div>
                        <div><small>Average</small><strong>${escapeHTML(card.avg)}</strong></div>
                        <footer class="${card.diffTone}">Range ${escapeHTML(card.diff)}</footer>
                    </article>
                `).join("")}
            </div>
        </section>
    `;
}

function buildSingleReportSignalPanel(signals = [], activeLabel = "Run") {
    if (!signals.length) {
        return `
            <section id="tbi-growth-signal-breakdown" class="tbi-single-trend-panel">
                <h4>Single Report Signal Breakdown</h4>
                <p class="tbi-muted">Load a report to generate single-run signal graphs.</p>
            </section>
        `;
    }

    return `
        <section id="tbi-growth-signal-breakdown" class="tbi-single-trend-panel tbi-single-trend-panel-v411z3">
            <header>
                <div>
                    <span class="tbi-kicker">Single Report</span>
                    <h4>${escapeHTML(activeLabel)} Signal Breakdown</h4>
                </div>
                <small>Derived from final totals</small>
            </header>
            <div class="tbi-single-signal-grid">
                ${signals.map(buildSignalCard).join("")}
            </div>
        </section>
    `;
}

function buildGrowthRail(verdict, movers, coverage, activeLabel) {
    return `
        <div class="tbi-growth-rail-block tbi-growth-rail-verdict ${escapeAttr(verdict.tone)}">
            <span class="tbi-kicker">Verdict</span>
            <h4>${escapeHTML(verdict.title)}</h4>
            <p>${escapeHTML(verdict.short)}</p>
        </div>
        <div class="tbi-growth-rail-block">
            <span class="tbi-kicker">Top Gains</span>
            ${movers.gains.slice(0, 3).map(item => `<div class="tbi-growth-rail-row good"><span>${escapeHTML(item.label)}</span><strong>${escapeHTML(item.value)}</strong></div>`).join("") || `<p>No gains yet.</p>`}
        </div>
        <div class="tbi-growth-rail-block">
            <span class="tbi-kicker">Top Drops</span>
            ${movers.losses.slice(0, 3).map(item => `<div class="tbi-growth-rail-row bad"><span>${escapeHTML(item.label)}</span><strong>${escapeHTML(item.value)}</strong></div>`).join("") || `<p>No drops yet.</p>`}
        </div>
        <div class="tbi-growth-rail-block">
            <span class="tbi-kicker">Data Coverage</span>
            <div class="tbi-growth-rail-row"><span>Reports</span><strong>${escapeHTML(String(coverage.reportCount))}</strong></div>
            <div class="tbi-growth-rail-row"><span>Months</span><strong>${escapeHTML(String(coverage.monthCount))}</strong></div>
            <div class="tbi-growth-rail-row"><span>Active Signal</span><strong>${escapeHTML(activeLabel)}</strong></div>
        </div>
        <div class="tbi-growth-side-jumps">
            <a href="#tbi-growth-main-trends">Charts</a>
            <a href="#tbi-growth-movers">Gains</a>
            <a href="#tbi-growth-monthly-rollup">Monthly</a>
        </div>
    `;
}

function buildTrendGraphCard(metric, points = [], options = {}) {
    const values = points.map(point => Number(point[metric.key] || 0));
    const latest = values.length ? values[values.length - 1] : 0;
    const previous = values.length > 1 ? values[0] : latest;
    const diff = latest - previous;
    const value = metric.type === "avg" ? average(points, metric.key) : latest;
    const classes = ["tbi-trend-graph-card", metric.tone, options.compact ? "compact" : "", options.mini ? "mini" : "", options.size === "large" ? "large" : ""].filter(Boolean).join(" ");

    return `
        <article class="${escapeAttr(classes)}">
            <header>
                <span>${escapeHTML(metric.label)}</span>
                <strong>${escapeHTML(formatNumber(value))}</strong>
            </header>
            ${buildSparkline(points, metric.key, metric.tone, { large: options.size === "large" })}
            <footer>
                <span>${escapeHTML(options.footerLabel || `${points.length} reports`)}</span>
                <b class="${diff > 0 ? "good" : diff < 0 ? "bad" : "neutral"}">${escapeHTML(formatDelta(diff, { compact: true }))}</b>
            </footer>
        </article>
    `;
}

function buildSparkline(points = [], key = "wave", tone = "cyan", options = {}) {
    const width = 300;
    const height = options.large ? 118 : 86;
    const pad = 12;
    const usableW = width - pad * 2;
    const usableH = height - pad * 2;
    const values = points.map(point => Number(point[key] || 0));

    if (values.length < 2) {
        return `
            <div class="tbi-trend-empty-chart">
                <span>Need 2+ reports</span>
            </div>
        `;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min || 1;
    const path = values.map((value, index) => {
        const x = pad + (usableW * index / Math.max(1, values.length - 1));
        const y = pad + usableH - ((value - min) / spread) * usableH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

    const end = path.split(" ").at(-1) || `${pad},${height - pad}`;

    return `
        <svg class="tbi-trend-sparkline tone-${escapeAttr(tone)}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttr(key)} trend graph">
            <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" class="trend-axis" />
            <polyline points="${escapeAttr(path)}" class="trend-line" />
            <polyline points="${pad},${height - pad} ${escapeAttr(path)} ${width - pad},${height - pad}" class="trend-fill" />
            <circle cx="${escapeAttr(end.split(",")[0])}" cy="${escapeAttr(end.split(",")[1])}" r="4" class="trend-dot" />
        </svg>
    `;
}

function buildHistoryPoints(state = {}) {
    const seen = new Set();
    const runs = [];

    for (const run of [...(Array.isArray(state.history) ? state.history : []), state.runA, state.runB]) {
        if (!run) continue;
        const id = run?.meta?.reportId || run?.meta?.id || run?.id || `${run?.core?.battleDate || "run"}-${runs.length}`;
        if (seen.has(id)) continue;
        seen.add(id);
        runs.push(run);
    }

    return runs
        .map((run, index) => toTrendPoint(run, index))
        .sort((a, b) => (a.timeSort || 0) - (b.timeSort || 0));
}

function toTrendPoint(run = {}, index = 0) {
    const core = run.core || {};
    const stats = run.stats || {};
    const sections = run.sections || {};
    const coreSection = sections.core || {};
    const battleDate = core.battleDate || core.battle_date || coreSection.battle_date || run.meta?.savedAt || `Report ${index + 1}`;

    return {
        index,
        label: shortDate(battleDate) || `Run ${index + 1}`,
        reportId: run.meta?.reportId || run.meta?.id || run.id || `run-${index + 1}`,
        battleDate,
        timeSort: dateSortValue(battleDate, index),
        wave: parseNumber(core.wave ?? coreSection.wave, 0),
        coins: parseNumber(core.coins ?? coreSection.coins_earned ?? sections.coins?.coins_earned, 0),
        cells: parseNumber(core.cells ?? coreSection.cells_earned ?? sections.currencies?.cells_earned, 0),
        coinsRate: parseNumber(stats.coinsPerHour ?? coreSection.coins_per_hour, 0),
        cellsRate: parseNumber(stats.cellsPerHour ?? coreSection.cells_per_hour, 0),
        damageOutput: metricValue(sections.damage, "damage_dealt") || sectionValueTotal(sections.damage),
        economyTotal: sectionValueTotal(sections.coins),
        defenseTotal: sectionValueTotal(sections.damage_taken) + sectionValueTotal(sections.damage_blocked) + sectionValueTotal(sections.health_regenerated),
        utilityTotal: sectionValueTotal(sections.utility),
        enemyTotal: sectionValueTotal(sections.enemies_hit_by),
        countTotal: sectionValueTotal(sections.counts),
        recordTotal: sectionValueTotal(sections.records),
        effectTotal: sectionValueTotal(sections.killed_with_effect_active),
        killedBy: core.killedBy || core.killed_by || coreSection.killed_by || "Unknown"
    };
}

function buildMonthlyPoints(points = []) {
    const groups = new Map();

    for (const point of points) {
        const key = monthKey(point);
        if (!key) continue;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(point);
    }

    return [...groups.entries()].map(([key, group], index) => {
        const latest = group[group.length - 1] || {};

        return {
            index,
            label: monthLabel(key),
            reportId: `month-${key}`,
            battleDate: monthLabel(key),
            timeSort: monthSortValue(key),
            runs: group.length,
            wave: Math.max(...group.map(point => Number(point.wave || 0)), 0),
            coins: Math.max(...group.map(point => Number(point.coins || 0)), 0),
            cells: Math.max(...group.map(point => Number(point.cells || 0)), 0),
            coinsRate: average(group, "coinsRate"),
            cellsRate: average(group, "cellsRate"),
            damageOutput: average(group, "damageOutput"),
            economyTotal: average(group, "economyTotal"),
            defenseTotal: average(group, "defenseTotal"),
            utilityTotal: average(group, "utilityTotal"),
            enemyTotal: average(group, "enemyTotal"),
            countTotal: average(group, "countTotal"),
            recordTotal: average(group, "recordTotal"),
            effectTotal: average(group, "effectTotal"),
            killedBy: latest.killedBy || "Unknown"
        };
    }).sort((a, b) => a.timeSort - b.timeSort);
}

function buildGrowthMovers(points = []) {
    const movers = SUMMARY_METRICS.map(metric => {
        const raw = diffBetween(points, metric.key);
        return {
            label: metric.label,
            raw,
            value: formatDelta(raw, { compact: true }),
            tone: raw > 0 ? "good" : raw < 0 ? "bad" : "neutral"
        };
    });

    return {
        gains: movers.filter(item => item.raw > 0).sort((a, b) => Math.abs(b.raw) - Math.abs(a.raw)).slice(0, 5),
        losses: movers.filter(item => item.raw < 0).sort((a, b) => Math.abs(b.raw) - Math.abs(a.raw)).slice(0, 5),
        all: movers
    };
}

function buildGrowthVerdict(points = [], movers = { gains: [], losses: [] }, signals = []) {
    const wave = diffBetween(points, "wave");
    const coins = diffBetween(points, "coins");
    const cells = diffBetween(points, "cells");
    const rate = diffBetween(points, "coinsRate");
    const goodCount = [wave, coins, cells, rate].filter(value => value > 0).length;
    const badCount = [wave, coins, cells, rate].filter(value => value < 0).length;
    const bestSignal = [...signals].sort((a, b) => b.score - a.score)[0];
    let title = "Need More History";
    let tone = "neutral";
    let summary = "Save at least two reports to unlock a proper improvement verdict.";

    if (points.length >= 2) {
        if (goodCount >= 3 && badCount === 0) {
            title = "Strong Improvement";
            tone = "good";
            summary = "Most core growth signals are moving upward across the selected history range.";
        } else if (goodCount >= badCount) {
            title = "Mixed Improvement";
            tone = "mixed";
            summary = "Some areas are improving while others need attention. Use Top Drops and Focus Next first.";
        } else {
            title = "Regression Warning";
            tone = "bad";
            summary = "More key signals are dropping than rising across this history range.";
        }
    }

    return {
        title,
        tone,
        summary,
        short: `${goodCount} up · ${badCount} down · ${points.length} reports`,
        cards: [
            { label: "Wave", value: formatDelta(wave, { compact: true }), note: wave >= 0 ? "wave depth up" : "wave depth down", tone: wave >= 0 ? "good" : "bad" },
            { label: "Coins", value: formatDelta(coins, { compact: true }), note: coins >= 0 ? "farming value up" : "farming value down", tone: coins >= 0 ? "good" : "bad" },
            { label: "Cells", value: formatDelta(cells, { compact: true }), note: cells >= 0 ? "cell gain up" : "cell gain down", tone: cells >= 0 ? "good" : "bad" },
            { label: "Rate", value: formatDelta(rate, { compact: true }), note: "coins/hour movement", tone: rate >= 0 ? "good" : "bad" },
            { label: "Best Signal", value: bestSignal?.title || movers.gains[0]?.label || "—", note: "strongest current signal", tone: "good" },
            { label: "Concern", value: movers.losses[0]?.label || "None", note: movers.losses[0] ? "largest negative movement" : "no major drop", tone: movers.losses[0] ? "bad" : "neutral" }
        ]
    };
}

function buildCoverageSummary(points = [], months = []) {
    return {
        reportCount: points.length,
        monthCount: months.length,
        first: points[0]?.label || "—",
        latest: points.at(-1)?.label || "—"
    };
}

function metricSummary(label, bestValue, avgValue, diffValue, tone = "cyan") {
    return {
        label,
        best: formatNumber(bestValue),
        avg: formatNumber(avgValue),
        diff: formatDelta(diffValue, { compact: true }),
        diffTone: diffValue > 0 ? "good" : diffValue < 0 ? "bad" : "neutral",
        tone
    };
}

function buildSingleReportSignals(run = null) {
    if (!run) return [];

    const sections = run.sections || {};
    const core = run.core || {};
    const stats = run.stats || {};

    const damage = metricValue(sections.damage, "damage_dealt") || sectionValueTotal(sections.damage);
    const economy = parseNumber(core.coins ?? sections.core?.coins_earned ?? sections.coins?.coins_earned, 0);
    const cells = parseNumber(core.cells ?? sections.core?.cells_earned ?? sections.currencies?.cells_earned, 0);
    const wave = parseNumber(core.wave ?? sections.core?.wave, 0);
    const coinsRate = parseNumber(stats.coinsPerHour ?? sections.core?.coins_per_hour, 0);
    const cellsRate = parseNumber(stats.cellsPerHour ?? sections.core?.cells_per_hour, 0);
    const survival = sectionValueTotal(sections.damage_blocked) + sectionValueTotal(sections.health_regenerated) + sectionValueTotal(sections.damage_taken);
    const utility = sectionValueTotal(sections.utility);

    return [
        signal("Economy Flow", "Coins, cells and rate pressure", [economy, coinsRate, cells, cellsRate], "gold"),
        signal("Survival Pressure", "Wave depth, defense and regen balance", [wave, Math.max(0, survival), sectionValueTotal(sections.damage_taken), sectionValueTotal(sections.health_regenerated)], "cyan"),
        signal("Damage Output", "Damage and kill-source pressure", [damage, metricValue(sections.damage, "orbs"), metricValue(sections.damage, "death_wave"), metricValue(sections.damage, "black_hole")], "violet"),
        signal("Utility Activity", "Packages, upgrades and skipped enemy levels", [utility, metricValue(sections.utility, "recovery_packages"), metricValue(sections.counts, "waves_skipped"), metricValue(sections.counts, "nuke")], "green")
    ];
}

function signal(title, subtitle, values = [], tone = "cyan") {
    const safeValues = values.map(value => Number.isFinite(Number(value)) ? Number(value) : 0);
    return {
        title,
        subtitle,
        tone,
        score: normalisedScore(safeValues),
        values: safeValues
    };
}

function buildSignalCard(item) {
    return `
        <article class="tbi-signal-card ${escapeAttr(item.tone)}">
            <div>
                <strong>${escapeHTML(item.title)}</strong>
                <span>${escapeHTML(item.subtitle)}</span>
            </div>
            ${buildSignalBars(item.values, item.tone)}
            <b>${escapeHTML(String(Math.round(item.score)))}%</b>
        </article>
    `;
}

function buildSignalBars(values = [], tone = "cyan") {
    const max = Math.max(...values.map(value => Math.abs(value)), 1);
    const bars = values.slice(0, 4).map(value => {
        const pct = clamp((Math.abs(value) / max) * 100, 5, 100);
        return `<i style="height:${pct.toFixed(1)}%"></i>`;
    }).join("");

    return `<div class="tbi-signal-bars tone-${escapeAttr(tone)}" aria-hidden="true">${bars}</div>`;
}

function bestFamilyForPoint(point = {}) {
    const scores = FAMILY_GROUPS.map(group => ({
        label: group.label,
        score: group.metrics.reduce((sum, metric) => sum + Math.abs(Number(point[metric.key] || 0)), 0)
    })).sort((a, b) => b.score - a.score);

    return scores[0]?.label || "—";
}

function filterPointsByRange(points = [], option = {}) {
    if (!option.days || !points.length) return points;
    const dated = points.filter(point => Number.isFinite(point.timeSort) && point.timeSort > 1000000000000);
    if (dated.length !== points.length) return points;
    const latest = Math.max(...points.map(point => point.timeSort));
    const minTime = latest - option.days * MS_DAY;
    const filtered = points.filter(point => point.timeSort >= minTime);
    return filtered.length ? filtered : points;
}

function metricValue(section = {}, key = "") {
    return parseNumber(section?.[key], 0);
}

function sectionValueTotal(section = {}) {
    if (!section || typeof section !== "object") return 0;

    return Object.values(section)
        .map(value => parseNumber(value, 0))
        .filter(Number.isFinite)
        .reduce((sum, value) => sum + value, 0);
}

function average(points = [], key = "wave") {
    const values = points.map(point => Number(point?.[key] || 0)).filter(Number.isFinite);
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function avgOf(points = [], key = "wave") {
    return average(points, key);
}

function maxOf(points = [], key = "wave") {
    const values = points.map(point => Number(point?.[key] || 0)).filter(Number.isFinite);
    return values.length ? Math.max(...values) : 0;
}

function diffBetween(points = [], key = "wave") {
    if (points.length < 2) return 0;
    const first = Number(points[0]?.[key] || 0);
    const last = Number(points[points.length - 1]?.[key] || 0);
    return last - first;
}

function monthKey(point = {}) {
    if (!Number.isFinite(point.timeSort) || point.timeSort < 1000000000000) return "";
    const date = new Date(point.timeSort);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function monthLabel(key = "") {
    const [year, month] = String(key).split("-");
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const index = Number(month) - 1;
    if (!year || index < 0 || index > 11) return key || "Unknown";
    return `${names[index]} ${year}`;
}

function monthSortValue(key = "") {
    const [year, month] = String(key).split("-").map(Number);
    if (!year || !month) return 0;
    return new Date(year, month - 1, 1).getTime();
}

function normalisedScore(values = []) {
    const safe = values.filter(value => Number.isFinite(value));
    if (!safe.length) return 0;
    const max = Math.max(...safe.map(value => Math.abs(value)), 1);
    const avg = safe.reduce((sum, value) => sum + Math.abs(value), 0) / safe.length;
    return clamp((avg / max) * 100, 0, 100);
}

function dateSortValue(value = "", fallback = 0) {
    const parsed = Date.parse(String(value || ""));
    return Number.isFinite(parsed) ? parsed : fallback;
}

function shortDate(value = "") {
    const text = String(value || "").trim();
    if (!text) return "";
    return text.replace(/,?\s*202\d/i, "").replace(/\s+\d{1,2}:\d{2}.*/, "").trim() || text;
}

export default {
    buildCompareTrendMonitor
};
