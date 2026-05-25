"use strict";

import {
    escapeHTML,
    escapeAttr,
    formatNumber,
    formatDelta,
    formatLabel,
    toneFromDiffData,
    sectionRows,
    sectionTotal,
    mergeSections,
    buildMetricRows
} from "./sectionUtils.js";
import { buildCompareTrendMonitor } from "./compareTrendView.js";

export function buildCompareView(state = {}, options = {}) {
    const blocks = buildCompareBlocks(state);
    const hero = buildCompareHero(state, blocks);
    const datasheetLimit = 999;

    return `
        <div class="tbi-view-stack tbi-compare-workspace">
            ${hero}
            ${buildCategorySummaryGrid(blocks)}
            <section id="tbi-compare-datasheet" class="tbi-compare-details-shell tbi-compare-datasheet-shell" data-compare-datasheet="true">
                <header class="tbi-compare-section-heading">
                    <div>
                        <span class="tbi-kicker">Full Datasheet</span>
                        <h3>Complete A / B Comparison</h3>
                        <p>Every available metric is shown here. DIFF+ opens the same full data in a larger no-squash popup.</p>
                    </div>
                    <div class="tbi-datasheet-count-pill">
                        <span>Total Rows</span>
                        <strong>${escapeHTML(String(totalMetricRows(blocks)))}</strong>
                    </div>
                </header>
                <div class="tbi-grid ${options.mobile ? "tbi-grid-1" : "tbi-grid-2"} tbi-compare-detail-grid tbi-compare-datasheet-grid">
                    ${blocks.map(block => buildCompareDetailCard(block, { limit: datasheetLimit })).join("")}
                </div>
            </section>
            ${buildCompareTrendMonitor(state)}
        </div>
    `;
}

function buildCompareBlocks(state = {}) {
    return [
        block("Damage Dealt", state.sections.damage, "✹", "damage", "damage"),
        block("Defense & Survival", mergeSections(state.sections, ["damage_taken", "health_regenerated", "damage_blocked"]), "⬡", "blue", "damage_taken"),
        block("Utility", state.sections.utility, "⚒", "violet", "utility"),
        block("Coins Breakdown", state.sections.coins, "$", "gold", "coins"),
        block("Enemies Hit By", state.sections.enemies_hit_by, "◎", "violet", "enemies_hit_by"),
        block("Counts", state.sections.counts, "#", "cyan", "counts"),
        block("Records", state.sections.records, "▤", "cyan", "records"),
        block("Effects Active", state.sections.killed_with_effect_active, "✦", "pink", "killed_with_effect_active")
    ];
}

function block(label, section, icon, accent, sectionKey) {
    const total = sectionTotal(section);
    const rows = sectionRows(section);
    const leadSide = total > 0 ? "lead-b" : total < 0 ? "lead-a" : "lead-neutral";

    return {
        label,
        section: section || {},
        icon,
        accent,
        sectionKey,
        total,
        rows,
        leadSide,
        leadLabel: total > 0 ? "Run B Leads" : total < 0 ? "Run A Leads" : "Even Match",
        leadAmount: leadAmount(total)
    };
}

function buildCompareHero(state = {}, blocks = []) {
    const runA = state.runA || {};
    const runB = state.runB || {};
    const totals = blocks.reduce((acc, item) => {
        if (item.total > 0) acc.b += 1;
        else if (item.total < 0) acc.a += 1;
        else acc.neutral += 1;
        return acc;
    }, { a: 0, b: 0, neutral: 0 });

    const winner = totals.b > totals.a ? "Run B" : totals.a > totals.b ? "Run A" : "Mixed";
    const verdictSide = winner === "Run B" ? "lead-b" : winner === "Run A" ? "lead-a" : "lead-neutral";
    const winnerLeadCount = winner === "Run B" ? totals.b : winner === "Run A" ? totals.a : Math.max(totals.a, totals.b);
    const biggest = [...blocks].sort((a, b) => Math.abs(b.total) - Math.abs(a.total))[0];
    const tradeoff = findTradeoffBlock(blocks, verdictSide);

    return `
        <section class="tbi-card tbi-compare-hero">
            <div class="tbi-compare-hero-copy">
                <span class="tbi-kicker">Compare Workspace</span>
                <h2>Run A vs Run B Analysis</h2>
                <p>Dashboard-style summary first, full datasheet below, and history growth charts for progression.</p>
                ${buildCategoryLeadBadges(blocks)}
                <div class="tbi-compare-jump-row">
                    <a class="tbi-compare-trend-jump" href="#tbi-compare-datasheet">Jump to Full Datasheet</a>
                    <a class="tbi-compare-trend-jump" href="#tbi-compare-trend-monitor">Jump to Long-Term Growth</a>
                </div>
            </div>
            <div class="tbi-compare-run-strip">
                ${buildRunChip("Run A", runA, "run-a")}
                <div class="tbi-compare-verdict ${escapeAttr(verdictSide)}">
                    <span>Overall Lean</span>
                    <strong>${escapeHTML(winner)}</strong>
                    <div class="tbi-compare-verdict-facts">
                        <b>${escapeHTML(String(winnerLeadCount))} category leads</b>
                        <b>Biggest gain: ${escapeHTML(biggest?.label || "—")}</b>
                        <b>${escapeHTML(tradeoff ? `Tradeoff: ${tradeoff.label}` : "No clear tradeoff")}</b>
                    </div>
                    <small>${escapeHTML(String(totals.a))} A leads · ${escapeHTML(String(totals.b))} B leads · ${escapeHTML(String(totals.neutral))} neutral</small>
                </div>
                ${buildRunChip("Run B", runB, "run-b")}
            </div>
            <div class="tbi-compare-hero-stats">
                <div><span>Biggest Gap</span><strong>${escapeHTML(biggest?.label || "—")}</strong></div>
                <div><span>Gap Value</span><strong>${escapeHTML(biggest?.leadAmount || "0")}</strong></div>
                <div><span>Datasheet Rows</span><strong>${escapeHTML(String(totalMetricRows(blocks)))}</strong></div>
            </div>
        </section>
    `;
}

function buildCategoryLeadBadges(blocks = []) {
    return `
        <div class="tbi-compare-lead-badges" aria-label="Category lead map">
            ${blocks.slice(0, 8).map(block => `
                <span class="${escapeAttr(block.leadSide)}">
                    <b>${escapeHTML(shortCategory(block.label))}</b>
                    <em>${block.leadSide === "lead-a" ? "A" : block.leadSide === "lead-b" ? "B" : "="}</em>
                </span>
            `).join("")}
        </div>
    `;
}

function buildRunChip(label, run = {}, side = "run-a") {
    const core = run.core || {};
    const sections = run.sections || {};
    const coreSection = sections.core || {};
    const wave = core.wave ?? coreSection.wave ?? "—";
    const killedBy = core.killedBy || core.killed_by || coreSection.killed_by || "Unknown";
    const coins = core.coins ?? coreSection.coins_earned ?? sections.coins?.coins_earned ?? 0;
    const cells = core.cells ?? coreSection.cells_earned ?? sections.currencies?.cells_earned ?? 0;

    return `
        <article class="tbi-compare-run-chip ${escapeAttr(side)}">
            <h3>${escapeHTML(label)}</h3>
            <div><span>Wave</span><b>${escapeHTML(formatNumber(wave))}</b></div>
            <div><span>Killed By</span><b>${escapeHTML(killedBy)}</b></div>
            <div><span>Coins</span><b>${escapeHTML(formatNumber(coins))}</b></div>
            <div><span>Cells</span><b>${escapeHTML(formatNumber(cells))}</b></div>
        </article>
    `;
}

function buildCategorySummaryGrid(blocks = []) {
    const primary = blocks.slice(0, 4);

    return `
        <section class="tbi-compare-summary-grid" aria-label="Compare category summary">
            ${primary.map(buildCategorySummaryCard).join("")}
        </section>
    `;
}

function buildCategorySummaryCard(block) {
    const topRows = block.rows.slice(0, 3);

    return `
        <article class="tbi-card tbi-compare-summary-card ${escapeAttr(block.accent)} ${escapeAttr(block.leadSide)}">
            <header>
                <span aria-hidden="true">${escapeHTML(block.icon)}</span>
                <h3>${escapeHTML(block.label)}</h3>
            </header>
            <div class="tbi-compare-lead-line">
                <span>${escapeHTML(block.leadLabel)}${block.leadSide !== "lead-neutral" ? " by" : ""}</span>
                <strong>${escapeHTML(block.leadAmount)}</strong>
            </div>
            <ul>
                ${topRows.map(row => `
                    <li>
                        <span>${escapeHTML(row.data?.label || row.key)}</span>
                        <b>${escapeHTML(formatDelta(row.data?.diff || 0, { compact: true }))}</b>
                    </li>
                `).join("") || `<li><span>No data</span><b>—</b></li>`}
            </ul>
        </article>
    `;
}

function buildCompareDetailCard(block, { limit = 999 } = {}) {
    const tone = block.total > 0 ? "good" : block.total < 0 ? "bad" : "neutral";
    const fullRows = buildFullRowsData(block.rows);
    const leadText = block.leadSide === "lead-b" ? "Run B is ahead" : block.leadSide === "lead-a" ? "Run A is ahead" : "No clear lead";

    return `
        <section class="tbi-card tbi-metric-card tbi-compare-detail-card ${escapeAttr(block.accent)} ${escapeAttr(block.leadSide)}" data-metric-detail-title="${escapeAttr(block.label)}" data-metric-detail-accent="${escapeAttr(block.accent)}" data-lead-side="${escapeAttr(block.leadSide)}" data-metric-full-rows="${escapeAttr(JSON.stringify(fullRows))}">
            <header class="tbi-compare-detail-header">
                <div>
                    <span aria-hidden="true">${escapeHTML(block.icon)}</span>
                    <h3>${escapeHTML(block.label)}</h3>
                </div>
                <div class="tbi-compare-detail-actions">
                    <strong class="${escapeAttr(tone)}">${escapeHTML(block.leadAmount)}</strong>
                    <button type="button" class="tbi-compare-diff-pill" data-metric-diff-toggle="true" aria-label="Open full ${escapeAttr(block.label)} Diff details">DIFF+</button>
                </div>
            </header>
            <div class="tbi-compare-lead-chip ${escapeAttr(block.leadSide)}">
                <span>${escapeHTML(block.leadLabel)}${block.leadSide !== "lead-neutral" ? " by" : ""} ${escapeHTML(block.leadAmount)}</span>
                <small>${escapeHTML(leadText)}</small>
            </div>
            ${buildMetricRows(block.section, { limit, showHeader: true, diffToggle: false, leadSide: block.leadSide })}
        </section>
    `;
}

function buildFullRowsData(rows = []) {
    return rows.map(row => {
        const data = { ...(row.data || {}), key: row.key };
        const tone = toneFromDiffData(data);

        return {
            metric: data.label || formatLabel(row.key),
            runA: formatNumber(data.a || 0),
            runB: formatNumber(data.b || 0),
            diff: formatDelta(data.diff || 0, { compact: true }),
            tone
        };
    });
}

function findTradeoffBlock(blocks = [], verdictSide = "lead-neutral") {
    const opposite = verdictSide === "lead-b" ? "lead-a" : verdictSide === "lead-a" ? "lead-b" : "";

    if (!opposite) {
        return null;
    }

    return [...blocks]
        .filter(block => block.leadSide === opposite)
        .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))[0] || null;
}

function totalMetricRows(blocks = []) {
    return blocks.reduce((sum, block) => sum + block.rows.length, 0);
}

function leadAmount(value = 0) {
    const abs = Math.abs(Number(value) || 0);
    if (!abs) return "0";
    return formatDelta(abs, { compact: true }).replace(/^\+/, "");
}

function shortCategory(label = "") {
    return String(label || "")
        .replace(/\s*&\s*/g, "/")
        .replace(/Breakdown/i, "")
        .replace(/Active/i, "")
        .trim();
}

export default {
    buildCompareView
};
