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

    return `
        <article class="tbi-run-card run-${escapeAttr(side)}">
            <div class="tbi-run-card-top">
                <div>
                    <h2>${escapeHTML(title)}</h2>
                    <span>▣ ${escapeHTML(core.battleDate || "No battle loaded")}</span>
                </div>
                <div class="tbi-run-time-stack">
                    <span>◷ ${escapeHTML(formatTime(core.time || 0))}</span>
                    <span>◉ ${escapeHTML(formatNumber(stats.coinsPerHour || 0))} / hour</span>
                </div>
            </div>
            <div class="tbi-run-metrics">
                ${runMetric("Wave", core.wave ?? "-", "primary")}
                ${runMetric("Killed By", core.killedBy || "-", "danger")}
                ${runMetric("Coins Earned", formatNumber(core.coins || 0), "gold")}
                ${runMetric("Cells Earned", formatNumber(core.cells || 0), "green")}
            </div>
            <div class="tbi-run-footer">
                <span>Coins / Hour <strong>${escapeHTML(formatNumber(stats.coinsPerHour || 0))}</strong></span>
                <span>Cells / Hour <strong>${escapeHTML(formatNumber(stats.cellsPerHour || 0))}</strong></span>
                <span>Real Time <strong>${escapeHTML(formatTime(core.time || 0))}</strong></span>
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

function runMetric(label, value, tone = "neutral") {
    return `
        <div class="tbi-run-metric ${escapeAttr(tone)}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
        </div>
    `;
}
