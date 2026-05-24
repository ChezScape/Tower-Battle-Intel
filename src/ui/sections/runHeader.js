"use strict";

import { escapeHTML, escapeAttr, formatNumber, formatTime } from "./sectionUtils.js";

export function buildRunHeader(state = {}) {
    return `
        <section class="tbi-run-strip">
            ${buildRunCard("Run A", state.runA, "a")}
            <div class="tbi-vs-core">
                <div class="tbi-vs-gem">VS</div>
                <div class="tbi-vs-label">A vs B<br>Comparison</div>
            </div>
            ${buildRunCard("Run B", state.runB, "b")}
        </section>
    `;
}

export function buildMobileRunDuel(state = {}) {
    return `
        <section class="tbi-mobile-duel">
            ${buildMobileRunCard("Run A", state.runA, "a")}
            <div class="tbi-mobile-vs">VS</div>
            ${buildMobileRunCard("Run B", state.runB, "b")}
        </section>
    `;
}

function buildRunCard(title, run, side = "a") {
    const core = run?.core || {};
    const stats = run?.stats || {};
    const date = core.battleDate || "No battle loaded";
    const runtime = formatTime(core.time || 0);
    const realTime = formatTime(core.realTime || core.time || 0);

    return `
        <article class="tbi-run-card run-${escapeAttr(side)}">
            <div class="tbi-run-card-top">
                <div class="tbi-run-title-line">
                    <h2>${escapeHTML(title)}</h2>
                    <span>▣ ${escapeHTML(date)}</span>
                    <span>◷ ${escapeHTML(runtime)}</span>
                    <span>◉ Real Time ${escapeHTML(realTime)}</span>
                </div>
                <div class="tbi-run-time-stack">
                    <span>◷ ${escapeHTML(runtime)}</span>
                    <span>◉ ${escapeHTML(formatNumber(stats.coinsPerHour || 0))} / hour</span>
                </div>
            </div>
            <div class="tbi-run-metrics">
                ${runMetric("Wave", core.wave ?? "-", "primary", "wave")}
                ${runMetric("Killed By", core.killedBy || "-", "danger", "killed")}
                ${runMetric("Coins Earned", formatNumber(core.coins || 0), "gold", "coins", `${escapeHTML(formatNumber(stats.coinsPerHour || 0))} / hour`)}
                ${runMetric("Cells Earned", formatNumber(core.cells || 0), "green", "cells", `${escapeHTML(formatNumber(stats.cellsPerHour || 0))} / hour`)}
            </div>
        </article>
    `;
}

function buildMobileRunCard(title, run, side) {
    const core = run?.core || {};

    return `
        <div class="tbi-mobile-run run-${escapeAttr(side)}">
            <h2>${escapeHTML(title)}</h2>
            <span>${escapeHTML(core.battleDate || "No run")}</span>
            <strong>${escapeHTML(core.wave ?? "-")}</strong>
            <em>${escapeHTML(formatNumber(core.coins || 0))}</em>
        </div>
    `;
}

function runMetric(label, value, tone = "neutral", icon = "", subline = "") {
    const iconClass = icon ? ` metric-${escapeAttr(icon)}` : "";
    const art = icon ? `<i class="metric-art metric-art-${escapeAttr(icon)}" aria-hidden="true"><b>${escapeHTML(metricGlyph(icon))}</b></i>` : "";

    return `
        <div class="tbi-run-metric ${escapeAttr(tone)}${iconClass}">
            <span>${art}${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
            ${subline ? `<em>${subline}</em>` : ""}
        </div>
    `;
}

function metricGlyph(icon = "") {
    const glyphs = {
        wave: "⌁",
        killed: "✖",
        coins: "$",
        cells: "●",
        damage: "✹"
    };

    return glyphs[icon] || "◇";
}
