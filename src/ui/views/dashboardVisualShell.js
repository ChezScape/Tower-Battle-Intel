"use strict";

/**
 * DASHBOARD VISUAL SHELL v4.11z52w7
 *
 * Compact Dashboard-only visual builder.
 * This intentionally avoids live Dashboard action wiring, Game Brain calls,
 * DIFF modal wiring, compare jump wiring, export/import routing, and section
 * bridge calls. The approved Dashboard look remains, but this phase makes the
 * Dashboard a safer visual shell while the engine/ownership layers are rebuilt.
 */

const EMPTY_RUN = Object.freeze({
    core: {},
    stats: {},
    sections: {}
});

export function buildDashboardVisualShell(state = {}) {
    return `
        <div class="tbi-desktop-grid" data-dashboard-grid="desktop" data-dashboard-visual-shell="v4.11z52w7">
            <main class="tbi-main-column">
                ${buildRunStrip(state)}
                ${buildVerificationStrip(state)}
                ${buildDifferenceOverview(state)}
                ${buildPrimaryMatrix(state)}
                ${buildSecondaryMatrix(state)}
                <footer class="tbi-status-footer" data-dashboard-footer-shell="true">
                    <span>ⓘ Dashboard visual shell is parked for clean rewiring.</span>
                    <span>🔒 Data remains stored locally only.</span>
                    <span>★ Live Dashboard buttons are intentionally disconnected in this phase.</span>
                </footer>
            </main>
            ${buildSideColumn(state)}
        </div>
    `;
}

function buildRunStrip(state = {}) {
    return `
        <section class="tbi-run-strip" data-dashboard-run-strip-shell="true">
            ${buildRunCard("Run A", state.runA || EMPTY_RUN, "a")}
            <div class="tbi-vs-core">
                <div class="tbi-vs-gem">VS</div>
                <div class="tbi-vs-label">A vs B<br>Comparison</div>
            </div>
            ${buildRunCard("Run B", state.runB || EMPTY_RUN, "b")}
        </section>
    `;
}

function buildRunCard(title, run, side) {
    const core = run?.core || {};
    const stats = run?.stats || {};
    const battleDate = core.battleDate || "No battle loaded";
    const runtime = formatTime(core.time || 0);
    const realTime = formatTime(core.realTime || core.time || 0);

    return `
        <article class="tbi-run-card run-${attr(side)}" data-dashboard-run-card-shell="${attr(side)}">
            <div class="tbi-run-card-top">
                <div class="tbi-run-title-line">
                    <h2>${html(title)}</h2>
                    <span>▣ ${html(battleDate)}</span>
                    <span>◷ ${html(runtime)}</span>
                    <span>◉ Real Time ${html(realTime)}</span>
                </div>
                <div class="tbi-run-time-stack">
                    <span>◷ ${html(runtime)}</span>
                    <span>◉ ${html(formatNumber(stats.coinsPerHour || 0))} / hour</span>
                </div>
            </div>
            <div class="tbi-run-metrics">
                ${runMetric("Wave", core.wave ?? "-", "primary", "wave")}
                ${runMetric("Killed By", core.killedBy || "-", "danger", "killed")}
                ${runMetric("Coins Earned", formatNumber(core.coins || 0), "gold", "coins", `${html(formatNumber(stats.coinsPerHour || 0))} / hour`)}
                ${runMetric("Cells Earned", formatNumber(core.cells || 0), "green", "cells", `${html(formatNumber(stats.cellsPerHour || 0))} / hour`)}
            </div>
        </article>
    `;
}

function runMetric(label, value, tone, icon, subline = "") {
    return `
        <div class="tbi-run-metric ${attr(tone)} metric-${attr(icon)}">
            <span><i class="metric-art metric-art-${attr(icon)}" aria-hidden="true"><b>${html(metricGlyph(icon))}</b></i>${html(label)}</span>
            <strong>${html(value)}</strong>
            ${subline ? `<em>${subline}</em>` : ""}
        </div>
    `;
}

function buildVerificationStrip(state = {}) {
    const loadedA = Boolean(state.runA?.core?.wave || state.runA?.core?.battleDate);
    const loadedB = Boolean(state.runB?.core?.wave || state.runB?.core?.battleDate);
    const status = loadedA || loadedB ? "Visual hold" : "Waiting";

    return `
        <section class="tbi-card tbi-dashboard-gamebrain-strip tone-quiet" data-dashboard-gamebrain-strip-shell="true" aria-label="Dashboard visual verification shell">
            <details class="tbi-dashboard-gamebrain-details">
                <summary class="tbi-dashboard-gamebrain-summary" aria-label="Dashboard visual shell status">
                    <div class="tbi-dashboard-gamebrain-title">
                        <span>Game Brain</span>
                        <h3>Verification</h3>
                    </div>
                    <strong class="tbi-dashboard-gamebrain-status tone-quiet">${html(status)}</strong>
                    <div class="tbi-dashboard-gamebrain-chips" aria-label="Verification visual shell summary">
                        ${verificationChip("Run A", loadedA ? "Loaded" : "Waiting", loadedA ? "info" : "quiet")}
                        ${verificationChip("Run B", loadedB ? "Loaded" : "Waiting", loadedB ? "info" : "quiet")}
                        ${verificationChip("Comparison", "Parked", "quiet")}
                    </div>
                    <b class="tbi-dashboard-gamebrain-toggle" aria-hidden="true">
                        <span class="is-closed">Details</span>
                        <span class="is-open">Hide</span>
                    </b>
                </summary>
                <div class="tbi-dashboard-gamebrain-proof">
                    <div class="tbi-dashboard-gamebrain-proof-note">
                        <span>Visual shell</span>
                        <b>Live parser calls disconnected</b>
                    </div>
                    <div class="tbi-dashboard-gamebrain-grid">
                        ${verificationRun("Run A", loadedA, "a")}
                        ${verificationRun("Run B", loadedB, "b")}
                        ${verificationRun("Verification Summary", false, "compare", "Safe to rewire later")}
                    </div>
                </div>
            </details>
        </section>
    `;
}

function verificationChip(label, value, tone) {
    return `<span class="tone-${attr(tone)}"><small>${html(label)}</small><b>${html(value)}</b></span>`;
}

function verificationRun(label, loaded, side, note = "No hidden formula claims") {
    const tone = loaded ? "info" : "quiet";
    return `
        <article class="tbi-dashboard-gamebrain-run run-${attr(side)} tone-${attr(tone)}">
            <div class="tbi-dashboard-gamebrain-run-top">
                <strong>${html(label)} Read Quality</strong>
                <b class="tone-${attr(tone)}">${loaded ? "Loaded" : "Parked"}</b>
            </div>
            <div class="tbi-dashboard-gamebrain-facts">
                ${fact("Mode", "Visual shell", "info")}
                ${fact("Parser calls", "Disconnected", "quiet")}
                ${fact("Mapping polish", "Paused", "quiet")}
                ${fact("Note", note, "info")}
            </div>
        </article>
    `;
}

function fact(label, value, tone) {
    return `<span class="tone-${attr(tone)}"><small>${html(label)}</small><b>${html(value)}</b></span>`;
}

function buildDifferenceOverview(state = {}) {
    const items = [
        diffItem("Wave", state.core?.wave, "wave", "⌁"),
        diffItem("Coins Earned", state.core?.coins, "coins", "$"),
        diffItem("Coins / Hour", state.stats?.coinsPerHour || state.stats?.coins_per_hour, "coins", "↗"),
        diffItem("Cells Earned", state.core?.cells, "cells", "●"),
        diffItem("Cells / Hour", state.stats?.cellsPerHour || state.stats?.cells_per_hour, "cells", "◌"),
        diffItem("Total Damage", firstSectionDiff(state.sections?.damage), "damage", "✹")
    ];

    return `
        <section class="tbi-card tbi-difference-overview" data-dashboard-diff-shell="true">
            <div class="tbi-card-heading compact-heading">
                <h3>Difference Overview</h3>
                <span class="tbi-legend tbi-run-lead-legend"><b class="run-a-dot"></b> Run A Leads <b class="run-b-dot"></b> Run B Leads <b class="neutral-dot"></b> Neutral</span>
            </div>
            <div class="tbi-diff-row">
                ${items.map(diffTile).join("")}
            </div>
        </section>
    `;
}

function diffItem(label, data, iconKey, glyph) {
    const diff = Number(data?.diff ?? data ?? 0);
    return { label, iconKey, glyph, diff, percent: data?.pct, tone: toneFromDiff(diff) };
}

function diffTile(item) {
    return `
        <div class="tbi-diff-tile ${attr(item.tone)} metric-${attr(item.iconKey)}">
            <div class="tbi-diff-icon metric-art metric-art-${attr(item.iconKey)}" aria-hidden="true"><b>${html(item.glyph)}</b></div>
            <span>${html(item.label)}</span>
            <strong>${html(formatDelta(item.diff))}</strong>
            <em>${html(formatPercent(item.percent))}</em>
        </div>
    `;
}

function buildPrimaryMatrix(state = {}) {
    return `
        <div class="tbi-grid tbi-grid-4 tbi-primary-matrix" data-dashboard-primary-shell="true">
            ${metricCard("Damage Dealt", state.sections?.damage, { icon: "✹", accent: "cyan", iconKey: "damage", placeholder: ["Damage Dealt", "Smart Missiles", "Death Wave"] })}
            ${metricCard("Defense & Survival", mergeSectionRows(state.sections, ["damage_taken", "health_regenerated", "damage_blocked"]), { icon: "⬡", accent: "blue", placeholder: ["Damage Taken", "Health Regen", "Damage Blocked"] })}
            ${metricCard("Utility", state.sections?.utility, { icon: "⚒", accent: "violet", placeholder: ["Free Upgrades", "Recovery", "Wave Skip"] })}
            ${gapPanel(state)}
        </div>
    `;
}

function buildSecondaryMatrix(state = {}) {
    return `
        <div class="tbi-grid tbi-grid-4 tbi-secondary-matrix" data-dashboard-secondary-shell="true">
            ${metricCard("Enemies Hit By", state.sections?.enemies_hit_by, { icon: "◎", accent: "violet", iconKey: "killed", placeholder: ["Orbs", "Death Ray", "Thorns"] })}
            ${metricCard("Counts", state.sections?.counts, { icon: "#", accent: "cyan", placeholder: ["Total Enemies", "Wave Skip", "Death Defy"] })}
            ${metricCard("Coins Breakdown", state.sections?.coins, { icon: "$", accent: "gold", iconKey: "coins", placeholder: ["Coins Earned", "Golden Tower", "Black Hole"] })}
            ${metricCard("Effects Active", state.sections?.killed_with_effect_active, { icon: "✦", accent: "pink", placeholder: ["Spotlight", "Black Hole", "Chain Lightning"] })}
        </div>
    `;
}

function metricCard(title, section, options = {}) {
    const rows = sectionRows(section, options.placeholder || []).slice(0, 6);
    const total = rows.reduce((sum, row) => sum + Number(row.diff || 0), 0);
    const leadSide = total > 0 ? "lead-b" : total < 0 ? "lead-a" : "lead-neutral";

    return `
        <section class="tbi-card tbi-metric-card ${attr(options.accent || "cyan")} ${attr(leadSide)}" data-dashboard-metric-shell="true" data-lead-side="${attr(leadSide)}">
            <div class="tbi-card-heading tbi-metric-title-row">
                <h3>${options.iconKey ? `<span class="metric-art metric-art-${attr(options.iconKey)}" aria-hidden="true"><b>${html(options.icon || "◇")}</b></span>` : `<span>${html(options.icon || "◇")}</span>`} ${html(title)}</h3>
            </div>
            ${panelDelta(total)}
            ${metricRows(rows)}
            <div class="tbi-metric-footer-action-row">
                <button type="button" class="tbi-card-footer-action" data-dashboard-action-inactive="true">View Details</button>
                <button type="button" class="tbi-metric-table-toggle tbi-metric-footer-diff-button" data-dashboard-action-inactive="true" aria-label="Diff details parked">DIFF+</button>
            </div>
        </section>
    `;
}

function metricRows(rows = []) {
    return `
        <div class="tbi-metric-table" data-dashboard-metric-table-shell="true">
            <div class="tbi-metric-row tbi-metric-row-head">
                <span>Metric</span><b>Run A</b><b>Run B</b><em>Diff</em>
            </div>
            ${rows.map(row => `
                <div class="tbi-metric-row ${attr(toneFromDiff(row.diff))}">
                    <span>${html(row.label)}</span>
                    <b>${html(formatNumber(row.a))}</b>
                    <b>${html(formatNumber(row.b))}</b>
                    <em>${html(formatDelta(row.diff))}</em>
                </div>
            `).join("")}
        </div>
    `;
}

function panelDelta(total) {
    const tone = total > 0 ? "good side-b" : total < 0 ? "bad side-a" : "neutral neutral";
    const label = total > 0 ? "Run B Leads" : total < 0 ? "Run A Leads" : "Even Match";
    return `
        <div class="tbi-panel-delta-strip tbi-column-lead-strip ${attr(tone)}" aria-label="${attr(label)} ${attr(formatDelta(total))}">
            <span>${html(label)}</span>
            <strong>${html(formatDelta(total))}</strong>
        </div>
    `;
}

function gapPanel(state = {}) {
    const damage = totalDiff(state.sections?.damage);
    const economy = totalDiff(state.sections?.coins) + Number(state.stats?.coinsPerHour?.diff || 0);
    const survival = totalDiff(state.sections?.damage_blocked) + totalDiff(state.sections?.health_regenerated) - totalDiff(state.sections?.damage_taken);
    const utility = totalDiff(state.sections?.utility) + totalDiff(state.sections?.counts);
    const pointsA = radarPoints([damage, economy, survival, utility], "a");
    const pointsB = radarPoints([damage, economy, survival, utility], "b");

    return `
        <section class="tbi-card tbi-gap-panel" data-dashboard-gap-shell="true">
            <div class="tbi-card-heading centered-heading tbi-gap-heading">
                <h3><span class="tbi-gap-icon" aria-hidden="true">◇</span> The Gap In Numbers</h3>
            </div>
            <div class="tbi-radar-wrap">
                <svg class="tbi-radar-chart" viewBox="0 0 220 220" role="img" aria-label="Visual radar shell">
                    <polygon points="110,18 202,110 110,202 18,110" class="tbi-radar-grid-outer"></polygon>
                    <polygon points="110,48 172,110 110,172 48,110" class="tbi-radar-grid-mid"></polygon>
                    <line x1="110" y1="18" x2="110" y2="202" class="tbi-radar-axis"></line>
                    <line x1="18" y1="110" x2="202" y2="110" class="tbi-radar-axis"></line>
                    <polygon points="${attr(pointsA)}" class="tbi-radar-area run-a"></polygon>
                    <polygon points="${attr(pointsB)}" class="tbi-radar-area run-b"></polygon>
                </svg>
            </div>
            <div class="tbi-radar-legend tbi-gap-legend" aria-label="Radar legend. Cyan is Run A, gold is Run B, gap equals Run B minus Run A.">
                <span class="tbi-gap-run"><i class="run-a-line"></i><b>Run A</b></span>
                <span class="tbi-gap-formula"><b>Gap</b><small>B - A</small></span>
                <span class="tbi-gap-run"><i class="run-b-line"></i><b>Run B</b></span>
            </div>
        </section>
    `;
}

function buildSideColumn(state = {}) {
    return `
        <aside class="tbi-side-column" data-dashboard-side-shell="true">
            ${takeawaysPanel(state)}
            ${quickInsightsPanel(state)}
            ${recommendationsPanel()}
            ${anomaliesPanel(state)}
            ${quickActionsPanel()}
        </aside>
    `;
}

function takeawaysPanel(state = {}) {
    const notes = [
        state.summary?.farming?.headline,
        state.summary?.gameAwareNotes?.[0]?.message,
        state.insights?.[0]?.message
    ].filter(Boolean).slice(0, 3);

    return `
        <section class="tbi-card tbi-takeaways">
            <h3>Key Takeaways</h3>
            <ul>${(notes.length ? notes : ["Dashboard is in visual-shell mode while wiring is rebuilt."]).map(note => `<li>${html(note)}</li>`).join("")}</ul>
            <div class="tbi-side-art tbi-target-reticle" aria-hidden="true"><i></i><b></b></div>
        </section>
    `;
}

function quickInsightsPanel(state = {}) {
    const items = [
        ["Wave", state.core?.wave?.diff],
        ["Coins", state.core?.coins?.diff],
        ["Cells", state.core?.cells?.diff],
        ["Damage", firstSectionDiff(state.sections?.damage)]
    ];

    return `
        <section class="tbi-card tbi-quick-insights">
            <h3>Quick Insights</h3>
            <div class="tbi-mini-stat-grid">
                ${items.map(([label, value]) => miniStat(label, formatDelta(value || 0), toneFromDiff(value || 0))).join("")}
            </div>
        </section>
    `;
}

function miniStat(label, value, tone) {
    return `<div class="tbi-mini-stat ${attr(tone)}"><span>${html(label)}</span><strong>${html(value)}</strong></div>`;
}

function recommendationsPanel() {
    return `
        <section class="tbi-card tbi-recommendations">
            <h3>Recommendations</h3>
            <p class="tbi-muted">Recommendations are paused until the clean Dashboard data path is rewired.</p>
            <div class="tbi-side-art tbi-chart-icon" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></div>
        </section>
    `;
}

function anomaliesPanel(state = {}) {
    const rows = Array.isArray(state.anomalies) ? state.anomalies.slice(0, 3) : [];
    return `
        <section class="tbi-card tbi-anomaly-mini">
            <div class="tbi-card-heading">
                <h3><span class="tbi-anomaly-sigil" aria-hidden="true"></span>Anomalies</h3>
                <button type="button" data-dashboard-action-inactive="true">View All</button>
            </div>
            <section class="tbi-anomaly-list">
                ${rows.length ? rows.map(row => `
                    <article class="tbi-anomaly-row neutral">
                        <strong>${html(row.title || row.path || row.id || "Anomaly")}</strong>
                        <span>${html(row.message || row.description || row.note || "Check this value")}</span>
                    </article>
                `).join("") : `<p class="tbi-muted">No active anomalies detected.</p>`}
            </section>
        </section>
    `;
}

function quickActionsPanel() {
    const actions = [
        ["Paste Report", "paste"],
        ["Save Report", "save"],
        ["Export", "export"],
        ["Import", "import"],
        ["Clear Runs", "clear", "wide"]
    ];

    return `
        <section class="tbi-card tbi-quick-actions">
            <h3>Quick Actions</h3>
            <div class="tbi-action-grid concept5-actions">
                ${actions.map(([label, icon, extra = ""]) => `
                    <button type="button" class="${attr(extra)} action-dashboard-${attr(icon)}" data-dashboard-action-inactive="true" title="Dashboard action inactive during rebuild">
                        <span class="tbi-action-icon tbi-action-icon-${attr(icon)}" aria-hidden="true">${actionIcon(icon)}</span>
                        <strong>${html(label)}</strong>
                    </button>
                `).join("")}
            </div>
        </section>
    `;
}

function actionIcon(icon = "") {
    const icons = {
        paste: `<svg viewBox="0 0 32 32"><path d="M10 5h10l6 6v16H10z"/><path d="M20 5v7h6"/><path d="M6 10v16h4"/><path d="M14 20h8"/><path d="M18 16l4 4-4 4"/></svg>`,
        save: `<svg viewBox="0 0 32 32"><path d="M7 6h15l3 3v17H7z"/><path d="M11 6v8h10V6"/><path d="M11 21h10"/><path d="M12 25h8"/></svg>`,
        export: `<svg viewBox="0 0 32 32"><path d="M9 6h14v20H9z"/><path d="M16 10v10"/><path d="M12 16l4 4 4-4"/></svg>`,
        import: `<svg viewBox="0 0 32 32"><path d="M9 6h14v20H9z"/><path d="M16 22V12"/><path d="M12 16l4-4 4 4"/></svg>`,
        clear: `<svg viewBox="0 0 32 32"><path d="M9 9l14 14"/><path d="M23 9L9 23"/><path d="M7 16a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"/></svg>`
    };

    return icons[icon] || icons.paste;
}

function sectionRows(section, placeholders = []) {
    const rows = [];
    const sourceRows = Array.isArray(section?.rows)
        ? section.rows
        : Array.isArray(section)
            ? section
            : Object.entries(section || {}).map(([key, data]) => ({ key, data }));

    for (const item of sourceRows) {
        const data = item?.data || item || {};
        const key = item?.key || data.key || data.label;
        if (!key || typeof data !== "object") continue;
        rows.push({
            label: data.label || titleCase(String(key)),
            a: data.a ?? data.runA ?? 0,
            b: data.b ?? data.runB ?? 0,
            diff: Number(data.diff ?? (Number(data.b || 0) - Number(data.a || 0)) ?? 0)
        });
    }

    if (rows.length) return rows;

    return placeholders.map(label => ({ label, a: 0, b: 0, diff: 0 }));
}

function mergeSectionRows(sections = {}, keys = []) {
    const rows = [];
    for (const key of keys) {
        rows.push(...sectionRows(sections?.[key]));
    }
    return rows;
}

function totalDiff(section) {
    return sectionRows(section).reduce((sum, row) => sum + Number(row.diff || 0), 0);
}

function firstSectionDiff(section) {
    const row = sectionRows(section)[0];
    return row ? { diff: row.diff } : { diff: 0 };
}

function radarPoints(values = [], side = "a") {
    const coords = [[110, 24], [196, 110], [110, 196], [24, 110]];
    return coords.map(([x, y], index) => {
        const diff = Number(values[index] || 0);
        const magnitude = Math.min(1, Math.log10(Math.abs(diff) + 10) / 7);
        const sideBoost = side === "b" ? Math.max(0, diff) : Math.max(0, -diff);
        const neutral = 0.52;
        const radius = Math.min(0.94, neutral + (sideBoost ? magnitude * 0.38 : -magnitude * 0.08));
        const cx = 110 + (x - 110) * radius;
        const cy = 110 + (y - 110) * radius;
        return `${Math.round(cx)},${Math.round(cy)}`;
    }).join(" ");
}

function formatNumber(value) {
    if (value === "-" || value === null || value === undefined || value === "") return "-";
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    const abs = Math.abs(number);
    const units = [
        [1e15, "Q"],
        [1e12, "T"],
        [1e9, "B"],
        [1e6, "M"],
        [1e3, "K"]
    ];
    for (const [unit, suffix] of units) {
        if (abs >= unit) return `${trim(number / unit)}${suffix}`;
    }
    return trim(number);
}

function formatDelta(value = 0) {
    const number = Number(value || 0);
    if (!Number.isFinite(number) || Math.abs(number) < 0.000001) return "±0";
    return `${number > 0 ? "+" : ""}${formatNumber(number)}`;
}

function formatPercent(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || Math.abs(number) < 0.000001) return "0%";
    return `${number > 0 ? "+" : ""}${trim(number)}%`;
}

function formatTime(seconds = 0) {
    const value = Number(seconds || 0);
    if (!Number.isFinite(value) || value <= 0) return "0m";
    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);
    return h ? `${h}h ${m}m` : `${m}m`;
}

function toneFromDiff(value = 0) {
    const number = Number(value || 0);
    if (number > 0) return "good";
    if (number < 0) return "bad";
    return "neutral";
}

function metricGlyph(icon = "") {
    return ({ wave: "⌁", killed: "✖", coins: "$", cells: "●", damage: "✹" })[icon] || "◇";
}

function trim(value) {
    return Number(value).toLocaleString("en-GB", {
        maximumFractionDigits: Math.abs(Number(value)) >= 100 ? 0 : 2
    });
}

function titleCase(value = "") {
    return String(value)
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

function html(value = "") {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function attr(value = "") {
    return html(value).replace(/"/g, "&quot;");
}

export default {
    buildDashboardVisualShell
};
